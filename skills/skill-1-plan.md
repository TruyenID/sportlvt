# Skill 1 — Nhận yêu cầu & Lên kế hoạch (Plan)

## Mục tiêu
Biến yêu cầu (có thể mơ hồ, kèm hình ảnh/link mẫu) của người dùng thành một
file kế hoạch (**plan**) rõ ràng, có thể kiểm tra được, để Skill 2 code theo
và Skill 3 test đối chiếu lại.

## Đầu vào
- Mô tả yêu cầu bằng lời của người dùng.
- (Nếu có) hình ảnh/thiết kế mẫu, link tham khảo, file đính kèm.

## Các bước thực hiện
1. **Đọc kỹ yêu cầu.** Nếu có điểm mơ hồ ảnh hưởng lớn tới cách làm (phạm vi,
   công nghệ, dữ liệu), hỏi lại người dùng 1 câu hỏi cụ thể trước khi lên plan.
   Không suy đoán/thêm thắt ngoài những gì người dùng cung cấp.
2. **Nếu người dùng gửi kèm hình ảnh/thiết kế mẫu**:
   - Lưu lại nguyên vẹn ảnh vào thư mục `skills/references/<ten-task>/`
     (tạo thư mục nếu chưa có), đặt tên rõ ràng, ví dụ `mockup-header.png`.
   - Ảnh này là "nguồn sự thật" để Skill 3 so sánh sau này — không sửa/resize/nén.
3. **Khảo sát codebase liên quan** (dùng codebase-retrieval/view) chỉ đủ để
   biết: nơi cần sửa, các component/API liên quan, quy ước hiện có.
4. **Viết file plan** tại `skills/plans/<ten-task>.md` gồm các mục:
   - **Mục tiêu**: 1-2 câu, đúng những gì người dùng yêu cầu.
   - **Phạm vi (Scope)**: rõ ràng những gì LÀM và KHÔNG LÀM.
   - **Ảnh/thiết kế tham chiếu**: đường dẫn tới ảnh đã lưu ở bước 2 (nếu có).
   - **Các bước triển khai**: liệt kê theo thứ tự, kèm file/thư mục dự kiến
     bị ảnh hưởng.
   - **Tiêu chí hoàn thành (Acceptance Criteria)**: danh sách điều kiện
     cụ thể, đo được để Skill 3 kiểm tra (ví dụ: "Header có logo bên trái,
     nav bên phải, giống ảnh mockup-header.png ở bố cục + màu sắc + khoảng
     cách", hoặc "API trả về đúng field X, Y", "build không lỗi").
   - **Rủi ro/lưu ý**: giới hạn kỹ thuật, phụ thuộc, việc cần hỏi thêm.
5. **Xác nhận với người dùng** (tóm tắt ngắn gọn plan) trước khi chuyển sang
   Skill 2, trừ khi người dùng đã yêu cầu rõ "cứ làm luôn".

## Đầu ra
- 1 file `skills/plans/<ten-task>.md`.
- (Nếu có) ảnh mẫu đã lưu trong `skills/references/<ten-task>/`.

## Nguyên tắc
- Không code ở bước này.
- Không suy diễn thêm yêu cầu ngoài những gì người dùng nói/gửi.
- Ưu tiên plan ngắn gọn, cụ thể, có thể kiểm chứng — tránh mô tả chung chung
  kiểu "làm đẹp giao diện" mà không có tiêu chí đo được.
