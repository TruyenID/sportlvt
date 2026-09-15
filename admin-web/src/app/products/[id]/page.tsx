"use client";

import { use, useEffect, useState } from "react";
import { ProductForm } from "@/components/product-form";
import { getAdminProduct } from "@/lib/endpoints";
import type { Product } from "@/lib/types";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminProduct(Number(id))
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải sản phẩm."));
  }, [id]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Sửa sản phẩm</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && !product && (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      )}
      {product && <ProductForm product={product} />}
    </div>
  );
}
