import type { Brand, Category } from "@/lib/types";

export interface ParsedVariant {
  sku: string;
  size: string;
  color: string;
  price: number | null;
  salePrice: number | null;
  stock: number;
  image: string;
}

export interface ParsedRow {
  name: string;
  categoryName: string;
  brandName: string;
  categoryId: number | null;
  brandId: number | null;
  basePrice: number;
  salePrice: number | null;
  shortDescription: string;
  description: string;
  thumbnail: string;
  isFeatured: boolean;
  variants: ParsedVariant[];
  errors: string[];
}

function splitCols(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  return line.split(",");
}

function parseVariants(cell: string | undefined): ParsedVariant[] {
  if (!cell || !cell.trim()) return [];
  return cell
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sku = "", size = "", color = "", price = "", salePrice = "", stock = "", image = ""] =
        entry.split("=").map((p) => p.trim());
      return {
        sku,
        size,
        color,
        price: price ? Number(price) : null,
        salePrice: salePrice ? Number(salePrice) : null,
        stock: stock ? Number(stock) : 0,
        image,
      };
    });
}

export function parseBulkRows(raw: string, categories: Category[], brands: Brand[]): ParsedRow[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const cols = splitCols(line).map((c) => c.trim());
    const [
      name = "",
      categoryName = "",
      brandName = "",
      basePriceStr = "",
      salePriceStr = "",
      shortDescription = "",
      description = "",
      thumbnail = "",
      isFeaturedStr = "",
      variantsCell = "",
    ] = cols;

    const errors: string[] = [];

    if (!name) errors.push("Thiếu tên sản phẩm");

    const category = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) errors.push(`Không tìm thấy danh mục "${categoryName}"`);

    const brand = brandName ? brands.find((b) => b.name.toLowerCase() === brandName.toLowerCase()) : undefined;
    if (brandName && !brand) errors.push(`Không tìm thấy thương hiệu "${brandName}"`);

    const basePrice = Number(basePriceStr);
    if (!basePriceStr || Number.isNaN(basePrice)) errors.push("Giá gốc không hợp lệ");

    const variants = parseVariants(variantsCell);
    const effectiveVariants =
      variants.length > 0
        ? variants
        : [{ sku: "", size: "", color: "", price: null, salePrice: null, stock: 0, image: "" }];
    if (variants.length === 0) errors.push("Thiếu SKU/biến thể (điền ít nhất 1 biến thể có SKU)");
    variants.forEach((v, i) => {
      if (!v.sku) errors.push(`Biến thể #${i + 1} thiếu SKU`);
    });

    return {
      name,
      categoryName,
      brandName,
      categoryId: category?.id ?? null,
      brandId: brand?.id ?? null,
      basePrice,
      salePrice: salePriceStr ? Number(salePriceStr) : null,
      shortDescription,
      description,
      thumbnail,
      isFeatured: isFeaturedStr.toLowerCase() === "true",
      variants: effectiveVariants,
      errors,
    };
  });
}
