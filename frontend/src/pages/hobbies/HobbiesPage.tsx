import { Link } from 'react-router-dom';
import { Camera, UtensilsCrossed, Gamepad2, ArrowRight } from 'lucide-react';

const hobbies = [
  {
    icon: Camera,
    title: 'Photography',
    description: 'Street, landscape, and architectural photography from Nairobi and beyond.',
    path: '/hobbies/photography'
  },
  {
    icon: UtensilsCrossed,
    title: 'Cooking',
    description: 'Recipes, experiments, and notes on East African and global cuisine.',
    path: '/hobbies/cooking'
  },
  {
    icon: Gamepad2,
    title: 'Arcade',
    description: 'Browser-based games, high scores, and weekend builds.',
    path: '/hobbies/arcade'
  }
];

export default function HobbiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      
      {/* Header Section */}
      <div className="mb-12 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-serif text-zinc-100 mb-3">
          Beyond the Screen
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Creative outlets that keep the mind sharp and the work honest.
        </p>
      </div>

      {/* Interactive Clay Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {hobbies.map((hobby) => {
          const Icon = hobby.icon;
          return (
            <Link 
              key={hobby.title} 
              to={hobby.path} 
              className="group relative bg-zinc-900/90 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between min-h-[280px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),inset_2px_2px_4px_rgba(255,255,255,0.08),inset_-4px_-4px_8px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9),inset_2px_2px_4px_rgba(217,107,67,0.2),inset_-4px_-4px_8px_rgba(0,0,0,0.7)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Icon Container (Squircle) */}
              <div className="w-14 h-14 rounded-2xl bg-[#D96B43]/15 flex items-center justify-center mb-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.5)] group-hover:bg-[#D96B43]/25 transition-colors duration-300">
                <Icon className="w-6 h-6 text-[#D96B43]" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h2 className="text-2xl font-serif text-zinc-100">{hobby.title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">{hobby.description}</p>
              </div>

              {/* Action Link */}
              <div className="pt-6 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D96B43] group-hover:translate-x-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
