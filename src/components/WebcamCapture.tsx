import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, StopCircle, ScanFace, AlertCircle } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const WebcamCapture = ({ onCapture, isAnalyzing }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceCheckInterval, setFaceCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Check for face presence periodically when camera is active
  useEffect(() => {
    if (isActive && !isAnalyzing) {
      const interval = setInterval(() => {
        checkFacePresence();
      }, 2000);
      setFaceCheckInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (faceCheckInterval) {
      clearInterval(faceCheckInterval);
      setFaceCheckInterval(null);
    }
  }, [isActive, isAnalyzing]);

  const checkFacePresence = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await fetch(`${API_BASE_URL}/check-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
        credentials: 'include'
      });
      
      const data = await response.json();
      setFaceDetected(data.face_detected);
    } catch (err) {
      console.error('Face check error:', err);
    }
  };

  const capture = useCallback(async () => {
    // Immediately set states to indicate processing has started
    setIsCapturing(true);
    setFaceDetected(null);
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const response = await fetch(`${API_BASE_URL}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageSrc }),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.error === 'No face detected') {
          setFaceDetected(false);
        } else {
          setFaceDetected(true);
          onCapture(imageSrc);
        }
      } catch (error) {
        console.error('Detection error:', error);
        setFaceDetected(false);
      } finally {
        setIsCapturing(false);
      }
    } else {
      setIsCapturing(false);
    }
  }, [onCapture]);

  const startCapture = useCallback(() => {
    setIsActive(true);
    setError(null);
    setFaceDetected(null); // Reset face detection state
  }, []);

  const stopCapture = useCallback(() => {
    setIsActive(false);
    setFaceDetected(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    setError('Unable to access camera. Please check permissions.');
    setIsActive(false);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 glass mood-transition hover:shadow-xl transition-all duration-300">
        <div className="space-y-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mood Detection Camera
            </h3>
            <p className="text-sm text-muted-foreground">
              Let NeuroMirror analyze your emotional state through facial expressions
            </p>
          </motion.div>

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
                  
                  {/* Face detection feedback overlay */}
                  {faceDetected === false && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <div className="bg-white p-4 rounded-lg text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <p className="text-red-500 font-medium">No face detected</p>
                        <p className="text-sm text-muted-foreground">Please position your face in the frame</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {faceDetected === true && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs flex items-center"
                    >
                      <ScanFace className="w-3 h-3 mr-1" />
                      <span>Face detected</span>
                    </motion.div>
                  )}

                  {(isAnalyzing || isCapturing) && (
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
                    <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
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
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Detection
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Detection
                </>
              )}
            </Button>

            {isActive && (
              <Button
                variant="outline"
                onClick={capture}
                disabled={isAnalyzing || faceDetected === false}
                className="px-6"
              >
                Analyze Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};