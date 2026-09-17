# Tài liệu dự án (đọc lại khi mở dự án)

Ghi chú kiến trúc chung: **Backend = Supabase** (Postgres + Auth + RLS), không có server Node/Laravel riêng.
`frontend` và `admin-web` gọi thẳng Supabase qua `src/lib/supabase.ts` + `src/lib/endpoints.ts`.
Ảnh sản phẩm/brand ở admin-web upload qua Cloudinary (`admin-web/src/lib/cloudinary.ts`).

---

## 1. Frontend (`frontend/`) — website khách hàng, chỉ trưng bày sản phẩm (không giỏ hàng/thanh toán thật)

File chính: `src/app/page.tsx` (trang chủ), `src/app/products/page.tsx` (danh sách), `src/app/products/[slug]/page.tsx` (chi tiết).

### Trang chủ (`page.tsx`) — thứ tự section từ trên xuống (số dòng tương ứng trong file, có thể lệch nhẹ sau khi sửa):
1. **Hero** (dòng ~81-123) — badge "Nhận in tên, số áo theo yêu cầu", `<h1>`, CTA "Mua sắm ngay" (`/products`) + "Sản phẩm nổi bật" (`/products?featured=true`). Dùng `Reveal` (variant="scale") + `Magnetic` cho nút.
2. **Banner Slider** (dòng ~126, component `components/banner-slider.tsx`) — gallery ngang cuộn ghim (pinned scroll).
3. **Perks** (dòng ~129-180) — data ở const `PERKS` (đầu file, dòng ~21-46): mảng 4 object `{icon, title, desc, color}` — **sửa nội dung/màu 4 ô cam kết thì sửa trực tiếp mảng này**, không phải trong JSX.
4. **Brands** (dòng ~183-240) — chỉ render nếu `brands.length > 0`. Nhãn phụ "Đối tác thương hiệu" + marquee `animate-marquee` (định nghĩa keyframe trong `globals.css`), khung `max-w-6xl`. Mỗi logo là `Link` `/products?brand=<slug>`, card `rounded-3xl`, hover: `-translate-y-1.5`, bỏ `grayscale`.
5. **Category Showcase** — xem chi tiết bên dưới (mục riêng "Category Showcase — chi tiết kỹ thuật").
6. **Entertainment Gallery** — xem chi tiết bên dưới (mục riêng "Entertainment Gallery — chi tiết kỹ thuật").
7. **Promo CTA** (dòng ~257-307) — banner in tên/số áo, nền `oklch(0.16 0.03 235)` + dot-grid trôi (`animate-grid-drift`) + 2 blob (`animate-blob-a`, `animate-blob-b`), nút "Đặt in ngay" → `/products`.
8. **Testimonials** (dòng ~310-337) — data ở const `TESTIMONIALS` (dòng ~48-67): mảng 3 object `{name, role, content}` — **sửa nội dung đánh giá mẫu thì sửa mảng này**.

### Category Showcase — chi tiết kỹ thuật (`components/category-showcase.tsx`, ~648 dòng)
Mô hình "hệ mặt trời": danh mục gốc (`!parent_id`) là hành tinh (`orbiting`) quay quanh mặt trời trung tâm; click vào hành tinh có con (`childrenOf(id).length > 0`) sẽ "zoom" vào — hành tinh đó trở thành mặt trời mới, các con của nó trở thành hành tinh mới.
- **State chính**: `path: Category[]` (dòng 62, ngăn xếp đã drill-down; rỗng = gốc ảo "Danh mục sản phẩm"), `current = path[path.length-1]`, `orbiting = current ? childrenOf(current.id) : roots`, `flight` (dòng 77-83, thông tin clone đang bay: `category/image/color/from/to`), `docked` (bool, đã bay tới đích chưa), `hovered` (index hành tinh đang hover).
- **Hàm điều khiển**:
  - `zoomInto(c, sourceEl, color)` (dòng 87-123) — bắt đầu chuỗi hiệu ứng khi click hành tinh có con. Timing: `SUN_EXIT_MS = 220` (mặt trời cũ fade+co trước) → `FLIGHT_MS = 600` (clone bay vào giữa) → sau tổng `220+600=820ms` mới `setPath` (đổi dữ liệu thật) và reset `flight/docked`.
  - `zoomToDepth(depth)` (dòng 124-131) — dùng cho breadcrumb (dòng ~230-252), cắt `path` về độ dài `depth` để quay lại cấp trên/gốc ngay lập tức (không có hiệu ứng bay lùi).
  - `handlePlanetMouseMove/Leave` (dòng 138-156) — set CSS custom properties `--rx/--ry/--gx/--gy` trực tiếp lên DOM (không re-render) để tạo tilt 3D + light sheen theo con trỏ cho từng hành tinh.
