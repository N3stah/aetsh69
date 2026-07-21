import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Tag, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { AddItemModal } from '../../components/admin/AddItemModal';

interface BlogPost {
  id: string; title: string; slug: string; excerpt?: string;
  cover_image?: string; cover_image_url?: string; category?: string; category_name?: string;
  published_at?: string; reading_time?: number; tags?: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filtered, setFiltered] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/blog/posts');
        if (mounted) {
          const arr = res.data?.posts || [];
          setPosts(arr);
          setFiltered(arr);
        }
      } catch {
        if (mounted) setError('Could not load posts.');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let result = posts;
    if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase()));
    if (activeTag) result = result.filter(p => p.tags?.includes(activeTag));
    setFiltered(result);
  }, [search, activeTag, posts]);

  const allTags = [...new Set((Array.isArray(posts) ? posts : []).flatMap(p => p.tags || []))];

  const handleAddPost = async (data: Record<string, string | number | string[]>) => {
    await api.post('/blog/posts', {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover_image_url: data.cover_image_url,
      status: 'published'
    });
    const res = await api.get('/blog/posts');
    setPosts(res.data?.posts || []);
  };

  const modalFields = [
    { name: 'title', label: 'Title', type: 'text' as const, placeholder: 'My New Post' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' as const, placeholder: 'Short summary...' },
    { name: 'content', label: 'Content (Markdown)', type: 'textarea' as const, placeholder: 'Write your post here...' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'file' as const }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <p className="text-rust font-mono text-sm mb-2">Blog</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-4">Writing</h1>
          <p className="text-ink-muted text-lg leading-relaxed">Engineering deep dives, tutorials, and thoughts from Nairobi.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded text-sm mt-2">
            <Plus size={16} /> New Post
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input className="input-field w-full pl-9 text-sm" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTag(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!activeTag ? 'border-rust text-rust bg-rust/5' : 'border-line text-ink-muted hover:border-rust/40'}`}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${activeTag === tag ? 'border-rust text-rust bg-rust/5' : 'border-line text-ink-muted hover:border-rust/40'}`}>
              <Tag size={10} /> {tag}
            </button>
          ))}
        </div>
      )}

      {error && <div className="card border-rust/30 mb-6"><p className="text-rust text-sm">{error}</p></div>}

      {filtered.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-ink-muted">No posts found{search ? ` for "${search}"` : ''}.</p>
        </div>
      )}

      <div className="space-y-6">
        {filtered.map(post => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
            <article className="card card-hover flex gap-6">
              {(post.cover_image || post.cover_image_url) && (
                <img src={post.cover_image || post.cover_image_url} alt={post.title} className="w-32 h-24 object-cover rounded-md border border-line flex-shrink-0 hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {(post.category || post.category_name) && <span className="text-xs px-2 py-0.5 rounded-full bg-rust/10 text-rust font-mono">{post.category || post.category_name}</span>}
                  {post.published_at && <span className="text-ink-faint text-xs">{new Date(post.published_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {post.reading_time && <span className="text-ink-faint text-xs flex items-center gap-1"><Clock size={10} /> {post.reading_time} min</span>}
                </div>
                <h2 className="font-display text-xl font-semibold text-ink mb-2 group-hover:text-rust transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-ink-muted text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 4).map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-line text-ink-faint">{tag}</span>)}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddPost} title="Add New Post" fields={modalFields} />
    </div>
  );
}
