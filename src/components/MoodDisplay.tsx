import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MoodData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface MoodDisplayProps {
  currentMood: MoodData | null;
  isAnalyzing: boolean;
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  calm: '😌',
  neutral: '😐',
  anxious: '😰',
  surprised: '😲',
  fear: '😨',
  disgust: '🤢'
};

const moodColors: Record<string, string> = {
  happy: 'mood-happy',
  sad: 'mood-sad',
  angry: 'mood-angry',
  calm: 'mood-calm',
  neutral: 'mood-neutral',
  anxious: 'mood-anxious',
  surprised: 'mood-neutral',
  fear: 'mood-anxious',
  disgust: 'mood-angry'
};

const moodDescriptions: Record<string, string> = {
  happy: 'Feeling joyful and positive',
  sad: 'Experiencing some melancholy',
  angry: 'Feeling frustrated or upset',
  calm: 'In a peaceful, relaxed state',
  neutral: 'Balanced and composed',
  anxious: 'Feeling worried or tense',
  surprised: 'Caught off guard',
  fear: 'Experiencing apprehension',
  disgust: 'Feeling displeased'
};

export const MoodDisplay = ({ currentMood, isAnalyzing }: MoodDisplayProps) => {
  const moodClass = currentMood ? moodColors[currentMood.emotion] || 'mood-neutral' : 'mood-calm';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 glass mood-transition ${moodClass} hover:shadow-xl transition-all duration-300`}>
        <div className="text-center space-y-4">
          <motion.h3 
            className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Current Mood
          </motion.h3>
        
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-4xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🔍
              </motion.div>
              <div>
                <p className="font-medium">Analyzing Expression...</p>
                <p className="text-sm text-muted-foreground">Reading your emotional state</p>
              </div>
            </motion.div>
          ) : currentMood ? (
            <motion.div
              key={`mood-${currentMood.emotion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <motion.div
                className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-4xl float"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {moodEmojis[currentMood.emotion] || '😐'}
              </motion.div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-xl font-semibold capitalize">
                    {currentMood.emotion}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(currentMood.confidence * 100)}%
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {moodDescriptions[currentMood.emotion] || 'Mood detected'}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Last updated: {currentMood.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <motion.div
                className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl breathe"
              >
                😌
              </motion.div>
              <div>
                <p className="font-medium">Ready to Analyze</p>
                <p className="text-sm text-muted-foreground">
                  Start camera detection to see your mood
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
    </motion.div>
  );
};