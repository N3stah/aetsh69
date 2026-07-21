import { useState, useRef, useEffect } from 'react';
import { Search, X, FileText, Code2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchService, type SearchResult } from '../../services/search';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.search(query);
        setResults(res);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  }, [query]);

  const close = () => { setOpen(false); setQuery(''); setResults([]); };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-ink-muted text-sm px-3 py-1.5 rounded-md border border-line hover:border-rust/40 transition-colors">
        <Search size={14} />
        <span className="hidden sm:inline">Search</span>
        <span className="hidden sm:inline text-xs text-ink-faint ml-1">⌘K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={close}>
          <div className="w-full max-w-lg bg-canvas-raised border border-line rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <Search size={16} className="text-ink-faint flex-shrink-0" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-ink placeholder:text-ink-faint outline-none text-sm"
                placeholder="Search blog posts and projects..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {loading && <Loader2 size={14} className="animate-spin text-ink-faint" />}
              <button onClick={close} className="text-ink-faint hover:text-ink"><X size={16} /></button>
            </div>

            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto py-2">
                {results.map(r => (
                  <Link key={r.id} to={r.type === 'blog' ? `/blog/${r.slug}` : `/portfolio/${r.slug}`}
                    onClick={close}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-canvas-overlay transition-colors">
                    <div className="w-7 h-7 rounded-md bg-rust/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {r.type === 'blog'
                        ? <FileText size={14} className="text-rust" />
                        : <Code2 size={14} className="text-rust" />}
                    </div>
                    <div>
                      <p className="text-ink text-sm font-medium">{r.title}</p>
                      {r.excerpt && <p className="text-ink-muted text-xs mt-0.5 line-clamp-1">{r.excerpt}</p>}
                      <span className="text-ink-faint text-[10px] capitalize">{r.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-ink-muted text-sm">
                No results for "<span className="text-ink">{query}</span>"
              </div>
            )}

            {!query && (
              <div className="px-4 py-4 text-center text-ink-faint text-xs">
                Type to search blog posts and projects
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
