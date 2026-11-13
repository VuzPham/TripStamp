# TripStamp

*Every Trip Leaves a Stamp.* Web-app bản đồ khám phá địa điểm bản địa Nha Trang: tìm địa điểm, quét QR, sưu tầm thẻ số (Digital Stamps) và đổi ưu đãi.

Stack: React + Vite · Tailwind CSS v4 · React Leaflet · @zxing/browser · Supabase · Vercel.

## 1. Chạy thử trên máy (30 giây, không cần Supabase)

```bash
npm install
npm run dev
```

Nếu chưa có file `.env.local`, app chạy ở **chế độ demo**: dùng 15 địa điểm mẫu, lưu thẻ trong trình duyệt. Mở `http://localhost:5173/dev/qr` để in/hiển thị mã QR demo rồi thử quét ở `/scan` (hoặc dán token `tripstamp-demo-cho-dam` vào ô nhập thủ công).

> Chế độ demo chỉ để trình diễn giao diện, không an toàn. Bản chạy thật phải dùng Supabase.

## 2. Kết nối Supabase (bản chạy thật)

1. Tạo project tại supabase.com.
2. Vào **SQL Editor**, chạy lần lượt `supabase/schema.sql`, `supabase/admin.sql`, `supabase/reviews.sql`, `supabase/media.sql`, `supabase/cities.sql`, `supabase/profile.sql` rồi `supabase/seed.sql`. Nếu đã chạy bản cũ: chạy lại `cities.sql` (thêm slogan, khu vực) rồi chạy lại `seed.sql`.
3. **Authentication → URL Configuration**: thêm URL local (`http://localhost:5173`) và URL Vercel vào Site URL / Redirect URLs. Nếu muốn đăng ký khỏi cần xác nhận email khi thử nghiệm, tắt “Confirm email” ở Providers → Email.
4. Sao chép `.env.example` thành `.env.local`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API).
5. `npm run dev`.

Không bao giờ đưa `service_role`/secret key vào biến `VITE_*`.

### Bảo mật đã được cài đặt

- Mọi bảng bật **RLS**; client bị thu hồi toàn bộ quyền rồi chỉ cấp lại quyền đọc cần thiết.
- `user_stamps` và `redemptions`: client **chỉ đọc dữ liệu của chính mình**, không có quyền ghi.
- Nhận thẻ và đổi ưu đãi chỉ thực hiện qua hai hàm Postgres `claim_stamp(token)` và `redeem_reward(id)` (SECURITY DEFINER), kiểm tra: đăng nhập, token tồn tại, còn hiệu lực/thời hạn, giới hạn lượt, trùng lặp (ràng buộc unique), giới hạn 10 lần quét sai / 5 phút.
- `qr_codes` hoàn toàn không đọc được từ client; thông tin liên hệ của `partners` không bị lộ.

### QR thật cho đối tác

`seed.sql` chèn token **demo cố định, dễ đoán**. Trước khi mời người dùng thật, xoá chúng và tạo token ngẫu nhiên:

```sql
delete from public.qr_codes where token like 'tripstamp-demo-%';
insert into public.qr_codes (place_id, token, expires_at)
select id, encode(gen_random_bytes(16), 'hex'), null from public.places where slug = 'ca-phe-muoi-gio-bien';
select p.name, q.token from public.qr_codes q join public.places p on p.id = q.place_id;
```

Dùng trang `/admin/qr` để tạo token ngẫu nhiên và in QR (không cần SQL). Mã QR chứa URL `https://<domain>/claim?t=<token>`: người dùng quét bằng camera điện thoại cũng mở thẳng trang nhận thẻ. Có thể sinh ảnh QR từ URL bằng bất kỳ công cụ QR nào, hoặc tạm dùng trang `/dev/qr` (bật bằng `VITE_ENABLE_DEV_TOOLS=true`, chỉ nên bật khi cần).

## 3. Trang quản trị (`/admin`)

Truy cập `https://<domain>/admin` (hoặc `http://localhost:5173/admin`). Chức năng: tổng quan số liệu, quản lý địa điểm + thẻ số (chọn vị trí trên bản đồ, tải ảnh lên Supabase Storage), đối tác, **tạo/thu hồi/in mã QR ngẫu nhiên**, ưu đãi, và tra mã đổi thưởng để đánh dấu "đã dùng" tại quầy.

