# Plan: Làm đẹp thông báo xóa thương hiệu

## Mục tiêu
Thay giao diện dialog xác nhận "Xóa thương hiệu này?" ở trang
`admin-web/src/app/brands/page.tsx` cho đẹp/rõ ràng hơn, không dùng
`alert()`/`confirm()` mặc định của trình duyệt.

## Phạm vi
- LÀM: chỉnh giao diện `AlertDialog` xác nhận xóa trong `brands/page.tsx`
  (thêm icon cảnh báo, căn giữa nội dung, nút hành động rõ ràng hơn).
- KHÔNG LÀM: đổi logic xóa (`handleDelete`, gọi API `deleteBrand`), không
  đổi các dialog xác nhận xóa ở trang khác (Danh mục, Sản phẩm, Banner,
  Trang động, Người dùng) trong lần này.

## Ảnh/thiết kế tham chiếu
Không có — người dùng không gửi ảnh mẫu, chỉ yêu cầu bằng lời "cho đẹp,
không dùng alert đơn giản".

## Các bước triển khai
1. Xác nhận dialog hiện tại đã dùng component `AlertDialog` (base-ui), không
   phải `window.confirm()`.
2. Thêm icon cảnh báo (`TriangleAlert` từ lucide-react) trong vòng tròn nền
   `bg-destructive/10`, đặt phía trên tiêu đề.
3. Căn giữa `AlertDialogHeader` (icon + tiêu đề + mô tả) và `AlertDialogFooter`
   (2 nút Hủy/Xóa) để bố cục cân đối, hiện đại hơn so với căn trái mặc định.
4. Đổi nút xác nhận từ "Xóa" thành "Xóa thương hiệu" kèm icon `Trash2` để rõ
   hành động hơn.
5. Build `admin-web` để đảm bảo không lỗi TypeScript/ESLint.

## Tiêu chí hoàn thành (Acceptance Criteria)
- [ ] Dialog xác nhận xóa thương hiệu KHÔNG dùng `alert()`/`confirm()` mặc định
      của trình duyệt — vẫn dùng component `AlertDialog` tuỳ biến.
- [ ] Dialog có icon cảnh báo trực quan (không chỉ text đơn thuần).
- [ ] Bố cục căn giữa, có phân cấp rõ (icon → tiêu đề → mô tả → 2 nút hành động).
- [ ] Nút xác nhận nêu rõ hành động ("Xóa thương hiệu"), có icon minh hoạ.
- [ ] Vẫn hiển thị đúng tên thương hiệu sắp xóa trong phần mô tả.
- [ ] Vẫn giữ trạng thái "Đang xóa..." khi đang xử lý, disable nút trong lúc đó.
- [ ] `npm run build` ở `admin-web` không lỗi.

## Rủi ro/lưu ý
- Yêu cầu "đẹp" mang tính chủ quan, không có ảnh mẫu để so khớp pixel-by-pixel
  → tiêu chí hoàn thành dựa trên các đặc điểm UI cụ thể liệt kê ở trên thay vì
  so ảnh.

## Kết quả hoàn thành
- Ngày hoàn thành: đã triển khai và build pass trong phiên làm việc hiện tại.
- File thực tế đã sửa: `admin-web/src/app/brands/page.tsx` (thêm import
  `TriangleAlert`, chỉnh `AlertDialogContent` phần xác nhận xóa thương hiệu).
- Đối chiếu tiêu chí:
  - [x] Không dùng `alert()`/`confirm()` mặc định — vẫn dùng component
    `AlertDialog` (base-ui) tuỳ biến.
  - [x] Có icon cảnh báo trực quan — `TriangleAlert` trong vòng tròn nền
    `bg-destructive/10`.
  - [x] Bố cục căn giữa, phân cấp rõ: icon → tiêu đề (`text-lg`) → mô tả →
    2 nút hành động căn giữa (`sm:justify-center`).
  - [x] Nút xác nhận nêu rõ hành động: "Xóa thương hiệu" kèm icon `Trash2`.
  - [x] Vẫn hiển thị đúng tên thương hiệu sắp xóa trong mô tả.
  - [x] Vẫn giữ trạng thái "Đang xóa..." khi đang xử lý, disable nút lúc đó.
  - [x] `npm run build` ở `admin-web` không lỗi (đã chạy, kết quả pass, các
    route tĩnh/động generate thành công).
- Ảnh attempt cuối khớp: không áp dụng (yêu cầu không kèm ảnh mẫu, xác nhận
  qua tiêu chí UI liệt kê ở trên).
