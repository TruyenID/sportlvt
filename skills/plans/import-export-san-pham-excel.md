# Import/Export sản phẩm bằng file Excel/CSV (admin-web)

## Mục tiêu
Cho phép admin xuất (export) toàn bộ sản phẩm hiện có ra file Excel (.xlsx),
và nhập (import) sản phẩm hàng loạt bằng cách upload trực tiếp 1 file Excel/CSV
(.xlsx/.csv) ngay trong trình duyệt (không cần chạy script Node ở máy).

## Phạm vi
**Làm:**
- Trang `admin-web/src/app/products/bulk-import/page.tsx`: thêm nút "Tải file
  mẫu Excel" (.xlsx) và ô "Chọn file Excel/CSV để nhập" (input file), đọc file
  bằng thư viện `xlsx` (đã có sẵn trong devDependencies) ngay trên trình duyệt,
  parse ra danh sách sản phẩm + biến thể, hiển thị bảng xem trước (tái dùng
  logic hiện có sau khi parse xong) rồi import qua `createProduct`.
- Giữ nguyên cách nhập dán dữ liệu (Tab/CSV) hiện tại — chỉ bổ sung thêm lựa
  chọn "upload file" bên cạnh, không phá cách cũ.
- Thêm nút "Xuất Excel" ở trang `admin-web/src/app/products/page.tsx`: xuất
  toàn bộ sản phẩm (kèm biến thể) đang có trong DB ra file `.xlsx` theo đúng
  cấu trúc cột của `import-excel.mjs` (name, category, brand, base_price,
  sale_price, short_description, description, thumbnail, is_featured, sku,
  size, color, price, variant_sale_price, stock, image) — mỗi biến thể 1 dòng.
- Cột ảnh (thumbnail/image) khi export sẽ là URL ảnh đã có sẵn (Cloudinary),
  khi import lại chỉ chấp nhận URL (http/https) — không convert/upload ảnh từ
  máy tính trong phạm vi này (giữ đúng như cách nhập dán dữ liệu hiện tại).

**Không làm:**
- Không đổi/xoá script `scripts/import-excel.mjs` hiện có (vẫn giữ cho use
  case convert ảnh local + upload Cloudinary hàng loạt).
- Không thêm export/import cho categories, brands, users.
- Không hỗ trợ import ảnh từ máy (chỉ URL).

## Các bước triển khai
1. Tạo `admin-web/src/app/products/bulk-import/excel.ts`:
   - `parseExcelFile(file: File): Promise<ParsedRow[]>` — đọc workbook bằng
     `xlsx`, lấy sheet đầu tiên, convert sang mảng dòng, group theo `name`
     giống logic trong `import-excel.mjs`, rồi map sang `ParsedRow` (tái dùng
     type từ `parse.ts`), tra cứu `categoryId`/`brandId` từ `categories`/`brands`
     truyền vào, validate lỗi tương tự `parseBulkRows`.
   - `downloadTemplateExcel()` — tạo workbook mẫu (1 dòng tiêu đề đúng thứ tự
     cột trên + 1 dòng ví dụ), tải xuống bằng `xlsx.writeFile`.
2. Sửa `admin-web/src/app/products/bulk-import/page.tsx`:
   - Thêm nút "Tải file mẫu" gọi `downloadTemplateExcel()`.
   - Thêm `<input type="file" accept=".xlsx,.csv">`, khi chọn file gọi
     `parseExcelFile` rồi `setRows(...)` (tái dùng toàn bộ UI xem trước/import
     hiện có).
3. Tạo `admin-web/src/app/products/export.ts`:
   - `exportProductsToExcel(products: Product[])` — với mỗi sản phẩm, nếu có
     variants thì mỗi variant 1 dòng (lặp lại thông tin sản phẩm), nếu không
     có variant thì 1 dòng để trống các cột biến thể; build workbook bằng
     `xlsx.utils.json_to_sheet`/`aoa_to_sheet` rồi `xlsx.writeFile` tên file
     `san-pham-YYYY-MM-DD.xlsx`.
