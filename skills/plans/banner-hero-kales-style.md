# Banner đầu trang chủ theo phong cách thoitrangkales.webme.vn

## Mục tiêu
Làm lại **section banner đầu trang chủ** (hiện là Hero text thuần, không ảnh)
theo phong cách banner của `https://thoitrangkales.webme.vn/`: banner nền là
ảnh full-width, có nhãn nhỏ (eyebrow), tiêu đề lớn 2 dòng, mô tả ngắn, nút CTA,
và chuyển động qua lại giữa nhiều slide. Chỉ làm **giao diện/hiệu ứng**; toàn
bộ nội dung (ảnh nền, nhãn, tiêu đề, mô tả, nút CTA) phải sửa được động từ
Cài đặt trong admin-web, không hardcode trong code frontend.

## Phạm vi (Scope)
**Làm:**
- Thay thế section "Hero" hiện tại (`frontend/src/app/page.tsx`, khối text
  không ảnh ở đầu trang) bằng component banner mới có ảnh nền full-width +
  overlay text, tự động chuyển slide (giống 3 slide luân phiên của KALES:
  nhãn nhỏ → tiêu đề 2 dòng → mô tả → nút CTA).
- Thêm bảng dữ liệu mới `hero_slides` (Supabase) + migration.
- Thêm API đọc (frontend) và CRUD (admin-web) cho `hero_slides`.
- Thêm panel quản lý trong Cài đặt (admin-web `settings`) để thêm/sửa/xoá/sắp
  xếp thứ tự các slide: ảnh nền, nhãn nhỏ, tiêu đề, mô tả, nhãn nút CTA, link
  nút CTA, bật/tắt hiển thị.
