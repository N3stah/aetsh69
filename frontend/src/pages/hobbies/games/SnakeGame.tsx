import { useState, useEffect, useRef, useCallback } from 'react';
import { arcadeService } from '../../../services/arcade';
import Leaderboard from '../../../components/arcade/Leaderboard';
import { Gamepad2, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Up
const INITIAL_SPEED = 150;

interface Point {
  x: number;
  y: number;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Ensure food doesn't spawn on snake
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setIsStarted(true);
    generateFood(INITIAL_SNAKE);
  };

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = { x: prev[0].x + directionRef.current.x, y: prev[0].y + directionRef.current.y };

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver(prev.length - 1); // Score is length - 1
        return prev;
      }

      // Self collision
      if (prev.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver(prev.length - 1);
        return prev;
      }

      const newSnake = [head, ...prev];

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        generateFood(newSnake);
        // Increase speed slightly every 50 points
        if ((score + 10) % 50 === 0 && speed > 50) {
          setSpeed(s => s - 10);
        }
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
      });
    };

    const gameLoop = setInterval(() => {
      // Draw background
      context.fillStyle = '#09090b';
      context.fillRect(0, 0, GRID_SIZE * 20, GRID_SIZE * 20);

      // Draw food (Rust color)
      context.fillStyle = '#D96B43';
      context.beginPath();
      context.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
      context.fill();

      // Draw snake (Zinc 100)
      context.fillStyle = '#F2EFE9';
      snake.forEach(segment => {
        context.fillRect(segment.x * 20 + 1, segment.y * 20 + 1, 18, 18);
      });

      moveSnake();
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isStarted, gameOver, food, snake, speed, generateFood]);

  const handleGameOver = async (finalScore: number) => {
    setGameOver(true);
    setIsStarted(false);
    try {
      await arcadeService.submitScore('snake', finalScore);
    } catch (err) {
      console.error('Failed to submit score:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div className="lg:col-span-2 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif font-bold text-zinc-100 flex items-center gap-2">
            <Gamepad2 className="text-[#D96B43]" /> Snake
          </h2>
          <div className="text-lg font-mono font-bold text-[#D96B43]">Score: {score}</div>
        </div>

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
          <canvas 
            ref={canvasRef} 
            width={GRID_SIZE * 20} 
            height={GRID_SIZE * 20} 
            className="block max-w-full h-auto"
          />
          
          {/* Overlays */}
          {!isStarted && !gameOver && (
            <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-4">
              <h3 className="text-2xl font-serif text-zinc-100">Ready?</h3>
              <p className="text-xs text-zinc-500 font-mono uppercase">Use Arrow Keys or WASD</p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-medium transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-4">
              <h3 className="text-3xl font-serif text-[#D96B43] font-bold">Game Over</h3>
              <p className="text-lg text-zinc-300">Final Score: <span className="font-mono font-bold">{score}</span></p>
              <button 
                onClick={resetGame}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Leaderboard game="snake" />
      </div>
    </div>
  );
}
