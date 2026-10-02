# Sửa setting banner (admin) — tách 2 khu vực theo hình dạng

## Mục tiêu
Trong trang admin quản lý banner (`admin-web/src/app/settings/banners-panel.tsx`),
tách danh sách banner thành 2 khu vực rõ ràng: "Banner chữ nhật (hàng trên)"
và "Banner vuông (hàng dưới)" — đúng như cách hiển thị ngoài trang chủ
(`frontend/src/components/banner-slider.tsx` dùng `shape: "rect"` cho hàng
trên, `shape: "square"` cho hàng dưới). Đảm bảo giao diện trang chủ vẫn
hiển thị đúng sau khi sửa admin (không đổi logic frontend).

## Phạm vi (Scope)
- LÀM: Sửa `admin-web/src/app/settings/banners-panel.tsx` — chia bảng danh
  sách banner hiện tại (1 bảng chung) thành 2 bảng/section riêng theo
  `shape`: "rect" ở trên, "square" ở dưới. Mỗi section có tiêu đề riêng,
  nút "Thêm banner" tạo mới sẽ mặc định đúng `shape` của section đó.
- KHÔNG LÀM: Không đổi database/migration, không đổi
  `frontend/src/components/banner-slider.tsx` (giữ nguyên logic lọc theo
  `shape` đã đúng), không đổi API endpoints.

## Khảo sát hiện trạng
- `banners-panel.tsx`: hiện có 1 bảng chung liệt kê tất cả banner, cột
  "Kiểu" hiển thị text "Chữ nhật"/"Vuông"; form thêm/sửa có select chọn
  shape thủ công.
- `banner-slider.tsx`: đã lọc đúng `b.shape === "rect"` cho track trên,
  `"square"` cho track dưới — không cần sửa.

## Các bước triển khai
1. Trong `banners-panel.tsx`, thêm hàm lọc `rectBanners = banners.filter(b => b.shape === "rect")`
   và `squareBanners = banners.filter(b => b.shape === "square")`.
2. Thay bảng chung bằng 2 khối Card riêng biệt, mỗi khối có:
   - Tiêu đề: "Banner chữ nhật (hàng trên)" / "Banner vuông (hàng dưới)".
   - Nút "Thêm banner" riêng cho từng khối, khi bấm mở form với
     `shape` mặc định tương ứng khối đó (ẩn/khóa select shape vì đã rõ
     theo khối, hoặc giữ select nhưng set default đúng).
   - Bảng con hiển thị banner thuộc đúng shape đó (bỏ cột "Kiểu" vì đã
     tách rõ theo khối).
3. Cập nhật state `openCreate` nhận tham số `shape` để set default form.
4. Build `admin-web` để kiểm tra không lỗi.

## Tiêu chí hoàn thành (Acceptance Criteria)
- Trang Cài đặt > Banner hiển thị 2 khối tách biệt: "Banner chữ nhật
  (hàng trên)" và "Banner vuông (hàng dưới)", mỗi khối có bảng + nút
  "Thêm banner" riêng.
- Thêm banner từ khối "chữ nhật" thì banner mới có `shape = "rect"`,
  từ khối "vuông" thì `shape = "square"`, không cần chọn thủ công.
- Trang chủ (`frontend`) vẫn hiển thị banner đúng vị trí (rect ở trên,
  square ở dưới) như trước — không có thay đổi hành vi ngoài admin.
- `npm run build` ở `admin-web` pass không lỗi.

## Rủi ro/lưu ý
- Vẫn giữ select "Kiểu banner" trong form để có thể đổi shape khi sửa
  banner đã tồn tại (trường hợp nhập sai khối ban đầu), tránh phải xóa
  tạo lại.

## Kết quả hoàn thành (2026-09-20)
- Đã sửa `admin-web/src/app/settings/banners-panel.tsx`:
  - Tách danh sách banner thành 2 `Card` riêng qua component `BannerSection`
    tái sử dụng: "Banner chữ nhật (hàng trên)" và "Banner vuông (hàng dưới)",
    mỗi khối lọc `banners` theo đúng `shape`.
  - Mỗi khối có nút "Thêm banner" riêng; `openCreate(shape)` set sẵn
    `shape` mặc định đúng khối khi mở form tạo mới.
  - Bỏ cột "Kiểu" trong bảng con vì đã phân theo khối; form sửa vẫn giữ
    select "Kiểu banner" để đổi shape khi cần.
  - Không đổi `frontend/src/components/banner-slider.tsx` — vẫn lọc
    đúng `rect`/`square` như cũ nên hiển thị trang chủ không đổi.
- `npm run build` ở `admin-web` pass, không lỗi, đủ 12 route như cũ
  (bao gồm `/settings`).

