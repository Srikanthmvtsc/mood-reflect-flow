import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface MoodEntry {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface MoodChartProps {
  moodHistory: MoodEntry[];
}

const moodToNumber = (emotion: string): number => {
  const moodMap: Record<string, number> = {
    sad: 1,
    angry: 2,
    anxious: 3,
    neutral: 4,
    calm: 5,
    happy: 6
  };
  return moodMap[emotion] || 4;
};

const numberToMood = (num: number): string => {
  const moodMap: Record<number, string> = {
    1: 'Sad',
    2: 'Angry', 
    3: 'Anxious',
    4: 'Neutral',
    5: 'Calm',
    6: 'Happy'
  };
  return moodMap[Math.round(num)] || 'Neutral';
};

const getMoodColor = (value: number): string => {
  if (value >= 5.5) return 'hsl(var(--mood-happy))';
  if (value >= 4.5) return 'hsl(var(--mood-calm))';
  if (value >= 3.5) return 'hsl(var(--mood-neutral))';
  if (value >= 2.5) return 'hsl(var(--mood-anxious))';
  if (value >= 1.5) return 'hsl(var(--mood-angry))';
  return 'hsl(var(--mood-sad))';
};

export const MoodChart = ({ moodHistory }: MoodChartProps) => {
  const chartData = moodHistory.slice(-20).map((entry, index) => ({
    time: entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mood: moodToNumber(entry.emotion),
    confidence: entry.confidence,
    emotion: entry.emotion,
    index
  }));

  const averageMood = chartData.length > 0 
    ? chartData.reduce((sum, entry) => sum + entry.mood, 0) / chartData.length 
    : 4;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm capitalize">
            Emotion: <span className="font-medium">{data.emotion}</span>
          </p>
          <p className="text-sm">
            Confidence: <span className="font-medium">{Math.round(data.confidence * 100)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
     <motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
    <Card className="p-6 glass mood-transition hover:shadow-xl transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Mood Journey</h3>
            <p className="text-sm text-muted-foreground">
              Your emotional timeline over time
            </p>
          </div>
          
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              Average Mood
            </Badge>
            <p className="text-sm font-medium">
              {numberToMood(averageMood)}
            </p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[1, 6]}
                  ticks={[1, 2, 3, 4, 5, 6]}
                  tickFormatter={numberToMood}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-64 flex items-center justify-center"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="font-medium">No Data Yet</p>
                <p className="text-sm text-muted-foreground">
                  Start mood detection to see your emotional journey
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mood Legend */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { mood: 'Happy', color: 'var(--mood-happy)' },
            { mood: 'Calm', color: 'var(--mood-calm)' },
            { mood: 'Neutral', color: 'var(--mood-neutral)' },
            { mood: 'Anxious', color: 'var(--mood-anxious)' },
            { mood: 'Angry', color: 'var(--mood-angry)' },
            { mood: 'Sad', color: 'var(--mood-sad)' }
          ].map((item) => (
            <div key={item.mood} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(${item.color})` }}
              />
              <span className="text-muted-foreground">{item.mood}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
    </motion.div>
  );
};