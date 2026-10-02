import * as xlsx from "xlsx";
import type { Brand, Category } from "@/lib/types";
import type { ParsedRow, ParsedVariant } from "./parse";

const TEMPLATE_HEADERS = [
  "name",
  "category",
  "brand",
  "base_price",
  "sale_price",
  "short_description",
  "description",
  "thumbnail",
  "is_featured",
  "sku",
  "size",
  "color",
  "price",
  "variant_sale_price",
  "stock",
  "image",
];

const TEMPLATE_EXAMPLE = [
  "Áo thun thể thao Nam",
  "Áo thun",
  "Kady",
  "250000",
  "199000",
  "Vải thun co giãn 4 chiều",
  "Mô tả chi tiết sản phẩm...",
  "https://.../thumb.webp",
  "false",
  "AT001",
  "M",
  "Đen",
  "250000",
  "199000",
  "20",
  "https://.../m-den.webp",
];

function toBool(v: unknown): boolean {
  return String(v ?? "").trim().toLowerCase() === "true";
}

function toNum(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function downloadTemplateExcel() {
  const ws = xlsx.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sản phẩm");
  xlsx.writeFile(wb, "mau-nhap-san-pham.xlsx");
}

export async function parseExcelFile(
  file: File,
  categories: Category[],
  brands: Brand[]
): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = xlsx.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
  const dataRows = rows.slice(1).filter((r) => r.length && r[0]);

  const grouped = new Map<string, ParsedRow>();

  for (const r of dataRows) {
    const [
      name,
      categoryName,
      brandName,
      basePrice,
      salePrice,
      shortDescription,
      description,
      thumbnail,
      isFeatured,
      sku,
      size,
      color,
      price,
      variantSalePrice,
      stock,
      image,
    ] = r as string[];

    const nameStr = String(name ?? "").trim();
    const categoryNameStr = String(categoryName ?? "").trim();
    const brandNameStr = String(brandName ?? "").trim();

    if (!grouped.has(nameStr)) {
      const errors: string[] = [];
      if (!nameStr) errors.push("Thiếu tên sản phẩm");

      const category = categories.find((c) => c.name.toLowerCase() === categoryNameStr.toLowerCase());
      if (!category) errors.push(`Không tìm thấy danh mục "${categoryNameStr}"`);

      const brand = brandNameStr
        ? brands.find((b) => b.name.toLowerCase() === brandNameStr.toLowerCase())
        : undefined;
      if (brandNameStr && !brand) errors.push(`Không tìm thấy thương hiệu "${brandNameStr}"`);

      const basePriceNum = toNum(basePrice);
      if (basePriceNum === null) errors.push("Giá gốc không hợp lệ");

      grouped.set(nameStr, {
        name: nameStr,
        categoryName: categoryNameStr,
        brandName: brandNameStr,
        categoryId: category?.id ?? null,
        brandId: brand?.id ?? null,
        basePrice: basePriceNum ?? 0,
        salePrice: toNum(salePrice),
        shortDescription: String(shortDescription ?? "").trim(),
        description: String(description ?? "").trim(),
        thumbnail: String(thumbnail ?? "").trim(),
        isFeatured: toBool(isFeatured),
        variants: [],
        errors,
      });
    }

    const skuStr = String(sku ?? "").trim();
    const variant: ParsedVariant = {
      sku: skuStr,
      size: String(size ?? "").trim(),
      color: String(color ?? "").trim(),
      price: toNum(price),
      salePrice: toNum(variantSalePrice),
      stock: toNum(stock) ?? 0,
      image: String(image ?? "").trim(),
    };
    const row = grouped.get(nameStr)!;
    row.variants.push(variant);
    if (!skuStr) row.errors.push(`Biến thể #${row.variants.length} thiếu SKU`);
  }

  for (const row of grouped.values()) {
    if (row.variants.length === 0) row.errors.push("Thiếu SKU/biến thể (điền ít nhất 1 biến thể có SKU)");
  }

  return Array.from(grouped.values());
}
