import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerLoudIcon, 
  SpeakerOffIcon,
  StopIcon 
} from '@radix-ui/react-icons';

interface SoundPlayerProps {
  suggestedSound?: string;
  mood?: string;
}

const moodSounds = {
  happy: {
    name: 'Uplifting Nature',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Birds chirping with gentle wind'
  },
  sad: {
    name: 'Comfort Rain',
    url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
    description: 'Soft rainfall for healing'
  },
  calm: {
    name: 'Ocean Waves',
    url: 'https://www.soundjay.com/misc/sounds/wave-1.wav',
    description: 'Gentle waves on peaceful shore'
  },
  anxious: {
    name: 'Forest Meditation',
    url: 'https://www.soundjay.com/misc/sounds/wind-3.wav',
    description: 'Rustling leaves and soft breeze'
  },
  angry: {
    name: 'Mountain Stream',
    url: 'https://www.soundjay.com/misc/sounds/water-1.wav',
    description: 'Flowing water for inner peace'
  },
  neutral: {
    name: 'Ambient Peace',
    url: 'https://www.soundjay.com/misc/sounds/wind-2.wav',
    description: 'Gentle ambient sounds'
  }
};

export const SoundPlayer = ({ suggestedSound, mood = 'calm' }: SoundPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSound = moodSounds[mood as keyof typeof moodSounds] || moodSounds.calm;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (volume[0] > 0) {
      setVolume([0]);
    } else {
      setVolume([0.5]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 glass mood-transition">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Therapeutic Sounds</h3>
            <p className="text-sm text-muted-foreground">
              Mood-based audio therapy
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            {mood}
          </Badge>
        </div>

        {/* Current Sound Info */}
        <motion.div
          key={currentSound.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 p-4 rounded-lg border border-primary/10"
        >
          <h4 className="font-medium text-sm">{currentSound.name}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {currentSound.description}
          </p>
        </motion.div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={currentSound.url}
          loop
          preload="metadata"
        />

        {/* Playback Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full p-0"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={stopPlayback}
              className="w-10 h-10 rounded-full p-0"
            >
              <StopIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="w-8 h-8 p-0"
            >
              {volume[0] === 0 ? (
                <SpeakerOffIcon className="w-4 h-4" />
              ) : (
                <SpeakerLoudIcon className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {suggestedSound && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20"
          >
            <p className="text-sm">
              <span className="font-medium">AI Suggestion:</span> Try {suggestedSound} for your current mood
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};