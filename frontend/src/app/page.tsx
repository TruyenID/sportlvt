import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Headset,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Undo2,
} from "lucide-react";
import { BannerSlider } from "@/components/banner-slider";
import { EntertainmentGallery } from "@/components/entertainment-gallery";
import { Magnetic } from "@/components/magnetic";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { getBrands, getCategories, getProducts } from "@/lib/endpoints";

const PERKS = [
  {
    icon: Truck,
    title: "Giao hàng toàn quốc",
    desc: "Nhanh chóng, đúng hẹn",
    color: "oklch(0.6 0.19 235)",
  },
  {
    icon: ShieldCheck,
    title: "Hàng chính hãng 100%",
    desc: "Cam kết chất lượng",
    color: "oklch(0.65 0.18 150)",
  },
  {
    icon: Undo2,
    title: "Đổi trả dễ dàng",
    desc: "Trong vòng 7 ngày",
    color: "oklch(0.72 0.16 70)",
  },
  {
    icon: Headset,
    title: "Hỗ trợ 24/7",
    desc: "Luôn sẵn sàng giúp bạn",
    color: "oklch(0.62 0.22 300)",
  },
];

const TESTIMONIALS = [
  {
    name: "Minh Anh",
    role: "Khách hàng thân thiết",
    content:
      "Sản phẩm chất lượng, giao hàng nhanh. Mình đã mua nhiều đôi giày ở đây và luôn hài lòng!",
  },
  {
    name: "Quốc Bảo",
    role: "Vận động viên phong trào",
    content:
      "Đội ngũ tư vấn nhiệt tình, hàng chính hãng 100%. Giá cả hợp lý so với thị trường.",
  },
  {
    name: "Thu Hà",
    role: "Khách hàng mới",
    content:
      "Website dễ dùng, đặt hàng nhanh chóng, đổi trả cũng rất thuận tiện. Sẽ ủng hộ tiếp!",
  },
];

