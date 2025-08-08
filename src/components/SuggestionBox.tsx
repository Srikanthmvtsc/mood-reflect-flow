import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeartIcon, UpdateIcon, SymbolIcon } from '@radix-ui/react-icons';

interface Suggestion {
  message: string;
  tip: string;
  activity?: string;
}

interface SuggestionBoxProps {
  suggestion: Suggestion | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SuggestionBox = ({ suggestion, isLoading, onRefresh }: SuggestionBoxProps) => {
  return (
    <motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
    <Card className="p-6 glass mood-transition hover:shadow-xl transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Guidance</h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <UpdateIcon 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  AI is crafting personalized guidance...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </motion.div>
          ) : suggestion ? (
            <motion.div
              key="suggestion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Supportive Message */}
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  Supportive Message
                </Badge>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {suggestion.message}
                </p>
              </div>

              {/* Practical Tip */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SymbolIcon className="w-4 h-4 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    Mindful Tip
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                  {suggestion.tip}
                </p>
              </div>

              {/* Suggested Activity */}
              {suggestion.activity && (
                <div className="space-y-2">
                  <Badge variant="default" className="text-xs">
                    Suggested Activity
                  </Badge>
                  <p className="text-sm leading-relaxed bg-accent/10 p-3 rounded-lg border border-accent/20">
                    {suggestion.activity}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-3 py-6"
            >
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Waiting for Mood Analysis</p>
                <p className="text-sm text-muted-foreground">
                  AI guidance will appear after detecting your emotional state
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