- **Vòng quay hành tinh**: `useEffect` dùng `requestAnimationFrame` — 1 vòng quay mất **50 giây** (`degPerMs = 360/(50*1000)`, sửa số này để đổi tốc độ quay); dừng quay khi có hành tinh đang hover (`hoveredRef.current !== null`) **hoặc khi đang có flight đang chạy** (`flightRef.current === true`, xem mục fix khựng bên dưới). Quỹ đạo dùng toán 2D thuần (không dùng CSS rotateX thật) để tránh méo hình: `SQUISH = 0.55` (độ "dẹt" ellipse khi nhìn xiên, dòng 46), `RING_RADIUS = [44, 34]` (% bán kính 2 vòng tròn nét đứt, dòng 47) — **hành tinh luôn chạy đúng theo `RING_RADIUS[0]` (vòng ngoài)**.
  - **Đã fix khựng lần 2**: dù clone bay chỉ animate `transform` (mượt), vòng lặp `requestAnimationFrame` của quỹ đạo vẫn tiếp tục ghi `el.style.left/top` (thuộc tính layout) cho MỌI hành tinh ở mỗi frame ngay trong lúc mặt trời + clone đang transition — việc reflow liên tục này giành CPU main thread với compositor, gây khựng đúng lúc bấm dù bản thân animation bay không có vấn đề. Đã thêm `flightRef` (đồng bộ từ state `flight` qua `useEffect`) để **tạm dừng hẳn vòng quay quỹ đạo trong suốt thời gian có flight**, loại bỏ việc tranh chấp main thread này.
