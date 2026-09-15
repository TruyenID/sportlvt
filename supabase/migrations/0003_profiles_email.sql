-- Thêm cột email vào profiles để admin-web có thể hiển thị/tìm kiếm người dùng
-- mà không cần dùng service_role key (client chỉ đọc được public.profiles, không đọc được auth.users).

alter table public.profiles add column if not exists email text;

-- backfill email cho các user đã tồn tại
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- cập nhật trigger tạo profile để lưu luôn email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer;
