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
import { Reveal } from "@/components/reveal";
import { ScrollStory } from "@/components/scroll-story";
import { Tilt3D } from "@/components/tilt-3d";
import { getBrands, getCategories } from "@/lib/endpoints";

const PERKS = [
  { icon: Truck, title: "Giao hàng toàn quốc", desc: "Nhanh chóng, đúng hẹn" },
  { icon: ShieldCheck, title: "Hàng chính hãng 100%", desc: "Cam kết chất lượng" },
  { icon: Undo2, title: "Đổi trả dễ dàng", desc: "Trong vòng 7 ngày" },
  { icon: Headset, title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng giúp bạn" },
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
  const [categories, brands] = await Promise.all([
    getCategories().catch(() => []),
    getBrands().catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-14 pb-16 [perspective:1500px]">
      {/* Banner slider */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <BannerSlider />
      </div>

      {/* Perks */}
      <Reveal className="mx-auto -mt-8 w-full max-w-6xl px-4">
        <section>
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <Tilt3D key={title} max={8} className="group flex items-center gap-3 rounded-xl p-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </Tilt3D>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <Reveal className="mx-auto w-full max-w-6xl px-4">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Danh mục sản phẩm</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((c, i) => (
                <Tilt3D key={c.id} max={12} style={{ transitionDelay: `${i * 30}ms` }}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/40 p-5 text-center shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <Sparkles className="size-5" />
                    </span>
                    <span className="text-sm font-medium transition-colors group-hover:text-primary">
                      {c.name}
                    </span>
                  </Link>
                </Tilt3D>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Promo CTA */}
      <Reveal className="mx-auto w-full max-w-6xl px-4">
        <section>
          <Tilt3D max={6}>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/70 px-6 py-10 text-primary-foreground shadow-lg transition-shadow duration-500 hover:shadow-2xl hover:shadow-primary/30 sm:px-10">
              <div className="relative z-10 flex flex-col items-start gap-3 sm:max-w-xl">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  Ưu đãi đặc biệt
                </span>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Săn deal thể thao – Giảm đến 50%
                </h2>
                <p className="text-sm text-primary-foreground/90 sm:text-base">
                  Hàng ngàn sản phẩm chính hãng đang chờ bạn khám phá. Mua sắm ngay hôm nay!
                </p>
                <Link
                  href="/products"
                  className="mt-2 flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  Mua sắm ngay <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 right-24 size-48 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125"
              />
            </div>
          </Tilt3D>
        </section>
      </Reveal>

      {/* Brands */}
      {brands && brands.length > 0 && (
        <Reveal className="mx-auto w-full max-w-6xl px-4">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Thương hiệu nổi bật</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {brands.map((b) => (
                <Tilt3D key={b.id} max={14}>
                  <Link
                    href={`/products?brand=${b.slug}`}
                    className="flex h-20 items-center justify-center rounded-xl border border-border bg-card p-3 grayscale transition-all duration-300 hover:grayscale-0 hover:shadow-md"
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
                </Tilt3D>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Sticky storytelling section (scroll scrubbing + parallax + pin + mask reveal + 3D + kinetic text) */}
      <section className="w-full">
        <ScrollStory
          panels={[
            {
              icon: <Truck className="size-9 text-white" />,
              title: "Giao hàng nhanh chóng",
              desc: "Đơn hàng của bạn được xử lý và vận chuyển tới tận tay chỉ trong vài ngày.",
              image: "/banner-3.webp",
              align: "start",
              paddleImage: "/img-vuot.webp",
            },
            {
              icon: <ShieldCheck className="size-9 text-white" />,
              title: "Hàng chính hãng 100%",
              desc: "Cam kết nguồn gốc rõ ràng, chất lượng chuẩn từ các thương hiệu lớn.",
              image: "/banner-5.webp",
              align: "end",
              paddleImage: "/vuot3D-2.webp",
            },
            {
              icon: <Undo2 className="size-9 text-white" />,
              title: "Đổi trả trong 7 ngày",
              desc: "Không hài lòng? Đổi trả nhanh gọn, không rắc rối.",
              image: "/banner-6.webp",
              align: "start",
              paddleImage: "/vuot3D-3.webp",
            },
            {
              icon: <Headset className="size-9 text-white" />,
              title: "Hỗ trợ tận tâm 24/7",
              desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp mọi thắc mắc.",
              image: "/banner-8.webp",
              align: "end",
              paddleImage: "/vuot3D-4.webp",
            },
          ]}
        />
      </section>

      {/* Testimonials */}
      <Reveal className="mx-auto w-full max-w-6xl px-4">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <Tilt3D max={8}>
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    <Quote className="size-6 text-primary/40" />
                    <p className="flex-1 text-sm text-muted-foreground">{t.content}</p>
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
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Newsletter */}
      <Reveal className="mx-auto w-full max-w-6xl px-4">
        <section>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-primary/40 bg-accent/30 px-6 py-10 text-center transition-colors duration-300 hover:bg-accent/50">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Đăng ký nhận ưu đãi mới nhất
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Nhận thông báo sớm nhất về sản phẩm mới và các chương trình khuyến mãi hấp dẫn.
            </p>
            <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                placeholder="Nhập email của bạn"
                className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
