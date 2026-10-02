-- Seed banners table with the images currently hardcoded as fallback on the
-- homepage banner slider (frontend/src/components/banner-slider.tsx), so the
-- admin "Cài đặt > Banner" screen shows them and they can be managed from
-- there without changing what's currently displayed on the homepage.
-- Only inserts if the table is empty, to avoid duplicating on re-run.

insert into public.banners (image, shape, sort_order, is_active)
select v.image, v.shape, v.sort_order, true
from (
  values
    ('/banner-1.webp', 'rect', 1),
    ('/banner-3.webp', 'rect', 2),
    ('/banner-cn.webp', 'rect', 3),
    ('/banner-cn-1.webp', 'rect', 4),
    ('/banner-2.webp', 'square', 1),
    ('/banner-4.webp', 'square', 2),
    ('/banner-5.webp', 'square', 3),
    ('/banner-6.webp', 'square', 4),
    ('/banner-7.webp', 'square', 5),
    ('/banner-8.webp', 'square', 6)
) as v(image, shape, sort_order)
where not exists (select 1 from public.banners);
