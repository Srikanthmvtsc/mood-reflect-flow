import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WebcamCapture } from '@/components/WebcamCapture';
import { MoodDisplay } from '@/components/MoodDisplay';
import { SuggestionBox } from '@/components/SuggestionBox';
import { SoundPlayer } from '@/components/SoundPlayer';
import { MoodChart } from '@/components/MoodChart';
import { BreathingExercise } from '@/components/BreathingExercise';
import { TherapyChat } from '@/components/TherapyChat';
import UserProfile from '@/components/UserProfile';
import HelpIcon from '@/components/HelpIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Pointer } from 'lucide-react';
import GameBar from '@/components/GameBar';

interface MoodData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface Suggestion {
  message: string;
  tip: string;
  activity?: string;
  sound?: string;
}

const Index = () => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<MoodData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const { toast } = useToast();

  // API URL from environment variable (for Flask backend)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load mood history from backend
  const loadMoodHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/mood-history?session_id=webcam-session&limit=50`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const historyData: MoodData[] = data.history.map((item: any) => ({
          emotion: item.emotion,
          confidence: item.confidence,
          timestamp: new Date(item.timestamp)
        }));
        setMoodHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  }, [API_URL]);

  // Load mood history on component mount
  useEffect(() => {
    loadMoodHistory();
  }, [loadMoodHistory]);

  // Apply mood-based theme to body
  useEffect(() => {
    if (currentMood) {
      document.body.className = `mood-${currentMood.emotion} mood-transition`;
    } else {
      document.body.className = 'mood-calm mood-transition';
    }
  }, [currentMood]);

  // Real emotion detection with backend API
  const analyzeEmotion = useCallback(async (imageSrc: string) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          image: imageSrc,
          session_id: 'webcam-session'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze emotion');
      }

      const data = await response.json();
      
      const newMood: MoodData = {
        emotion: data.emotion,
        confidence: data.confidence,
        timestamp: new Date()
      };

      setCurrentMood(newMood);
      setMoodHistory(prev => [...prev, newMood].slice(-50)); // Keep last 50 entries
      
      // Get AI suggestion
      await getSuggestion(data.emotion);
      
      toast({
        title: "Mood Detected",
        description: `You seem to be feeling ${data.emotion} (${Math.round(data.confidence * 100)}% confidence)`,
      });

    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to detect mood. Please ensure a clear camera view and unobstructed background.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [API_URL, toast]);

  // Mock AI suggestion (replace with Gemini API call)
  const getSuggestion = useCallback(async (emotion: string) => {
    setIsLoadingSuggestion(true);
    
    try {
      // Mock API call - replace with actual Gemini API
      // const response = await fetch(`${API_URL}/suggestion`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ emotion })
      // });
      // const data = await response.json();

      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions = {
        happy: {
          message: "Your positive energy is wonderful! Keep embracing this joyful moment.",
          tip: "Share your happiness with others - it's contagious in the best way.",
          activity: "Try dancing to your favorite song or call someone you care about.",
          sound: "uplifting nature sounds"
        },
        sad: {
          message: "It's okay to feel this way. Your emotions are valid and temporary.",
          tip: "Take slow, deep breaths and remember that this feeling will pass.",
          activity: "Try gentle stretching or writing down three things you're grateful for.",
          sound: "comfort rain"
        },
        calm: {
          message: "You're in a beautiful state of peace. Savor this tranquil moment.",
          tip: "Use this calm energy to set positive intentions for your day.",
          activity: "Practice meditation or enjoy a mindful cup of tea.",
          sound: "ocean waves"
        },
        anxious: {
          message: "You're stronger than your worries. Take it one breath at a time.",
          tip: "Try the 4-7-8 breathing technique to help your nervous system relax.",
          activity: "Ground yourself by naming 5 things you can see, 4 you can touch, 3 you can hear.",
          sound: "forest meditation"
        },
        angry: {
          message: "Your feelings are valid. Let's channel this energy constructively.",
          tip: "Physical movement can help release tension. Try some gentle exercise.",
          activity: "Take a brief walk outside or do some deep breathing exercises.",
          sound: "mountain stream"
        },
        neutral: {
          message: "A balanced state is a gift. You're centered and ready for whatever comes.",
          tip: "This is a perfect time for planning or trying something new.",
          activity: "Consider setting a small, achievable goal for today.",
          sound: "ambient peace"
        }
      };

      const newSuggestion = mockSuggestions[emotion as keyof typeof mockSuggestions] || mockSuggestions.neutral;
      setSuggestion(newSuggestion);

    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [API_URL]);

  const refreshSuggestion = useCallback(() => {
    if (currentMood) {
      getSuggestion(currentMood.emotion);
    }
  }, [currentMood, getSuggestion]);

  return (
    <div className="min-h-screen bg-background mood-transition">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
              <span className="text-lg" style={{ cursor: 'pointer' }}>🧠</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">NeuroMirror</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Mood Detection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentMood && (
                <Badge variant="outline" className="capitalize">
                  Currently: {currentMood.emotion}
                </Badge>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Primary Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Webcam and Mood Display */}
            <div className="grid gap-6 md:grid-cols-2">
              <WebcamCapture
                onCapture={analyzeEmotion}
                isAnalyzing={isAnalyzing}
              />
              <MoodDisplay
                currentMood={currentMood}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* AI Suggestions */}
            <SuggestionBox
              suggestion={suggestion}
              isLoading={isLoadingSuggestion}
              onRefresh={refreshSuggestion}
            />

            {/* Mood Chart */}
            <MoodChart moodHistory={moodHistory} />
          </motion.div>

          {/* Right Column - Therapeutic Tools */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Sound Player */}
            <SoundPlayer
              suggestedSound={suggestion?.sound}
              mood={currentMood?.emotion}
            />

            {/* Breathing Exercise */}
            <BreathingExercise mood={currentMood?.emotion} />

            {/* Game Bar */}
            <GameBar />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-border/50 bg-background/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              NeuroMirror • AI-powered emotional wellness • 
              <span className="text-primary ml-1">Your mental health matters</span>
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Therapy Chat */}
      <TherapyChat currentMood={currentMood?.emotion} />
      
      {/* Help Icon */}
      <HelpIcon />
    </div>
  );
};

export default Index;