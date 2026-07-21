import api from './api';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  reading_time?: number;
  author?: string;
}

export interface BlogPostDetail extends BlogPost {
  content?: string;
  body?: string;
}

export const blogService = {
  async listPosts(): Promise<BlogPost[]> {
    const { data } = await api.get('/blog/posts');
    return data;
  },
  async getPost(slug: string): Promise<BlogPostDetail> {
    const { data } = await api.get(`/blog/posts/${slug}/`);
    return data;
  },
};