- Có dữ liệu mặc định (fallback) khi bảng rỗng, dùng đúng nội dung hiện tại
  của Hero (badge "Nhận in tên, số áo theo yêu cầu", tiêu đề "Đồ thể thao
  chính hãng. Cho mọi cuộc chơi.", mô tả, 2 nút hiện có) làm slide mặc định 1.

**Không làm:**
- Không đụng tới `BannerSlider` (gallery cuộn ngang "pinned scroll" hiện có
  bên dưới Hero) — giữ nguyên, không gộp chung.
- Không copy các phần khác của KALES (menu, giỏ hàng, search overlay, footer,
  lookbook...).
- Không thêm giỏ hàng/đơn hàng — đúng theo giới hạn dự án (showcase catalog).

## Ảnh/thiết kế tham chiếu
- Không có ảnh mockup người dùng gửi; tham chiếu là cấu trúc HTML/text lấy
  trực tiếp từ `https://thoitrangkales.webme.vn/` (phần `#banner-...`):
  mỗi slide có nhãn nhỏ, tiêu đề 2 dòng, mô tả, 1 nút CTA, ảnh nền full-bleed.

## Các bước triển khai
1. **Database**: `supabase/migrations/0009_hero_slides.sql`
   - Bảng `hero_slides`: `id, image (text not null), eyebrow (text), heading
     (text not null), description (text), cta_label (text), cta_link (text),
     sort_order (int default 0), is_active (bool default true), timestamps`.
2. **Types**:
   - `frontend/src/lib/types.ts` và `admin-web/src/lib/types.ts`: thêm
     interface `HeroSlide`.
3. **Endpoints**:
   - `frontend/src/lib/endpoints.ts`: `getHeroSlides()` (chỉ lấy
     `is_active = true`, order theo `sort_order`).
   - `admin-web/src/lib/endpoints.ts`: `getHeroSlides`, `createHeroSlide`,
     `updateHeroSlide`, `deleteHeroSlide` (tương tự pattern của `banners`).
4. **Admin UI**:
   - Thêm file `admin-web/src/app/settings/hero-slides-panel.tsx` (dựa theo
     cấu trúc `banners-panel.tsx`): form ảnh nền (upload Cloudinary), nhãn
     nhỏ, tiêu đề, mô tả, nhãn nút, link nút, kéo-thả sắp xếp, bật/tắt, xoá.
   - Gắn panel này vào trang Settings (thêm tab/section "Banner đầu trang").
5. **Frontend component**:
   - Tạo `frontend/src/components/hero-banner.tsx`: nhận danh sách slide,
     hiển thị ảnh nền full-bleed (object-cover, overlay gradient tối để chữ
     rõ), tự động chuyển slide sau vài giây (giống KALES), có transition mờ
     dần/dịch chuyển mượt giữa các slide, giữ style chữ lớn/OKLCH hiện tại
     của site (không copy màu KALES).
   - Sửa `frontend/src/app/page.tsx`: bỏ khối Hero text tĩnh, dùng
     `<HeroBanner slides={...} />` lấy dữ liệu qua `getHeroSlides()` (có
     fallback data mặc định nếu API rỗng/lỗi).
6. **Build & kiểm tra**: `npm run build` ở cả `frontend` và `admin-web`.

## Tiêu chí hoàn thành (Acceptance Criteria)
- Trang chủ hiển thị banner nền ảnh full-width ở vị trí Hero cũ, có nhãn nhỏ +
  tiêu đề 2 dòng + mô tả + nút CTA, tự chuyển qua slide khác nếu có ≥2 slide.
- Sửa ảnh/tiêu đề/mô tả/nút trong admin (Cài đặt) → phản ánh đúng trên trang
  chủ sau khi tải lại (không cần sửa code).
- Không có slide nào (bảng rỗng) → vẫn hiển thị được nội dung mặc định, không
  vỡ layout.
- `npm run build` pass ở cả `frontend` và `admin-web`.
- `BannerSlider` (gallery cuộn) bên dưới không bị ảnh hưởng.

## Xác nhận với người dùng
- Thay thế hẳn Hero text cũ bằng banner ảnh mới (không giữ song song).
- Vừa tự động chuyển slide theo thời gian, vừa có nút mũi tên trái/phải để
  chuyển thủ công. Ưu tiên hiệu ứng chuyển mượt/đẹp (crossfade + dịch nhẹ ảnh
  nền, text đổi theo kiểu reveal).

## Kết quả hoàn thành
- Migration thực tế: `supabase/migrations/0008_hero_slides.sql` (không phải
  `0009` như dự kiến, vì `0007` đã tồn tại) — bảng `hero_slides` với RLS theo
  đúng pattern `public.is_admin()` như các bảng settings khác.
- Types: `HeroSlide` thêm vào `frontend/src/lib/types.ts` và
  `admin-web/src/lib/types.ts`.
- Endpoints: `getHeroSlides()` (frontend, chỉ `is_active`); `getHeroSlides`,
  `createHeroSlide`, `updateHeroSlide`, `deleteHeroSlide` (admin-web).
- Component `frontend/src/components/hero-banner.tsx`: banner nền ảnh
  full-bleed, crossfade giữa các slide (opacity + ken-burns scale nhẹ), text
  reveal (`animate-hero-slide-in` thêm vào `globals.css`), tự động chuyển
  slide mỗi 6s (dừng khi hover), có nút mũi tên trái/phải + dot điều hướng
  thủ công khi có ≥2 slide, có 1 slide mặc định fallback khi bảng rỗng
  (dùng đúng nội dung Hero cũ).
- Đã thay thế hoàn toàn khối Hero text tĩnh trong `frontend/src/app/page.tsx`
  bằng `<HeroBanner />`.
- Admin UI: `admin-web/src/app/settings/hero-slides-panel.tsx` (theo pattern
  `banners-panel.tsx`: upload ảnh, kéo-thả sắp xếp, bật/tắt, xoá, sửa nhãn
  nhỏ/tiêu đề/mô tả/nút CTA), gắn vào tab mới "Banner đầu trang" trong
  `admin-web/src/app/settings/page.tsx`.
- `BannerSlider` (gallery cuộn ngang) giữ nguyên, không đụng tới.
- `npm run build` pass ở cả `frontend` và `admin-web`.
- Lưu ý triển khai: cần chạy migration `0008_hero_slides.sql` trên Supabase
  trước khi dùng tab "Banner đầu trang" trong admin.

## Rủi ro/lưu ý
- Cần chạy migration Supabase mới (`0009_hero_slides.sql`) trước khi admin
  panel hoạt động — sẽ báo người dùng chạy migration sau khi code xong.
- Hiệu ứng chuyển slide sẽ dùng CSS/JS thuần (giống cách các section khác
  trong site đã làm: `Reveal`, `TextReveal`, fade/translate), không thêm thư
  viện ngoài.
