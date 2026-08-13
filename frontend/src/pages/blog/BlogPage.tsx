import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Terminal, ArrowRight, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blogData';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Machine Learning', 'DevOps', 'Computer Science', 'AgriTech'];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-20 pt-6 max-w-7xl mx-auto px-6">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
          <Terminal className="w-3.5 h-3.5 text-[#D96B43]"/>
          <span>TECHNICAL WRITING // ENGINEERING LOG</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-100">
          The AETSH-69 Blog
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
          Deep dives into systems architecture, AI tooling, DevOps, and building technology in Nairobi.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-[#C25932] text-white font-semibold'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 focus:border-[#D96B43]/50 focus:outline-none text-sm text-zinc-200 placeholder:text-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Blog Grid (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <Link 
            to={`/blog/${post.slug}`} 
            key={post.id} 
            className="group p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 hover:border-[#D96B43]/50 transition-all duration-300 flex flex-col justify-between min-h-[280px] shadow-lg hover:shadow-[#D96B43]/10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-zinc-700/50">
                  {post.category}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 hidden sm:flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight text-zinc-100 group-hover:text-[#D96B43] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{post.excerpt}</p>
            </div>
            <div className="pt-6 mt-auto">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-950/80 text-zinc-400 font-mono text-[10px] border border-zinc-800">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-[#D96B43] group-hover:translate-x-1 transition-transform">
                <span>Read Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 font-mono">No articles found matching your search.</p>
        </div>
      )}

    </div>
  );
}
