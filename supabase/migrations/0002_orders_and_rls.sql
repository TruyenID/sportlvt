-- ============ ORDERS ============
create table public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  coupon_id bigint references public.coupons (id) on delete set null,

  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_province text not null,
  shipping_district text not null,
  shipping_ward text not null,
  shipping_street_address text not null,

  subtotal bigint not null,
  discount_amount bigint not null default 0,
  tax_amount bigint not null default 0,
  shipping_fee bigint not null default 0,
  total_amount bigint not null,

  payment_method text not null default 'cod' check (payment_method in ('cod', 'momo')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),

  note text,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_id_status_idx on public.orders (user_id, status);

-- ============ ORDER ITEMS ============
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_variant_id bigint references public.product_variants (id) on delete set null,
  product_name text not null,
  sku text,
  size text,
  color text,
  image text,
  price bigint not null,
  quantity integer not null,
  line_total bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PAYMENTS ============
create table public.payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  method text not null default 'momo' check (method in ('cod', 'momo')),
  amount bigint not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  momo_order_id text,
  momo_request_id text,
  momo_trans_id text,
  momo_result_code text,
  momo_message text,
  momo_raw_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_id_status_idx on public.payments (order_id, status);

-- ============ REVIEWS ============
create table public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_item_id bigint references public.order_items (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  images jsonb,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id, order_item_id)
);

-- ================= ROW LEVEL SECURITY =================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

-- helper: kiểm tra người dùng hiện tại có role admin không
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES: xem/sửa chính mình, admin xem/sửa tất cả
create policy "profiles_select_own_or_admin" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update using (auth.uid() = id or public.is_admin());

-- CATALOG (categories, brands, products, variants, images): public đọc dữ liệu active, admin toàn quyền
create policy "categories_public_read" on public.categories for select using (is_active or public.is_admin());
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "brands_public_read" on public.brands for select using (is_active or public.is_admin());
create policy "brands_admin_write" on public.brands for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "product_variants_public_read" on public.product_variants for select using (is_active or public.is_admin());
create policy "product_variants_admin_write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- ADDRESSES: chỉ chủ sở hữu, admin toàn quyền
create policy "addresses_owner_or_admin" on public.addresses for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- CARTS / CART ITEMS: chỉ chủ sở hữu
create policy "carts_owner_or_admin" on public.carts for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "cart_items_owner_or_admin" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin())));

-- COUPONS: public đọc coupon active, admin toàn quyền
create policy "coupons_public_read" on public.coupons for select using (is_active or public.is_admin());
create policy "coupons_admin_write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS / ORDER ITEMS / PAYMENTS: chủ sở hữu xem, admin toàn quyền; chỉ admin sửa/xóa
create policy "orders_owner_select" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_owner_insert" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin_delete" on public.orders for delete using (public.is_admin());

create policy "order_items_owner_select" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "order_items_owner_insert" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_admin_write" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "payments_owner_select" on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "payments_admin_write" on public.payments for all using (public.is_admin()) with check (public.is_admin());

-- REVIEWS: public đọc review đã duyệt, chủ sở hữu tạo/sửa review của mình, admin toàn quyền
create policy "reviews_public_read" on public.reviews for select using (is_approved or auth.uid() = user_id or public.is_admin());
create policy "reviews_owner_insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_owner_update" on public.reviews for update using (auth.uid() = user_id or public.is_admin());
create policy "reviews_admin_delete" on public.reviews for delete using (public.is_admin());
