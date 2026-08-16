export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aetsh69Service = {
  async chat(message: string, conversationId?: string, context?: string): Promise<Response> {
    const token = JSON.parse(localStorage.getItem('aetsh69-auth') || '{}')?.state?.accessToken;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/aetsh69/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message, conversation_id: conversationId, context })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response;
  }
};
