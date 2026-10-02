# Tính năng Liên hệ (frontend + admin-web)

## Mục tiêu
Cho khách hàng lướt website dễ dàng liên hệ qua nhiều kênh (điện thoại, Zalo,
Messenger, email, form liên hệ trên web), lưu lại các liên hệ gửi qua form vào
Supabase để admin xem/quản lý trong admin-web.

## Phạm vi
**Làm:**
- Thêm 2 cột `messenger_url`, `phone_number` (SĐT bấm gọi trực tiếp, khác
  `hotline` hiển thị dạng text nếu cần) vào `site_settings` — thực chất tái
  dùng `hotline` có sẵn làm số điện thoại, chỉ bổ sung `messenger_url` (Zalo
  đã có `zalo_url` sẵn).
- Bảng mới `contacts` (Supabase) lưu submission từ form liên hệ: `name`,
  `phone`, `email`, `message`, `status` (`new`/`read`), `created_at`.
- **Widget nổi (floating)** hiển thị xuyên suốt mọi trang frontend: cụm nút
  tròn góc dưới phải — Gọi điện, Zalo, Messenger, Email — bung ra khi bấm nút
  chính (FAB), dùng dữ liệu từ `site_settings` (ẩn nút nếu link/số trống).
- **Trang `/contact`** (frontend): hiển thị đầy đủ thông tin liên hệ (số điện
  thoại, Zalo, Messenger, email, địa chỉ) + form liên hệ (tên, SĐT, email,
  nội dung) gửi vào bảng `contacts` qua Supabase (insert trực tiếp, RLS cho
  phép insert công khai).
- Thêm link "Liên hệ" vào header/footer frontend trỏ tới `/contact`.
- **Trang admin `admin-web/src/app/contacts/page.tsx`**: danh sách các liên hệ
  đã gửi (bảng: Tên, SĐT, Email, Nội dung, Trạng thái, Ngày gửi), đánh dấu
  đã đọc (`status = read`), xóa liên hệ. Thêm mục "Liên hệ" vào sidebar admin.
- Thêm field "Messenger URL" vào trang Cài đặt admin (`general-panel.tsx`).
- Cập nhật `SiteSettings` type (2 nơi: `frontend/src/lib/types.ts`,
  `admin-web/src/lib/types.ts`) thêm `messenger_url`.
- Thêm `Contact` type + endpoint functions (`getContacts`, `createContact`,
  `updateContactStatus`, `deleteContact`) vào `frontend/src/lib/endpoints.ts`
  (chỉ `createContact`) và `admin-web/src/lib/endpoints.ts` (đủ 4 hàm).
- Migration SQL mới: `supabase/migrations/0006_contacts.sql`.

**Không làm:**
- Không tích hợp gửi email/notification tự động khi có liên hệ mới (chỉ lưu
  DB, admin tự vào xem).
- Không làm chat trực tiếp trong web (chỉ link ra Zalo/Messenger ngoài).
- Không thêm phân trang phức tạp cho danh sách liên hệ nếu số lượng còn ít
  (load toàn bộ, sort theo `created_at desc`, tối đa như trang brands hiện tại
  dùng đơn giản — có thể thêm phân trang cơ bản giống `getAdminProducts` nếu
  cần nhưng không bắt buộc trong scope này).

## Các bước triển khai
1. `supabase/migrations/0006_contacts.sql`:
   - `alter table public.site_settings add column messenger_url text;`
   - Tạo bảng `contacts` (id, name, phone, email, message, status default
     'new', created_at). RLS: cho phép `insert` công khai (anon) để form hoạt
     động không cần đăng nhập; `select/update/delete` chỉ admin
     (`public.is_admin()` — dùng lại hàm đã có).
2. Cập nhật type: `frontend/src/lib/types.ts`, `admin-web/src/lib/types.ts`
   thêm `messenger_url` vào `SiteSettings`, thêm interface `Contact`.
3. `frontend/src/lib/endpoints.ts`: thêm `createContact(data)`.
4. `admin-web/src/lib/endpoints.ts`: thêm `getContacts`, `updateContactStatus`,
   `deleteContact`.
5. `admin-web/src/app/settings/general-panel.tsx`: thêm field
   `messenger_url` vào mảng `FIELDS`.
6. Tạo `frontend/src/components/contact-widget.tsx` ("use client"): FAB góc
   dưới phải, bung 4 nút (Gọi, Zalo, Messenger, Email) lấy dữ liệu từ
   `getSiteSettings()`, ẩn nút nếu thiếu dữ liệu tương ứng. Thêm vào
   `frontend/src/app/layout.tsx` (đặt sau `SiteFooter`).
7. Tạo `frontend/src/app/contact/page.tsx`: layout 2 cột — bên trái thông tin
   liên hệ (điện thoại, Zalo, Messenger, email, địa chỉ từ `site_settings`),
   bên phải form (tên, SĐT, email, nội dung) submit qua `createContact`, hiện
   trạng thái thành công/lỗi.
8. Thêm link "Liên hệ" (`/contact`) vào `frontend/src/components/site-header.tsx`
   và `site-footer.tsx` (mục "Sản phẩm" hoặc mục riêng).
