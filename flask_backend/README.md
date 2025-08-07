# NeuroMirror Flask Backend

A therapeutic AI backend for emotion detection and chat support using FER (Facial Emotion Recognition) and Google's Gemini API.

## Features

- **Emotion Detection**: Real-time facial emotion recognition using FER
- **AI Therapy Chat**: Context-aware therapeutic conversations using Gemini
- **Mood Tracking**: SQLite database for storing mood history and chat logs
- **RESTful API**: Clean endpoints for frontend integration

## Setup Instructions

### 1. Environment Setup

```bash
# Navigate to backend directory
cd flask_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 4. Run the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /detect
Detects emotion from uploaded image
```json
{
  "image": "base64_image_string",
  "session_id": "optional_session_id"
}
```

Response:
```json
{
  "emotion": "happy",
  "confidence": 0.87,
  "message": "Your positive energy is wonderful!",
  "tip": "Share your happiness with others",
  "activity": "Try dancing to your favorite song",
  "sound": "uplifting nature sounds"
}
```

### POST /chat
Therapeutic chat conversation
```json
{
  "message": "I'm feeling anxious today",
  "mood": "anxious",
  "chat_history": [...],
  "session_id": "optional_session_id"
}
```

Response:
```json
{
  "response": "I understand you're feeling anxious. That's completely valid...",
  "timestamp": "2024-01-01T12:00:00"
}
```

### GET /mood-history
Get mood detection history
Query params: `session_id`, `limit`

### GET /chat-history  
Get chat conversation history
Query params: `session_id`, `limit`

### GET /health
Health check endpoint

## Database Schema

### mood_history
- id (PRIMARY KEY)
- emotion (TEXT)
- confidence (REAL)
- timestamp (DATETIME)
- session_id (TEXT)

### chat_history
- id (PRIMARY KEY)
- message (TEXT)
- sender (TEXT)
- mood (TEXT)
- timestamp (DATETIME)
- session_id (TEXT)

### suggestions
- id (PRIMARY KEY)
- emotion (TEXT)
- message (TEXT)
- tip (TEXT)
- activity (TEXT)
- sound (TEXT)
- timestamp (DATETIME)

## Supported Emotions

- happy
- sad
- angry
- fear
- surprise
- disgust
- neutral

## Dependencies

- **Flask**: Web framework
- **FER**: Facial emotion recognition
- **OpenCV**: Image processing
- **Google Generative AI**: Gemini API for chat
- **SQLite**: Database storage
- **PIL**: Image handling

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server like Gunicorn
3. Configure proper logging
4. Set up database backups
5. Implement rate limiting
6. Use HTTPS

```bash
# Example production run with Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Camera/Image Issues
- Ensure proper image encoding (base64)
- Check image format compatibility
- Verify face is clearly visible in image

### Gemini API Issues
- Verify API key is correct
- Check API quota limits
- Ensure stable internet connection

### Database Issues
- Check file permissions for SQLite database
- Verify database file creation in current directory

## Security Notes

- Never commit `.env` file to version control
- Implement rate limiting for production
- Validate all input data
- Use HTTPS in production
- Implement proper authentication if needed