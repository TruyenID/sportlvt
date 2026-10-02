import * as xlsx from "xlsx";
import type { Product } from "@/lib/types";

const HEADERS = [
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

export function exportProductsToExcel(products: Product[]) {
  const rows: (string | number | boolean | null)[][] = [HEADERS];

  for (const p of products) {
    const base = [
      p.name,
      p.category?.name ?? "",
      p.brand?.name ?? "",
      p.base_price,
      p.sale_price ?? "",
      p.short_description ?? "",
      p.description ?? "",
      p.thumbnail ?? "",
      p.is_featured ? "true" : "false",
    ];

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        rows.push([
          ...base,
          v.sku,
          v.size ?? "",
          v.color ?? "",
          v.price ?? "",
          v.sale_price ?? "",
          v.stock,
          v.image ?? "",
        ]);
      }
    } else {
      rows.push([...base, "", "", "", "", "", "", ""]);
    }
  }

  const ws = xlsx.utils.aoa_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sản phẩm");
  const date = new Date().toISOString().slice(0, 10);
  xlsx.writeFile(wb, `san-pham-${date}.xlsx`);
}
