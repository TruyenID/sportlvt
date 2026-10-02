// Upload ảnh trực tiếp từ trình duyệt lên Cloudinary (unsigned upload preset).
// Không cần qua backend, không lộ API Secret.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

/** Convert 1 File ảnh (PNG/JPG/...) sang File .webp bằng Canvas API (chạy trong trình duyệt). */
async function toWebpFile(file: File): Promise<File> {
  // Đã là .webp hoặc là ảnh động (gif) thì giữ nguyên (canvas không giữ animation).
  if (file.type === "image/webp" || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const webpFile = await toWebpFile(file).catch(() => file);
  const formData = new FormData();
  formData.append("file", webpFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Tải ảnh lên Cloudinary thất bại.");
  }

  return { url: data.secure_url as string, public_id: data.public_id as string };
}
