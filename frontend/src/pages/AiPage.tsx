import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Cpu, Code2, ShieldCheck, Terminal } from 'lucide-react';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

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
    <div className="h-[calc(100vh-64px)] relative flex flex-col overflow-hidden bg-zinc-950">
      
      {/* Atmospheric Wallpaper Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ backgroundImage: "url('/AETSH-69_wallpaper/Aetsh69_chat_wallpaper.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950/95 backdrop-blur-sm"></div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Dynamic Empty State */}
        {isEmpty && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#C25932]/20 border border-[#C25932]/40 flex items-center justify-center mb-8">
              <Terminal className="w-8 h-8 text-[#D96B43]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100 mb-4">
              AETSH-69 <span className="text-[#D96B43]">Intelligence Hub</span>
            </h1>
            <p className="text-zinc-400 max-w-md mb-10">
              An interactive command center powered by RAG architecture. Ask me about Mark's engineering projects, IT services, or technical stack.
            </p>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={idx} 
                    onClick={() => sendMessage(action.text)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-white/10 hover:bg-white/5 hover:border-[#D96B43]/50 transition-all duration-300 text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-[#D96B43]/10 transition-colors flex-none">
                      <Icon className="w-4 h-4 text-[#D96B43]" />
                    </div>
                    <span className="font-sans text-sm text-zinc-300 group-hover:text-white">{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Chat Thread */
          <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-4 py-8">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#C25932]/20 border border-[#C25932]/40 flex items-center justify-center flex-none mt-1">
                      <Terminal className="w-4 h-4 text-[#D96B43]" />
                    </div>
                  )}
                  
                  {msg.role === 'user' ? (
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[#C25932]/20 border border-[#C25932]/30 text-zinc-100 text-sm leading-relaxed shadow-lg shadow-black/20">
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  ) : (
                    <div className="max-w-[80%] text-zinc-100 text-sm leading-relaxed pt-1">
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
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#C25932]/20 border border-[#C25932]/40 flex items-center justify-center flex-none mt-1">
                    <Terminal className="w-4 h-4 text-[#D96B43]" />
                  </div>
                  <div className="pt-3">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Input Bar */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent mb-8">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl shadow-black/50 p-2 focus-within:border-[#D96B43]/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AETSH-69..."
                rows={1}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-zinc-100 placeholder:text-zinc-400 text-sm resize-none px-4 py-3 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-3 rounded-full bg-[#D96B43] hover:bg-[#d96b43] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
