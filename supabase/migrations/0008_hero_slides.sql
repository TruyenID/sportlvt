-- Banner đầu trang chủ dạng slider ảnh nền (phong cách KALES), quản lý động qua admin.
create table public.hero_slides (
  id bigint generated always as identity primary key,
  image text not null,
  eyebrow text,
  heading text not null,
  description text,
  cta_label text,
  cta_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hero_slides_sort_idx on public.hero_slides (sort_order);

alter table public.hero_slides enable row level security;

create policy "hero_slides_public_read" on public.hero_slides for select using (is_active or public.is_admin());
create policy "hero_slides_admin_write" on public.hero_slides for all using (public.is_admin()) with check (public.is_admin());
