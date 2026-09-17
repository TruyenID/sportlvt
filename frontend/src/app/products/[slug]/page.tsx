import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGalleryWithOptions } from "@/components/product-gallery-with-options";
import { getProduct } from "@/lib/endpoints";

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

      <ProductGalleryWithOptions product={product} gallery={gallery} />

      {product.description && (
        <section className="prose max-w-none border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
        </section>
      )}
    </div>
  );
}
