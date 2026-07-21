import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Trophy, Clock, RotateCcw, Globe } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Game2048 from './games/Game2048';
import MemoryMatch from './games/MemoryMatch';
import Tetris from './games/Tetris';
import Pong from './games/Pong';

interface ScoreEntry { game: string; score: number; date: string; }
interface LeaderboardEntry { player: string; score: number; played_at: string; }

const GAMES = [
  { id: 'snake', name: 'Snake', desc: 'Eat food, grow longer, avoid walls and yourself.' },
  { id: 'tetris', name: 'Tetris', desc: 'Classic block-stacking puzzle game.' },
  { id: '2048', name: '2048', desc: 'Slide and merge tiles to reach 2048.' },
  { id: 'memory-match', name: 'Memory Match', desc: 'Flip cards and find matching pairs.' },
  { id: 'pong', name: 'Pong', desc: 'Classic arcade table tennis vs CPU.' }
];

export default function ArcadePage() {
  const user = useAuthStore((state) => state.user);
  const storageKey = `aetsh69-arcade-scores-${user?.id || 'guest'}`;
  
  const [history, setHistory] = useState<ScoreEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  
  const [active, setActive] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const addScore = useCallback((game: string, score: number) => {
    if (score === 0) return;
    setHistory(prev => {
      const entry = { game, score, date: new Date().toISOString() };
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const clearHistory = useCallback(() => { 
    setHistory([]); 
    localStorage.removeItem(storageKey); 
  }, [storageKey]);

  const bestScore = useCallback((game: string) => Math.max(0, ...history.filter(h => h.game === game).map(h => h.score)), [history]);

  const handleGameOver = useCallback(async (game: string, score: number) => {
    addScore(game, score);
    try {
      await api.post('/arcade/scores', { game_id: game, score, duration_seconds: 60, user_id: user?.id });
    } catch (e) {
      console.error('Failed to submit score to backend', e);
    }
  }, [addScore, user]);

  const fetchLeaderboard = useCallback(async (gameId: string) => {
    try {
      const r = await api.get(`/arcade/leaderboard/${gameId}`);
      setLeaderboard(r.data);
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    if (showLeaderboard && active) fetchLeaderboard(active);
  }, [showLeaderboard, active, fetchLeaderboard]);

  const activeGame = GAMES.find(g => g.id === active);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Hobbies</p>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2 flex items-center gap-3">
            <Gamepad2 size={32} className="text-rust" /> Arcade
          </h1>
          <p className="text-ink-muted">Browser games — a little fun between the engineering.</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary text-xs flex items-center gap-1.5 mt-2">
          <Trophy size={14} /> {showHistory ? 'Hide' : 'Score History'}
        </button>
      </div>

      {showHistory && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink text-sm flex items-center gap-2"><Trophy size={16} className="text-rust" /> Local Score History</h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-ink-faint text-xs hover:text-rust transition-colors">Clear all</button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-ink-muted text-sm">No scores yet — play a game!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-ink-faint text-xs w-5 text-right">{i + 1}.</span>
                    <span className="text-ink-muted capitalize">{h.game}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-ink font-bold">{h.score}</span>
                    <span className="text-ink-faint text-xs flex items-center gap-1">
                      <Clock size={10} /> {new Date(h.date).toLocaleDateString('en-KE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!active ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAMES.map(game => (
            <div key={game.id} onClick={() => setActive(game.id)} className="card card-hover cursor-pointer group">
              <div className="w-12 h-12 rounded-md bg-rust/10 flex items-center justify-center mb-4">
                <Gamepad2 size={24} className="text-rust" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-rust transition-colors">{game.name}</h2>
                {bestScore(game.id) > 0 && (
                  <span className="flex items-center gap-1 text-xs text-rust font-mono">
                    <Trophy size={12} /> {bestScore(game.id)}
                  </span>
                )}
              </div>
              <p className="text-ink-muted text-sm mb-4">{game.desc}</p>
              <button className="btn-primary text-sm">Play →</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{activeGame?.name}</h2>
              {bestScore(active) > 0 && (
                <p className="text-ink-faint text-xs flex items-center gap-1 mt-1">
                  <Trophy size={11} className="text-rust" />Best: {bestScore(active)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="btn-ghost text-sm flex items-center gap-1">
                <Globe size={14} /> Leaderboard
              </button>
              <button onClick={() => { setActive(null); setShowLeaderboard(false); }} className="btn-ghost text-sm">← Back</button>
            </div>
          </div>

          {showLeaderboard && (
            <div className="mb-6 p-4 border border-line rounded-md bg-[#111110]">
              <h3 className="text-sm font-mono text-rust mb-3">Global Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="text-ink-muted text-xs">No global scores yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-line last:border-0">
                      <span className="text-ink-muted">{i + 1}. {entry.player}</span>
                      <span className="font-mono text-ink font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center py-6 bg-[#111110] rounded-md border border-line">
            {active === 'snake' && (
              <div className="flex flex-col items-center gap-4">
                <SnakeGame onGameOver={(s) => handleGameOver('snake', s)} />
              </div>
            )}
            {active === 'tetris' && <Tetris onGameOver={(s) => handleGameOver('tetris', s)} />}
            {active === '2048' && <Game2048 onGameOver={(s) => handleGameOver('2048', s)} />}
            {active === 'memory-match' && <MemoryMatch onGameOver={(s) => handleGameOver('memory-match', s)} />}
            {active === 'pong' && <Pong onGameOver={(s) => handleGameOver('pong', s)} />}
          </div>
        </div>
      )}
    </div>
  );
}

function SnakeGame({ onGameOver }: { onGameOver: (score: number) => void }) {
  const SIZE = 15;
  const [snake, setSnake] = useState([[7, 7]]);
  const [food, setFood] = useState([3, 3]);
  const [dir, setDir] = useState([0, 1]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);

  const randomFood = useCallback((s: number[][]) => {
    let f: number[];
    do { f = [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)]; }
    while (s.some(([r, c]) => r === f[0] && c === f[1]));
    return f;
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSnake(prev => {
        const head = [prev[0][0] + dir[0], prev[0][1] + dir[1]];
        if (head[0] < 0 || head[0] >= SIZE || head[1] < 0 || head[1] >= SIZE ||
          prev.some(([r, c]) => r === head[0] && c === head[1])) {
          setRunning(false);
          setDead(true);
          setScore(s => { onGameOver(s); return s; });
          return prev;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        const next = [head, ...prev.slice(0, ate ? undefined : -1)];
        if (ate) { setScore(s => s + 10); setFood(randomFood(next)); }
        return next;
      });
    }, 140);
    return () => clearInterval(t);
  }, [running, dir, food, randomFood, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number[]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (map[e.key]) {
        e.preventDefault();
        setDir(d => (map[e.key][0] !== -d[0] || map[e.key][1] !== -d[1]) ? map[e.key] : d);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const reset = () => {
    setSnake([[7, 7]]);
    setFood([3, 3]);
    setDir([0, 1]);
    setScore(0);
    setDead(false);
    setRunning(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-ink-muted text-sm">Score: <span className="text-ink font-mono font-bold">{score}</span></span>
        <button onClick={running ? () => setRunning(false) : reset} className="btn-secondary text-xs flex items-center gap-1">
          {running ? 'Pause' : dead ? <><RotateCcw size={12} /> Restart</> : 'Start'}
        </button>
      </div>
      <div className="border border-line rounded-md overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 300, height: 300 }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const r = Math.floor(i / SIZE), c = i % SIZE;
          const isHead = snake[0][0] === r && snake[0][1] === c;
          const isSnake = !isHead && snake.some(([sr, sc]) => sr === r && sc === c);
          const isFood = food[0] === r && food[1] === c;
          return <div key={i} style={{ background: isHead ? '#B8552F' : isSnake ? '#7a3820' : isFood ? '#e05c30' : 'transparent', border: '0.5px solid #222' }} />;
        })}
      </div>
      {dead && <p className="text-rust text-sm font-mono">Game over! Final score: {score}</p>}
      <p className="text-ink-faint text-xs">Use arrow keys to move</p>
    </div>
  );
}
