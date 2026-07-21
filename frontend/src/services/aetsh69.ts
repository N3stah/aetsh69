import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export const aetsh69Service = {
  async chat(message: string, conversationId?: string, context?: string): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>('/aetsh69/chat', {
      message,
      conversation_id: conversationId,
      context,
    });
    return data;
  },
};
