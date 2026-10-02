import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/endpoints";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadPage(slug: string) {
  try {
    return await getPage(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return { title: "Trang không tồn tại" };
  return { title: page.title };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Về trang chủ
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      {page.content && (
        <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">
          {page.content}
        </div>
      )}
    </div>
  );
}