Cấp quyền admin cho tài khoản của bạn (đăng ký tài khoản trong app trước):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ban@example.com');
```

Bảo mật: quyền admin được kiểm tra ở database (`is_admin()` + RLS + hàm RPC), không phải chỉ ẩn giao diện. Người dùng thường mở `/admin` sẽ thấy thông báo không có quyền và mọi lệnh ghi đều bị từ chối. Khu vực admin cần Supabase (không chạy ở chế độ demo). Mã admin được tải riêng (lazy) nên người dùng thường không tải về.

## 3b. Đánh giá, bình luận và trạng thái Hot

- **Đánh giá:** người dùng chấm 1–5 sao và bình luận ở trang chi tiết địa điểm. Chỉ người **đã check-in** (đã nhận thẻ của địa điểm đó) mới đánh giá được; mỗi người một đánh giá cho mỗi nơi, có thể sửa/xoá. Việc kiểm tra nằm ở hàm Postgres `submit_review`, không thể qua mặt từ frontend.
- **Hot 🔥:** địa điểm hiện huy hiệu Hot khi admin ghim (tick “Ghim là địa điểm Hot” ở /admin/places) hoặc tự động khi `lượt nhận thẻ 14 ngày + 2 × đánh giá 14 ngày ≥ 5`. Đổi ngưỡng trong view `place_stats` (supabase/reviews.sql).
- **❤️ Được yêu thích:** điểm trung bình ≥ 4,5 với ít nhất 3 đánh giá.
- Trang Khám phá có bộ lọc “🔥 Hot” và “⭐ Đánh giá cao”; trang chủ có mục “Địa điểm đang hot”; marker Hot trên bản đồ có biểu tượng 🔥.
- Admin kiểm duyệt đánh giá ở `/admin/reviews` (ẩn, hiện lại, xoá).
- Dữ liệu mẫu **không** chứa đánh giá giả; bạn tự thử bằng cách nhận thẻ rồi đánh giá. 3 địa điểm mẫu được ghim Hot để thấy huy hiệu.

## 3c. Ảnh địa điểm

- **Ảnh của bạn (khuyến nghị):** vào `/admin/places` → sửa địa điểm → “Chọn ảnh”. Ảnh được nén còn tối đa 1200px rồi lưu ở Supabase Storage (bucket `place-images`, đọc công khai) và hiển thị ở mọi nơi trong app. Có ô “Ghi nguồn ảnh” để ghi tác giả/liên kết khi dùng ảnh của người khác.
- **Ảnh minh hoạ mặc định:** địa điểm chưa có ảnh (hoặc ảnh bị lỗi) tự dùng tranh minh hoạ theo danh mục ở `public/images/cat-*.svg` (vẽ riêng cho dự án, không vướng bản quyền).
- **Ảnh mẫu từ cloud:** Tháp Bà Ponagar dùng ảnh từ Wikimedia Commons (có ghi nguồn). Tôi chưa kiểm tra được giấy phép chi tiết/tác giả của từng tệp, hãy mở liên kết nguồn trên trang địa điểm để xác nhận trước khi dùng thương mại, hoặc thay bằng ảnh của bạn. Không nên chèn ảnh từ trang web khác khi chưa được phép.

## 3d. Chọn khu vực, ảnh nền theo thành phố, bắt buộc đăng nhập

- **Bộ chọn khu vực** (`components/Location/LocationSelector.jsx`) dùng chung ở thanh trên, Home, Khám phá và Chi tiết địa điểm: chọn tỉnh/thành + quận/khu vực, tìm nhanh, hoặc dùng GPS (xử lý trường hợp từ chối quyền / không lấy được vị trí / ngoài vùng hỗ trợ). Vị trí lưu ở `CityContext` (và localStorage) nên mọi trang đổi theo.
- **Ảnh nền theo thành phố:** vào `/admin/cities`, tải ảnh nền cho từng thành phố (lưu ở Supabase Storage), nhập slogan. Chưa có ảnh thì dùng tranh minh hoạ mặc định. Khu vực (quận/huyện) quản lý ở `/admin/areas`; gán khu vực cho địa điểm ở `/admin/places`.
- **Yêu cầu đăng nhập:** `/scan`, `/claim`, `/collection`, `/rewards` được bọc bởi `ProtectedRoute`; chưa đăng nhập sẽ chuyển tới `/login` với thông báo “Login Required” và quay lại đúng trang cũ sau khi đăng nhập. Home, Khám phá, Chi tiết địa điểm, `/login`, `/register` công khai. Đây chỉ là lớp giao diện — dữ liệu cá nhân vẫn do RLS và các hàm RPC trong Supabase bảo vệ.

## 3e. Hồ sơ và đăng nhập Google / Facebook

- **Hồ sơ:** chạy `supabase/profile.sql` (thêm họ tên, số điện thoại, ngày sinh, nơi ở, giới thiệu, bucket ảnh đại diện `avatars`). Người dùng sửa ở `/profile`; chỉ sửa được hồ sơ của chính mình, không tự đổi được `role`.
- **Google:** Google Cloud Console → APIs & Services → Credentials → tạo *OAuth client ID* (Web). Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`. Dán Client ID/Secret vào Supabase → Authentication → Providers → Google → bật.
- **Facebook:** developers.facebook.com → tạo app → thêm *Facebook Login* → Valid OAuth Redirect URI: `https://<project>.supabase.co/auth/v1/callback`. Dán App ID/Secret vào Supabase → Authentication → Providers → Facebook → bật.
- Supabase → Authentication → URL Configuration: đặt *Site URL* là domain Vercel của bạn và thêm `https://<domain>/login` (và `http://localhost:5173/login`) vào *Redirect URLs*.
- Chưa bật nhà cung cấp nào thì nút tương ứng báo lỗi thân thiện; đăng nhập bằng email vẫn dùng bình thường. Chế độ demo ẩn hai nút này.

