import api from './api';

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price_kes: number;
  price_usd?: number;
  stock_quantity: number;
  images: string[];
  is_featured?: boolean;
  category_name?: string;
  tags?: string[];
  specifications?: Record<string, string>;
}

export const shopService = {
  async listProducts(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/shop/products');
    return data;
  },
};
