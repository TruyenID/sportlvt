-- Tính năng Liên hệ: thêm messenger_url vào site_settings + bảng contacts
-- lưu submission từ form liên hệ trên frontend.

alter table public.site_settings add column messenger_url text;

-- ============ CONTACTS ============
create table public.contacts (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);
create index contacts_status_created_idx on public.contacts (status, created_at desc);

alter table public.contacts enable row level security;

-- Cho phép bất kỳ ai (kể cả khách chưa đăng nhập) gửi liên hệ, nhưng chỉ
-- admin mới được xem/sửa/xóa để tránh lộ thông tin liên hệ của khách khác.
create policy "contacts_public_insert" on public.contacts for insert with check (true);
create policy "contacts_admin_select" on public.contacts for select using (public.is_admin());
create policy "contacts_admin_update" on public.contacts for update using (public.is_admin()) with check (public.is_admin());
create policy "contacts_admin_delete" on public.contacts for delete using (public.is_admin());