- **Đã fix lỗi hydration mismatch (2 lớp nguyên nhân)** trên div anchor hành tinh (`className="absolute size-0"`, có `left/top/zIndex`) và div depth (`transform: scale(...)`, `opacity`):
  1. `initialX`/`initialY` tính bằng `Math.cos`/`Math.sin` có thể lệch nhau ở bit cuối cùng giữa V8 server và V8 trình duyệt (khác OS/kiến trúc) dù cùng công thức, vd server ra `"28%"` nhưng client ra `"27.99999999999998%"` — đã fix bằng `.toFixed(4)` cho `initialX`/`initialY` để đảm bảo chuỗi render giống hệt nhau.
  2. **Nguyên nhân sâu hơn (vẫn còn báo lỗi sau khi fix #1)**: vòng lặp `requestAnimationFrame` của quỹ đạo (`planetRefs`/`depthRefs`) bắt đầu ghi đè trực tiếp `left/top/zIndex/transform/opacity` lên đúng các node này **ngay trong frame đầu tiên sau khi mount** — tức gần như tức thời, thường trước khi React kịp xác minh xong phần hydrate. Đây là dạng lỗi hydration "vô hại nhưng không tránh được bằng cách làm giá trị khớp nhau", vì bản chất giá trị ĐÃ được client chủ động animate lệch khỏi SSR ngay sau mount — đúng trường hợp React khuyến nghị dùng `suppressHydrationWarning` thay vì cố làm giá trị không bao giờ đổi. Đã thêm `suppressHydrationWarning` vào cả 2 div này (anchor + depth wrapper). **Nếu sau này có node nào khác bị 1 `useEffect`/rAF ghi đè style ngay sau mount (không phải sau khi user tương tác), luôn cân nhắc `suppressHydrationWarning` cho chính node đó thay vì chỉ sửa công thức tính giá trị ban đầu.** **Đã fix nốt cảnh báo hydration còn lại trên nút breadcrumb "Danh mục sản phẩm"** (`onClick={() => zoomToDepth(0)}`, dòng ~255): cảnh báo chỉ còn đúng 1 thuộc tính `fdprocessedid` — đây KHÔNG phải lỗi code, mà do extension trình duyệt kiểu quản lý mật khẩu (LastPass/Dashlane...) tự chèn thuộc tính này vào các phần tử clickable ngay trên DOM trước khi React kịp hydrate (chính React cũng liệt kê nguyên nhân này trong thông báo lỗi). Đã thêm `suppressHydrationWarning` lên nút đó để tắt cảnh báo false-positive này. **Nếu sau này gặp lại cảnh báo hydration mà diff CHỈ có `fdprocessedid` (không có thuộc tính nào khác), luôn là do extension trình duyệt — chỉ cần `suppressHydrationWarning` trên đúng node đó, không cần sửa logic.**
- **Nền không gian** (dòng 283-332): nebula gradient + 26 ngôi sao nhấp nháy (`STARS`, dòng 31-36, vị trí cố định theo công thức để không đổi mỗi lần re-render). Zoom nền theo cấp: `transform: scale(1 + path.length * 0.12)`, khi đang bay (`flight && docked`) thì nhảy thẳng lên mức của cấp tiếp theo (`(path.length + 1) * 0.12`) — **không có bước "bung ra" tạm thời, chỉnh hệ số `0.12` để đổi độ zoom mỗi cấp**.
- **Mặt trời trung tâm** (dòng 556-603, `<button ref={sunRef}>`): click gọi `zoomToDepth(path.length - 1)` (lùi 1 cấp). Khi `flight` đang chạy: `opacity: 0`, `scale: 0.7`, `pointer-events-none` (ẩn trước khi clone bay tới, tránh chồng hình). **Lưu ý kỹ thuật quan trọng**: canh giữa dùng thuộc tính CSS gốc `style.translate = "-50% -50%"` (KHÔNG dùng class Tailwind `-translate-x-1/2 -translate-y-1/2` cùng lúc với `style.transform`, vì Tailwind v4 compile các class đó ra thuộc tính `translate` riêng — nếu vừa có class vừa có `style.transform` chứa `translate(...)` sẽ bị cộng dồn lệch tâm, đây là bug đã gặp và fix).
- **Clone bay ("flight")**: div tuyệt đối, box (`left/top/width/height`) được set CỐ ĐỊNH một lần bằng rect của hành tinh gốc (`flight.from`) và không đổi nữa — toàn bộ chuyển động (bay tới vị trí + phóng to bằng kích thước mặt trời) chỉ chạy qua một thuộc tính duy nhất `transform` (`translate3d(dx, dy, 0) scale(...)`, với `dx/dy/scale` = `flightDx/flightDy/flightScale` tính sẵn từ tâm `flight.from`/`flight.to`, khai báo ngay sau state `flight/docked`). Có `translateZ` để tạo cảm giác bay trong không gian 3D (cần `perspective: 1200px` đặt trên `sceneRef`).
  - **Đã fix lỗi khựng/giật (lần 1)**: bản cũ animate trực tiếp `left/top/width/height` (thuộc tính layout) khiến trình duyệt phải reflow lại mỗi frame trong suốt 600ms → khựng, nhất là máy yếu. Bản mới chỉ animate `transform` (GPU compositor, không reflow) nên mượt hơn hẳn. **Nếu sau này cần chỉnh lại chuyển động bay, luôn ưu tiên sửa qua `transform`/`translate3d`/`scale`, tuyệt đối không thêm lại `transition` trên `left/top/width/height`.**
  - **Đã fix lỗi khựng (lần 2)**: nguyên nhân không nằm ở clone bay mà ở vòng quay quỹ đạo — xem mục "Vòng quay hành tinh" bên trên (thêm `flightRef` để tạm dừng quỹ đạo trong lúc có flight, tránh tranh chấp main thread với transition của mặt trời/clone).
  - **Đã fix lỗi méo hình tròn khi bay (lần 3)**: bản trước animate `transform` gộp cả `rotateY(-35deg) rotateX(14deg)` cùng lúc với `translate3d` + `scale` để tạo cảm giác "lộn nhào" trong không gian. Vấn đề: trình duyệt nội suy `transform` như MỘT ma trận duy nhất chứ không tách riêng từng hàm — trộn rotate với translate/scale trên phần tử có `perspective` khiến hình tròn bị méo thành elip lệch trong lúc bay ("méo hình tròn"), không phải chuyển động sạch. **Đã bỏ hẳn `rotateY`/`rotateX` khỏi transition này** (và bỏ `transformStyle: preserve-3d` không còn cần thiết), chỉ giữ `translate3d` (vẫn di chuyển qua trục Z để có chiều sâu) + `scale` — hình tròn giữ nguyên hình dạng suốt quá trình bay. **Nếu muốn thêm lại hiệu ứng xoay/lộn nhào sau này, nên tách riêng một layer con để rotate, không gộp chung transform với clone đang translate/scale.**
- **Muốn đổi tốc độ/timing của cả chuỗi hiệu ứng zoom**: sửa `SUN_EXIT_MS`/`FLIGHT_MS` trong `zoomInto` (dòng 114-115) — nhớ đồng bộ với các `duration-[...]`/`transition` gắn cứng theo ms ở phần JSX mặt trời (dòng 561) và clone bay (dòng 616).

### Entertainment Gallery — chi tiết kỹ thuật (`components/entertainment-gallery.tsx`, ~223 dòng)
"Card deck": các sản phẩm xếp cạnh nhau như bộ bài, hover vào thẻ nào thì thẻ đó "kéo ra" phóng to (dùng `flex-grow`/`flex-basis`, không tính toán vị trí bằng JS).
- **Hằng số**: `EXPAND_DURATION_MS = 900` (dòng 21) — thời gian giãn/co thẻ; đổi số này thì cũng phải đổi khớp `duration-[900ms]` trong class Tailwind (dòng ~131, ~176) vì đây là 2 chỗ tách biệt (JS timer vs CSS transition), không tự động đồng bộ.
- **State**: `hovered` (index đang hover, có debounce `scheduleHover` 120ms dòng 63-70 để tránh giật khi thẻ giãn ra đè lên thẻ bên cạnh), `settled` (chỉ set sau khi `EXPAND_DURATION_MS` trôi qua — thẻ đã giãn xong mới đổi ảnh sang `object-contain`, tránh ảnh "chạy trước" khung), `ratios` (tỉ lệ ảnh gốc từng sản phẩm, đo từ `naturalWidth/naturalHeight` khi ảnh load).
- **Tilt 3D khi hover** (`handleTiltMove`/`handleTiltLeave`, dòng 78-95): set `--rx/--ry/--mx/--my` lên chính thẻ đang hover; áp dụng trong `style.transform` (dòng ~141): `perspective(1200px) rotateX(var(--rx)) rotateY(var(--ry)) scale3d(1.02,1.02,1.02)`.
- **Fix lỗi giật khi nhả hover đã gặp**: class `transition-[flex-grow,flex-basis,filter,transform]` (dòng 131) PHẢI có `transform` trong danh sách, và trạng thái không-hover PHẢI set `transform` về `rotateX(0) rotateY(0) scale3d(1,1,1)` tường minh (dòng 148) thay vì bỏ trống — nếu thiếu 1 trong 2 điều này, hiệu ứng tilt sẽ cắt đột ngột thay vì tan biến mượt cùng lúc thẻ thu nhỏ.
- **Không dùng shadow theo yêu cầu** — hiệu ứng nổi khối dùng `translateZ(30px)` trên ảnh (dòng 175) + lớp "light sheen" theo con trỏ `mix-blend-mode: overlay` (dòng 180-191).

### Trang khác:
- `/products` — danh sách sản phẩm, lọc theo category/brand/search/giá, sort.
- `/products/[slug]` — chi tiết sản phẩm (`product-gallery-with-options.tsx`).
- `/login`, `/register`, `/account`, `/cart`, `/checkout` — tồn tại trong `src/app/` nhưng lưu ý: các bảng `carts/orders/payments/addresses/coupons/reviews` **đã bị drop khỏi Supabase** (migration `0004_drop_ecommerce_tables.sql`) vì dự án chuyển hẳn sang mô hình showcase — các trang này cần rà soát lại nếu còn gọi tới dữ liệu đó.

### Component dùng chung đáng chú ý:
- `magnetic.tsx` — nút "hút" theo con trỏ.
- `reveal.tsx`, `text-reveal.tsx` — hiệu ứng xuất hiện khi cuộn.
- `tilt-3d.tsx` — tilt 3D dùng chung (product-card, entertainment-gallery).
- `site-loader.tsx` — màn hình loading khi vào site.
- `site-header.tsx`, `site-footer.tsx`.

---

## 2. Backend (Supabase — `supabase/migrations/`)

Không có backend API riêng; toàn bộ nghiệp vụ nằm trong Postgres schema + RLS policy, truy cập trực tiếp qua Supabase client SDK.

### Bảng dữ liệu hiện còn dùng (theo `endpoints.ts` của cả 2 app):
- `profiles` — mở rộng `auth.users`, có `role` (`customer` | `admin`), tự tạo qua trigger `handle_new_user` khi có user mới đăng ký.
- `categories` — có `parent_id` (danh mục cha/con), `slug`, `is_active`, `sort_order`.
- `brands` — `slug`, `logo`, `is_active`.
- `products` — thuộc `category_id` + `brand_id` (optional), giá `base_price`/`sale_price`, `is_featured`, `is_active`, các số liệu `view_count/sold_count/rating_avg/rating_count`.
- `product_variants` — biến thể theo `size`/`color`, `stock`, `price` riêng.
- `product_images` — ảnh phụ theo `sort_order`.

### Bảng đã bị xoá (migration `0004_drop_ecommerce_tables.sql`), không còn tồn tại trong DB:
`addresses`, `carts`, `cart_items`, `coupons`, `orders`, `order_items`, `payments`, `reviews`.
→ Lý do: website chuyển hẳn sang catalog showcase, không bán hàng thật.

### Quyền truy cập (RLS, định nghĩa ở `0002_orders_and_rls.sql`, các bảng bị drop thì policy cũng bị drop theo):
- Khách (chưa đăng nhập / customer): đọc được `categories`, `brands`, `products`, `product_variants` đang `is_active = true`; đọc mọi `product_images`.
- Admin (`profiles.role = 'admin'`, kiểm tra qua hàm `is_admin()`): toàn quyền đọc/ghi tất cả bảng catalog.
- `profiles`: user chỉ xem/sửa chính mình, admin xem/sửa tất cả.

### "Chức năng backend" theo từng file `endpoints.ts`:
- `frontend/src/lib/endpoints.ts` (chỉ đọc — public):
  - `getCategories()`, `getBrands()`
  - `getProducts(filters)` — lọc category/brand/search/giá/featured, sort (`latest/price_asc/price_desc/best_selling/rating`), phân trang.
  - `getProduct(slug)` — chi tiết 1 sản phẩm.
- `admin-web/src/lib/endpoints.ts` (cần quyền admin):
  - **Auth**: `login`, `logout`, `me` — đăng nhập yêu cầu `role = 'admin'`, nếu không sẽ tự signOut và báo lỗi.
  - **Categories**: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`.
  - **Brands**: `getBrands`, `createBrand`, `updateBrand`, `deleteBrand`.
  - **Upload**: `uploadImage` — đẩy file lên Cloudinary, trả về URL.
  - **Products**: `getAdminProducts` (phân trang + search), `getAdminProduct`, `createProduct` (kèm tạo variants), `updateProduct`, `deleteProduct`.
  - **Product Variants**: `createVariant`, `updateVariant`, `deleteVariant`.
  - **Users**: `getAdminUsers` (lọc role/search + phân trang), `getAdminUser`, `updateAdminUser` (sửa name/phone/role), `deleteAdminUser`.

---

## 3. Admin-web (`admin-web/`) — giao diện quản trị

Layout chung: `components/admin-shell.tsx` (khung trang) + `components/app-sidebar.tsx` (menu điều hướng) + `components/site-header.tsx`.

### Danh sách giao diện (`src/app/`):
- **`/login`** — đăng nhập admin (chỉ tài khoản có `role = admin` mới vào được).
- **`/`** (dashboard) — trang tổng quan sau đăng nhập.
- **`/categories`** — quản lý danh mục: danh sách, thêm/sửa/xoá (CRUD qua `endpoints.ts`), hỗ trợ `parent_id` cho danh mục cha/con.
- **`/brands`** — quản lý thương hiệu: danh sách, thêm/sửa/xoá, upload logo qua Cloudinary.
- **`/products`** — danh sách sản phẩm (tìm kiếm + phân trang).
  - **`/products/new`** — tạo sản phẩm mới, dùng chung `components/product-form.tsx` (nhập thông tin + tạo variants đi kèm).
  - **`/products/[id]`** — sửa sản phẩm, quản lý biến thể (size/color/giá/tồn kho) và ảnh sản phẩm.
- **`/users`** — quản lý tài khoản (`profiles`): danh sách lọc theo role/search, xem chi tiết, sửa (tên/sđt/role), xoá.

### Ghi chú:
- Không có trang quản lý đơn hàng/thanh toán/giỏ hàng — đúng với việc các bảng đó đã bị xoá khỏi DB.
- `hooks/use-mobile.ts` — hook responsive dùng cho sidebar.
