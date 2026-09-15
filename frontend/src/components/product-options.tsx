"use client";

import { useMemo, useState } from "react";
import { formatVnd } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";

/**
 * Display-only variant picker (size/color/price/stock) for the catalog.
 * No cart/order functionality — the site is browse-only.
 */
export function ProductOptions({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[],
    [variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants]
  );

  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);

  const selectedVariant: ProductVariant | undefined = variants.find(
    (v) => (sizes.length === 0 || v.size === size) && (colors.length === 0 || v.color === color)
  );

  const price = selectedVariant?.final_price ?? selectedVariant?.price ?? product.sale_price ?? product.base_price;
  const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : variants.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold text-primary">{formatVnd(price)}</div>

      {sizes.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Kích cỡ</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  size === s ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Màu sắc</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  color === c ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="text-sm text-muted-foreground">
          {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : "Hết hàng"}
        </p>
      )}

      {outOfStock && (
        <p className="w-fit rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
          Hết hàng
        </p>
      )}
    </div>
  );
}
