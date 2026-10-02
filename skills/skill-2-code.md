# Skill 2 — Đọc Plan & Code

## Mục tiêu
Triển khai đúng những gì đã thống nhất trong file plan (Skill 1 tạo ra),
không tự ý mở rộng hoặc thu hẹp phạm vi.

## Đầu vào
- File plan: `skills/plans/<ten-task>.md`.
- (Nếu có) ảnh mẫu tham chiếu: `skills/references/<ten-task>/`.

## Các bước thực hiện
1. **Đọc lại toàn bộ file plan** trước khi sửa bất kỳ file nào. Xác nhận:
   - Danh sách file/thư mục dự kiến bị ảnh hưởng.
   - Tiêu chí hoàn thành (Acceptance Criteria) — đây là "đề bài" cho Skill 3.
2. **Nếu plan có ảnh mẫu**, mở ảnh (`view` ảnh) để nắm bố cục/màu sắc/spacing
   trước khi code, không code theo trí nhớ/suy đoán.
3. **Khảo sát nhanh** các file liên quan (component/API hiện có) để tuân theo
   đúng quy ước, tránh phá vỡ pattern đang dùng trong repo.
4. **Thực hiện đúng phạm vi trong plan**:
   - Chỉ sửa/tạo file nằm trong "Các bước triển khai" của plan.
   - Nếu trong lúc code phát hiện cần đi ngoài phạm vi (ví dụ phải sửa thêm
     file không có trong plan), dừng lại, cập nhật file plan (thêm mục mới)
     rồi mới tiếp tục — không âm thầm mở rộng phạm vi.
   - Ưu tiên chỉnh sửa tối thiểu, đúng pattern hiện có trong codebase.
5. **Chạy kiểm tra kỹ thuật cơ bản** ngay sau khi code xong một phần việc:
   - Build (`npm run build`) hoặc lint cho phần vừa sửa.
   - Sửa lỗi phát sinh trước khi coi là "xong".
6. **Không tự viết báo cáo/tài liệu** ngoài yêu cầu — việc ghi lại kết quả
   kiểm tra so khớp với plan thuộc về Skill 3.

## Đầu ra
- Code đã triển khai đúng theo plan, build/lint sạch.
- Sẵn sàng để Skill 3 kiểm tra đối chiếu lại với plan.

## Nguyên tắc
- Không code phần nào không có trong plan.
- Không xoá/ghi đè code liên quan không nằm trong phạm vi plan.
- Nếu plan thiếu chi tiết khiến không thể code chính xác, quay lại hỏi rõ
  thay vì đoán.
