import { useState, useEffect, useCallback, useRef } from 'react';

const ROWS = 20;
const COLS = 10;
const TETROMINOES: Record<string, number[][]> = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]]
};
const COLORS: Record<string, string> = {
  I: '#3F3F3F', J: '#4A3A2A', L: '#5E472F', O: '#725235', S: '#865D3B', T: '#9A6841', Z: '#B8552F'
};

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(''));

interface Piece { shape: number[][]; color: string; x: number; y: number; }

const randomPiece = (): Piece => {
  const keys = Object.keys(TETROMINOES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { shape: TETROMINOES[type], color: COLORS[type], x: Math.floor(COLS / 2) - 1, y: 0 };
};

export default function Tetris({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [board, setBoard] = useState<string[][]>(createBoard);
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState(800);
  const pieceRef = useRef(piece);
  pieceRef.current = piece;

  const isColliding = useCallback((p: Piece, b: string[][]) => {
    return p.shape.some((row, y) =>
      row.some((val, x) => {
        if (!val) return false;
        const boardY = y + p.y;
        const boardX = x + p.x;
        return boardY >= ROWS || boardX < 0 || boardX >= COLS || (boardY >= 0 && b[boardY][boardX]);
      })
    );
  }, []);

  const mergePiece = useCallback((p: Piece, b: string[][]) => {
    const newBoard = b.map(row => [...row]);
    p.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && y + p.y >= 0) newBoard[y + p.y][x + p.x] = p.color;
      });
    });
    return newBoard;
  }, []);

  const clearLines = useCallback((b: string[][]) => {
    let cleared = 0;
    const newBoard = b.filter(row => {
      if (row.every(cell => cell !== '')) { cleared++; return false; }
      return true;
    });
    while (newBoard.length < ROWS) newBoard.unshift(Array(COLS).fill(''));
    if (cleared > 0) {
      setScore(s => s + [0, 100, 300, 500, 800][cleared]);
      setDropTime(t => Math.max(100, t - cleared * 50));
    }
    return newBoard;
  }, []);

  const drop = useCallback(() => {
    if (gameOver) return;
    const p = pieceRef.current;
    const moved = { ...p, y: p.y + 1 };
    if (!isColliding(moved, board)) {
      setPiece(moved);
    } else {
      const merged = mergePiece(p, board);
      const cleared = clearLines(merged);
      const newPiece = randomPiece();
      if (isColliding(newPiece, cleared)) {
        setGameOver(true);
        onGameOver(score);
      } else {
        setBoard(cleared);
        setPiece(newPiece);
      }
    }
  }, [board, gameOver, isColliding, mergePiece, clearLines, onGameOver, score]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(drop, dropTime);
    return () => clearInterval(timer);
  }, [drop, dropTime, gameOver]);

  const rotate = useCallback(() => {
    const p = pieceRef.current;
    const rotated = p.shape[0].map((_, i) => p.shape.map(row => row[i]).reverse());
    const newPiece = { ...p, shape: rotated };
    if (!isColliding(newPiece, board)) setPiece(newPiece);
  }, [board, isColliding]);

  const move = useCallback((dir: number) => {
    const p = pieceRef.current;
    const moved = { ...p, x: p.x + dir };
    if (!isColliding(moved, board)) setPiece(moved);
  }, [board, isColliding]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') rotate();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move, drop, rotate]);

  const reset = () => {
    setBoard(createBoard());
    setPiece(randomPiece());
    setScore(0);
    setGameOver(false);
    setDropTime(800);
  };

  const displayBoard = board.map(row => [...row]);
  if (!gameOver) {
    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && y + piece.y >= 0) displayBoard[y + piece.y][x + piece.x] = piece.color;
      });
    });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-ink-muted text-sm">Score: <span className="text-ink font-mono font-bold">{score}</span></span>
        <button onClick={reset} className="btn-secondary text-xs">Restart</button>
      </div>
      <div className="grid grid-cols-10 gap-px p-2 bg-[#111110] rounded-md border border-line">
        {displayBoard.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className="w-4 h-4 rounded-sm" style={{ background: cell || '#1F1F1D' }} />
          ))
        )}
      </div>
      {gameOver && <p className="text-rust text-sm font-mono">Game over! Final score: {score}</p>}
      <p className="text-ink-faint text-xs">Arrows: Move/Down. Up: Rotate</p>
    </div>
  );
}
