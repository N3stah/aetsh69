import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, Volume2, VolumeX, Square } from 'lucide-react';
import { aetsh69Service, type ChatMessage } from '../../services/aetsh69';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, ArrowRight } from 'lucide-react';

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


interface ParsedAction {
  text: string;
  actionType: 'add_to_cart' | 'navigate' | null;
  payload: string;
}

const parseAction = (text: string): ParsedAction => {
  const regex = /\[ACTION:(add_to_cart|navigate):([a-zA-Z0-9\-_\/:]+)\]/;
  const match = text.match(regex);
  if (match) {
    return {
      text: text.replace(regex, '').trim(),
      actionType: match[1] as 'add_to_cart' | 'navigate',
      payload: match[2]
    };
  }
  return { text, actionType: null, payload: '' };
};

const ActionButton = ({ type, payload }: { type: 'add_to_cart' | 'navigate', payload: string }) => {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === 'add_to_cart') {
      // Fetch product details from the window object or just pass the ID
      // Since we don't have full product context here, we'll just add the ID and open cart
      // The cart will need to handle fetching product details if not present, 
      // but for now, we'll assume the user saw the price in the chat.
      addItem({ id: payload, slug: payload, name: payload, price: 0, currency: 'KES', quantity: 1 });
      openCart();
    } else if (type === 'navigate') {
      navigate(payload);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rust hover:bg-rust-hover text-white font-mono text-xs transition-colors shadow-sm"
    >
      {type === 'add_to_cart' ? <ShoppingCart className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
      <span>{type === 'add_to_cart' ? 'Add to Cart' : 'View Page'}</span>
    </button>
  );
};

export default function AetshChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Habari! Mimi ni AETSH-69 — Mark's AI concierge. Ask me about Mark's projects, services, shop, or anything on this site. You can also use the 🎤 mic to talk to me!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  
  const voiceModeRef = useRef(false);
  const voiceOutputRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldRestartRef = useRef(false);
  const isSendingRef = useRef(false);

  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { voiceOutputRef.current = voiceOutputEnabled; }, [voiceOutputEnabled]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, interimText]);

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

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setInterimText('');
    finalTranscriptRef.current = '';
    setLoading(true);
    stopSpeaking();

    try {
      const response = await aetsh69Service.chat(msg, conversationId, 'general');
      
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream reader not available');
        
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        // Add empty assistant message to fill in
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
                  // Update the last message (assistant) with new text
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

        if (fromVoice && (voiceOutputRef.current || voiceModeRef.current)) {
          speakText(assistantMessage, () => {
            if (voiceModeRef.current) {
              setTimeout(() => restartCallback?.(), 300);
            }
          });
        }
      } else {
        // Fallback for non-streaming (e.g., Gemini)
        const data = await response.json();
        setConversationId(data.conversation_id);
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Pole sana — connection issue. Please try again.' }]);
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

  // Load speech synthesis voices & cleanup on unmount
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
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rust text-ink shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95"
        aria-label="Open AETSH-69 chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-90 max-w-[calc(100vw-2rem)] h-130 max-h-[calc(100vh-8rem)] bg-canvas-raised border border-line-strong rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-line flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rust-muted flex items-center justify-center">
              <span className="text-xs font-bold text-ink">69</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">AETSH-69</p>
              <p className="text-xs text-ink-faint">
                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : "Mark's AI concierge"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice mode toggle */}
              {SpeechRecognitionClass && (
                <button
                  onClick={toggleVoiceMode}
                  title={voiceMode ? 'Voice-to-voice ON — click to disable' : 'Enable voice-to-voice mode'}
                  className={`p-1.5 rounded-md text-xs transition-colors ${voiceMode ? 'bg-rust text-ink' : 'text-ink-faint hover:text-ink'}`}
                >
                  🎙️
                </button>
              )}
              {/* Speaker toggle */}
              <button
                onClick={() => { setVoiceOutputEnabled(!voiceOutputEnabled); if (isSpeaking) stopSpeaking(); }}
                title={voiceOutputEnabled ? 'Voice output ON' : 'Voice output OFF'}
                className={`p-1.5 rounded-md transition-colors ${voiceOutputEnabled ? 'text-rust' : 'text-ink-faint hover:text-ink'}`}
              >
                {voiceOutputEnabled || voiceMode ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </div>

          {/* Voice mode banner */}
          {voiceMode && (
            <div className="px-4 py-2 bg-rust/10 border-b border-rust/20 text-xs text-rust text-center">
              🎙️ Voice-to-voice active — speak and AETSH-69 will reply aloud
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => {
              const parsed = msg.role === 'assistant' ? parseAction(msg.content) : null;
              return (
              <div key={i}
                className={`max-w-[85%] px-3.5 py-2.5 rounded-md text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-rust text-ink ml-auto whitespace-pre-wrap' : 'bg-canvas-overlay text-ink-muted border border-line'
                }`}>
                {msg.role === 'assistant' && parsed ? (
                  <>
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 space-y-1 mb-2" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 space-y-1 mb-2" />,
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noreferrer" className="text-rust underline" />,
                        code: ({node, ...props}) => <code {...props} className="bg-zinc-950/50 text-rust px-1 rounded" />
                      }}
                    >
                      {parsed.text}
                    </ReactMarkdown>
                    {parsed.actionType && <ActionButton type={parsed.actionType} payload={parsed.payload} />}
                  </>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              );
            })}
            {loading && (
              <div className="bg-canvas-overlay border border-line rounded-md px-3.5 py-2.5 w-fit">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-rust rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-rust rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-rust rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-line p-3 flex gap-2 items-end">
            <textarea
              value={displayInput}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎤 Listening — speak now...' : 'Ask AETSH-69 anything...'}
              rows={1}
              className={`input-field flex-1 resize-none text-sm py-2 transition-colors ${isListening ? 'border-rust/60' : ''}`}
            />

            {SpeechRecognitionClass && (
              <button
                onClick={handleMicClick}
                title="Voice input (Chrome/Edge only)"
                className={`rounded-md p-2.5 transition-all duration-150 ${
                  isListening
                    ? 'bg-rust text-ink animate-voice-pulse'
                    : 'bg-canvas-overlay text-ink-muted hover:text-rust border border-line'
                }`}
              >
                {isListening ? <Square size={16} /> : <Mic size={16} />}
              </button>
            )}

            <button
              onClick={() => { stopListening(); sendMessage(); }}
              disabled={loading || !displayInput.trim()}
              className="bg-rust text-ink rounded-md p-2.5 hover:bg-rust-hover transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
