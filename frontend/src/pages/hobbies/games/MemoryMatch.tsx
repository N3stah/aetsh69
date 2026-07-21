import { useState, useEffect } from 'react';

const EMOJIS = ['🚀', '⚙️', '📡', '💻', '🔌', '🛠️', '📊', '🔒'];

const shuffle = () => {
  const cards = [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  return cards;
};

export default function MemoryMatch({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [cards, setCards] = useState(shuffle);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleClick = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || cards[id].matched) return;

    const newFlipped = [...flipped, id];
    const newCards = cards.map(c => (c.id === id ? { ...c, flipped: true } : c));
    
    setFlipped(newFlipped);
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === first || c.id === second ? { ...c, matched: true } : c)));
          setMatches(m => m + 1);
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === first || c.id === second ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (matches === EMOJIS.length && !gameOver) {
      setGameOver(true);
      const score = Math.max(1000 - moves * 50, 100);
      onGameOver(score);
    }
  }, [matches, moves, gameOver, onGameOver]);

  const reset = () => {
    setCards(shuffle());
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-ink-muted text-sm">Moves: <span className="text-ink font-mono font-bold">{moves}</span></span>
        <span className="text-ink-muted text-sm">Matches: <span className="text-ink font-mono font-bold">{matches}/{EMOJIS.length}</span></span>
        <button onClick={reset} className="btn-secondary text-xs">Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4 bg-[#111110] rounded-md border border-line">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`w-16 h-16 rounded-md flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-[#1F1F1D] border border-[#B8552F]'
                : 'bg-[#28282A] border border-[#333330] hover:border-[#B8552F]/50'
            } ${card.matched ? 'opacity-50' : ''}`}
          >
            {card.flipped || card.matched ? card.emoji : ''}
          </div>
        ))}
      </div>
      {gameOver && <p className="text-rust text-sm font-mono">You won in {moves} moves! Score: {Math.max(1000 - moves * 50, 100)}</p>}
    </div>
  );
}
