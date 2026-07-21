import { Link } from 'react-router-dom';
import { Camera, Utensils, Gamepad2, ArrowRight } from 'lucide-react';

const hobbies = [
  { slug: 'photography', title: 'Photography', description: 'Street, landscape, and architectural photography from Nairobi and beyond.', icon: <Camera size={28} /> },
  { slug: 'cooking', title: 'Cooking', description: 'Recipes, experiments, and notes on East African and global cuisine.', icon: <Utensils size={28} /> },
  { slug: 'arcade', title: 'Arcade', description: 'Browser-based games, high scores, and weekend builds.', icon: <Gamepad2 size={28} /> },
];

export default function HobbiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12">
        <p className="text-rust font-mono text-sm mb-2">Hobbies</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Beyond the Screen</h1>
        <p className="text-ink-muted text-lg mt-4 leading-relaxed">Creative outlets that keep the mind sharp and the work honest.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hobbies.map(h => (
          <Link key={h.slug} to={`/${h.slug}`} className="card card-hover group">
            <div className="w-12 h-12 rounded-md bg-rust-muted flex items-center justify-center text-ink mb-4">{h.icon}</div>
            <h2 className="font-display text-xl font-semibold text-ink group-hover:text-rust transition-colors duration-150">{h.title}</h2>
            <p className="text-ink-muted text-sm mt-2 leading-relaxed">{h.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-rust text-sm font-medium">Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
