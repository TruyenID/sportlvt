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
import { CategoryShowcase } from "@/components/category-showcase";
import { EntertainmentGallery } from "@/components/entertainment-gallery";
import { HeroBanner } from "@/components/hero-banner";
import { Magnetic } from "@/components/magnetic";
import { Reveal } from "@/components/reveal";
import { TextReveal } from "@/components/text-reveal";
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
  const [categories, brands, featured] = await Promise.all([
    getCategories().catch(() => []),
    getBrands().catch(() => []),
    getProducts({ featured: true, per_page: 8 })
      .then((r) => r.data)
      .catch(() => []),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero banner (dynamic slider managed via admin settings) */}
      <HeroBanner />

      {/* Perks */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-24 lg:mt-32">
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

      {/* Brands — minimal "trusted by" strip, logos as plain marks (no boxy cards) */}
      {brands && brands.length > 0 && (
        <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-24 lg:mt-32">
          <Reveal>
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Đối tác thương hiệu
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
                  <TextReveal as="span">Thương hiệu nổi bật</TextReveal>
                </h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Phân phối chính hãng các thương hiệu thể thao hàng đầu thế giới.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-border/60 bg-card/40 py-8 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:mt-10 sm:py-10">
            <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
              {[...brands, ...brands].map((b, i) => (
                <Link
                  key={`${b.id}-${i}`}
                  href={`/products?brand=${b.slug}`}
                  className="group flex h-14 shrink-0 items-center justify-center px-6 sm:h-16 sm:px-14"
                >
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={120}
                      height={48}
                      unoptimized
                      className="max-h-10 w-auto object-contain opacity-50 grayscale transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-base font-semibold text-muted-foreground/60 transition-colors duration-300 group-hover:text-foreground">
                      {b.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories — immersive full-bleed list (activetheory.net inspired) */}
      {categories && categories.length > 0 && <CategoryShowcase categories={categories} />}

      {/* Endless shopping gallery (Apple "Endless entertainment" style) */}
      {featured && featured.length > 0 && (
        <div className="mt-16 sm:mt-24 lg:mt-32">
          <EntertainmentGallery
            title="Mua sắm bất tận."
            subtitle="Hàng trăm mẫu sản phẩm thể thao mới được cập nhật mỗi tuần."
            products={featured}
          />
        </div>
      )}

      {/* Promo CTA */}
      <Reveal variant="slide" duration={1600} className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-24 lg:mt-32">
        <section className="group relative overflow-hidden rounded-[2rem] bg-[oklch(0.16_0.03_235)] px-6 py-12 text-center text-background sm:px-10 sm:py-24">
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
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              <TextReveal className="bg-gradient-to-b from-background to-background/60 bg-clip-text text-transparent">
                In tên, số áo theo yêu cầu
              </TextReveal>
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

      {/* Testimonials */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 pb-16 sm:mt-24 sm:pb-24 lg:mt-32">
        <Reveal>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-5xl">
            <TextReveal as="span">Khách hàng nói gì</TextReveal>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3">
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

    </div>
  );
}