## Cập nhật bổ sung (2026-09-20): section banner chỉ cần ảnh
- Theo yêu cầu tiếp theo: bỏ trường "Tiêu đề" và "Link khi bấm vào" khỏi
  form thêm/sửa banner và bảng danh sách trong
  `admin-web/src/app/settings/banners-panel.tsx`, vì
  `frontend/src/components/banner-slider.tsx` (section `#banner-slider`)
  chỉ hiển thị ảnh, không dùng title/link.
- Giữ nguyên cột `title`, `link` trong DB (không migration) — khi tạo
  banner mới, payload luôn gửi `title: null, link: null`.
- Form còn lại: Ảnh (URL, bắt buộc), Kiểu banner (select), Thứ tự hiển
  thị, checkbox Hiển thị. Bảng danh sách còn lại: Ảnh, Thứ tự, Trạng
  thái, Hành động.
- `npm run build` ở `admin-web` pass sau thay đổi.

## Cập nhật bổ sung (2026-09-20): chỉ 1 nút "Thêm banner" duy nhất
- Bỏ nút "Thêm banner" riêng ở mỗi khối (rect/square), gộp lại thành
  1 nút "Thêm banner" duy nhất ở đầu trang (mở form với `shape` mặc
  định "rect"); người dùng tự chọn lại "Kiểu banner" (Chữ nhật hàng
  trên / Vuông hàng dưới) trong form nếu muốn tạo banner vuông.
  `BannerSection` bỏ prop `onAdd`, chỉ còn hiển thị danh sách + sửa/xóa
  theo đúng khối shape của nó.
- `npm run build` ở `admin-web` pass sau thay đổi.

## Cập nhật bổ sung (2026-09-20): seed 10 ảnh banner hiện có + fix ảnh vỡ
- Tạo `admin-web/scripts/seed-banners.mjs`: convert + upload 10 ảnh banner
  tĩnh (`frontend/public/banner-*.webp`) lên Cloudinary, ghi/cập nhật vào
  bảng `banners` (khớp qua đường dẫn cũ để tránh trùng dòng).
- Lý do ảnh bị vỡ (icon ảnh lỗi) trong bảng ở admin: dữ liệu seed ban đầu
  (migration `0007_seed_banners.sql`) dùng đường dẫn tĩnh `/banner-x.webp`
  — chỉ tồn tại trên domain/port của `frontend`, còn `admin-web` chạy khác
  port nên không load được. Script `seed-banners.mjs` sửa bằng cách thay
  các đường dẫn đó bằng URL Cloudinary (dùng chung mọi domain).
- Đã chạy script thành công: 10/10 ảnh upload + cập nhật OK.

## Cập nhật bổ sung (2026-09-20): kéo-thả đổi thứ tự + bật/tắt hiển thị nhanh
- Bỏ trường "Thứ tự hiển thị" (nhập số tay) khỏi form thêm/sửa; khi tạo mới
  tự gán thứ tự = cuối danh sách theo đúng khối shape.
- Mỗi khối banner (`BannerSection`) hỗ trợ kéo-thả (HTML5 drag & drop, có
  tay cầm `GripVertical`) để đổi thứ tự trực tiếp trong bảng — thả xong tự
  gọi `updateBanner` cập nhật lại `sort_order` cho các dòng bị ảnh hưởng.
- Cột "Trạng thái" đổi từ Badge tĩnh sang công tắc bật/tắt (switch) bấm
  trực tiếp để hiển thị/ẩn banner mà không cần mở form sửa.
- `npm run build` ở `admin-web` pass sau thay đổi.

## Cập nhật bổ sung (2026-09-20): đồng bộ chọn ảnh (upload) thay vì nhập URL
- Rà soát toàn bộ admin-web, còn 2 nơi dùng ô nhập URL ảnh thủ công thay
  vì chọn file upload Cloudinary: `banners-panel.tsx` (Ảnh banner) và
  `brands/page.tsx` (Logo thương hiệu). Các nơi khác (`general-panel.tsx`,
  `categories/page.tsx`, `product-form.tsx`) đã dùng upload từ trước.
- Đã sửa cả 2 file trên theo đúng pattern upload sẵn có (`uploadImage`
  từ `@/lib/endpoints`, ô kéo-thả có preview + overlay "Đổi ảnh"):
  - `banners-panel.tsx`: thêm `handleImageChange`, state `uploading`,
    thay `Input` URL bằng khung upload ảnh; nút "Lưu" disable khi đang
    tải ảnh hoặc chưa có ảnh.
  - `brands/page.tsx`: thêm `handleLogoChange`, state `uploading`, thay
    `Input` URL Logo bằng khung upload ảnh (logo vẫn là tuỳ chọn).
- `npm run build` ở `admin-web` pass sau thay đổi.

