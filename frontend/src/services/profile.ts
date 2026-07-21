import api from './api';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  created_at?: string;
}

export const profileService = {
  async update(data: { full_name?: string; username?: string; avatar?: File }) {
    const formData = new FormData();
    if (data.full_name) formData.append('full_name', data.full_name);
    if (data.username) formData.append('username', data.username);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.patch('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as User;
  },
};
