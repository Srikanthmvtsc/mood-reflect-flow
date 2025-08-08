import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LogOut, User, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoodData {
  emotion: string;
  confidence: number;
  timestamp: string;
}

interface EmotionFrequency {
  [key: string]: number;
}

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [emotionFrequency, setEmotionFrequency] = useState<EmotionFrequency>({});
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchMoodJourney = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/mood-journey?days=30`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoodData(data.mood_data);
        setEmotionFrequency(data.emotion_frequency);
      }
    } catch (error) {
      console.error('Error fetching mood journey:', error);
      toast({
        title: "Error",
        description: "Failed to load mood journey data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMoodJourney();
    }
  }, [isOpen]);

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      happy: 'bg-green-100 text-green-800',
      sad: 'bg-blue-100 text-blue-800',
      angry: 'bg-red-100 text-red-800',
      fear: 'bg-purple-100 text-purple-800',
      surprise: 'bg-yellow-100 text-yellow-800',
      disgust: 'bg-orange-100 text-orange-800',
      neutral: 'bg-gray-100 text-gray-800',
    };
    return colors[emotion] || 'bg-gray-100 text-gray-800';
  };

  const getTotalEntries = () => moodData.length;
  const getMostFrequentEmotion = () => {
    if (Object.keys(emotionFrequency).length === 0) return 'None';
    return Object.entries(emotionFrequency).sort(([,a], [,b]) => b - a)[0][0];
  };

  const getAverageConfidence = () => {
    if (moodData.length === 0) return 0;
    const total = moodData.reduce((sum, entry) => sum + entry.confidence, 0);
    return Math.round((total / moodData.length) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              <User className="h-4 w-4" />
              Profile
            </Button>
          </motion.div>
        </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </DialogTitle>
          <DialogDescription>
            View your account information and mental health journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">{user?.username}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Mood Journey Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Mood Journey Summary (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading your mood data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{getTotalEntries()}</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{getMostFrequentEmotion()}</div>
                      <div className="text-sm text-gray-600">Most Frequent</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{getAverageConfidence()}%</div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                  </div>

                  {/* Emotion Frequency */}
                  {Object.keys(emotionFrequency).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Emotion Frequency
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(emotionFrequency)
                          .sort(([,a], [,b]) => b - a)
                          .map(([emotion, count]) => (
                            <div key={emotion} className="flex items-center gap-3">
                              <Badge className={getEmotionColor(emotion)}>
                                {emotion}
                              </Badge>
                              <Progress 
                                value={(count / getTotalEntries()) * 100} 
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-600 w-8 text-right">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Entries */}
                  {moodData.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Recent Entries
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {moodData.slice(0, 10).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getEmotionColor(entry.emotion)}>
                                {entry.emotion}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {Math.round(entry.confidence * 100)}% confidence
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {moodData.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No mood data available yet.</p>
                      <p className="text-sm">Start using the mood detection feature to see your journey here.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile; 