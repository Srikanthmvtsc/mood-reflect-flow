import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Gamepad2, Zap, Target, Puzzle, Shuffle, Heart } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Game {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const MemoryGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'];

  const startGame = () => {
    const initialSequence = [Math.floor(Math.random() * 4)];
    setSequence(initialSequence);
    setUserSequence([]);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    showSequence(initialSequence);
  };

  const showSequence = (seq: number[]) => {
    setIsShowing(true);
    seq.forEach((color, index) => {
      setTimeout(() => {
        const button = document.getElementById(`color-${color}`);
        if (button) {
          button.classList.add('brightness-150');
          setTimeout(() => button.classList.remove('brightness-150'), 300);
        }
        if (index === seq.length - 1) {
          setTimeout(() => setIsShowing(false), 500);
        }
      }, (index + 1) * 600);
    });
  };

  const handleColorClick = (colorIndex: number) => {
    if (isShowing || gameOver) return;
    
    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      setGameOver(true);
      setGameStarted(false);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setScore(score + 1);
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setUserSequence([]);
      setTimeout(() => showSequence(newSequence), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Memory Pattern</h3>
      <p className="text-sm text-muted-foreground text-center">
        Watch the pattern and repeat it back
      </p>
      
      {!gameStarted && !gameOver ? (
        <Button onClick={startGame} className="mt-4">Start Game</Button>
      ) : gameOver ? (
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-destructive">Game Over!</div>
          <div className="text-lg">Final Score: {score}</div>
          <Button onClick={startGame} className="mt-4">Play Again</Button>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">Score: {score}</div>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color, index) => (
              <button
                key={index}
                id={`color-${index}`}
                className={`w-16 h-16 rounded-lg transition-all duration-300 ${color} ${
                  isShowing ? 'cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={() => handleColorClick(index)}
                disabled={isShowing}
              />
            ))}
          </div>
          <Button variant="outline" onClick={() => setGameStarted(false)}>
            Reset
          </Button>
        </>
      )}
    </div>
  );
};

const ClickGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setTargets([]);
    }
  }, [timeLeft, gameActive]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        setTargets(prev => [
          ...prev.slice(-4),
          {
            id: Date.now(),
            x: Math.random() * 200,
            y: Math.random() * 200
          }
        ]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameActive(true);
    setTargets([]);
  };

  const hitTarget = (id: number) => {
    setScore(score + 1);
    setTargets(targets.filter(target => target.id !== id));
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Target Practice</h3>
      <p className="text-sm text-muted-foreground text-center">
        Click the targets as they appear
      </p>
      
      {!gameActive ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">Final Score: {score}</div>
          <Button onClick={startGame}>Start Game</Button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
          <div className="relative w-64 h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            {targets.map(target => (
              <button
                key={target.id}
                className="absolute w-8 h-8 bg-primary rounded-full animate-pulse hover:scale-110 transition-transform"
                style={{ left: target.x, top: target.y }}
                onClick={() => hitTarget(target.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const BreathingGame = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCount(prev => {
        if (phase === 'inhale' && prev >= 4) {
          setPhase('hold');
          return 0;
        } else if (phase === 'hold' && prev >= 2) {
          setPhase('exhale');
          return 0;
        } else if (phase === 'exhale' && prev >= 4) {
          setPhase('inhale');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const getInstructions = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 'scale-150';
      case 'hold': return 'scale-150';
      case 'exhale': return 'scale-75';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h3 className="text-lg font-semibold text-foreground">Breathing Exercise</h3>
      <p className="text-sm text-muted-foreground text-center">
        Follow the circle and breathe deeply
      </p>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-in-out ${isActive ? getCircleScale() : 'scale-100'}`} />
        </div>
        
        {isActive && (
          <div className="text-center space-y-2">
            <div className="text-xl font-semibold text-foreground">{getInstructions()}</div>
            <div className="text-3xl font-bold text-primary">{4 - count}</div>
          </div>
        )}
        
        <Button 
          onClick={() => setIsActive(!isActive)}
          variant={isActive ? "outline" : "default"}
        >
          {isActive ? 'Stop' : 'Start Breathing'}
        </Button>
      </div>
    </div>
  );
};

const PuzzleGame = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializePuzzle = () => {
    const numbers = Array.from({ length: 8 }, (_, i) => i + 1);
    numbers.push(0); // Empty space
    setTiles(shuffleArray([...numbers]));
    setMoves(0);
    setIsWon(false);
  };

  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const moveTile = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const canMove = [
      emptyIndex - 1, emptyIndex + 1, 
      emptyIndex - 3, emptyIndex + 3
    ].includes(index) && 
    !(emptyIndex % 3 === 0 && index === emptyIndex - 1) &&
    !(emptyIndex % 3 === 2 && index === emptyIndex + 1);

    if (canMove) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);
      
      if (newTiles.slice(0, 8).every((tile, i) => tile === i + 1)) {
        setIsWon(true);
      }
    }
  };

  useEffect(() => {
    initializePuzzle();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Sliding Puzzle</h3>
      <p className="text-sm text-muted-foreground text-center">
        Arrange numbers 1-8 in order
      </p>
      
      <div className="text-sm text-muted-foreground">Moves: {moves}</div>
      
      {isWon && (
        <div className="text-green-500 font-semibold">Puzzle Solved! 🎉</div>
      )}
      
      <div className="grid grid-cols-3 gap-1 w-48 h-48 bg-muted/20 p-2 rounded-lg">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => moveTile(index)}
            className={`
              w-14 h-14 rounded-md flex items-center justify-center font-bold transition-all
              ${tile === 0 
                ? 'bg-transparent cursor-default' 
                : 'bg-primary/80 text-primary-foreground hover:bg-primary hover:scale-105'
              }
            `}
            disabled={tile === 0}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>
      
      <Button onClick={initializePuzzle} variant="outline">
        New Puzzle
      </Button>
    </div>
  );
};

