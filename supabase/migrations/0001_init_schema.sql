-- Mirror của schema Laravel sang Supabase (Postgres)
-- Auth: dùng auth.users có sẵn của Supabase, bảng profiles mở rộng role/phone.

create extension if not exists "pgcrypto";

-- ============ PROFILES (mở rộng auth.users) ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tự tạo profile khi có user mới đăng ký
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ CATEGORIES ============
create table public.categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ BRANDS ============
create table public.brands (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  logo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PRODUCTS ============
create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete cascade,
  brand_id bigint references public.brands (id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  base_price bigint not null,
  sale_price bigint,
  weight integer not null default 0,
  thumbnail text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  view_count integer not null default 0,
  sold_count integer not null default 0,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index products_is_active_category_id_idx on public.products (is_active, category_id);

-- ============ PRODUCT VARIANTS ============
create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text,
  color text,
  color_hex text,
  price bigint,
  sale_price bigint,
  stock integer not null default 0,
  image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

-- ============ PRODUCT IMAGES ============
create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ ADDRESSES ============
create table public.addresses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  ward text not null,
  street_address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CARTS ============
create table public.carts (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CART ITEMS ============
create table public.cart_items (
  id bigint generated always as identity primary key,
  cart_id bigint not null references public.carts (id) on delete cascade,
  product_variant_id bigint not null references public.product_variants (id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_variant_id)
);

-- ============ COUPONS ============
create table public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  type text not null default 'percent' check (type in ('percent', 'fixed')),
  value integer not null,
  max_discount bigint,
  min_order_amount bigint not null default 0,
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
