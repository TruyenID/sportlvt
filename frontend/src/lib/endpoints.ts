import { supabase } from "./supabase";
import type { Banner, Brand, Category, Contact, HeroSlide, Page, Paginated, Product, SiteSettings } from "./types";

const PRODUCT_SELECT =
  "*, category:categories(*), brand:brands(*), images:product_images(*), variants:product_variants(*)";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// ---------- Catalog (public) ----------
export async function getCategories() {
  const res = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
  return unwrap<Category[]>(res);
}

export async function getBrands() {
  const res = await supabase.from("brands").select("*").eq("is_active", true).order("name");
  return unwrap<Brand[]>(res);
}

export async function getSiteSettings() {
  const res = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return unwrap<SiteSettings>(res);
}

export async function getBanners() {
  const res = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("shape")
    .order("sort_order");
  return unwrap<Banner[]>(res);
}

export async function getHeroSlides() {
  const res = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return unwrap<HeroSlide[]>(res);
}

export async function getPages() {
  const res = await supabase.from("pages").select("*").eq("is_active", true).order("title");
  return unwrap<Page[]>(res);
}

export async function createContact(data: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
}) {
  const res = await supabase.from("contacts").insert(data).select("*").single();
  return unwrap<Contact>(res);
}

export async function getPage(slug: string) {
  const res = await supabase.from("pages").select("*").eq("slug", slug).eq("is_active", true).single();
  return unwrap<Page>(res);
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  min_price?: number | string;
  max_price?: number | string;
  featured?: boolean;
  sort?: "latest" | "price_asc" | "price_desc" | "best_selling" | "rating";
  page?: number;
  per_page?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("is_active", true);

  if (filters.category) query = query.eq("category.slug", filters.category);
  if (filters.brand) query = query.eq("brand.slug", filters.brand);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters.min_price) query = query.gte("base_price", Number(filters.min_price));
  if (filters.max_price) query = query.lte("base_price", Number(filters.max_price));
  if (filters.featured) query = query.eq("is_featured", true);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "best_selling":
      query = query.order("sold_count", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return {
    data: (data as Product[]) ?? [],
    current_page: page,
    per_page: perPage,
    total: count ?? 0,
    last_page: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  };
}

export async function getProduct(slug: string) {
  const res = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("is_active", true).single();
  return unwrap<Product>(res);
}
