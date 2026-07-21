import api from './api';

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: 'blog' | 'project';
  excerpt: string;
  rank: number;
}

export const searchService = {
  async search(q: string): Promise<SearchResult[]> {
    const { data } = await api.get('/search/', { params: { q } });
    return data;
  },
};
