import { useRef, useEffect, useState } from 'react';

export default function Pong({ onGameOver }: { onGameOver: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [gameOver, setGameOver] = useState(false);
  const stateRef = useRef({
    ball: { x: 200, y: 150, dx: 4, dy: 2 },
    player: 120,
    cpu: 120,
    keys: { up: false, down: false }
  });

  useEffect(() => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.up = isDown;
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = isDown;
    };
    const keyDown = (e: KeyboardEvent) => handleKey(e, true);
    const keyUp = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    let animFrame: number;
    const update = () => {
      const s = stateRef.current;
      const b = s.ball;
      
      if (s.keys.up) s.player = Math.max(0, s.player - 6);
      if (s.keys.down) s.player = Math.min(canvas.height - 60, s.player + 6);

      b.x += b.dx;
      b.y += b.dy;

      if (b.y < 0 || b.y > canvas.height) b.dy *= -1;

      if (b.x < 20 && b.y > s.player && b.y < s.player + 60 && b.dx < 0) {
        b.dx = Math.abs(b.dx) * 1.05;
        b.dy = (b.y - (s.player + 30)) / 5;
      }
      if (b.x > canvas.width - 20 && b.y > s.cpu && b.y < s.cpu + 60 && b.dx > 0) {
        b.dx = -Math.abs(b.dx) * 1.05;
        b.dy = (b.y - (s.cpu + 30)) / 5;
      }

      if (b.x < 0) {
        setScore(prev => {
          const newScore = { ...prev, cpu: prev.cpu + 1 };
          if (newScore.cpu >= 10) { setGameOver(true); onGameOver(newScore.player * 100); }
          return newScore;
        });
        b.x = canvas.width / 2; b.y = canvas.height / 2; b.dx = 4; b.dy = 2;
      }
      if (b.x > canvas.width) {
        setScore(prev => {
          const newScore = { ...prev, player: prev.player + 1 };
          if (newScore.player >= 10) { setGameOver(true); onGameOver(newScore.player * 100); }
          return newScore;
        });
        b.x = canvas.width / 2; b.y = canvas.height / 2; b.dx = -4; b.dy = -2;
      }

      if (s.cpu + 30 < b.y) s.cpu = Math.min(canvas.height - 60, s.cpu + 3.5);
      else s.cpu = Math.max(0, s.cpu - 3.5);

      ctx.fillStyle = '#161614';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#222220';
      for (let i = 0; i < canvas.height; i += 20) ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
      ctx.fillStyle = '#F2EFE9';
      ctx.fillRect(10, s.player, 10, 60);
      ctx.fillRect(canvas.width - 20, s.cpu, 10, 60);
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      ctx.fill();

      if (!gameOver) animFrame = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [gameOver, onGameOver]);

  const reset = () => {
    stateRef.current = { ball: { x: 200, y: 150, dx: 4, dy: 2 }, player: 120, cpu: 120, keys: { up: false, down: false } };
    setScore({ player: 0, cpu: 0 });
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <span className="text-ink-muted text-sm">Player: <span className="text-ink font-mono font-bold">{score.player}</span></span>
        <button onClick={reset} className="btn-secondary text-xs">Restart</button>
        <span className="text-ink-muted text-sm">CPU: <span className="text-ink font-mono font-bold">{score.cpu}</span></span>
      </div>
      <canvas ref={canvasRef} width={400} height={300} className="border border-line rounded-md" />
      {gameOver && <p className="text-rust text-sm font-mono">Game over! Final score: {score.player * 100}</p>}
      <p className="text-ink-faint text-xs">Use W/S or Up/Down arrows to move</p>
    </div>
  );
}
