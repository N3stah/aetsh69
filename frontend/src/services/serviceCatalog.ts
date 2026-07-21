import api from './api';

export interface Service {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  icon?: string;
  price_kes?: number;
  price_display?: string;
  category?: string;
  features?: string[];
  delivery_time?: string;
  is_featured?: boolean;
  title?: string;
  price?: string;
}

export const serviceCatalog = {
  async listServices(): Promise<Service[]> {
    const { data } = await api.get<Service[]>('/services/');
    return data;
  },
};
