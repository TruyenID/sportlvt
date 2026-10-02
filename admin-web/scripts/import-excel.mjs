/**
 * Import sản phẩm hàng loạt từ file Excel/CSV vào Supabase, kèm convert ảnh
 * (.webp) + upload Cloudinary nếu cột ảnh là tên file thay vì URL.
 *
 * Chuẩn bị:
 *   1. Tạo file Excel/CSV theo đúng thứ tự cột (dòng đầu là tiêu đề, sẽ bị bỏ qua):
 *      name | category | brand | base_price | sale_price | short_description |
 *      description | thumbnail | is_featured | sku | size | color | price |
 *      variant_sale_price | stock | image
 *
 *      - Mỗi dòng là 1 BIẾN THỂ. Các dòng có cùng "name" sẽ được gộp thành
 *        1 sản phẩm với nhiều biến thể (điền lại đủ name/category/... ở mỗi dòng).
 *      - category/brand phải trùng tên đã có sẵn trong hệ thống (brand để trống nếu không có).
 *      - Cột thumbnail/image: điền URL (http/https) hoặc tên file ảnh có trong --images.
 *      - is_featured: true/false (để trống = false).
 *
 *   2. Thêm vào admin-web/.env.local: ADMIN_EMAIL=... và ADMIN_PASSWORD=...
 *      (tài khoản admin dùng để đăng nhập Supabase trước khi insert, do RLS yêu cầu).
 *
 * Cách chạy (từ thư mục admin-web/):
 *   node scripts/import-excel.mjs <file.xlsx|file.csv> [--images <thư_mục_ảnh>]
 */
import path from "node:path";
import dotenv from "dotenv";
import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { resolveImage } = await import("./lib/images.mjs");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function toBool(v) {
  return String(v ?? "").trim().toLowerCase() === "true";
}
function toNum(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

async function main() {
  const filePath = process.argv[2];
  const imagesIdx = process.argv.indexOf("--images");
  const imagesFolder = imagesIdx !== -1 ? process.argv[imagesIdx + 1] : null;

  if (!filePath) {
    console.error("Thiếu tham số. Cách dùng: node scripts/import-excel.mjs <file.xlsx|file.csv> [--images <thư_mục_ảnh>]");
    process.exit(1);
  }

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

  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
  const dataRows = rows.slice(1).filter((r) => r.length && r[0]);

  const { data: categories } = await supabase.from("categories").select("id, name");
  const { data: brands } = await supabase.from("brands").select("id, name");

  const grouped = new Map();
  for (const r of dataRows) {
    const [
      name, category, brand, basePrice, salePrice, shortDescription, description,
      thumbnail, isFeatured, sku, size, color, price, variantSalePrice, stock, image,
    ] = r;
    if (!grouped.has(name)) {
      grouped.set(name, {
        name, category, brand, basePrice, salePrice, shortDescription, description,
        thumbnail, isFeatured, variants: [],
      });
    }
    grouped.get(name).variants.push({ sku, size, color, price, variantSalePrice, stock, image });
  }

  console.log(`Tìm thấy ${grouped.size} sản phẩm (${dataRows.length} dòng biến thể). Bắt đầu import...\n`);

  let ok = 0;
  let fail = 0;

  for (const [name, row] of grouped) {
    process.stdout.write(`- ${name} ... `);
    try {
      const cat = categories.find((c) => c.name.toLowerCase() === String(row.category || "").toLowerCase());
      if (!cat) throw new Error(`không tìm thấy danh mục "${row.category}"`);
      const br = row.brand
        ? brands.find((b) => b.name.toLowerCase() === String(row.brand).toLowerCase())
        : null;
      if (row.brand && !br) throw new Error(`không tìm thấy thương hiệu "${row.brand}"`);

      const thumbnailUrl = await resolveImage(row.thumbnail, imagesFolder);
      const slug = String(name)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      const { data: product, error: prodErr } = await supabase
        .from("products")
        .insert({
          category_id: cat.id,
          brand_id: br?.id ?? null,
          name,
          slug,
          short_description: row.shortDescription || null,
          description: row.description || null,
          base_price: toNum(row.basePrice) ?? 0,
          sale_price: toNum(row.salePrice),
          thumbnail: thumbnailUrl,
          is_active: true,
          is_featured: toBool(row.isFeatured),
        })
        .select("id")
        .single();
      if (prodErr) throw new Error(prodErr.message);

      const variantRows = [];
      for (const v of row.variants) {
        const variantImage = await resolveImage(v.image, imagesFolder);
        variantRows.push({
          product_id: product.id,
          sku: v.sku,
          size: v.size || null,
          color: v.color || null,
          price: toNum(v.price),
          sale_price: toNum(v.variantSalePrice),
          stock: toNum(v.stock) ?? 0,
          image: variantImage,
        });
      }
      if (variantRows.length) {
        const { error: varErr } = await supabase.from("product_variants").insert(variantRows);
        if (varErr) throw new Error(varErr.message);
      }

      ok++;
      console.log("OK");
    } catch (err) {
      fail++;
      console.log(`LỖI (${err.message})`);
    }
  }

  console.log(`\nHoàn tất: ${ok} sản phẩm thành công, ${fail} lỗi.`);
  await supabase.auth.signOut();
}

main();
