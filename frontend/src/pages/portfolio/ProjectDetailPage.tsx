import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { portfolioService, type ProjectDetailExtended as ProjectDetail } from '../../services/portfolio';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.39.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.21 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/>
  </svg>
);

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    portfolioService
      .getProject(slug)
      .then(setProject)
      .catch(() => setError('Project not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="h-8 w-32 bg-canvas-overlay animate-pulse rounded mb-8" />
        <div className="h-12 w-3/4 bg-canvas-overlay animate-pulse rounded mb-4" />
        <div className="h-24 bg-canvas-overlay animate-pulse rounded" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-ink-muted mb-4">{error || 'Project not found.'}</p>
        <Link to="/portfolio" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/portfolio" className="nav-link inline-flex items-center gap-2 mb-8">
        <ArrowLeft size={16} /> Back to Portfolio
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-4xl font-semibold text-ink">
          {project.title}
        </h1>
        {project.featured && <span className="badge badge-accent">Featured</span>}
      </div>

      {project.tagline && (
        <p className="text-ink-muted text-lg mt-2">{project.tagline}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-4 text-ink-faint text-sm">
        {(project.start_date || project.is_ongoing) && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {project.start_date}
            {project.is_ongoing ? ' — Present' : project.end_date ? ` — ${project.end_date}` : ''}
          </span>
        )}
      </div>

      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {project.tech_stack.map((tech) => (
            <span key={tech} className="badge">{tech}</span>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {project.links?.github && (
          <a href={project.links.github} target="_blank" rel="noreferrer"
             className="btn-secondary inline-flex items-center gap-2 text-sm">
            <GithubIcon /> View Source
          </a>
        )}
        {project.links?.live && (
          <a href={project.links.live} target="_blank" rel="noreferrer"
             className="btn-primary inline-flex items-center gap-2 text-sm">
            <ExternalLink size={16} /> Live Demo
          </a>
        )}
      </div>

      {project.cover_image && (
        <img
          src={project.cover_image}
          alt={project.title}
          className="w-full rounded-lg border border-line mt-8"
        />
      )}

      <div className="divider my-8" />

      <div className="text-ink-muted leading-relaxed whitespace-pre-wrap">
        {project.content || project.description}
      </div>

      {project.gallery && project.gallery.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {project.gallery.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt || img.caption || `${project.title} screenshot ${i + 1}`}
              className="w-full rounded-lg border border-line"
            />
          ))}
        </div>
      )}
    </div>
  );
}
