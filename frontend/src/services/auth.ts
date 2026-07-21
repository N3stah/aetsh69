import api from './api';
import axios from 'axios';

// Public API instance – no interceptors, no token attachment
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(data: RegisterData): Promise<{ id: string; email: string }> {
    const { data: response } = await api.post<{ id: string; email: string }>('/auth/register', data);
    return response;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  // Use publicApi to avoid interceptor issues
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await publicApi.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await publicApi.post('/auth/reset-password', { token, new_password: newPassword });
    return data;
  },
};
