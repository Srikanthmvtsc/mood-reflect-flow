import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, PauseIcon, StopIcon } from '@radix-ui/react-icons';

interface BreathingExerciseProps {
  mood?: string;
}

const breathingPatterns = {
  calm: { inhale: 4, hold: 4, exhale: 4, rest: 2 },
  anxious: { inhale: 4, hold: 7, exhale: 8, rest: 2 },
  angry: { inhale: 6, hold: 2, exhale: 8, rest: 3 },
  sad: { inhale: 4, hold: 2, exhale: 6, rest: 2 },
  happy: { inhale: 4, hold: 4, exhale: 4, rest: 1 },
  neutral: { inhale: 4, hold: 4, exhale: 4, rest: 2 }
};

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathingExercise = ({ mood = 'calm' }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const pattern = breathingPatterns[mood as keyof typeof breathingPatterns] || breathingPatterns.calm;

  const phaseSequence: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
  const phaseInstructions = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    rest: 'Rest'
  };

  const phaseColors = {
    inhale: 'hsl(var(--mood-calm))',
    hold: 'hsl(var(--mood-neutral))', 
    exhale: 'hsl(var(--primary))',
    rest: 'hsl(var(--muted))'
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const currentIndex = phaseSequence.indexOf(currentPhase);
            const nextIndex = (currentIndex + 1) % phaseSequence.length;
            const nextPhase = phaseSequence[nextIndex];
            
            setCurrentPhase(nextPhase);
            
            // Increment cycle count when completing a full cycle
            if (nextPhase === 'inhale') {
              setCycleCount(c => c + 1);
            }
            
            return pattern[nextPhase];
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentPhase, pattern]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
    setCycleCount(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const stopExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(0);
    setCycleCount(0);
  };

  const getCircleScale = () => {
    const progress = 1 - (timeLeft / pattern[currentPhase]);
    
    switch (currentPhase) {
      case 'inhale':
        return 0.5 + (progress * 0.5); // Scale from 0.5 to 1
      case 'exhale':
        return 1 - (progress * 0.5); // Scale from 1 to 0.5
      case 'hold':
      case 'rest':
      default:
        return currentPhase === 'hold' ? 1 : 0.5;
    }
  };

  return (
    <motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
    <Card className="p-6 glass mood-transition hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Guided Breathing</h3>
          <p className="text-sm text-muted-foreground">
            {mood === 'anxious' 
              ? '4-7-8 breathing for anxiety relief'
              : `${pattern.inhale}-${pattern.hold}-${pattern.exhale} breathing pattern`
            }
          </p>
        </div>

        {/* Breathing Visualization */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div
              className="absolute w-full h-full rounded-full border-4 opacity-20"
              style={{ borderColor: phaseColors[currentPhase] }}
            />
            
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ backgroundColor: phaseColors[currentPhase] }}
              animate={{
                scale: isActive ? getCircleScale() : 0.5,
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
            >
              <div className="text-center text-white">
                <div className="text-2xl font-bold">
                  {timeLeft}
                </div>
                <div className="text-sm opacity-90">
                  {phaseInstructions[currentPhase]}
                </div>
              </div>
            </motion.div>

            {/* Pulse rings */}
            {isActive && (
              <motion.div
                className="absolute w-full h-full rounded-full border-2 opacity-30"
                style={{ borderColor: phaseColors[currentPhase] }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="flex justify-center gap-2">
          {phaseSequence.map((phase) => (
            <Badge
              key={phase}
              variant={currentPhase === phase ? "default" : "secondary"}
              className="text-xs capitalize"
            >
              {phase}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Completed Cycles: <span className="font-medium">{cycleCount}</span>
          </p>
          
          {cycleCount >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary font-medium"
            >
              Great progress! You're building mindfulness 🌟
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant={isActive ? "secondary" : "default"}
            onClick={isActive ? pauseExercise : startExercise}
            className="flex items-center gap-2"
          >
            {isActive ? (
              <>
                <PauseIcon className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                Start
              </>
            )}
          </Button>

          {(isActive || cycleCount > 0) && (
            <Button
              variant="outline"
              onClick={stopExercise}
              className="flex items-center gap-2"
            >
              <StopIcon className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
    </motion.div>
  );
};