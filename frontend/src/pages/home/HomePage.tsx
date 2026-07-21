import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Brain, Wifi, Camera, ShoppingBag, Users } from 'lucide-react';

const sections = [
  { icon: Code2, title: 'Portfolio', desc: 'Engineering projects and case studies', path: '/portfolio', color: 'text-rust' },
  { icon: Brain, title: 'AETSH-69 AI', desc: 'My AI concierge — ask me anything', path: null, color: 'text-rust' },
  { icon: ShoppingBag, title: 'Shop', desc: 'Tools, kits and service packages', path: '/shop', color: 'text-rust' },
  { icon: Wifi, title: 'Services', desc: 'Engineering and IT consultancy', path: '/services', color: 'text-rust' },
  { icon: Camera, title: 'Hobbies', desc: 'Photography, cooking, arcade games', path: '/hobbies', color: 'text-rust' },
  { icon: Users, title: 'Membership', desc: 'Join the ecosystem — Builder tier', path: '/membership', color: 'text-rust' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <p className="text-rust font-mono text-sm mb-4 tracking-wider">Nairobi, Kenya</p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-ink mb-6 leading-tight">
          Mark Manoti<br />Ndege
        </h1>
        <p className="text-ink-muted text-xl md:text-2xl max-w-2xl leading-relaxed mb-10">
          Software engineer, AI builder, and technologist. I design and ship full-stack systems, AI-powered products, and IT services — from Nairobi to the world.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/portfolio" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            View Portfolio <ArrowRight size={18} />
          </Link>
          <Link to="/services" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
            My Services
          </Link>
        </div>
      </section>

      {/* Sections grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ icon: Icon, title, desc, path }) => (
            path ? (
              <Link key={title} to={path} className="card card-hover group flex flex-col gap-3">
                <Icon size={24} className="text-rust" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink group-hover:text-rust transition-colors">{title}</h2>
                  <p className="text-ink-muted text-sm mt-1">{desc}</p>
                </div>
                <span className="text-rust text-xs flex items-center gap-1 mt-auto">Explore <ArrowRight size={12} /></span>
              </Link>
            ) : (
              <div key={title} className="card flex flex-col gap-3 cursor-default">
                <Icon size={24} className="text-rust" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
                  <p className="text-ink-muted text-sm mt-1">{desc}</p>
                </div>
                <span className="text-ink-faint text-xs mt-auto">Available via chat widget ↗</span>
              </div>
            )
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Join the ecosystem</h2>
            <p className="text-ink-muted">Get exclusive tutorials, priority AI access, and direct collaboration.</p>
          </div>
          <Link to="/membership" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            View membership plans <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
