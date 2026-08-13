import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessagesSquare, List, ThumbsUp, Send } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Tech_Recruiter_Nairobi',
    content: 'Excellent breakdown of the USSD synchronization challenges. Most developers don\'t realize how strict state management has to be for feature phone sessions.',
    upvotes: 12,
    replies: [
      {
        id: '1-1',
        author: 'Mark Manoti',
        content: 'Exactly. The 60-second USSD session timeout forces you to design extremely efficient database transactions.',
        upvotes: 5
      }
    ]
  },
  {
    id: '2',
    author: 'DevOps_Engineer',
    content: 'The point about networking and volumes in Docker is spot on. I spent 3 hours last week debugging a volume mount issue that a deep understanding of Linux file systems would have solved in 5 minutes.',
    upvotes: 8
  }
];

export default function CommentSection() {
  const [viewMode, setViewMode] = useState<'flat' | 'threaded'>('threaded');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleUpvote = (id: string) => {
    // Basic upvote logic for UI demo
    console.log('Upvoted:', id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newEntry: Comment = {
      id: Date.now().toString(),
      author: 'Guest_User',
      content: newComment,
      upvotes: 0
    };
    setComments([...comments, newEntry]);
    setNewComment('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4 border-l border-zinc-800 pl-4' : 'mt-4'}`}>
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-[#D96B43]">{comment.author}</span>
          <button onClick={() => handleUpvote(comment.id)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
            <ThumbsUp className="w-3 h-3" /> {comment.upvotes}
          </button>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
      </div>
      {viewMode === 'threaded' && comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="mt-12 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif font-bold text-zinc-100">Comments ({comments.length})</h3>
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
          <button onClick={() => setViewMode('threaded')} className={`p-1.5 rounded-md ${viewMode === 'threaded' ? 'bg-[#C25932] text-white' : 'text-zinc-400'}`}>
            <MessagesSquare className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('flat')} className={`p-1.5 rounded-md ${viewMode === 'flat' ? 'bg-[#C25932] text-white' : 'text-zinc-400'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frosted Glass Composer */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 focus-within:border-[#D96B43]/50 transition-colors">
        <textarea 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your technical thoughts..." 
          rows={3}
          className="w-full bg-transparent text-zinc-200 text-sm outline-none resize-none placeholder:text-zinc-500"
        />
        <div className="flex justify-end mt-2">
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs transition-colors">
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        <AnimatePresence>
          {comments.map(comment => renderComment(comment))}
        </AnimatePresence>
      </div>
    </div>
  );
}
