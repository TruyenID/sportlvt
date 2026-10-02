# Plan: Đồng bộ giao diện dialog xác nhận xóa toàn admin

## Mục tiêu
Áp dụng cùng kiểu dialog xác nhận xóa (icon cảnh báo + căn giữa + nút hành
động rõ ràng) đã làm ở `brands/page.tsx` cho tất cả các trang admin còn lại
có dialog xóa, để giao diện đồng nhất toàn hệ thống.

## Mẫu tham chiếu
Dialog xóa thương hiệu hiện tại trong `admin-web/src/app/brands/page.tsx`
(đã hoàn thành ở `skills/plans/xoa-thuong-hieu-dialog-dep.md`):
- Icon `TriangleAlert` trong vòng tròn `bg-destructive/10`, `size-12`.
- `AlertDialogHeader` căn giữa (`items-center text-center sm:items-center sm:text-center`).
- `AlertDialogTitle` cỡ `text-lg`.
- `AlertDialogFooter` căn giữa (`sm:justify-center`).
- Nút xác nhận nêu rõ đối tượng bị xóa + icon `Trash2` (vd: "Xóa danh mục",
  "Xóa sản phẩm", "Xóa banner", "Xóa trang", "Xóa người dùng").

## Phạm vi
- LÀM: cập nhật dialog xác nhận xóa ở các file sau theo đúng mẫu trên:
  1. `admin-web/src/app/categories/page.tsx` — "Xóa danh mục này?"
  2. `admin-web/src/app/products/page.tsx` — "Xóa sản phẩm này?"
  3. `admin-web/src/app/users/page.tsx` — "Xóa người dùng này?"
  4. `admin-web/src/app/settings/banners-panel.tsx` — "Xóa banner này?"
  5. `admin-web/src/app/settings/pages-panel.tsx` — "Xóa trang này?"
- KHÔNG LÀM: không đổi logic xóa (`handleDelete`, API calls), không đổi nội
  dung mô tả (giữ nguyên câu chữ hiện tại, chỉ đổi bố cục/thêm icon), không
  đổi các dialog khác không phải xác nhận xóa.

## Các bước triển khai
1. Với mỗi file, thêm import `TriangleAlert` từ `lucide-react` (nếu chưa có).
2. Bọc icon cảnh báo trong `<div className="flex size-12 items-center
   justify-center rounded-full bg-destructive/10"><TriangleAlert
   className="size-6 text-destructive" /></div>` đặt đầu `AlertDialogHeader`.
3. Thêm class căn giữa cho `AlertDialogHeader`:
   `className="items-center text-center sm:items-center sm:text-center"`.
4. Thêm `className="text-lg"` cho `AlertDialogTitle`.
5. Thêm `className="sm:justify-center"` cho `AlertDialogFooter`.
6. Đổi nút xác nhận (`AlertDialogAction`) thành icon `Trash2` + text cụ thể
   theo đối tượng (ví dụ "Xóa danh mục", "Xóa sản phẩm"...), giữ trạng thái
   "Đang xóa..." khi `deleting`.
7. Build `admin-web` để đảm bảo không lỗi TypeScript/ESLint.

## Tiêu chí hoàn thành (Acceptance Criteria)
- [ ] Cả 5 file trên đều có icon `TriangleAlert` trong vòng tròn nền đỏ nhạt.
- [ ] Cả 5 file đều có header/footer căn giữa giống mẫu brands.
- [ ] Cả 5 file đều có nút xác nhận nêu rõ hành động kèm icon `Trash2`.
- [ ] Không đổi logic xóa hay nội dung mô tả hiện có (trừ bố cục/thêm icon).
- [ ] `npm run build` ở `admin-web` không lỗi.

## Rủi ro/lưu ý
- `banners-panel.tsx` không hiển thị tên cụ thể trong mô tả (chỉ có text cố
  định "Banner sẽ bị xóa vĩnh viễn khỏi trang chủ.") — giữ nguyên, không
  thêm tên vì đây không thuộc phạm vi yêu cầu.
- Không có ảnh mẫu kèm theo, đối chiếu dựa trên tiêu chí liệt kê ở trên và
  tính nhất quán với `brands/page.tsx`.

## Kết quả hoàn thành
- Ngày hoàn thành: đã triển khai và build pass trong phiên làm việc hiện tại.
- File thực tế đã sửa:
  - `admin-web/src/app/categories/page.tsx` — "Xóa danh mục"
  - `admin-web/src/app/products/page.tsx` — "Xóa sản phẩm"
  - `admin-web/src/app/users/page.tsx` — "Xóa người dùng"
  - `admin-web/src/app/settings/banners-panel.tsx` — "Xóa banner"
  - `admin-web/src/app/settings/pages-panel.tsx` — "Xóa trang"
- Đối chiếu tiêu chí:
  - [x] Cả 5 file đều có icon `TriangleAlert` trong vòng tròn nền
    `bg-destructive/10`, `size-12`.
  - [x] Cả 5 file đều có `AlertDialogHeader` căn giữa
    (`items-center text-center sm:items-center sm:text-center`),
    `AlertDialogTitle` cỡ `text-lg`, `AlertDialogFooter` căn giữa
    (`sm:justify-center`).
  - [x] Nút xác nhận nêu rõ hành động kèm icon `Trash2` ("Xóa danh mục",
    "Xóa sản phẩm", "Xóa người dùng", "Xóa banner", "Xóa trang"), vẫn giữ
    trạng thái "Đang xóa..." khi `deleting`.
  - [x] Không đổi logic xóa (`handleDelete`) hay nội dung mô tả hiện có.
  - [x] `npm run build` ở `admin-web` pass, tất cả route generate thành
    công (không lỗi TypeScript/ESLint).
- Ảnh attempt cuối khớp: không áp dụng (không có ảnh mẫu, đối chiếu qua
  tiêu chí UI liệt kê ở trên, đồng bộ với `brands/page.tsx`).
