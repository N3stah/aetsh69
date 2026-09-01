import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, Code2, ShieldCheck, ArrowRight } from 'lucide-react';
import { aetsh69Service, type ChatMessage } from '../services/aetsh69';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const quickActions = [
  { icon: Cpu, text: "Summarize Mark's technical skills" },
  { icon: Code2, text: "What web development services are offered?" },
  { icon: Sparkles, text: "Explain the architecture of SmartShamba" },
  { icon: ShieldCheck, text: "How does the DEEP-TRIO malware scanner work?" },
];

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Welcome to the AETSH-69 Intelligence Hub. I am Mark's AI concierge. Ask me about his projects, services, or technical stack."
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await aetsh69Service.chat(msg, conversationId, 'general');
      
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream reader not available');
        
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.conversation_id) {
                  setConversationId(parsed.conversation_id);
                }
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { 
                      role: 'assistant', 
                      content: assistantMessage 
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming
        const data = await response.json();
        setConversationId(data.conversation_id);
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Pole sana — connection issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex flex-col overflow-hidden bg-zinc-950">
      
      {/* Wallpaper Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ backgroundImage: "url('/AETSH-69_wallpaper/Aetsh69_chat_wallpaper.jpeg')" }}
      />
      {/* Dimming Overlay */}
      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.7)_0%,rgba(9,9,11,0.95)_100%)]"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-zinc-100 mb-2">
            AETSH-69 <span className="text-[#D96B43]">Intelligence Hub</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            An interactive command center powered by RAG architecture. Ask me about Mark's engineering projects, IT services, or technical stack.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button 
                key={idx} 
                onClick={() => sendMessage(action.text)}
                disabled={loading}
                className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-[#D96B43]/50 hover:bg-zinc-900/80 transition-all duration-200 text-left disabled:opacity-50 group"
              >
                <Icon className="w-4 h-4 text-[#D96B43] flex-none" />
                <span className="text-xs font-mono text-zinc-300 group-hover:text-white">{action.text}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
          
          {/* Messages Area */}
          <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#C25932] text-white rounded-br-sm shadow-lg shadow-[#C25932]/20' 
                      : 'bg-zinc-900/80 backdrop-blur-md border border-white/10 text-zinc-100 rounded-bl-sm shadow-lg shadow-black/20'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      rehypePlugins={[[rehypeSanitize]]}
                      components={{
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 space-y-1 mb-2" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 space-y-1 mb-2" />,
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noreferrer" className="text-[#D96B43] underline" />,
                        code: ({node, ...props}) => <code {...props} className="bg-black/40 text-[#D96B43] px-1 rounded" />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-lg shadow-black/20">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-white/5 p-4 bg-zinc-900/40 backdrop-blur-xl">
            <div className="flex items-end gap-2 bg-zinc-800/50 border border-white/10 rounded-2xl p-2 focus-within:border-[#D96B43]/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AETSH-69..."
                rows={1}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-zinc-100 placeholder:text-zinc-500 text-sm resize-none px-3 py-2.5 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-[#C25932] hover:bg-[#d96b43] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
