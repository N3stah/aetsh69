import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('aetsh69-auth');
  const token = stored ? JSON.parse(stored)?.state?.accessToken : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage
        const stored = localStorage.getItem('aetsh69-auth');
        if (!stored) {
          // No auth data – force logout
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        const parsed = JSON.parse(stored);
        const refreshToken = parsed?.state?.refreshToken;
        const user = parsed?.state?.user || null;

        if (!refreshToken) {
          // No refresh token – force logout
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = response.data;

        // Update store with new tokens
        useAuthStore.getState().setAuth(user, access_token, refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – logout
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const mediaService = {
  async getUploadSignature() {
    const { data } = await api.get('/media/sign-upload');
    return data;
  },

  async uploadFile(file: File) {
    const sig = await this.getUploadSignature();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', sig.signature);
    formData.append('timestamp', sig.timestamp);
    formData.append('api_key', sig.api_key);
    formData.append('folder', sig.folder);

    // Upload directly to Cloudinary, bypassing the Render backend entirely
    const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url; // Return the public URL of the uploaded image
  }
};
