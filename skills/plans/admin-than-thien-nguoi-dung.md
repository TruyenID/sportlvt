# Plan: Làm admin thân thiện hơn với người không rành công nghệ

## Mục tiêu
Cải thiện trải nghiệm admin-web để một người không hiểu gì về công nghệ vẫn
có thể tự sử dụng được: hiểu được các trường nhập liệu, biết phải làm gì khi
chưa có dữ liệu, và không bị dọa bởi thông báo lỗi kỹ thuật.

## Phạm vi
### LÀM
1. **Text hướng dẫn/chú thích cho trường khó hiểu**: thêm chú thích nhỏ dưới
   trường "Slug" và "SKU" trong `product-form.tsx`, và "Slug" trong
   `categories/page.tsx`, `brands/page.tsx`, `settings/pages-panel.tsx`
   (giải thích ngắn gọn bằng tiếng Việt, có ví dụ).
2. **Nút hành động rõ nghĩa hơn**: thêm `title` (tooltip khi hover) cho các
   nút icon-only "Sửa"/"Xóa" trong các bảng ở: `products/page.tsx`,
   `categories/page.tsx`, `brands/page.tsx`, `users/page.tsx`,
   `settings/banners-panel.tsx`, `settings/pages-panel.tsx`.
3. **Câu giới thiệu đầu trang**: thêm 1 dòng mô tả ngắn ngay dưới tiêu đề mỗi
   trang quản lý, giải thích trang này dùng để làm gì + gợi ý hành động đầu
   tiên (sản phẩm, danh mục, thương hiệu, người dùng, cài đặt).
4. **Empty state thân thiện hơn**: thay dòng chữ xám đơn giản "Chưa có...
   nào" bằng icon + câu gợi ý hành động cụ thể (vd: "Chưa có sản phẩm nào.
   Bấm 'Thêm sản phẩm' phía trên để tạo sản phẩm đầu tiên.") ở các bảng nêu
   trên.
5. **Thông báo lỗi thân thiện hơn**: rà lại các message lỗi hiển thị cho
   người dùng ở các trang trên — giữ nguyên các message đã viết sẵn bằng
   tiếng Việt dễ hiểu, chỉ đảm bảo không có trường hợp lộ lỗi kỹ thuật thô
   (vd lỗi mạng chung chung) mà không có câu tiếng Việt kèm theo.

### KHÔNG LÀM (ngoài phạm vi lần này)
- Không đổi cấu trúc sidebar, không đổi luồng nghiệp vụ (logic tạo/sửa/xóa).
- Không đổi dashboard (`page.tsx` tổng quan) — để task riêng nếu cần.
- Không đổi màu sắc/theme tổng thể, không đổi bulk-import.

## Các bước triển khai
1. `product-form.tsx`: thêm `<p className="text-xs text-muted-foreground">`
   dưới Label "Slug" và "SKU" giải thích ý nghĩa + ví dụ.
2. `categories/page.tsx`, `brands/page.tsx`, `settings/pages-panel.tsx`:
   thêm chú thích tương tự dưới trường Slug trong form thêm/sửa.
3. Thêm `title="Sửa ..."` / `title="Xóa ..."` cho các `<Button variant="ghost"
   size="icon-sm">` chứa icon Pencil/Trash2 ở 6 trang liệt kê trên.
4. Thêm dòng mô tả ngắn dưới `<h1>`/`<h2>` tiêu đề mỗi trang quản lý.
5. Cập nhật các dòng "Chưa có ... nào" trong `<TableCell colSpan=...>` thành
   khối có icon + 2 dòng text (câu chính + câu gợi ý hành động).
6. Build `admin-web` để đảm bảo không lỗi.

## Tiêu chí hoàn thành (Acceptance Criteria)
- [ ] Trường Slug và SKU đều có chú thích giải thích + ví dụ dễ hiểu.
- [ ] Tất cả nút icon-only Sửa/Xóa trong 6 trang đều có tooltip `title` rõ
      nghĩa (không chỉ để icon trần).
- [ ] Mỗi trang quản lý (Sản phẩm, Danh mục, Thương hiệu, Người dùng, Cài
      đặt banner, Cài đặt trang) có 1 câu mô tả ngắn dưới tiêu đề.
- [ ] Empty state ở các bảng có icon + câu gợi ý hành động cụ thể, không chỉ
      là dòng chữ xám đơn thuần.
- [ ] Không đổi logic nghiệp vụ, không đổi cấu trúc sidebar/dashboard.
- [ ] `npm run build` ở `admin-web` không lỗi.

## Rủi ro/lưu ý
- Không có ảnh mẫu, tiêu chí "thân thiện" mang tính chủ quan → đối chiếu dựa
  trên checklist cụ thể ở trên thay vì so ảnh pixel-by-pixel.
- Giữ nguyên toàn bộ hành vi/logic hiện có, chỉ thêm text/thuộc tính UI,
  tránh rủi ro phá vỡ chức năng đang chạy tốt.

## Kết quả hoàn thành
- Ngày hoàn thành: đã triển khai và build pass trong phiên làm việc hiện tại.
- File thực tế đã sửa:
  - `admin-web/src/components/product-form.tsx` — chú thích Slug + SKU.
  - `admin-web/src/app/products/page.tsx` — mô tả đầu trang, tooltip Sửa/Xóa,
    empty state gợi ý hành động.
  - `admin-web/src/app/categories/page.tsx` — mô tả đầu trang, chú thích Slug,
    tooltip Sửa/Xóa, empty state gợi ý hành động.
  - `admin-web/src/app/brands/page.tsx` — mô tả đầu trang, chú thích Slug,
    tooltip Sửa/Xóa, empty state gợi ý hành động.
  - `admin-web/src/app/users/page.tsx` — mô tả đầu trang, tooltip Xóa, empty
    state gợi ý.
  - `admin-web/src/app/settings/page.tsx` — mô tả đầu trang Cài đặt.
  - `admin-web/src/app/settings/banners-panel.tsx` — mô tả đầu mục, tooltip
    Sửa/Xóa, empty state gợi ý hành động.
  - `admin-web/src/app/settings/pages-panel.tsx` — mô tả đầu mục, chú thích
    Slug, tooltip Sửa/Xóa, empty state gợi ý hành động.
- Đối chiếu tiêu chí:
  - [x] Trường Slug và SKU đều có chú thích giải thích + ví dụ dễ hiểu.
  - [x] Tất cả nút icon-only Sửa/Xóa trong 6 trang đều có tooltip `title` rõ
        nghĩa (kèm tên đối tượng khi có thể).
  - [x] Mỗi trang quản lý có 1 câu mô tả ngắn dưới tiêu đề.
  - [x] Empty state ở các bảng có icon (nếu có sẵn) + câu gợi ý hành động cụ
        thể, không chỉ là dòng chữ xám đơn thuần.
  - [x] Không đổi logic nghiệp vụ, không đổi cấu trúc sidebar/dashboard.
  - [x] `npm run build` ở `admin-web` không lỗi.
- Ảnh attempt cuối khớp: không áp dụng (không có ảnh mẫu, đối chiếu qua
  checklist UI liệt kê ở trên).
