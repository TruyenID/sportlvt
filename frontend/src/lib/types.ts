export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string | null;
  color: string | null;
  sku: string;
  price: number | null;
  stock: number;
  image: string | null;
  is_active: boolean;
  final_price?: number;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price: number;
  sale_price: number | null;
  thumbnail: string | null;
  rating_avg: number;
  sold_count: number;
  view_count: number;
  is_featured: boolean;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  variants_min_price?: number;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}


