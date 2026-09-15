export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "customer" | "admin";
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  is_active: boolean;
  sort_order?: number | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  is_active: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  price?: number | null;
  sale_price?: number | null;
  stock: number;
  image?: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  path: string;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  base_price: number;
  sale_price?: number | null;
  weight?: number | null;
  thumbnail?: string | null;
  is_active: boolean;
  is_featured: boolean;
  category?: Category;
  brand?: Brand | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  created_at?: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
