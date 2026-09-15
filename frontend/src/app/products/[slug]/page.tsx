import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductOptions } from "@/components/product-options";
import { getProduct } from "@/lib/endpoints";
import { formatVnd } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };

  const title = product.meta_title || product.name;
  const description =
    product.meta_description || product.short_description || product.description?.slice(0, 160) || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const gallery = [
    ...(product.thumbnail ? [{ id: 0, url: product.thumbnail }] : []),
    ...(product.images ?? []).map((img) => ({ id: img.id, url: img.url })),
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <Link
        href="/products"
        className="group flex w-fit items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Quay lại
      </Link>

      <nav className="text-sm text-muted-foreground">
        {product.category?.name && <span>{product.category.name} / </span>}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
            style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
          >
            {gallery[0] ? (
              <Image src={gallery[0].url} alt={product.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Không có ảnh</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image src={img.url} alt={product.name} fill unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {product.brand?.name && (
            <span className="text-sm text-muted-foreground">{product.brand.name}</span>
          )}
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {product.rating_avg > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>⭐ {Number(product.rating_avg).toFixed(1)}</span>
              <span>· Đã bán {product.sold_count}</span>
            </div>
          )}

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          <ProductOptions product={product} />

          {product.sale_price != null && product.sale_price < product.base_price && (
            <p className="text-sm text-muted-foreground line-through">{formatVnd(product.base_price)}</p>
          )}
        </div>
      </div>

      {product.description && (
        <section className="prose max-w-none border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
        </section>
      )}
    </div>
  );
}
