-- Website chuyển hẳn sang mô hình showcase (chỉ trưng bày sản phẩm), không bán hàng thật.
-- Bỏ toàn bộ bảng liên quan đơn hàng, thanh toán, giỏ hàng, mã giảm giá, địa chỉ, đánh giá.
-- Giữ lại: profiles, categories, brands, products, product_variants, product_images.

drop policy if exists "reviews_admin_delete" on public.reviews;
drop policy if exists "reviews_owner_update" on public.reviews;
drop policy if exists "reviews_owner_insert" on public.reviews;
drop policy if exists "reviews_public_read" on public.reviews;

drop policy if exists "payments_admin_write" on public.payments;
drop policy if exists "payments_owner_select" on public.payments;

drop policy if exists "order_items_admin_write" on public.order_items;
drop policy if exists "order_items_owner_insert" on public.order_items;
drop policy if exists "order_items_owner_select" on public.order_items;

drop policy if exists "orders_admin_delete" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;
drop policy if exists "orders_owner_insert" on public.orders;
drop policy if exists "orders_owner_select" on public.orders;

drop policy if exists "coupons_admin_write" on public.coupons;
drop policy if exists "coupons_public_read" on public.coupons;

drop policy if exists "cart_items_owner_or_admin" on public.cart_items;
drop policy if exists "carts_owner_or_admin" on public.carts;

drop policy if exists "addresses_owner_or_admin" on public.addresses;

drop table if exists public.reviews;
drop table if exists public.payments;
drop table if exists public.order_items;
drop table if exists public.orders;
drop table if exists public.cart_items;
drop table if exists public.carts;
drop table if exists public.coupons;
drop table if exists public.addresses;
