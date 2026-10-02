import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error(
    "Thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong admin-web/.env.local"
  );
  process.exit(1);
}

/** Convert 1 file ảnh local sang buffer .webp (quality 82, giữ nguyên kích thước gốc). */
export async function toWebpBuffer(filePath) {
  return sharp(filePath).webp({ quality: 82 }).toBuffer();
}

/** Upload 1 buffer ảnh lên Cloudinary (unsigned upload preset), trả về secure_url. */
export async function uploadBufferToCloudinary(buffer, filename) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/webp" }), filename);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Upload Cloudinary thất bại.");
  }
  return data.secure_url;
}

/** Convert 1 file ảnh local sang .webp rồi upload lên Cloudinary, trả về URL. */
export async function convertAndUpload(filePath) {
  const buffer = await toWebpBuffer(filePath);
  const filename = path.basename(filePath, path.extname(filePath)) + ".webp";
  return uploadBufferToCloudinary(buffer, filename);
}

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

export function listImageFiles(folder) {
  return fs
    .readdirSync(folder)
    .filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(folder, f));
}

/**
 * Resolve 1 giá trị ảnh trong file Excel/CSV:
 * - Nếu là URL (http/https) → trả về nguyên văn.
 * - Nếu là tên file → tìm trong `imagesFolder`, convert .webp + upload Cloudinary.
 * - Nếu rỗng → trả về null.
 * Cache theo tên file để không convert/upload trùng lặp nhiều lần.
 */
const cache = new Map();

export async function resolveImage(value, imagesFolder) {
  if (!value || !String(value).trim()) return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;

  if (!imagesFolder) {
    throw new Error(`Cột ảnh "${v}" là tên file nhưng không có --images <thư mục ảnh>`);
  }
  if (cache.has(v)) return cache.get(v);

  const filePath = path.join(imagesFolder, v);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file ảnh "${v}" trong thư mục ${imagesFolder}`);
  }
  const url = await convertAndUpload(filePath);
  cache.set(v, url);
  return url;
}
