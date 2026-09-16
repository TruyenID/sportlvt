import { supabase } from "./supabase";
import { uploadToCloudinary } from "./cloudinary";
import type { Brand, Category, Paginated, Product, ProductVariant, User } from "./types";

const PRODUCT_SELECT =
  "*, category:categories(*), brand:brands(*), images:product_images(*), variants:product_variants(*)";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function loadProfile(id: string, email: string): Promise<User> {
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return { id: profile.id, name: profile.name, email: profile.email ?? email, phone: profile.phone, role: profile.role };
}

// ---------- Auth ----------
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = await loadProfile(data.user.id, data.user.email!);
  if (user.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Tài khoản không có quyền quản trị.");
  }
  return { user, token: data.session?.access_token ?? "" };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { message: "ok" };
}

export async function me() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Chưa đăng nhập");
  return loadProfile(data.user.id, data.user.email!);
}

// ---------- Categories ----------
export async function getCategories() {
  const res = await supabase.from("categories").select("*").order("sort_order");
  return unwrap<Category[]>(res);
}

export async function createCategory(data: Partial<Category>) {
  const res = await supabase.from("categories").insert(data).select("*").single();
  return unwrap<Category>(res);
}

export async function updateCategory(id: number, data: Partial<Category>) {
  const res = await supabase.from("categories").update(data).eq("id", id).select("*").single();
  return unwrap<Category>(res);
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "ok" };
}

// ---------- Brands ----------
export async function getBrands() {
  const res = await supabase.from("brands").select("*").order("name");
  return unwrap<Brand[]>(res);
}

export async function createBrand(data: Partial<Brand>) {
  const res = await supabase.from("brands").insert(data).select("*").single();
  return unwrap<Brand>(res);
}

export async function updateBrand(id: number, data: Partial<Brand>) {
  const res = await supabase.from("brands").update(data).eq("id", id).select("*").single();
  return unwrap<Brand>(res);
}

export async function deleteBrand(id: number) {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "ok" };
}

// ---------- Upload (Cloudinary) ----------
export async function uploadImage(file: File) {
  const result = await uploadToCloudinary(file);
  return { path: result.url, url: result.url };
}

// ---------- Products ----------
export async function getAdminProducts(params: { search?: string; page?: number } = {}) {
  const page = params.page ?? 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  let query = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" });
  if (params.search) query = query.ilike("name", `%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);
  return {
    data: (data as Product[]) ?? [],
    current_page: page,
    per_page: perPage,
    total: count ?? 0,
    last_page: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  } as Paginated<Product>;
}

export async function getAdminProduct(id: number) {
  const res = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).single();
  return unwrap<Product>(res);
}

export async function createProduct(data: Record<string, unknown>) {
  const { variants, ...productData } = data as { variants?: Record<string, unknown>[] } & Record<
    string,
    unknown
  >;
  const created = unwrap<Product>(
    await supabase.from("products").insert(productData).select(PRODUCT_SELECT).single()
  );

  if (variants?.length) {
    const { error } = await supabase
      .from("product_variants")
      .insert(variants.map((v) => ({ ...v, product_id: created.id })));
    if (error) throw new Error(error.message);
  }

  const res = await supabase.from("products").select(PRODUCT_SELECT).eq("id", created.id).single();
  return unwrap<Product>(res);
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  const res = await supabase.from("products").update(data).eq("id", id).select(PRODUCT_SELECT).single();
  return unwrap<Product>(res);
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "ok" };
}

// ---------- Product Variants ----------
export async function createVariant(productId: number, data: Record<string, unknown>) {
  const res = await supabase
    .from("product_variants")
    .insert({ ...data, product_id: productId })
    .select("*")
    .single();
  return unwrap<ProductVariant>(res);
}

export async function updateVariant(productId: number, variantId: number, data: Record<string, unknown>) {
  const res = await supabase
    .from("product_variants")
    .update(data)
    .eq("id", variantId)
    .eq("product_id", productId)
    .select("*")
    .single();
  return unwrap<ProductVariant>(res);
}

export async function deleteVariant(productId: number, variantId: number) {
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
  return { message: "ok" };
}

// ---------- Users ----------
export async function getAdminUsers(params: { role?: string; search?: string; page?: number } = {}) {
  const page = params.page ?? 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  let query = supabase.from("profiles").select("*", { count: "exact" });
  if (params.role) query = query.eq("role", params.role);
  if (params.search) query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);
  return {
    data: (data as User[]) ?? [],
    current_page: page,
    per_page: perPage,
    total: count ?? 0,
    last_page: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  } as Paginated<User>;
}

export async function getAdminUser(id: string) {
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return profile as User;
}

export async function updateAdminUser(id: string, data: Partial<Pick<User, "name" | "phone" | "role">>) {
  const res = await supabase.from("profiles").update(data).eq("id", id).select("*").single();
  return unwrap<User>(res);
}

export async function deleteAdminUser(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "ok" };
}
