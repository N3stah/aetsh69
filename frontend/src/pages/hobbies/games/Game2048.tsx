import { useState, useEffect, useCallback } from 'react';

const SIZE = 4;
type Grid = number[][];

const emptyGrid = (): Grid => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const addRandomTile = (grid: Grid): Grid => {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const slide = (row: number[]): [number[], number] => {
  let arr = row.filter(v => v !== 0);
  let score = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < SIZE) arr.push(0);
  return [arr, score];
};

const rotate = (grid: Grid): Grid => grid[0].map((_, i) => grid.map(row => row[i]).reverse());

export default function Game2048({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [grid, setGrid] = useState<Grid>(() => addRandomTile(addRandomTile(emptyGrid())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const move = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    setGrid(prev => {
      let g = prev.map(row => [...row]);
      if (dir === 'up') g = rotate(g);
      if (dir === 'down') g = rotate(rotate(rotate(g)));
      if (dir === 'right') g = rotate(rotate(g));

      let earnedScore = 0;
      const newGrid = g.map(row => {
        const [newRow, s] = slide(row);
        earnedScore += s;
        return newRow;
      });

      let finalGrid = newGrid;
      if (dir === 'up') finalGrid = rotate(rotate(rotate(newGrid)));
      if (dir === 'down') finalGrid = rotate(newGrid);
      if (dir === 'right') finalGrid = rotate(rotate(newGrid));

      if (JSON.stringify(finalGrid) !== JSON.stringify(prev)) {
        const withTile = addRandomTile(finalGrid);
        if (earnedScore > 0) setScore(s => s + earnedScore);
        return withTile;
      }
      return prev;
    });
  }, [gameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  useEffect(() => {
    const hasEmpty = grid.some(row => row.includes(0));
    let canMove = false;
    for (let r = 0; r < SIZE && !canMove; r++) {
      for (let c = 0; c < SIZE && !canMove; c++) {
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) canMove = true;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) canMove = true;
      }
    }
    if (!hasEmpty && !canMove) {
      setGameOver(true);
      onGameOver(score);
    }
  }, [grid, score, onGameOver]);

  const reset = () => {
    setGrid(addRandomTile(addRandomTile(emptyGrid())));
    setScore(0);
    setGameOver(false);
  };

  const tileColors: Record<number, string> = {
    0: 'bg-[#1F1F1D] text-transparent',
    2: 'bg-[#28282A] text-[#F2EFE9]',
    4: 'bg-[#353532] text-[#F2EFE9]',
    8: 'bg-[#4A3A2A] text-[#F2EFE9]',
    16: 'bg-[#5E472F] text-[#F2EFE9]',
    32: 'bg-[#725235] text-[#F2EFE9]',
    64: 'bg-[#865D3B] text-[#F2EFE9]',
    128: 'bg-[#9A6841] text-[#F2EFE9]',
    256: 'bg-[#AE7347] text-[#F2EFE9]',
    512: 'bg-[#C27E4D] text-[#F2EFE9]',
    1024: 'bg-[#B8552F] text-[#F2EFE9]',
    2048: 'bg-[#D4623A] text-[#F2EFE9]'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-ink-muted text-sm">Score: <span className="text-ink font-mono font-bold">{score}</span></span>
        <button onClick={reset} className="btn-secondary text-xs">Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-2 bg-[#111110] rounded-md border border-line">
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div key={`${r}-${c}`} className={`w-16 h-16 rounded flex items-center justify-center font-mono font-bold text-lg transition-all ${tileColors[val] || 'bg-[#B8552F]'}`}>
              {val !== 0 ? val : ''}
            </div>
          ))
        )}
      </div>
      {gameOver && <p className="text-rust text-sm font-mono">Game over! Final score: {score}</p>}
      <p className="text-ink-faint text-xs">Use arrow keys to move</p>
    </div>
  );
}
