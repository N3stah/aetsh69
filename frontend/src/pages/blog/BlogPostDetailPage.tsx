import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, type BlogPostDetail } from '../../services/blog';
import { Clock, ArrowLeft, Tag, Share2, ExternalLink } from 'lucide-react';

function readingTime(content: string): number {
  const words = content?.trim().split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    blogService.getPost(slug)
      .then(setPost)
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const shareUrl = window.location.href;
  const shareText = post ? `${post.title} — via AETSH-69` : '';

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="w-5 h-5 rounded-full border-2 border-rust border-t-transparent animate-spin mx-auto" />
    </div>
  );

  if (error || !post) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <p className="text-ink-muted mb-4">{error || 'Post not found.'}</p>
      <Link to="/blog" className="btn-secondary text-sm">Back to Blog</Link>
    </div>
  );

  const mins = readingTime(post.content || post.body || '');

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/blog" className="flex items-center gap-2 text-ink-muted text-sm mb-8 hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-8 border border-line" />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {post.category && (
          <span className="text-xs px-2 py-1 rounded-full bg-rust/10 text-rust font-mono">{post.category}</span>
        )}
        <span className="flex items-center gap-1 text-ink-faint text-xs">
          <Clock size={12} /> {mins} min read
        </span>
        {post.published_at && (
          <span className="text-ink-faint text-xs">
            {new Date(post.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        )}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4 leading-tight">{post.title}</h1>

      {post.excerpt && <p className="text-ink-muted text-lg leading-relaxed mb-8 border-l-2 border-rust pl-4">{post.excerpt}</p>}

      <div className="prose prose-invert max-w-none text-ink-muted leading-relaxed mb-12"
        dangerouslySetInnerHTML={{ __html: post.content || post.body || '<p>Content coming soon.</p>' }} />

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t border-line">
          <Tag size={14} className="text-ink-faint" />
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full border border-line text-ink-muted">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-6 border-t border-line">
        <span className="text-ink-muted text-sm flex items-center gap-2"><Share2 size={14} /> Share:</span>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-secondary text-xs flex items-center gap-1.5">
          <ExternalLink size={12} /> X / Twitter
        </a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-secondary text-xs flex items-center gap-1.5">
          <ExternalLink size={12} /> LinkedIn
        </a>
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-secondary text-xs">
          WhatsApp
        </a>
      </div>
    </div>
  );
}
