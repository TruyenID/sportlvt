/**
 * Upload các ảnh banner tĩnh (frontend/public/banner-*.webp) lên Cloudinary
 * và ghi vào bảng `banners`, để admin quản lý được và ảnh hiển thị đúng ở
 * mọi nơi (kể cả trang quản trị admin-web khác domain/port với frontend).
 *
 * Nếu banner đã tồn tại trong DB với đường dẫn tĩnh cũ (vd "/banner-1.webp")
 * thì sẽ UPDATE lại thành URL Cloudinary thay vì tạo trùng dòng mới.
 *
 * Chuẩn bị: thêm ADMIN_EMAIL / ADMIN_PASSWORD vào admin-web/.env.local
 * (tài khoản admin dùng để đăng nhập Supabase trước khi ghi, do RLS yêu cầu).
 *
 * Cách chạy (từ thư mục admin-web/):
 *   node scripts/seed-banners.mjs
 */
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { convertAndUpload } = await import("./lib/images.mjs");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const FRONTEND_PUBLIC = path.resolve(process.cwd(), "..", "frontend", "public");

const BANNERS = [
  { file: "banner-1.webp", legacyPath: "/banner-1.webp", shape: "rect", sort_order: 1 },
  { file: "banner-3.webp", legacyPath: "/banner-3.webp", shape: "rect", sort_order: 2 },
  { file: "banner-cn.webp", legacyPath: "/banner-cn.webp", shape: "rect", sort_order: 3 },
  { file: "banner-cn-1.webp", legacyPath: "/banner-cn-1.webp", shape: "rect", sort_order: 4 },
  { file: "banner-2.webp", legacyPath: "/banner-2.webp", shape: "square", sort_order: 1 },
  { file: "banner-4.webp", legacyPath: "/banner-4.webp", shape: "square", sort_order: 2 },
  { file: "banner-5.webp", legacyPath: "/banner-5.webp", shape: "square", sort_order: 3 },
  { file: "banner-6.webp", legacyPath: "/banner-6.webp", shape: "square", sort_order: 4 },
  { file: "banner-7.webp", legacyPath: "/banner-7.webp", shape: "square", sort_order: 5 },
  { file: "banner-8.webp", legacyPath: "/banner-8.webp", shape: "square", sort_order: 6 },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Thiếu ADMIN_EMAIL / ADMIN_PASSWORD trong admin-web/.env.local");
    process.exit(1);
  }
  console.log("Đang đăng nhập admin...");
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    console.error(`Đăng nhập thất bại: ${authError.message}`);
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (const b of BANNERS) {
    process.stdout.write(`- ${b.file} ... `);
    try {
      const filePath = path.join(FRONTEND_PUBLIC, b.file);
      if (!fs.existsSync(filePath)) throw new Error("không tìm thấy file");

      const url = await convertAndUpload(filePath);

      const { data: existing } = await supabase
        .from("banners")
        .select("id")
        .eq("image", b.legacyPath)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("banners")
          .update({ image: url })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        console.log("OK (đã cập nhật)");
      } else {
        const { error } = await supabase.from("banners").insert({
          image: url,
          shape: b.shape,
          sort_order: b.sort_order,
          is_active: true,
        });
        if (error) throw new Error(error.message);
        console.log("OK (đã thêm mới)");
      }
      ok++;
    } catch (err) {
      fail++;
      console.log(`LỖI (${err.message})`);
    }
  }

  console.log(`\nHoàn tất: ${ok} thành công, ${fail} lỗi.`);
  await supabase.auth.signOut();
}

main();