const ColorMatchGame = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const colorPairs = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

  const initializeGame = () => {
    const gameColors = [...colorPairs, ...colorPairs];
    setColors(shuffleArray([...gameColors]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (colors[newFlipped[0]] === colors[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h3 className="text-lg font-semibold text-foreground">Color Match</h3>
      <p className="text-sm text-muted-foreground text-center">
        Find matching color pairs
      </p>
      
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Moves: {moves}</span>
        <span>Pairs: {matched.length / 2}/{colorPairs.length}</span>
      </div>
      
      {matched.length === colors.length && (
        <div className="text-green-500 font-semibold">All matched! 🎉</div>
      )}
      
      <div className="grid grid-cols-4 gap-2 max-w-64">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            className={`
              w-12 h-12 rounded-lg transition-all duration-300 border-2
              ${flipped.includes(index) || matched.includes(index)
                ? `${color} border-primary`
                : 'bg-muted hover:bg-muted/80 border-border'
              }
              ${matched.includes(index) ? 'opacity-70' : 'hover:scale-105'}
            `}
          />
        ))}
      </div>
      
      <Button onClick={initializeGame} variant="outline">
        New Game
      </Button>
    </div>
  );
};

const GameBar: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: 'memory',
      name: 'Memory',
      icon: <Gamepad2 size={20} />,
      component: <MemoryGame />
    },
    {
      id: 'click',
      name: 'Target',
      icon: <Target size={20} />,
      component: <ClickGame />
    },
    {
      id: 'breathing',
      name: 'Breathe',
      icon: <Zap size={20} />,
      component: <BreathingGame />
    },
    {
      id: 'puzzle',
      name: 'Puzzle',
      icon: <Puzzle size={20} />,
      component: <PuzzleGame />
    },
    {
      id: 'colors',
      name: 'Colors',
      icon: <Shuffle size={20} />,
      component: <ColorMatchGame />
    }
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
    <Card className="p-6 glass mood-transition hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-primary" />
          Boost Your Mood
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {games.map((game) => (
            <Button
              key={game.id}
              variant="outline"
              size="sm"
              onClick={() => setSelectedGame(game.id)}
              className="flex items-center gap-2 bg-card/50 hover:bg-card border-primary/20 hover:border-primary/40 backdrop-blur-sm"
            >
              {game.icon}
              <span className="hidden sm:inline">{game.name}</span>
            </Button>
          ))}
        </motion.div>

        {selectedGame && createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center"
            >
              {/* Blurred background */}
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setSelectedGame(null)}
              />
              
              {/* Game modal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-md mx-4"
              >
                <Card className="p-6 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGame(null)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive/10"
                    >
                    <X size={16} />
                  </Button>
                  
                  {games.find(game => game.id === selectedGame)?.component}
                </Card>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default GameBar;