4. Sửa `admin-web/src/app/products/page.tsx`:
   - Thêm nút "Xuất Excel" cạnh nút "Thêm sản phẩm hàng loạt"/"Thêm sản phẩm".
   - Khi bấm: gọi API lấy toàn bộ sản phẩm (không giới hạn phân trang 20 —
     dùng `per_page` lớn hoặc lặp trang) rồi gọi `exportProductsToExcel`.
5. Build kiểm tra (`npm run build` trong `admin-web`).

## Tiêu chí hoàn thành
- Trang `bulk-import` có thêm: nút tải file mẫu Excel, ô chọn file Excel/CSV
  để nhập, sau khi chọn file hợp lệ thì bảng xem trước hiện đúng số dòng sản
  phẩm/biến thể đọc được từ file, bấm "Import" tạo được sản phẩm thành công.
- Trang `products` có nút "Xuất Excel", bấm vào tải về 1 file `.xlsx` chứa
  đúng toàn bộ sản phẩm hiện có kèm biến thể, đúng thứ tự cột như trên.
- File export ra có thể dùng lại làm file import (import chính file vừa export
  không báo lỗi thiếu cột/sai định dạng).
- `npm run build` ở `admin-web` pass, không lỗi TypeScript/ESLint.
- Không phá vỡ chức năng dán dữ liệu (Tab/CSV) hiện có của trang bulk-import.

## Rủi ro/lưu ý
- Thư viện `xlsx` chạy phía client (browser) cần đảm bảo bundle được với Next
  (đã dùng ở server script, cần kiểm tra hoạt động tốt trong "use client").
- Số lượng sản phẩm lớn khi export cần lặp phân trang để lấy hết (API
  `getAdminProducts` giới hạn 20/trang).

## Kết quả hoàn thành
- Ngày hoàn thành: 2026-09-19.
- File đã tạo/sửa:
  - Tạo `admin-web/src/app/products/bulk-import/excel.ts` — `parseExcelFile`
    (đọc workbook bằng `xlsx`, group theo `name` giống `import-excel.mjs`, map
    sang `ParsedRow`/`ParsedVariant`, validate lỗi tương tự `parseBulkRows`) và
    `downloadTemplateExcel` (tải file mẫu 1 dòng tiêu đề + 1 dòng ví dụ).
  - Sửa `admin-web/src/app/products/bulk-import/page.tsx` — thêm card "Nhập từ
    file Excel/CSV" với nút "Tải file mẫu" và nút "Chọn file Excel/CSV để nhập"
    (input file ẩn, accept `.xlsx,.csv`), tái dùng UI xem trước/import hiện có;
    giữ nguyên khối "Dán dữ liệu" (Tab/CSV) không đổi.
  - Tạo `admin-web/src/app/products/export.ts` — `exportProductsToExcel`, mỗi
    variant 1 dòng theo đúng thứ tự cột của `import-excel.mjs`, không có
    variant thì 1 dòng để trống cột biến thể, tên file `san-pham-YYYY-MM-DD.xlsx`.
  - Sửa `admin-web/src/app/products/page.tsx` — thêm nút "Xuất Excel" cạnh nút
    "Thêm hàng loạt"/"Thêm sản phẩm", khi bấm lặp phân trang `getAdminProducts`
    tới hết rồi gọi `exportProductsToExcel`.
- Đối chiếu tiêu chí:
  - Trang `bulk-import` có nút tải file mẫu + ô chọn file, chọn file hợp lệ
    hiện đúng bảng xem trước, import qua `createProduct` như luồng dán dữ liệu
    — Đạt (dùng chung state `rows`/`handleImport` sẵn có).
  - Trang `products` có nút "Xuất Excel" tải về `.xlsx` đúng thứ tự cột — Đạt.
  - File export dùng lại làm file import không lỗi cột: cùng thứ tự cột
    `name, category, brand, base_price, sale_price, short_description,
    description, thumbnail, is_featured, sku, size, color, price,
    variant_sale_price, stock, image` ở cả 2 chiều — Đạt (theo cấu trúc code).
  - `npm run build` ở `admin-web` pass, không lỗi TypeScript/ESLint — Đạt (xem
    log build: tất cả route generate thành công, không có lỗi).
  - Không phá vỡ chức năng dán dữ liệu hiện có — Đạt (giữ nguyên `handlePreview`,
    `textarea`, `parseBulkRows`).

