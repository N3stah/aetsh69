import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Cpu, Code2, ShieldCheck, PlusCircle, Trash2, MessageSquare, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { aetsh69Service } from '../services/aetsh69';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useChatHistoryStore } from '../store/chatHistoryStore';
import type { ChatMessage } from '../store/chatHistoryStore';

const quickActions = [
  { icon: Cpu, text: "Summarize Mark's technical skills" },
  { icon: Code2, text: "What web development services are offered?" },
  { icon: Sparkles, text: "Explain the architecture of SmartShamba" },
  { icon: ShieldCheck, text: "How does the DEEP-TRIO malware scanner work?" },
];

export default function AiPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { sessions, activeSessionId, createSession, addMessageToSession, updateLastMessageInSession, setBackendConversationId, loadSession, deleteSession, clearAllHistory } = useChatHistoryStore();
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
  const isEmpty = messages.length === 0;
  const conversationId = activeSession?.conversationId;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, isThinking]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = createSession();
    }
    
    addMessageToSession(currentSessionId, { role: 'user', content: msg });
    setInput('');
    setLoading(true);
    setIsThinking(true);

    addMessageToSession(currentSessionId, { role: 'assistant', content: '' });

    const startTime = Date.now();

    try {
      const response = await aetsh69Service.chat(msg, conversationId, 'general');
      
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream reader not available');
        
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let firstTokenReceived = false;
        
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
                  setBackendConversationId(currentSessionId, parsed.conversation_id);
                }
                if (parsed.content) {
                  if (!firstTokenReceived) {
                    setIsThinking(false);
                    firstTokenReceived = true;
                  }
                  assistantMessage += parsed.content;
                  updateLastMessageInSession(currentSessionId, assistantMessage);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
        
        const timeTaken = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
        updateLastMessageInSession(currentSessionId, assistantMessage, timeTaken);

      } else {
        const data = await response.json();
        setBackendConversationId(currentSessionId, data.conversation_id);
        const timeTaken = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
        updateLastMessageInSession(currentSessionId, data.response, timeTaken);
      }
    } catch (err) {
      console.error('Chat error:', err);
      updateLastMessageInSession(currentSessionId, 'Pole sana — connection issue. Please try again.');
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    loadSession('');
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-64px)] relative flex flex-row overflow-hidden bg-zinc-950">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/5 bg-zinc-950/80 backdrop-blur-md flex flex-col h-full overflow-hidden`}>
        <div className="p-4 border-b border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">History</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-white">
              <PanelLeftClose size={16} />
            </button>
          </div>
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white text-sm font-medium transition-colors">
            <PlusCircle size={16} /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.slice().reverse().map(session => (
            <div 
              key={session.id} 
              className={`group relative w-full text-left p-3 rounded-lg transition-colors ${activeSessionId === session.id ? 'bg-zinc-800/50 text-white' : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'}`}
            >
              <button 
                onClick={() => loadSession(session.id)}
                className="w-full text-left pr-8"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="flex-none opacity-70" />
                  <p className="text-sm font-medium truncate">{session.title}</p>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-6">{new Date(session.createdAt).toLocaleDateString()}</p>
              </button>
              <button 
                onClick={() => deleteSession(session.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={clearAllHistory} className="w-full flex items-center gap-2 text-left text-xs text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} /> Clear All History
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Atmospheric Wallpaper Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: "url('/AETSH-69_wallpaper/Aetsh69_chat_wallpaper.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950/95 backdrop-blur-sm"></div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm">
            {!sidebarOpen ? (
              <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800/50">
                <PanelLeftOpen size={18} />
              </button>
            ) : (
              <div className="w-10"></div>
            )}
            <div className="w-10"></div>
          </div>

          {/* Dynamic Empty State */}
          {isEmpty && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <img src="/Aetshlogo.png" alt="AETSH-69 Logo" className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10 mb-8" />
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
                {messages.map((msg: ChatMessage, i: number) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <img 
                        src="/Aetshlogo.png" 
                        alt="AETSH-69" 
                        className={`w-8 h-8 rounded-full object-cover ring-1 ring-white/10 flex-none mt-1 ${loading && msg.content === '' ? 'animate-pulse' : ''}`} 
                      />
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
                        
                        {msg.latency && !loading && (
                          <div className="text-[10px] text-zinc-600 font-mono mt-2 flex items-center gap-1">
                            <span>⚡</span> Processed in {msg.latency}s
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Exposed "Thinking" UI */}
                {isThinking && (
                  <div className="flex gap-3 justify-start">
                    <img src="/Aetshlogo.png" alt="AETSH-69" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 animate-pulse flex-none mt-1" />
                    <div className="pt-3 text-zinc-500 text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Analyzing context...
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
                  className="p-3 rounded-full bg-[#D96B43] hover:bg-[#d96b43] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-none"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-zinc-600 text-center mt-2">
                Conversations are saved locally on your device and anonymously logged to help improve AETSH-69.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
