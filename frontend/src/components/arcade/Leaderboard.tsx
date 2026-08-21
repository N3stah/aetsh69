import { useState, useEffect } from 'react';
import { arcadeService, LeaderboardEntry } from '../../services/arcade';
import { Trophy } from 'lucide-react';

export default function Leaderboard({ game }: { game: string }) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const data = await arcadeService.getLeaderboard(game);
        setScores(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [game]);

  if (loading) return <div className="text-zinc-500 text-sm font-mono">Loading scores...</div>;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-mono text-[#D96B43] uppercase tracking-widest mb-3 flex items-center gap-2">
        <Trophy size={14} /> Top 10 Scores
      </h3>
      {scores.length === 0 ? (
        <p className="text-zinc-500 text-xs">No scores yet. Be the first!</p>
      ) : (
        <ol className="space-y-2">
          {scores.map((entry, idx) => (
            <li key={entry.id} className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">{idx + 1}. {entry.user_name || 'Anonymous'}</span>
              <span className="text-zinc-100 font-mono font-bold">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
