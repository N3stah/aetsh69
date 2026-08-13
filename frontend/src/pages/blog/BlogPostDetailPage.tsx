import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blogData';
import CommentSection from '../../components/blog/CommentSection';

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-20 max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-serif text-zinc-100 mb-4">Article not found</h1>
        <Link to="/blog" className="text-[#D96B43] hover:underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-20">
      
      {/* Back Button */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-[#D96B43] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </Link>

      {/* Article Header */}
      <article>
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="px-2.5 py-1 rounded-full bg-[#D96B43]/10 text-[#D96B43] border border-[#D96B43]/30 uppercase tracking-widest">
              {post.category}
            </span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-zinc-100 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-lg text-zinc-400 leading-relaxed font-medium">
            {post.excerpt}
          </p>
        </div>

        {/* Article Body (Optimized Typography) */}
        <div className="prose prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-zinc-300 leading-loose text-base sm:text-lg mb-6 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-zinc-800">
        {post.tags.map(tag => (
          <span key={tag} className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
            {tag}
          </span>
        ))}
      </div>

      {/* Interactive Comment System */}
      <CommentSection />

    </div>
  );
}
