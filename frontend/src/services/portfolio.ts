import api from './api';

export interface Project {
  id: string;
  slug: string;
  name?: string;
  title?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  tech_stack?: string[];
  demo_url?: string;
  github_url?: string;
  status?: string;
  featured?: boolean;
}

export interface ProjectDetail extends Project {
  content?: string;
  body?: string;
  outcomes?: string[];
  challenges?: string[];
  timeline?: string;
  tagline?: string;
  start_date?: string;
  end_date?: string;
  is_ongoing?: boolean;
  gallery?: { url: string; alt?: string; caption?: string }[];
  links?: { github?: string; live?: string };
}

export type ProjectDetailExtended = ProjectDetail;

export const portfolioService = {
  async listProjects(params?: { category?: string; featured?: boolean }): Promise<Project[]> {
    const { data } = await api.get<Project[]>('/projects/', { params });
    return data;
  },
  async getProject(slug: string): Promise<ProjectDetail> {
    const { data } = await api.get<ProjectDetail>(`/projects/${slug}`);
    return data;
  },
};