## 4. Deploy lên Vercel

1. `npm run build` ở local để chắc chắn build sạch.
2. Đẩy code lên GitHub (file `.env.local` đã nằm trong `.gitignore`).
3. Vercel → **Add New Project** → import repository. Framework Preset: Vite; Build Command `npm run build`; Output Directory `dist` (đã khai báo trong `vercel.json`, kèm rewrite SPA nên F5 trang con không bị 404).
4. Project Settings → Environment Variables: thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Deploy, rồi thêm URL `*.vercel.app` vào Redirect URLs của Supabase Auth.
6. Kiểm tra trên điện thoại (HTTPS): bản đồ, đăng nhập, camera QR, nhận thẻ.

## 5. Cấu trúc

```
src/
  components/  Navbar, Map (PlacesMap), PlaceCard, QRScanner, StampCard (+ClaimResult), ui/
  pages/       Home, Explore, PlaceDetail, Scan (+Claim), MyCollection, Rewards, Profile, Dev
  services/    supabase.js, placeService, stampService, rewardService, demoStore
  contexts/    AuthContext
  hooks/       usePlaces, useClaim, useGeolocation, useAsync
  data/seed.js Nguồn dữ liệu mẫu (15 địa điểm); `npm run gen:seed` sinh lại supabase/seed.sql
src/admin/     Trang quản trị (layout, pages, adminService)
supabase/      schema.sql (bảng + RLS + hàm), admin.sql (quyền admin), seed.sql
```

## 6. Dữ liệu mẫu và việc cần làm tiếp

- 7 địa điểm là landmark có thật ở Nha Trang; 8 địa điểm có hậu tố “(mẫu)” là đối tác **giả lập**. Tọa độ chỉ xấp xỉ, hãy kiểm tra lại và thay bằng đối tác thật (3–5 nơi) trước khi thử nghiệm.
- Ảnh địa điểm chưa có (hiển thị khối màu theo danh mục). Thêm ảnh vào Supabase Storage rồi cập nhật cột `places.image_url`.
- Tile OpenStreetMap chỉ phù hợp quy mô MVP; nếu lưu lượng tăng, dùng nhà cung cấp tile riêng theo chính sách của OSM.
- Hiện chỉ admin xác nhận “đã dùng” ưu đãi. Nếu muốn đối tác tự đăng nhập xác nhận, cần thêm vai trò `partner` (chưa làm).
