# Skill 3 — Test & Đối chiếu với Plan (quan trọng nhất)

## Mục tiêu
Kiểm tra kết quả Skill 2 đã code có khớp **100%** với plan (Skill 1) hay
chưa — đặc biệt khi yêu cầu là "làm giao diện giống hình mẫu", phải so sánh
trực tiếp với ảnh gốc đã lưu, lặp lại tới khi khớp hoàn toàn.

## Đầu vào
- File plan: `skills/plans/<ten-task>.md` (đặc biệt phần Acceptance Criteria).
- Ảnh mẫu gốc (nếu có): `skills/references/<ten-task>/*.png|jpg`.
- Code đã được Skill 2 triển khai.

## Các bước thực hiện

### A. Trường hợp có ảnh/thiết kế mẫu (so sánh giao diện)
1. Mở lại ảnh mẫu gốc đã lưu ở Skill 1 (`view` ảnh) — đây là baseline, tuyệt
   đối không sửa/thay ảnh này.
2. Chạy ứng dụng (dev server) và **chụp lại giao diện hiện tại** của phần vừa
   code (dùng trình duyệt/browser tool để mở đúng trang, hoặc dùng ảnh
   preview nếu có sẵn công cụ chụp màn hình).
3. Lưu ảnh chụp hiện tại vào `skills/references/<ten-task>/attempt-<n>.png`
   (đánh số tăng dần mỗi lần thử) để có lịch sử đối chiếu.
4. **So sánh trực tiếp** ảnh mẫu gốc với ảnh vừa chụp theo từng tiêu chí:
   bố cục (layout), khoảng cách (spacing), màu sắc, font chữ, kích thước,
   responsive (nếu có yêu cầu). Ghi rõ điểm khớp / điểm lệch.
5. Nếu **chưa khớp 100%** với ảnh mẫu:
   - Liệt kê cụ thể từng điểm sai lệch.
   - Quay lại Skill 2 để sửa đúng những điểm đó (không sửa lan man).
   - Lặp lại từ bước 2 cho tới khi ảnh chụp khớp hoàn toàn với ảnh mẫu gốc.
6. Khi khớp 100%, giữ lại ảnh `attempt-<n>.png` cuối cùng làm bằng chứng đối
   chiếu đạt yêu cầu.

### B. Trường hợp không phải giao diện (logic/API/dữ liệu...)
1. Lấy từng dòng trong "Acceptance Criteria" của plan, kiểm tra thực tế:
   chạy build, chạy test liên quan, gọi thử API, kiểm tra dữ liệu trong DB...
2. Đánh dấu Đạt/Không đạt cho từng tiêu chí, kèm bằng chứng (log, kết quả
   lệnh, response mẫu).
3. Nếu có tiêu chí "Không đạt", quay lại Skill 2 để sửa đúng phần đó, rồi
   test lại từ đầu danh sách tiêu chí (không chỉ test riêng phần vừa sửa,
   để tránh phá vỡ phần đã đạt trước đó).

## Đầu ra
- Kết quả đối chiếu từng tiêu chí trong plan: Đạt / Không đạt + bằng chứng.
- Với giao diện: ảnh mẫu gốc + ảnh attempt cuối cùng khớp 100%, lưu trong
  `skills/references/<ten-task>/`.
- Báo cáo ngắn gọn cho người dùng: đã đạt bao nhiêu/tổng bao nhiêu tiêu chí,
  còn thiếu gì (nếu có).
- **Khi toàn bộ tiêu chí đã Đạt (task hoàn thành)**: cập nhật lại chính file
  `skills/plans/<ten-task>.md` — không xoá, không tạo file mới — thêm/điền
  vào cuối file mục **"Kết quả hoàn thành"** gồm:
  - Ngày hoàn thành.
  - Danh sách file thực tế đã tạo/sửa (có thể khác nhẹ so với dự kiến ban đầu).
  - Kết quả đối chiếu từng tiêu chí (Đạt, kèm bằng chứng ngắn gọn).
  - Đường dẫn ảnh attempt cuối cùng đã khớp (nếu có).
  Mục đích: file plan trở thành hồ sơ đầy đủ, đọc lại là biết ngay task đó
  đã làm gì, làm đúng như thế nào, không cần lục lại lịch sử chat.

## Nguyên tắc
- Không tự ý kết luận "xong" nếu chưa đối chiếu được với ảnh mẫu/tiêu chí cụ thể.
- Không chỉnh sửa ảnh mẫu gốc — chỉ tạo ảnh attempt mới để so sánh.
- Lặp vòng Skill 2 ⇄ Skill 3 cho tới khi khớp 100% hoặc người dùng xác nhận
  chấp nhận mức độ hiện tại.
