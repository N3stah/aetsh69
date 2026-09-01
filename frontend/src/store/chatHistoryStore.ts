import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  latency?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
  conversationId?: string;
}

interface ChatHistoryState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createSession: () => string;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  updateLastMessageInSession: (sessionId: string, content: string, latency?: number) => void;
  setBackendConversationId: (sessionId: string, convId: string) => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearAllHistory: () => void;
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      createSession: () => {
        const id = Date.now().toString();
        set((state) => ({
          sessions: [...state.sessions, { id, title: 'New Chat', createdAt: Date.now(), messages: [] }],
          activeSessionId: id
        }));
        return id;
      },
      addMessageToSession: (sessionId, message) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id === sessionId) {
            const messages = [...s.messages, message];
            if (s.title === 'New Chat' && message.role === 'user') {
              return { ...s, messages, title: message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '') };
            }
            return { ...s, messages };
          }
          return s;
        })
      })),
      updateLastMessageInSession: (sessionId, content, latency) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id === sessionId) {
            const messages = [...s.messages];
            if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
              messages[messages.length - 1] = { ...messages[messages.length - 1], content, latency };
            }
            return { ...s, messages };
          }
          return s;
        })
      })),
      setBackendConversationId: (sessionId, convId) => set((state) => ({
        sessions: state.sessions.map(s => s.id === sessionId ? { ...s, conversationId: convId } : s)
      })),
      loadSession: (sessionId) => set({ activeSessionId: sessionId }),
      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId
      })),
      clearAllHistory: () => set({ sessions: [], activeSessionId: null })
    }),
    { name: 'aetsh69-chat-history' }
  )
);
