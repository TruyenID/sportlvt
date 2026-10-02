# Quy tắc bắt buộc cho Agent trong repo này

## Luôn ưu tiên chạy theo bộ Skill trong `skills/`

Với **mọi yêu cầu** của người dùng liên quan tới việc thêm/sửa/xây dựng tính
năng (không áp dụng cho câu hỏi thuần thông tin, hoặc việc siêu nhỏ như sửa
1 dòng typo), agent phải tuân theo đúng trình tự 3 skill sau, đọc trực tiếp
nội dung từng file trước khi thực hiện bước tương ứng:

1. **`skills/skill-1-plan.md`** — chạy đầu tiên, với mọi yêu cầu mới.
   - Lưu ảnh/mẫu người dùng gửi (nếu có) vào `skills/references/<ten-task>/`.
   - Viết plan ra `skills/plans/<ten-task>.md`.
2. **`skills/skill-2-code.md`** — chỉ chạy sau khi đã có file plan ở bước 1.
   - Đọc lại đúng file plan đó rồi mới code, đúng phạm vi đã ghi.
3. **`skills/skill-3-test-compare.md`** — chạy ngay sau khi code xong ở bước 2.
   - Đối chiếu kết quả với plan/ảnh mẫu gốc, lặp lại 2 ⇄ 3 tới khi khớp
     100% hoặc người dùng xác nhận chấp nhận.
   - **Khi yêu cầu đã hoàn thành (done)**: cập nhật lại đầy đủ vào chính
     file `skills/plans/<ten-task>.md` (mục "Kết quả hoàn thành" — xem chi
     tiết trong `skills/skill-3-test-compare.md`), không chỉ báo cáo miệng
     cho người dùng rồi bỏ qua việc lưu lại plan.

`<ten-task>` là tên ngắn gọn, viết-liền-bằng-gạch-ngang mô tả yêu cầu (ví dụ
`sua-header-logo`, `them-trang-gioi-thieu`).

## Ngoại lệ (được bỏ qua quy trình 3 bước)
- Câu hỏi thuần thông tin, không yêu cầu sửa code.
- Việc sửa cực nhỏ, rõ ràng, không có tiêu chí hình ảnh/thiết kế cần so khớp
  (ví dụ: sửa 1 câu chữ, đổi 1 màu theo mã hex cụ thể người dùng cho sẵn).
- Người dùng yêu cầu rõ ràng bỏ qua plan (ví dụ "làm luôn, khỏi lên plan").

## Lưu ý
- Không tự ý bỏ qua Skill 3 khi yêu cầu có kèm hình ảnh/thiết kế mẫu — đây
  là bước bắt buộc để đảm bảo kết quả khớp đúng yêu cầu.
- Nếu plan (skill 1) chưa đủ rõ để code, quay lại hỏi người dùng thay vì
  đoán rồi code sai.