export default async function Home() {
  const [categories, brands, featured, bestSelling] = await Promise.all([
    getCategories().catch(() => []),
    getBrands().catch(() => []),
    getProducts({ featured: true, per_page: 8 })
      .then((r) => r.data)
      .catch(() => []),
    getProducts({ sort: "best_selling", per_page: 10 })
      .then((r) => r.data)
      .catch(() => []),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
        <Reveal variant="scale" delay={40}>
          <span className="animate-badge-pulse-glow inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            <span className="animate-gradient-flow bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-clip-text text-transparent">
              Nhận in tên, số áo theo yêu cầu
            </span>
          </span>
        </Reveal>
        <Reveal variant="scale" delay={80}>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            Đồ thể thao chính hãng.
            <br />
            Cho mọi cuộc chơi.
          </h1>
        </Reveal>
        <Reveal variant="scale" delay={160}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Khám phá bộ sưu tập giày, áo và dụng cụ thể thao được chọn lọc kỹ càng —
            kèm dịch vụ in tên, số theo yêu cầu.
          </p>
        </Reveal>
        <Reveal variant="scale" delay={240}>
          <div className="mt-7 flex items-center justify-center gap-6">
            <Magnetic>
              <Link
                href="/products"
                className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-transform duration-300 active:scale-95"
              >
                Mua sắm ngay
              </Link>
            </Magnetic>
            <Magnetic strength={10}>
              <Link
                href="/products?featured=true"
                className="flex items-center gap-1 text-[15px] font-medium text-primary transition-colors hover:opacity-70"
              >
                Sản phẩm nổi bật <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      {/* Banner slider (pinned scroll-driven horizontal gallery) */}
      <BannerSlider />

      {/* Perks */}
      <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:mt-32">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, desc, color }, i) => (
            <Reveal key={title} variant="scale" delay={i * 100}>
              <div
                className="group relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl"
                style={{ "--perk-color": color } as React.CSSProperties}
              >
                {/* Glow background on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(120px circle at 50% 0%, color-mix(in oklch, var(--perk-color) 18%, transparent), transparent 70%)",
                  }}
                />
                {/* Icon badge */}
                <span
                  className="relative flex size-14 items-center justify-center rounded-2xl transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-6"
                  style={{
                    background: "color-mix(in oklch, var(--perk-color) 14%, transparent)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-100 rounded-2xl opacity-40 transition-transform duration-700 ease-out group-hover:scale-150 group-hover:opacity-0"
                    style={{
                      background: "color-mix(in oklch, var(--perk-color) 30%, transparent)",
                    }}
                  />
                  <Icon
                    className="relative size-6 transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={1.75}
                    style={{ color: "var(--perk-color)" }}
                  />
                </span>
                <p className="relative text-[15px] font-semibold transition-colors duration-300">
                  {title}
                </p>
                <p className="relative text-sm text-muted-foreground">{desc}</p>
                {/* Bottom accent line */}
                <span
                  aria-hidden
                  className="absolute inset-x-6 bottom-0 h-0.5 origin-center scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100"
                  style={{ background: "var(--perk-color)" }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:mt-32">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
              Danh mục sản phẩm
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <Reveal key={c.id} variant="scale" delay={i * 60}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="group relative flex aspect-square flex-col items-end overflow-hidden rounded-3xl bg-muted/60 p-4 transition-shadow duration-500 hover:shadow-xl"
                >
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : null}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0"
                  />
                  <span className="relative z-10 text-[15px] font-medium text-white">
                    {c.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured && featured.length > 0 && (
        <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:mt-32">
          <Reveal className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Sản phẩm nổi bật
            </h2>
            <Link
              href="/products?featured=true"
              className="hidden shrink-0 items-center gap-1 text-[15px] font-medium text-primary transition-colors hover:opacity-70 sm:flex"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} variant="scale" delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
          <Link
            href="/products?featured=true"
            className="mt-6 flex items-center justify-center gap-1 text-[15px] font-medium text-primary transition-colors hover:opacity-70 sm:hidden"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </section>
      )}

      {/* Endless shopping gallery (Apple "Endless entertainment" style) */}
      {bestSelling && bestSelling.length > 0 && (
        <div className="mt-24 sm:mt-32">
          <EntertainmentGallery
            title="Mua sắm bất tận."
            subtitle="Hàng trăm mẫu sản phẩm thể thao mới được cập nhật mỗi tuần."
            products={bestSelling}
          />
        </div>
      )}

      {/* Promo CTA */}
      <Reveal variant="slide" duration={1600} className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-20">
        <section className="group relative overflow-hidden rounded-[2rem] bg-[oklch(0.16_0.03_235)] px-6 py-16 text-center text-background sm:px-10 sm:py-24">
          {/* Drifting dot grid */}
          <div
            aria-hidden
            className="animate-grid-drift pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklch, var(--color-primary) 80%, white) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Floating gradient blobs */}
          <div
            aria-hidden
            className="animate-blob-a pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/40 blur-3xl"
          />
          <div
            aria-hidden
            className="animate-blob-b pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-[oklch(0.65_0.2_200)]/30 blur-3xl"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background/15 bg-background/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-background/70 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary" />
              Dịch vụ in ấn
            </span>
            <h2 className="mt-4 text-balance bg-gradient-to-b from-background to-background/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
              In tên, số áo theo yêu cầu
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-background/70 sm:text-lg">
              Cá nhân hóa áo đấu của bạn với dịch vụ in tên, số theo yêu cầu — sắc nét, bền màu, giao nhanh.
            </p>
            <Magnetic className="mt-7">
              <Link
                href="/products"
                className="group/btn relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-background px-6 py-2.5 text-[15px] font-medium text-foreground transition-transform duration-300 active:scale-95"
              >
                <span
                  aria-hidden
                  className="animate-shimmer-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100"
                />
                <span className="relative">Đặt in ngay</span>
                <ArrowRight className="relative size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Magnetic>
          </div>
        </section>
      </Reveal>

      {/* Brands */}
      {brands && brands.length > 0 && (
        <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:mt-32">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
              Thương hiệu nổi bật
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
            {brands.map((b, i) => (
              <Reveal key={b.id} variant="scale" delay={i * 40}>
                <Link
                  href={`/products?brand=${b.slug}`}
                  className="flex h-20 items-center justify-center rounded-2xl bg-muted/40 p-3 grayscale transition-all duration-500 hover:grayscale-0"
                >
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={100}
                      height={48}
                      unoptimized
                      className="max-h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{b.name}</span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:mt-32">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
            Khách hàng nói gì
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} variant="scale" delay={i * 100}>
              <div className="flex h-full flex-col gap-3 rounded-3xl bg-muted/50 p-6">
                <Quote className="size-5 text-primary/50" />
                <p className="flex-1 text-[15px] text-muted-foreground">{t.content}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="size-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <Reveal variant="scale" className="mx-auto my-24 w-full max-w-6xl px-4 sm:my-32">
        <section className="flex flex-col items-center gap-4 rounded-[2rem] bg-muted/50 px-6 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Đăng ký nhận ưu đãi mới nhất
          </h2>
          <p className="max-w-md text-[15px] text-muted-foreground">
            Nhận thông báo sớm nhất về sản phẩm mới và các chương trình khuyến mãi hấp dẫn.
          </p>
          <form className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Nhập email của bạn"
              className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
              suppressHydrationWarning
            />
            <Magnetic strength={10} className="shrink-0">
              <button
                type="submit"
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform duration-300 active:scale-95"
                suppressHydrationWarning
              >
                Đăng ký
              </button>
            </Magnetic>
          </form>
        </section>
      </Reveal>
    </div>
  );
}
