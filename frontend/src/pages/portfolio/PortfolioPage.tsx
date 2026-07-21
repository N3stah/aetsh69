import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService, type Project } from '../../services/portfolio';
import { ExternalLink, Code2, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'AI', 'Web', 'IoT', 'Mobile', 'Other'];

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [category, setCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portfolioService.listProjects().then(data => { setProjects(data); setFiltered(data); }).catch(() => setError('Could not load projects.'));
  }, []);

  useEffect(() => {
    setFiltered(category === 'All' ? projects : projects.filter(p => p.category === category || p.tags?.includes(category)));
  }, [category, projects]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-rust font-mono text-sm mb-2">Portfolio</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-4">Projects</h1>
        <p className="text-ink-muted text-lg leading-relaxed">Engineering projects, AI experiments, and products built from Nairobi.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${category === cat ? 'border-rust text-rust bg-rust/5' : 'border-line text-ink-muted hover:border-rust/40'}`}>
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="card border-rust/30 mb-6"><p className="text-rust text-sm">{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(project => (
          <div key={project.id} className="card card-hover flex flex-col group">
            {project.image_url ? (
              <img src={project.image_url} alt={project.name} className="w-full h-48 object-cover rounded-md mb-4 border border-line" />
            ) : (
              <div className="w-full h-48 bg-canvas-overlay rounded-md mb-4 border border-line flex items-center justify-center">
                <Tag size={28} className="text-ink-faint" />
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-display text-lg font-semibold text-ink group-hover:text-rust transition-colors">{project.name || project.title}</h2>
              {project.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rust/10 text-rust font-mono flex-shrink-0 ml-2">{project.category}</span>}
            </div>
            <p className="text-ink-muted text-sm leading-relaxed flex-1 mb-4">{project.description || project.short_description}</p>
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tech_stack.slice(0, 4).map((tech: string) => (
                  <span key={tech} className="text-[10px] px-2 py-0.5 rounded border border-line text-ink-faint">{tech}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 pt-3 border-t border-line mt-auto">
              <Link to={`/portfolio/${project.slug}`} className="btn-secondary text-xs flex-1 text-center">View details</Link>
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center gap-1">
                  <ExternalLink size={12} /> Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center gap-1">
                  <Code2 size={12} /> Code
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
