/**
 * Convert hàng loạt ảnh trong 1 thư mục sang .webp và upload lên Cloudinary.
 *
 * Dùng khi đã tự tải ảnh sản phẩm về máy (đúng theo thỏa thuận với nhà cung
 * cấp dữ liệu), muốn convert .webp + có URL để dán vào form "Thêm hàng loạt"
 * hoặc file Excel import.
 *
 * Cách chạy (từ thư mục admin-web/):
 *   node scripts/convert-upload-images.mjs <thư_mục_ảnh> [file_json_output]
 *
 * Ví dụ:
 *   node scripts/convert-upload-images.mjs ./anh-san-pham ./anh-san-pham/urls.json
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { convertAndUpload, listImageFiles } = await import("./lib/images.mjs");

async function main() {
  const folder = process.argv[2];
  const outputPath = process.argv[3] || (folder ? path.join(folder, "urls.json") : null);

  if (!folder) {
    console.error("Thiếu tham số. Cách dùng: node scripts/convert-upload-images.mjs <thư_mục_ảnh> [file_json_output]");
    process.exit(1);
  }
  if (!fs.existsSync(folder)) {
    console.error(`Không tìm thấy thư mục: ${folder}`);
    process.exit(1);
  }

  const files = listImageFiles(folder);
  if (files.length === 0) {
    console.log("Không có file ảnh nào (.jpg/.jpeg/.png/.webp/.gif/.avif) trong thư mục này.");
    return;
  }

  console.log(`Tìm thấy ${files.length} ảnh. Bắt đầu convert .webp + upload Cloudinary...\n`);

  const result = {};
  let ok = 0;
  let fail = 0;

  for (const filePath of files) {
    const name = path.basename(filePath);
    process.stdout.write(`- ${name} ... `);
    try {
      const url = await convertAndUpload(filePath);
      result[name] = url;
      ok++;
      console.log("OK");
    } catch (err) {
      fail++;
      console.log(`LỖI (${err.message})`);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log(`\nHoàn tất: ${ok} thành công, ${fail} lỗi.`);
  console.log(`Danh sách URL đã lưu vào: ${outputPath}`);
}

main();
