import api from './api';

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactService = {
  async send(data: ContactPayload): Promise<{ id: string; message: string }> {
    const { data: res } = await api.post('/contact/', data);
    return res;
  },
};
