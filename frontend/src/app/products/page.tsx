import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getBrands, getCategories, getProducts } from "@/lib/endpoints";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh sách sản phẩm thể thao: giày, áo, dụng cụ chính hãng.",
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "latest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "best_selling", label: "Bán chạy" },
  { value: "rating", label: "Đánh giá cao" },
];

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const sort = params.sort ?? "latest";

  const [productsResult, categories, brands] = await Promise.all([
    getProducts({
      category: params.category,
      brand: params.brand,
      search: params.search,
      min_price: params.min_price,
      max_price: params.max_price,
      featured: params.featured === "true",
      sort: sort as never,
      page,
      per_page: 12,
    }).catch(() => null),
    getCategories().catch(() => []),
    getBrands().catch(() => []),
  ]);

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides, page: overrides.page ?? undefined };
    const qs = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) qs.set(key, value);
    });
    const query = qs.toString();
    return `/products${query ? `?${query}` : ""}`;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Sản phẩm</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar filters */}
        <aside className="flex w-full flex-col gap-6 md:w-56 shrink-0">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Danh mục</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link
                href={buildHref({ category: undefined })}
                className={cn("hover:text-primary", !params.category && "font-semibold text-primary")}
              >
                Tất cả
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildHref({ category: c.slug })}
                  className={cn(
                    "hover:text-primary",
                    params.category === c.slug && "font-semibold text-primary"
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {brands.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Thương hiệu</h3>
              <div className="flex flex-col gap-1 text-sm">
                <Link
                  href={buildHref({ brand: undefined })}
                  className={cn("hover:text-primary", !params.brand && "font-semibold text-primary")}
                >
                  Tất cả
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={buildHref({ brand: b.slug })}
                    className={cn(
                      "hover:text-primary",
                      params.brand === b.slug && "font-semibold text-primary"
                    )}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {productsResult ? `${productsResult.total} sản phẩm` : ""}
            </span>
            <div className="flex flex-wrap gap-2 text-sm">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildHref({ sort: opt.value, page: undefined })}
                  className={cn(
                    "rounded-full border border-border px-3 py-1 hover:bg-muted",
                    sort === opt.value && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {productsResult && productsResult.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {productsResult.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
          )}

          {productsResult && productsResult.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: productsResult.last_page }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildHref({ page: p === 1 ? undefined : String(p) })}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border border-border text-sm hover:bg-muted",
                    p === page && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
