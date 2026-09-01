import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Mic, Volume2, VolumeX, Square, Maximize2, Sparkles } from 'lucide-react';
import { aetsh69Service } from '../../services/aetsh69';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useChatHistoryStore } from '../../store/chatHistoryStore';

// Web Speech API TypeScript declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const SpeechRecognitionClass = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

export default function AetshChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  
  // Tooltip State
  const [tooltip1, setTooltip1] = useState(false);
  const [tooltip2, setTooltip2] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const voiceModeRef = useRef(false);
  const voiceOutputRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldRestartRef = useRef(false);
  const isSendingRef = useRef(false);

  const { sessions, activeSessionId, createSession, addMessageToSession, updateLastMessageInSession, setBackendConversationId, loadSession } = useChatHistoryStore();
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
  const conversationId = activeSession?.conversationId;

  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { voiceOutputRef.current = voiceOutputEnabled; }, [voiceOutputEnabled]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, interimText, loading]);

  // Tooltip Timers
  useEffect(() => {
    if (!open && !tooltipDismissed) {
      const t1 = setTimeout(() => setTooltip1(true), 3000);
      const t2 = setTimeout(() => { setTooltip1(false); setTooltip2(true); }, 15000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [open, tooltipDismissed]);

  useEffect(() => {
    if (open) {
      setTooltip1(false);
      setTooltip2(false);
    }
  }, [open]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string, onDone?: () => void) => {
    if (!('speechSynthesis' in window) || (!voiceOutputRef.current && !voiceModeRef.current)) {
      onDone?.();
      return;
    }
    stopSpeaking();
    const clean = stripMarkdown(text);
    const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google UK English Female'))
      || voices.find(v => v.name.includes('Microsoft Zira'))
      || voices.find(v => v.lang.startsWith('en'));

    let i = 0;
    setIsSpeaking(true);

    const speakNext = () => {
      if (i >= sentences.length) {
        setIsSpeaking(false);
        onDone?.();
        return;
      }
      const utt = new SpeechSynthesisUtterance(sentences[i].trim());
      if (voice) utt.voice = voice;
      utt.rate = 1.0;
      utt.pitch = 1.0;
      utt.onend = () => { i++; speakNext(); };
      utt.onerror = () => { i++; speakNext(); };
      window.speechSynthesis.speak(utt);
    };
    speakNext();
  };

  const stopListening = () => {
    shouldRestartRef.current = false;
    isSendingRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText('');
    finalTranscriptRef.current = '';
  };

  const sendMessage = async (text?: string, fromVoice = false, restartCallback?: () => void) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = createSession();
    }
    
    addMessageToSession(currentSessionId, { role: 'user', content: msg });
    setInput('');
    setInterimText('');
    finalTranscriptRef.current = '';
    setLoading(true);
    stopSpeaking();
    addMessageToSession(currentSessionId, { role: 'assistant', content: '' });

    const startTime = Date.now();

    try {
      const response = await aetsh69Service.chat(msg, conversationId, 'general');
      
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream reader not available');
        
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
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

        if (fromVoice && (voiceOutputRef.current || voiceModeRef.current)) {
          speakText(assistantMessage, () => {
            if (voiceModeRef.current) {
              setTimeout(() => restartCallback?.(), 300);
            }
          });
        }
      } else {
        const data = await response.json();
        setBackendConversationId(currentSessionId, data.conversation_id);
        const timeTaken = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
        updateLastMessageInSession(currentSessionId, data.response, timeTaken);

        if (fromVoice && (voiceOutputRef.current || voiceModeRef.current)) {
          speakText(data.response, () => {
            if (voiceModeRef.current) {
              setTimeout(() => restartCallback?.(), 300);
            }
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      updateLastMessageInSession(currentSessionId, 'Pole sana — connection issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startListening = (fromVoice = false) => {
    if (!SpeechRecognitionClass) return;
    stopSpeaking();
    isSendingRef.current = false;

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;
    recognition.continuous = true; 
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    finalTranscriptRef.current = '';
    shouldRestartRef.current = fromVoice;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + ' ';
        } else {
          interim += t;
        }
      }

      finalTranscriptRef.current = final;
      setInput(final);
      setInterimText(interim);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const toSend = (final + interim).trim();
        if (toSend) {
          isSendingRef.current = true;
          recognition.stop();
          sendMessage(toSend, fromVoice, () => startListening(true));
        }
      }, 2500); 
    };

    recognition.onerror = (e: Event) => {
      const err = e as ErrorEvent;
      if ((err as unknown as { error: string }).error === 'no-speech' && fromVoice) {
        recognition.stop();
        return;
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldRestartRef.current && !isSendingRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.error("Failed to restart recognition", e);
        }
      }
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      const toSend = (finalTranscriptRef.current + interimText).trim();
      if (toSend) sendMessage(toSend, voiceMode, () => startListening(true));
    } else {
      startListening(voiceMode);
    }
  };

  const toggleVoiceMode = () => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    voiceModeRef.current = newMode;
    if (newMode) {
      setVoiceOutputEnabled(true);
      voiceOutputRef.current = true;
      setTimeout(() => startListening(true), 300);
    } else {
      stopListening();
      stopSpeaking();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopListening();
      sendMessage();
    }
  };

  const displayInput = input + (interimText ? interimText : '');

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Timed Tooltips */}
        {!open && tooltip1 && !tooltipDismissed && (
          <div className="mb-4 relative w-56 p-3 bg-zinc-900 text-white text-sm rounded-xl shadow-2xl border border-zinc-700 animate-fade-in">
            <button onClick={() => setTooltipDismissed(true)} className="absolute top-1 right-1 text-zinc-500 hover:text-white p-1"><X size={12} /></button>
            Welcome to Mark's personal ecosystem! 👋
          </div>
        )}
        {!open && tooltip2 && !tooltipDismissed && (
          <div className="mb-4 relative w-64 p-3 bg-zinc-900 text-white text-sm rounded-xl shadow-2xl border border-zinc-700 animate-fade-in">
            <button onClick={() => setTooltipDismissed(true)} className="absolute top-1 right-1 text-zinc-500 hover:text-white p-1"><X size={12} /></button>
            Need help navigating projects or checking service pricing? Ask me anything!
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-[#C25932] text-white shadow-2xl shadow-black/50 flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Open AETSH-69 chat"
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/80 flex flex-col border border-white/10">
          
          {/* Wallpaper Background Layer */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: "url('/AETSH-69_wallpaper/Aetsh69_chat_wallpaper.jpeg')" }}
          />
          <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.7)_0%,rgba(9,9,11,0.95)_100%)]"></div>

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col h-full">
            
            {/* Glass Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img src="/Aetshlogo.png" alt="AETSH-69" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">AETSH-69</p>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : "Online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link to="/ai" onClick={() => setOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors" title="Open Full Screen">
                  <Maximize2 size={16} />
                </Link>
                {SpeechRecognitionClass && (
                  <button
                    onClick={toggleVoiceMode}
                    title={voiceMode ? 'Voice-to-voice ON' : 'Enable voice mode'}
                    className={`p-2 rounded-lg text-xs transition-colors ${voiceMode ? 'bg-[#C25932] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                  >
                    🎙️
                  </button>
                )}
                <button
                  onClick={() => { setVoiceOutputEnabled(!voiceOutputEnabled); if (isSpeaking) stopSpeaking(); }}
                  title={voiceOutputEnabled ? 'Voice output ON' : 'Voice output OFF'}
                  className={`p-2 rounded-lg transition-colors ${voiceOutputEnabled ? 'text-[#D96B43]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  {voiceOutputEnabled || voiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {voiceMode && (
              <div className="px-4 py-2 bg-[#D96B43]/10 border-b border-[#D96B43]/20 text-xs text-[#D96B43] text-center font-mono">
                🎙️ Voice-to-voice active
              </div>
            )}

            {/* Messages Area */}
            <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#C25932]/90 backdrop-blur-md text-white rounded-br-sm shadow-lg shadow-[#C25932]/20' 
                        : 'bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-100 rounded-bl-sm shadow-lg shadow-black/20'
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
                    {msg.latency && !loading && msg.role === 'assistant' && (
                      <div className="text-[10px] text-zinc-600 font-mono mt-2 flex items-center gap-1">
                        <span>⚡</span> Processed in {msg.latency}s
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg shadow-black/20">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#D96B43] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Glass Input Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/40 backdrop-blur-xl">
              <div className="flex items-end gap-2 bg-zinc-800/50 border border-white/10 rounded-2xl p-2 focus-within:border-[#D96B43]/50 transition-colors">
                <textarea
                  value={displayInput}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening...' : 'Message AETSH-69...'}
                  rows={1}
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-zinc-100 placeholder:text-zinc-500 text-sm resize-none px-2 py-1.5 outline-none"
                />
                {SpeechRecognitionClass && (
                  <button
                    onClick={handleMicClick}
                    title="Voice input"
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      isListening
                        ? 'bg-[#C25932] text-white animate-voice-pulse'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isListening ? <Square size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <button
                  onClick={() => { stopListening(); sendMessage(); }}
                  disabled={loading || !displayInput.trim()}
                  className="p-2.5 rounded-xl bg-[#C25932] hover:bg-[#d96b43] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
