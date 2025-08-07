from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import sqlite3
import os
from datetime import datetime
import google.generativeai as genai
from fer import FER
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")
    model = None

# Initialize emotion detector
emotion_detector = FER(mtcnn=True)

# Database setup
def init_db():
    conn = sqlite3.connect('neuromirror.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emotion TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            sender TEXT NOT NULL,
            mood TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emotion TEXT NOT NULL,
            message TEXT NOT NULL,
            tip TEXT NOT NULL,
            activity TEXT,
            sound TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

def get_db_connection():
    conn = sqlite3.connect('neuromirror.db')
    conn.row_factory = sqlite3.Row
    return conn

def decode_base64_image(base64_string):
    """Decode base64 image string to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        return opencv_image
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        return None

def detect_emotion(image):
    """Detect emotion from image using FER"""
    try:
        # Detect emotions
        emotions = emotion_detector.detect_emotions(image)
        
        if not emotions:
            return None, 0.0
        
        # Get the first face detected
        emotion_data = emotions[0]['emotions']
        
        # Find the emotion with highest confidence
        dominant_emotion = max(emotion_data, key=emotion_data.get)
        confidence = emotion_data[dominant_emotion]
        
        return dominant_emotion, confidence
    except Exception as e:
        logger.error(f"Error detecting emotion: {e}")
        return None, 0.0

def get_therapeutic_suggestion(emotion, use_gemini=True):
    """Get therapeutic suggestion for detected emotion"""
    
    if use_gemini and model:
        try:
            prompt = f"""
            You are a compassionate AI therapist. A person is feeling {emotion}. 
            Provide a therapeutic response with:
            1. A supportive message (2-3 sentences)
            2. A practical tip for managing this emotion
            3. A suggested activity to help them feel better
            4. A type of calming sound that would help (e.g., "ocean waves", "forest sounds", "gentle rain")
            
            Be warm, empathetic, and professional. Focus on emotional regulation and self-care.
            Keep each section concise but meaningful.
            
            Format your response as JSON with keys: message, tip, activity, sound
            """
            
            response = model.generate_content(prompt)
            
            # Try to parse as JSON, fallback to structured text
            try:
                import json
                suggestion_data = json.loads(response.text)
                return suggestion_data
            except:
                # Fallback parsing if not JSON
                lines = response.text.split('\n')
                return {
                    "message": "You're doing great by acknowledging your feelings. Every emotion is valid and temporary.",
                    "tip": "Take slow, deep breaths and remind yourself that this feeling will pass.",
                    "activity": "Try a short mindfulness exercise or gentle movement.",
                    "sound": "calming nature sounds"
                }
                
        except Exception as e:
            logger.error(f"Error getting Gemini suggestion: {e}")
    
    # Fallback suggestions
    fallback_suggestions = {
        'happy': {
            "message": "Your positive energy is wonderful! Embrace this joyful moment and let it fill you with warmth.",
            "tip": "Share your happiness with others - positive emotions are contagious in the best way.",
            "activity": "Try dancing to your favorite song or call someone you care about.",
            "sound": "uplifting nature sounds"
        },
        'sad': {
            "message": "It's completely okay to feel this way. Your emotions are valid, and you're not alone in this.",
            "tip": "Allow yourself to feel without judgment. Sadness is a natural part of the human experience.",
            "activity": "Try gentle stretching, journaling, or listening to comforting music.",
            "sound": "gentle rain"
        },
        'angry': {
            "message": "Your feelings are valid. Let's channel this energy in a healthy, constructive way.",
            "tip": "Physical movement can help release tension. Take deep breaths and count to ten.",
            "activity": "Try a brief walk outside, some deep breathing, or write down your thoughts.",
            "sound": "flowing stream"
        },
        'fear': {
            "message": "You're braver than you feel right now. Fear is temporary, but your strength is lasting.",
            "tip": "Ground yourself by focusing on what you can control in this moment.",
            "activity": "Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.",
            "sound": "peaceful forest"
        },
        'surprise': {
            "message": "Life is full of unexpected moments. You're handling this surprise with grace.",
            "tip": "Take a moment to process this new information. Surprises can lead to growth.",
            "activity": "Take a few mindful breaths and reflect on how you're feeling right now.",
            "sound": "gentle wind chimes"
        },
        'disgust': {
            "message": "Your boundaries and values are important. It's okay to feel this way about things that don't align with you.",
            "tip": "Distance yourself from what's bothering you if possible, and focus on what brings you peace.",
            "activity": "Engage in something that brings you joy or comfort - perhaps a hobby or time in nature.",
            "sound": "mountain breeze"
        },
        'neutral': {
            "message": "A balanced state is a gift. You're centered and ready for whatever comes your way.",
            "tip": "This is a perfect time for planning, reflection, or trying something new.",
            "activity": "Consider setting a small, achievable goal for today or practicing gratitude.",
            "sound": "ambient peace"
        }
    }
    
    return fallback_suggestions.get(emotion, fallback_suggestions['neutral'])

def get_chat_response(message, mood, chat_history):
    """Get therapeutic chat response using Gemini"""
    
    if not model:
        return "I'm here to listen and support you. Sometimes it helps just to know someone cares about you."
    
    try:
        # Build context from chat history
        context = ""
        if chat_history:
            context = "Previous conversation:\n"
            for msg in chat_history[-5:]:  # Last 5 messages for context
                sender = "Human" if msg.get('sender') == 'user' else "Therapist"
                context += f"{sender}: {msg.get('text', '')}\n"
        
        mood_context = f"The person's current detected mood is: {mood}" if mood else ""
        
        prompt = f"""
        You are a compassionate, professional AI therapist. You provide supportive, empathetic responses that help people process their emotions and find healthy coping strategies.
        
        {mood_context}
        
        {context}
        
        Human: {message}
        
        Guidelines for your response:
        - Be warm, empathetic, and non-judgmental
        - Acknowledge their feelings without minimizing them
        - Offer gentle guidance or coping strategies when appropriate
        - Ask thoughtful follow-up questions to encourage reflection
        - Keep responses concise but meaningful (2-4 sentences)
        - Use therapeutic techniques like validation, reframing, and mindfulness
        - Avoid giving medical advice or diagnosing
        - Focus on emotional support and self-care
        
        Respond as a caring therapist:
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Error getting chat response: {e}")
        return "I'm here for you. Your feelings are valid, and it's okay to take things one step at a time."

@app.route('/detect', methods=['POST'])
def detect_mood():
    """Detect emotion from uploaded image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode the image
        image = decode_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Detect emotion
        emotion, confidence = detect_emotion(image)
        
        if emotion is None:
            return jsonify({'error': 'No face detected'}), 400
        
        # Store in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO mood_history (emotion, confidence, session_id) VALUES (?, ?, ?)',
            (emotion, confidence, data.get('session_id', 'default'))
        )
        conn.commit()
        conn.close()
        
        # Get therapeutic suggestion
        suggestion = get_therapeutic_suggestion(emotion)
        
        # Store suggestion in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO suggestions (emotion, message, tip, activity, sound) VALUES (?, ?, ?, ?, ?)',
            (emotion, suggestion['message'], suggestion['tip'], 
             suggestion.get('activity', ''), suggestion.get('sound', ''))
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'emotion': emotion,
            'confidence': round(confidence, 2),
            'message': suggestion['message'],
            'tip': suggestion['tip'],
            'activity': suggestion.get('activity', ''),
            'sound': suggestion.get('sound', '')
        })
        
    except Exception as e:
        logger.error(f"Error in detect_mood: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Handle therapeutic chat conversation"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        user_message = data['message']
        mood = data.get('mood')
        chat_history = data.get('chat_history', [])
        session_id = data.get('session_id', 'default')
        
        # Store user message
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO chat_history (message, sender, mood, session_id) VALUES (?, ?, ?, ?)',
            (user_message, 'user', mood, session_id)
        )
        
        # Get AI response
        ai_response = get_chat_response(user_message, mood, chat_history)
        
        # Store AI response
        cursor.execute(
            'INSERT INTO chat_history (message, sender, mood, session_id) VALUES (?, ?, ?, ?)',
            (ai_response, 'therapist', mood, session_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/mood-history', methods=['GET'])
def get_mood_history():
    """Get mood detection history"""
    try:
        session_id = request.args.get('session_id', 'default')
        limit = request.args.get('limit', 50, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT emotion, confidence, timestamp FROM mood_history WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?',
            (session_id, limit)
        )
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'emotion': row['emotion'],
                'confidence': row['confidence'],
                'timestamp': row['timestamp']
            })
        
        conn.close()
        return jsonify({'history': history})
        
    except Exception as e:
        logger.error(f"Error getting mood history: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/chat-history', methods=['GET'])
def get_chat_history():
    """Get chat conversation history"""
    try:
        session_id = request.args.get('session_id', 'default')
        limit = request.args.get('limit', 100, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT message, sender, mood, timestamp FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?',
            (session_id, limit)
        )
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'message': row['message'],
                'sender': row['sender'],
                'mood': row['mood'],
                'timestamp': row['timestamp']
            })
        
        conn.close()
        return jsonify({'history': history})
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'gemini_configured': model is not None
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)