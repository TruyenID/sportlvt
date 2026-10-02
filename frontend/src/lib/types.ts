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

export interface SiteSettings {
  id: number;
  site_name: string;
  logo_header: string | null;
  logo_footer: string | null;
  favicon: string | null;
  hotline: string | null;
  email: string | null;
  address: string | null;
  footer_note: string | null;
  facebook_url: string | null;
  zalo_url: string | null;
  messenger_url: string | null;
}

export interface Contact {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: "new" | "read";
  created_at: string;
}

export interface Banner {
  id: number;
  title: string | null;
  image: string;
  link: string | null;
  shape: "rect" | "square";
  sort_order: number;
}

export interface HeroSlide {
  id: number;
  image: string;
  eyebrow: string | null;
  heading: string;
  description: string | null;
  cta_label: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}


