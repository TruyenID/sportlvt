-- Cho phép admin quản lý logo, banner, trang động (giới thiệu, điều khoản, ...)
-- từ trang Cài đặt trong admin-web, thay vì hardcode trong code frontend.

-- ============ SITE SETTINGS (bảng singleton, luôn chỉ có 1 dòng id = 1) ============
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'LevanTruyen Sport',
  logo_header text,
  logo_footer text,
  favicon text,
  hotline text,
  email text,
  address text,
  footer_note text,
  facebook_url text,
  zalo_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

-- ============ BANNERS (banner-slider ở trang chủ) ============
create table public.banners (
  id bigint generated always as identity primary key,
  title text,
  image text not null,
  link text,
  shape text not null default 'rect' check (shape in ('rect', 'square')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index banners_shape_sort_idx on public.banners (shape, sort_order);

-- ============ PAGES (trang nội dung động: giới thiệu, điều khoản, ...) ============
create table public.pages (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  content text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================= ROW LEVEL SECURITY =================
alter table public.site_settings enable row level security;
alter table public.banners enable row level security;
alter table public.pages enable row level security;

-- SITE SETTINGS: public đọc, chỉ admin sửa (không cho insert/delete để giữ đúng 1 dòng)
create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_admin_update" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

-- BANNERS: public đọc banner active, admin toàn quyền
create policy "banners_public_read" on public.banners for select using (is_active or public.is_admin());
create policy "banners_admin_write" on public.banners for all using (public.is_admin()) with check (public.is_admin());

-- PAGES: public đọc trang active, admin toàn quyền
create policy "pages_public_read" on public.pages for select using (is_active or public.is_admin());
create policy "pages_admin_write" on public.pages for all using (public.is_admin()) with check (public.is_admin());
