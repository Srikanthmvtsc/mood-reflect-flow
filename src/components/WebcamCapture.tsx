import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CameraIcon, StopIcon } from '@radix-ui/react-icons';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
}

export const WebcamCapture = ({ onCapture, isAnalyzing }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const startCapture = useCallback(() => {
    setIsActive(true);
    setError(null);
  }, []);

  const stopCapture = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    setError('Unable to access camera. Please check permissions.');
    setIsActive(false);
  }, []);

  return (
    <Card className="p-6 glass mood-transition">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Mood Detection Camera</h3>
          <p className="text-sm text-muted-foreground">
            Let NeuroMirror analyze your emotional state through facial expressions
          </p>
        </div>

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="webcam"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  onUserMediaError={handleUserMediaError}
                  mirrored={true}
                />
                {isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Analyzing mood...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-muted"
              >
                <div className="text-center space-y-4">
                  <CameraIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Camera Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Start detection to begin mood analysis
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={isActive ? stopCapture : startCapture}
            className="flex-1"
            disabled={isAnalyzing}
          >
            {isActive ? (
              <>
                <StopIcon className="w-4 h-4 mr-2" />
                Stop Detection
              </>
            ) : (
              <>
                <CameraIcon className="w-4 h-4 mr-2" />
                Start Detection
              </>
            )}
          </Button>

          {isActive && (
            <Button
              variant="outline"
              onClick={capture}
              disabled={isAnalyzing}
              className="px-6"
            >
              Analyze Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};