9. Tạo `admin-web/src/app/contacts/page.tsx`: bảng danh sách liên hệ (tái
   dùng pattern từ `brands/page.tsx`: `Table`, `Badge` trạng thái, nút xem/
   đánh dấu đã đọc, nút xóa kèm dialog xác nhận).
10. Thêm mục "Liên hệ" vào `admin-web/src/components/app-sidebar.tsx`
    (icon `Mail` hoặc `MessageCircle`) và `pageTitles` trong `site-header.tsx`.
11. Build kiểm tra `npm run build` ở cả `frontend` và `admin-web`.

## Tiêu chí hoàn thành
- Mọi trang frontend đều thấy nút liên hệ nổi góc dưới phải, bấm vào bung ra
  đủ 4 lựa chọn (Gọi điện, Zalo, Messenger, Email), bấm mỗi nút mở đúng kênh
  tương ứng (tel:, zalo link, messenger link, mailto:).
- Trang `/contact` hiển thị đủ thông tin liên hệ + form gửi được, gửi thành
  công thì có dòng dữ liệu mới trong bảng `contacts` (kiểm tra qua trang admin).
- Trang `admin-web/contacts` liệt kê đúng các liên hệ đã gửi, đánh dấu đã đọc
  và xóa hoạt động đúng.
- `npm run build` pass ở cả `frontend` và `admin-web`, không lỗi TypeScript/
  ESLint.
- Không phá vỡ chức năng hiện có (header/footer/cài đặt vẫn hoạt động bình
  thường).

## Rủi ro/lưu ý
- Cần link Zalo/Messenger thực tế của cửa hàng — nếu admin chưa nhập trong
  Cài đặt thì nút tương ứng trên widget sẽ tự ẩn (không hiện link rỗng).
- RLS cho `insert` công khai trên `contacts` cần cẩn thận (chỉ cho insert,
  không cho select/update/delete từ phía anon) để tránh lộ dữ liệu liên hệ
  của khách khác.
- Migration cần chạy tay trên Supabase (project không có server riêng để tự
  migrate).

## Kết quả hoàn thành
- Ngày hoàn thành: 2026-09-20.
- File đã tạo/sửa:
  - Tạo `supabase/migrations/0006_contacts.sql` — thêm cột `messenger_url`
    vào `site_settings`, tạo bảng `contacts` (name, phone, email, message,
    status, created_at) + RLS: `insert` công khai, `select/update/delete`
    chỉ admin (`public.is_admin()`).
  - Sửa `frontend/src/lib/types.ts`, `admin-web/src/lib/types.ts` — thêm
    `messenger_url` vào `SiteSettings`, thêm interface `Contact`.
  - Sửa `frontend/src/lib/endpoints.ts` — thêm `createContact`.
  - Sửa `admin-web/src/lib/endpoints.ts` — thêm `getContacts`,
    `updateContactStatus`, `deleteContact`.
  - Sửa `admin-web/src/app/settings/general-panel.tsx` — thêm field
    "Link Messenger".
  - Tạo `frontend/src/components/contact-widget.tsx` — FAB góc dưới phải,
    bung 4 nút Gọi điện/Zalo/Messenger/Email lấy dữ liệu từ `site_settings`,
    tự ẩn nút thiếu dữ liệu; thêm vào `frontend/src/app/layout.tsx`.
  - Tạo `frontend/src/app/contact/page.tsx` — trang thông tin liên hệ +
    form gửi qua `createContact`.
  - Sửa `frontend/src/components/site-header.tsx`, `site-footer.tsx` — thêm
    link "Liên hệ" (`/contact`) vào nav desktop, menu mobile, và footer.
  - Tạo `admin-web/src/app/contacts/page.tsx` — bảng danh sách liên hệ,
    đánh dấu đã đọc, xóa (dialog xác nhận), theo đúng pattern `brands/page.tsx`.
  - Sửa `admin-web/src/components/app-sidebar.tsx`,
    `admin-web/src/components/site-header.tsx` — thêm mục "Liên hệ"
    (`/contacts`) vào sidebar và `pageTitles`.
- Đối chiếu tiêu chí:
  - Widget nổi hiện trên mọi trang frontend (đặt trong `layout.tsx`, ẩn nút
    nếu thiếu dữ liệu tương ứng trong `site_settings`) — Đạt (theo code).
  - Trang `/contact` hiển thị thông tin liên hệ + form gửi, gửi thành công
    ghi dòng mới vào bảng `contacts` qua `createContact` — Đạt (theo code,
    insert thẳng Supabase).
  - Trang `admin-web/contacts` liệt kê, đánh dấu đã đọc, xóa hoạt động đúng
    — Đạt (dùng `getContacts`/`updateContactStatus`/`deleteContact`).
  - `npm run build` pass ở cả `frontend` và `admin-web`, không lỗi
    TypeScript/ESLint — Đạt (xem log build: tất cả route generate thành công,
    có thêm route `/contact` ở frontend và `/contacts` ở admin-web).
  - Không phá vỡ chức năng hiện có — Đạt (chỉ thêm mới, không xóa logic cũ
    của header/footer/cài đặt).
- Lưu ý còn lại: cần chạy migration `0006_contacts.sql` thủ công trên
  Supabase project thật, và admin cần nhập link Zalo/Messenger/hotline/email
  thật trong trang Cài đặt để widget + trang liên hệ hiển thị đầy đủ.
