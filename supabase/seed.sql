-- File được sinh tự động bởi `npm run gen:seed`. Đừng sửa tay; hãy sửa src/data/seed.js.
-- Dữ liệu MẪU để thử nghiệm. Chạy sau supabase/schema.sql.

insert into public.categories (id, name, icon, color, sort_order) values
  ('food', 'Ẩm thực', '🍜', '#ea580c', 1),
  ('cafe', 'Cà phê', '☕', '#92400e', 2),
  ('art', 'Nghệ thuật', '🎨', '#7c3aed', 3),
  ('shopping', 'Mua sắm', '🛍️', '#db2777', 4),
  ('experience', 'Trải nghiệm', '🧭', '#0f766e', 5)
on conflict (id) do update set name = excluded.name, icon = excluded.icon, color = excluded.color, sort_order = excluded.sort_order;

insert into public.cities (id, name, province, tagline, slogan, latitude, longitude, zoom, color_primary, color_accent, hero_image, sort_order) values
  ('nha-trang', 'Nha Trang', 'Khánh Hòa', 'Biển xanh, hoàng hôn và những quán ăn bản địa.', 'Explore beautiful destinations and collect unforgettable memories.', 12.2388, 109.1967, 13, '#0f6b66', '#ff6b4a', '/images/hero.svg', 1),
  ('ha-noi', 'Hà Nội', 'Hà Nội', 'Phố cổ, mặt hồ và ly cà phê trứng buổi sáng.', 'Wander old streets and lakeside paths, and collect the flavours that stay with you.', 21.0285, 105.8412, 14, '#8a2b2b', '#f2b134', '/images/city-ha-noi.svg', 2),
  ('hue', 'Huế', 'Thừa Thiên Huế', 'Cố đô trầm mặc bên dòng sông Hương.', 'Slow down in the old capital beside the Perfume River.', 16.4637, 107.5909, 13, '#5b3a82', '#e9b44c', '/images/city-hue.svg', 3),
  ('da-nang', 'Đà Nẵng', 'Đà Nẵng', 'Thành phố của những cây cầu và bãi biển dài.', 'Cross the bridges, walk the long beaches and stamp the best of the city.', 16.0678, 108.2208, 13, '#0e6ba8', '#ff8a3d', '/images/city-da-nang.svg', 4),
  ('da-lat', 'Đà Lạt', 'Lâm Đồng', 'Sương sớm, rừng thông và những góc phố se lạnh.', 'Chase misty mornings and pine forests, and collect cool-weather memories.', 11.9404, 108.4583, 14, '#2a6b45', '#ec6b9a', '/images/city-da-lat.svg', 5),
  ('ho-chi-minh', 'Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Sài Gòn sôi động, từ kiến trúc cổ đến phố đi bộ.', 'From historic landmarks to lively streets, stamp your way through Saigon.', 10.7769, 106.7009, 15, '#b4410a', '#1aa3b5', '/images/city-ho-chi-minh.svg', 6)
on conflict (id) do update set name = excluded.name, province = excluded.province, tagline = excluded.tagline, slogan = excluded.slogan, latitude = excluded.latitude, longitude = excluded.longitude, zoom = excluded.zoom, color_primary = excluded.color_primary, color_accent = excluded.color_accent, hero_image = excluded.hero_image, sort_order = excluded.sort_order
where public.cities.tagline is null; -- chỉ điền hàng thành phố còn trống; không ghi đè ảnh/màu bạn đã chỉnh trong admin

insert into public.areas (id, city_id, name, sort_order) values
  ('nha-trang-trung-tam', 'nha-trang', 'Trung tâm & Trần Phú', 1),
  ('nha-trang-bac', 'nha-trang', 'Bắc Nha Trang', 2),
  ('nha-trang-nam', 'nha-trang', 'Cầu Đá & phía Nam', 3),
  ('ha-noi-hoan-kiem', 'ha-noi', 'Hoàn Kiếm', 1),
  ('ha-noi-ba-dinh', 'ha-noi', 'Ba Đình', 2),
  ('ha-noi-dong-da', 'ha-noi', 'Đống Đa', 3),
  ('hue-trung-tam', 'hue', 'Kinh thành & trung tâm', 1),
  ('hue-ngoai-thanh', 'hue', 'Ngoại thành', 2),
  ('da-nang-hai-chau', 'da-nang', 'Hải Châu', 1),
  ('da-nang-son-tra', 'da-nang', 'Sơn Trà', 2),
  ('da-lat-trung-tam', 'da-lat', 'Quanh hồ Xuân Hương', 1),
  ('da-lat-phia-dong', 'da-lat', 'Phía đông', 2),
  ('ho-chi-minh-quan-1', 'ho-chi-minh', 'Quận 1', 1)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.partners (name, status)
select v.name, 'active' from (values
  ('Biển Xanh (mẫu)'),
  ('Hẻm Nhỏ (mẫu)'),
  ('Chiều Gió (mẫu)'),
  ('Gió Biển (mẫu)'),
  ('Vườn Chiều (mẫu)'),
  ('Cát Trắng (mẫu)'),
  ('Quà biển (mẫu)'),
  ('Lặn biển (mẫu)')
) as v(name)
where not exists (select 1 from public.partners p where p.name = v.name);

insert into public.places (slug, name, description, category_id, partner_id, latitude, longitude, address, tags, city_id, area_id)
select v.slug, v.name, v.description, v.category_id, (select id from public.partners where name = v.partner limit 1), v.lat, v.lng, v.address, v.tags, v.city_id, v.area_id
from (values
  ('thap-ba-ponagar', 'Tháp Bà Ponagar', 'Quần thể đền tháp Chăm cổ trên đồi Cù Lao, nhìn ra cửa sông Cái.', 'experience', null, 12.2654::float8, 109.1954::float8, 'Số 2 Tháng 4, Nha Trang', array['văn hoá', 'lịch sử', 'Chăm']::text[], 'nha-trang', 'nha-trang-bac'),
  ('nha-tho-nui', 'Nhà thờ Núi (Nhà thờ Đá)', 'Công trình kiến trúc Gothic bằng đá trên đồi cao giữa trung tâm thành phố.', 'art', null, 12.2488::float8, 109.1922::float8, 'Đường Thái Nguyên, Nha Trang', array['kiến trúc', 'chụp ảnh']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('cho-dam', 'Chợ Đầm', 'Khu chợ lâu đời với đặc sản, hải sản khô và quà lưu niệm Nha Trang.', 'shopping', null, 12.2566::float8, 109.1912::float8, 'Khu Chợ Đầm, Nha Trang', array['đặc sản', 'chợ truyền thống']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('vien-hai-duong-hoc', 'Viện Hải dương học', 'Bảo tàng sinh vật biển lâu đời nhất Việt Nam, bên cạnh bến Cầu Đá.', 'experience', null, 12.2056::float8, 109.2203::float8, '01 Cầu Đá, Nha Trang', array['biển', 'gia đình', 'khoa học']::text[], 'nha-trang', 'nha-trang-nam'),
  ('hon-chong', 'Hòn Chồng', 'Cụm đá granite khổng lồ ven biển, điểm ngắm bình minh quen thuộc.', 'experience', null, 12.2707::float8, 109.2056::float8, 'Khu Hòn Chồng, Nha Trang', array['ngắm cảnh', 'bình minh']::text[], 'nha-trang', 'nha-trang-bac'),
  ('bao-tang-yersin', 'Bảo tàng Yersin', 'Không gian lưu giữ dấu ấn của bác sĩ Alexandre Yersin tại Nha Trang.', 'art', null, 12.2397::float8, 109.1971::float8, '10 Trần Phú, Nha Trang', array['lịch sử', 'bảo tàng']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('thap-tram-huong', 'Tháp Trầm Hương', 'Công trình biểu tượng hình búp sen bên bờ biển, nơi diễn ra nhiều sự kiện văn hoá.', 'art', null, 12.2386::float8, 109.197::float8, 'Đường Trần Phú, Nha Trang', array['biểu tượng', 'bãi biển']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('bun-sua-bien-xanh', 'Bún sứa Biển Xanh (mẫu)', 'Quán bún sứa kiểu bản địa với nước dùng thanh, ăn sáng cực hợp.', 'food', 'Biển Xanh (mẫu)', 12.2441::float8, 109.1946::float8, 'Khu trung tâm, Nha Trang', array['ăn sáng', 'đặc sản']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('nem-nuong-hem-nho', 'Nem nướng Hẻm Nhỏ (mẫu)', 'Nem nướng cuốn bánh tráng, nước chấm đậm đà kiểu Nha Trang.', 'food', 'Hẻm Nhỏ (mẫu)', 12.2465::float8, 109.1931::float8, 'Khu trung tâm, Nha Trang', array['đặc sản', 'ăn tối']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('banh-can-chieu-gio', 'Bánh căn Chiều Gió (mẫu)', 'Bánh căn nóng hổi ăn kèm mắm nêm, chén nước chấm và rau sống.', 'food', 'Chiều Gió (mẫu)', 12.2519::float8, 109.1938::float8, 'Khu trung tâm, Nha Trang', array['ăn vặt', 'bản địa']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('ca-phe-muoi-gio-bien', 'Cà phê muối Gió Biển (mẫu)', 'Cà phê muối mát lạnh, ngồi nhìn biển và nghe sóng.', 'cafe', 'Gió Biển (mẫu)', 12.2372::float8, 109.1962::float8, 'Đường Trần Phú, Nha Trang', array['view biển', 'check-in']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('ca-phe-vuon-chieu', 'Cà phê Vườn Chiều (mẫu)', 'Quán cà phê sân vườn yên tĩnh, hợp làm việc hoặc đọc sách.', 'cafe', 'Vườn Chiều (mẫu)', 12.2431::float8, 109.1899::float8, 'Khu trung tâm, Nha Trang', array['yên tĩnh', 'làm việc']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('xuong-gom-cat-trang', 'Xưởng gốm Cát Trắng (mẫu)', 'Tự tay nặn và vẽ gốm, mang sản phẩm của mình về làm kỷ niệm.', 'art', 'Cát Trắng (mẫu)', 12.2493::float8, 109.2001::float8, 'Khu trung tâm, Nha Trang', array['workshop', 'thủ công']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('tiem-qua-yen-hai-san', 'Tiệm quà biển Nha Trang (mẫu)', 'Đặc sản khô, quà lưu niệm làm từ vỏ sò và vật liệu địa phương.', 'shopping', 'Quà biển (mẫu)', 12.2538::float8, 109.1925::float8, 'Khu trung tâm, Nha Trang', array['quà lưu niệm', 'đặc sản']::text[], 'nha-trang', 'nha-trang-trung-tam'),
  ('tour-lan-ngam-san-ho', 'Tour lặn ngắm san hô (mẫu)', 'Hành trình ra đảo, lặn ống thở ngắm san hô với hướng dẫn viên bản địa.', 'experience', 'Lặn biển (mẫu)', 12.2178::float8, 109.2142::float8, 'Bến Cầu Đá, Nha Trang', array['biển', 'phiêu lưu']::text[], 'nha-trang', 'nha-trang-nam'),
  ('ho-hoan-kiem', 'Hồ Hoàn Kiếm', 'Mặt hồ giữa lòng thủ đô với Tháp Rùa và cầu Thê Húc.', 'experience', null, 21.0285::float8, 105.8522::float8, 'Phường Hoàn Kiếm, Hà Nội', array['dạo bộ', 'biểu tượng']::text[], 'ha-noi', 'ha-noi-hoan-kiem'),
  ('van-mieu-quoc-tu-giam', 'Văn Miếu – Quốc Tử Giám', 'Quần thể di tích gắn với trường đại học đầu tiên của Việt Nam, lập năm 1076.', 'art', null, 21.0293::float8, 105.8355::float8, '58 Quốc Tử Giám, Hà Nội', array['lịch sử', 'kiến trúc']::text[], 'ha-noi', 'ha-noi-dong-da'),
  ('nha-tho-lon-ha-noi', 'Nhà thờ Lớn Hà Nội', 'Nhà thờ kiến trúc Gothic xây cuối thế kỷ 19 ở khu phố cổ.', 'art', null, 21.0287::float8, 105.8489::float8, '40 Nhà Chung, Hà Nội', array['kiến trúc', 'chụp ảnh']::text[], 'ha-noi', 'ha-noi-hoan-kiem'),
  ('cho-dong-xuan', 'Chợ Đồng Xuân', 'Khu chợ đầu mối lâu đời của phố cổ, đủ loại hàng hoá và đồ ăn vặt.', 'shopping', null, 21.0382::float8, 105.8497::float8, 'Phường Đồng Xuân, Hà Nội', array['chợ truyền thống', 'phố cổ']::text[], 'ha-noi', 'ha-noi-hoan-kiem'),
  ('hoang-thanh-thang-long', 'Hoàng thành Thăng Long', 'Di sản thế giới UNESCO, trung tâm quyền lực qua nhiều triều đại.', 'experience', null, 21.0345::float8, 105.8402::float8, '19C Hoàng Diệu, Hà Nội', array['di sản', 'lịch sử']::text[], 'ha-noi', 'ha-noi-ba-dinh'),
  ('dai-noi-hue', 'Đại Nội Huế', 'Kinh thành triều Nguyễn, di sản thế giới bên bờ sông Hương.', 'experience', null, 16.4698::float8, 107.5786::float8, 'Phú Hậu, Huế', array['di sản', 'cung đình']::text[], 'hue', 'hue-trung-tam'),
  ('chua-thien-mu', 'Chùa Thiên Mụ', 'Ngôi chùa cổ bên sông Hương với tháp Phước Duyên bảy tầng.', 'art', null, 16.4538::float8, 107.5445::float8, 'Kim Long, Huế', array['chùa', 'sông Hương']::text[], 'hue', 'hue-ngoai-thanh'),
  ('cau-truong-tien', 'Cầu Trường Tiền', 'Cây cầu thép biểu tượng của Huế, lên đèn rất đẹp về đêm.', 'experience', null, 16.4693::float8, 107.5887::float8, 'Sông Hương, Huế', array['biểu tượng', 'ngắm cảnh']::text[], 'hue', 'hue-trung-tam'),
  ('cho-dong-ba', 'Chợ Đông Ba', 'Chợ lớn nhất Huế, nơi mua đặc sản, đồ thủ công và ăn vặt xứ Huế.', 'shopping', null, 16.4727::float8, 107.5878::float8, 'Đường Trần Hưng Đạo, Huế', array['đặc sản', 'chợ']::text[], 'hue', 'hue-trung-tam'),
  ('lang-khai-dinh', 'Lăng Khải Định', 'Lăng tẩm pha trộn kiến trúc Đông – Tây với nội thất khảm sành sứ.', 'art', null, 16.3986::float8, 107.5887::float8, 'Thủy Bằng, Huế', array['kiến trúc', 'lăng tẩm']::text[], 'hue', 'hue-ngoai-thanh'),
  ('cau-rong', 'Cầu Rồng', 'Cây cầu hình rồng bắc qua sông Hàn, phun lửa và nước vào cuối tuần.', 'experience', null, 16.0611::float8, 108.2278::float8, 'Sông Hàn, Đà Nẵng', array['biểu tượng', 'ban đêm']::text[], 'da-nang', 'da-nang-hai-chau'),
  ('bai-bien-my-khe', 'Bãi biển Mỹ Khê', 'Bãi biển cát trắng dài, nước trong, hợp tắm biển và ngắm bình minh.', 'experience', null, 16.0544::float8, 108.248::float8, 'Phường Phước Mỹ, Đà Nẵng', array['biển', 'bình minh']::text[], 'da-nang', 'da-nang-son-tra'),
  ('cho-han', 'Chợ Hàn', 'Chợ trung tâm gần sông Hàn, nhiều đặc sản và hải sản khô.', 'shopping', null, 16.0689::float8, 108.2237::float8, '119 Trần Phú, Đà Nẵng', array['đặc sản', 'chợ']::text[], 'da-nang', 'da-nang-hai-chau'),
  ('bao-tang-cham-da-nang', 'Bảo tàng Điêu khắc Chăm', 'Nơi lưu giữ bộ sưu tập điêu khắc Chăm lớn nhất thế giới.', 'art', null, 16.0602::float8, 108.2236::float8, '02 Đường 2 Tháng 9, Đà Nẵng', array['bảo tàng', 'Chăm']::text[], 'da-nang', 'da-nang-hai-chau'),
  ('chua-linh-ung-son-tra', 'Chùa Linh Ứng Sơn Trà', 'Ngôi chùa trên bán đảo Sơn Trà với tượng Quan Âm cao nhìn ra biển.', 'art', null, 16.1002::float8, 108.2778::float8, 'Bán đảo Sơn Trà, Đà Nẵng', array['chùa', 'ngắm biển']::text[], 'da-nang', 'da-nang-son-tra'),
  ('ho-xuan-huong', 'Hồ Xuân Hương', 'Hồ nước hình vầng trăng khuyết giữa lòng thành phố, hợp dạo bộ và đạp vịt.', 'experience', null, 11.9437::float8, 108.4419::float8, 'Trung tâm Đà Lạt', array['dạo bộ', 'hồ']::text[], 'da-lat', 'da-lat-trung-tam'),
  ('ga-da-lat', 'Ga Đà Lạt', 'Nhà ga cổ kiến trúc độc đáo, nơi có chuyến tàu du lịch chạy Trại Mát.', 'art', null, 11.942::float8, 108.455::float8, '1 Quang Trung, Đà Lạt', array['kiến trúc', 'tàu hoả']::text[], 'da-lat', 'da-lat-phia-dong'),
  ('cho-da-lat', 'Chợ Đà Lạt', 'Chợ trung tâm với rau củ, mứt, hoa tươi và đồ len.', 'shopping', null, 11.943::float8, 108.4376::float8, 'Khu Hòa Bình, Đà Lạt', array['đặc sản', 'chợ']::text[], 'da-lat', 'da-lat-trung-tam'),
  ('nha-tho-con-ga', 'Nhà thờ Con Gà', 'Nhà thờ Chánh Tòa với con gà trên đỉnh tháp chuông.', 'art', null, 11.9395::float8, 108.4363::float8, '15 Trần Phú, Đà Lạt', array['kiến trúc', 'chụp ảnh']::text[], 'da-lat', 'da-lat-trung-tam'),
  ('quang-truong-lam-vien', 'Quảng trường Lâm Viên', 'Quảng trường với công trình hoa dã quỳ và bông hoa khổng lồ bên hồ.', 'experience', null, 11.9451::float8, 108.443::float8, 'Bên hồ Xuân Hương, Đà Lạt', array['check-in', 'hoa']::text[], 'da-lat', 'da-lat-trung-tam'),
  ('nha-tho-duc-ba', 'Nhà thờ Đức Bà Sài Gòn', 'Nhà thờ gạch đỏ hai tháp chuông giữa trung tâm Sài Gòn.', 'art', null, 10.7798::float8, 106.699::float8, '01 Công xã Paris, Quận 1', array['kiến trúc', 'biểu tượng']::text[], 'ho-chi-minh', 'ho-chi-minh-quan-1'),
  ('buu-dien-trung-tam-sai-gon', 'Bưu điện Trung tâm Sài Gòn', 'Toà nhà kiến trúc Pháp còn hoạt động, nơi gửi tem và bưu thiếp.', 'art', null, 10.7799::float8, 106.6999::float8, '02 Công xã Paris, Quận 1', array['kiến trúc', 'bưu thiếp']::text[], 'ho-chi-minh', 'ho-chi-minh-quan-1'),
  ('cho-ben-thanh', 'Chợ Bến Thành', 'Khu chợ biểu tượng với đặc sản, quà lưu niệm và ẩm thực đường phố.', 'shopping', null, 10.7725::float8, 106.698::float8, 'Đường Lê Lợi, Quận 1', array['đặc sản', 'ẩm thực']::text[], 'ho-chi-minh', 'ho-chi-minh-quan-1'),
  ('dinh-doc-lap', 'Dinh Độc Lập', 'Di tích lịch sử gắn với thời khắc 30/4/1975, có hầm chỉ huy và phòng khánh tiết.', 'experience', null, 10.777::float8, 106.6955::float8, '135 Nam Kỳ Khởi Nghĩa, Quận 1', array['lịch sử', 'di tích']::text[], 'ho-chi-minh', 'ho-chi-minh-quan-1'),
  ('pho-di-bo-nguyen-hue', 'Phố đi bộ Nguyễn Huệ', 'Phố đi bộ rộng dẫn ra bờ sông Sài Gòn, nơi diễn ra nhiều sự kiện.', 'experience', null, 10.7745::float8, 106.704::float8, 'Đường Nguyễn Huệ, Quận 1', array['dạo phố', 'sự kiện']::text[], 'ho-chi-minh', 'ho-chi-minh-quan-1')
) as v(slug, name, description, category_id, partner, lat, lng, address, tags, city_id, area_id)
on conflict (slug) do update set city_id = excluded.city_id, area_id = excluded.area_id;

-- Ảnh địa điểm (cần chạy supabase/media.sql trước). Địa điểm không có ảnh sẽ dùng ảnh minh hoạ theo danh mục.
update public.places set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_115.jpg?width=900', image_credit = 'Ảnh: Wikimedia Commons (giấy phép mở, xem trang nguồn)', image_source_url = 'https://commons.wikimedia.org/wiki/File:04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_115.jpg' where slug = 'thap-ba-ponagar';

-- Địa điểm được ghim Hot (cần chạy supabase/reviews.sql trước)
update public.places set is_featured = true where slug in ('thap-ba-ponagar', 'cho-dam', 'ca-phe-muoi-gio-bien', 'ho-hoan-kiem', 'dai-noi-hue', 'cau-rong', 'ho-xuan-huong', 'nha-tho-duc-ba');

insert into public.stamps (place_id, name, description, rarity)
select pl.id, v.name, v.description, v.rarity from (values
  ('thap-ba-ponagar', 'Tem Tháp Bà Ponagar', 'Bạn đã ghé Tháp Bà Ponagar.', 'rare'),
  ('nha-tho-nui', 'Tem Nhà thờ Núi (Nhà thờ Đá)', 'Bạn đã ghé Nhà thờ Núi (Nhà thờ Đá).', 'common'),
  ('cho-dam', 'Tem Chợ Đầm', 'Bạn đã ghé Chợ Đầm.', 'common'),
  ('vien-hai-duong-hoc', 'Tem Viện Hải dương học', 'Bạn đã ghé Viện Hải dương học.', 'common'),
  ('hon-chong', 'Tem Hòn Chồng', 'Bạn đã ghé Hòn Chồng.', 'common'),
  ('bao-tang-yersin', 'Tem Bảo tàng Yersin', 'Bạn đã ghé Bảo tàng Yersin.', 'rare'),
  ('thap-tram-huong', 'Tem Tháp Trầm Hương', 'Bạn đã ghé Tháp Trầm Hương.', 'common'),
  ('bun-sua-bien-xanh', 'Tem Bún sứa Biển Xanh', 'Bạn đã ghé Bún sứa Biển Xanh.', 'common'),
  ('nem-nuong-hem-nho', 'Tem Nem nướng Hẻm Nhỏ', 'Bạn đã ghé Nem nướng Hẻm Nhỏ.', 'common'),
  ('banh-can-chieu-gio', 'Tem Bánh căn Chiều Gió', 'Bạn đã ghé Bánh căn Chiều Gió.', 'common'),
  ('ca-phe-muoi-gio-bien', 'Tem Cà phê muối Gió Biển', 'Bạn đã ghé Cà phê muối Gió Biển.', 'common'),
  ('ca-phe-vuon-chieu', 'Tem Cà phê Vườn Chiều', 'Bạn đã ghé Cà phê Vườn Chiều.', 'common'),
  ('xuong-gom-cat-trang', 'Tem Xưởng gốm Cát Trắng', 'Bạn đã ghé Xưởng gốm Cát Trắng.', 'rare'),
  ('tiem-qua-yen-hai-san', 'Tem Tiệm quà biển Nha Trang', 'Bạn đã ghé Tiệm quà biển Nha Trang.', 'common'),
  ('tour-lan-ngam-san-ho', 'Tem Tour lặn ngắm san hô', 'Bạn đã ghé Tour lặn ngắm san hô.', 'epic'),
  ('ho-hoan-kiem', 'Tem Hồ Hoàn Kiếm', 'Bạn đã ghé Hồ Hoàn Kiếm.', 'common'),
  ('van-mieu-quoc-tu-giam', 'Tem Văn Miếu – Quốc Tử Giám', 'Bạn đã ghé Văn Miếu – Quốc Tử Giám.', 'rare'),
  ('nha-tho-lon-ha-noi', 'Tem Nhà thờ Lớn Hà Nội', 'Bạn đã ghé Nhà thờ Lớn Hà Nội.', 'common'),
  ('cho-dong-xuan', 'Tem Chợ Đồng Xuân', 'Bạn đã ghé Chợ Đồng Xuân.', 'common'),
  ('hoang-thanh-thang-long', 'Tem Hoàng thành Thăng Long', 'Bạn đã ghé Hoàng thành Thăng Long.', 'rare'),
  ('dai-noi-hue', 'Tem Đại Nội Huế', 'Bạn đã ghé Đại Nội Huế.', 'epic'),
  ('chua-thien-mu', 'Tem Chùa Thiên Mụ', 'Bạn đã ghé Chùa Thiên Mụ.', 'rare'),
  ('cau-truong-tien', 'Tem Cầu Trường Tiền', 'Bạn đã ghé Cầu Trường Tiền.', 'common'),
  ('cho-dong-ba', 'Tem Chợ Đông Ba', 'Bạn đã ghé Chợ Đông Ba.', 'common'),
  ('lang-khai-dinh', 'Tem Lăng Khải Định', 'Bạn đã ghé Lăng Khải Định.', 'rare'),
  ('cau-rong', 'Tem Cầu Rồng', 'Bạn đã ghé Cầu Rồng.', 'rare'),
  ('bai-bien-my-khe', 'Tem Bãi biển Mỹ Khê', 'Bạn đã ghé Bãi biển Mỹ Khê.', 'common'),
  ('cho-han', 'Tem Chợ Hàn', 'Bạn đã ghé Chợ Hàn.', 'common'),
  ('bao-tang-cham-da-nang', 'Tem Bảo tàng Điêu khắc Chăm', 'Bạn đã ghé Bảo tàng Điêu khắc Chăm.', 'rare'),
  ('chua-linh-ung-son-tra', 'Tem Chùa Linh Ứng Sơn Trà', 'Bạn đã ghé Chùa Linh Ứng Sơn Trà.', 'common'),
  ('ho-xuan-huong', 'Tem Hồ Xuân Hương', 'Bạn đã ghé Hồ Xuân Hương.', 'common'),
  ('ga-da-lat', 'Tem Ga Đà Lạt', 'Bạn đã ghé Ga Đà Lạt.', 'rare'),
  ('cho-da-lat', 'Tem Chợ Đà Lạt', 'Bạn đã ghé Chợ Đà Lạt.', 'common'),
  ('nha-tho-con-ga', 'Tem Nhà thờ Con Gà', 'Bạn đã ghé Nhà thờ Con Gà.', 'common'),
  ('quang-truong-lam-vien', 'Tem Quảng trường Lâm Viên', 'Bạn đã ghé Quảng trường Lâm Viên.', 'common'),
  ('nha-tho-duc-ba', 'Tem Nhà thờ Đức Bà Sài Gòn', 'Bạn đã ghé Nhà thờ Đức Bà Sài Gòn.', 'rare'),
  ('buu-dien-trung-tam-sai-gon', 'Tem Bưu điện Trung tâm Sài Gòn', 'Bạn đã ghé Bưu điện Trung tâm Sài Gòn.', 'rare'),
  ('cho-ben-thanh', 'Tem Chợ Bến Thành', 'Bạn đã ghé Chợ Bến Thành.', 'common'),
  ('dinh-doc-lap', 'Tem Dinh Độc Lập', 'Bạn đã ghé Dinh Độc Lập.', 'common'),
  ('pho-di-bo-nguyen-hue', 'Tem Phố đi bộ Nguyễn Huệ', 'Bạn đã ghé Phố đi bộ Nguyễn Huệ.', 'common')
) as v(slug, name, description, rarity)
join public.places pl on pl.slug = v.slug
on conflict (place_id) do nothing;

-- Mã QR DEMO (token cố định, dễ đoán). TRƯỚC KHI CHẠY THẬT: xoá và tạo token ngẫu nhiên, xem README.
insert into public.qr_codes (place_id, token)
select pl.id, v.token from (values
  ('thap-ba-ponagar', 'tripstamp-demo-thap-ba-ponagar'),
  ('nha-tho-nui', 'tripstamp-demo-nha-tho-nui'),
  ('cho-dam', 'tripstamp-demo-cho-dam'),
  ('vien-hai-duong-hoc', 'tripstamp-demo-vien-hai-duong-hoc'),
  ('hon-chong', 'tripstamp-demo-hon-chong'),
  ('bao-tang-yersin', 'tripstamp-demo-bao-tang-yersin'),
  ('thap-tram-huong', 'tripstamp-demo-thap-tram-huong'),
  ('bun-sua-bien-xanh', 'tripstamp-demo-bun-sua-bien-xanh'),
  ('nem-nuong-hem-nho', 'tripstamp-demo-nem-nuong-hem-nho'),
  ('banh-can-chieu-gio', 'tripstamp-demo-banh-can-chieu-gio'),
  ('ca-phe-muoi-gio-bien', 'tripstamp-demo-ca-phe-muoi-gio-bien'),
  ('ca-phe-vuon-chieu', 'tripstamp-demo-ca-phe-vuon-chieu'),
  ('xuong-gom-cat-trang', 'tripstamp-demo-xuong-gom-cat-trang'),
  ('tiem-qua-yen-hai-san', 'tripstamp-demo-tiem-qua-yen-hai-san'),
  ('tour-lan-ngam-san-ho', 'tripstamp-demo-tour-lan-ngam-san-ho'),
  ('ho-hoan-kiem', 'tripstamp-demo-ho-hoan-kiem'),
  ('van-mieu-quoc-tu-giam', 'tripstamp-demo-van-mieu-quoc-tu-giam'),
  ('nha-tho-lon-ha-noi', 'tripstamp-demo-nha-tho-lon-ha-noi'),
  ('cho-dong-xuan', 'tripstamp-demo-cho-dong-xuan'),
  ('hoang-thanh-thang-long', 'tripstamp-demo-hoang-thanh-thang-long'),
  ('dai-noi-hue', 'tripstamp-demo-dai-noi-hue'),
  ('chua-thien-mu', 'tripstamp-demo-chua-thien-mu'),
  ('cau-truong-tien', 'tripstamp-demo-cau-truong-tien'),
  ('cho-dong-ba', 'tripstamp-demo-cho-dong-ba'),
  ('lang-khai-dinh', 'tripstamp-demo-lang-khai-dinh'),
  ('cau-rong', 'tripstamp-demo-cau-rong'),
  ('bai-bien-my-khe', 'tripstamp-demo-bai-bien-my-khe'),
  ('cho-han', 'tripstamp-demo-cho-han'),
  ('bao-tang-cham-da-nang', 'tripstamp-demo-bao-tang-cham-da-nang'),
  ('chua-linh-ung-son-tra', 'tripstamp-demo-chua-linh-ung-son-tra'),
  ('ho-xuan-huong', 'tripstamp-demo-ho-xuan-huong'),
  ('ga-da-lat', 'tripstamp-demo-ga-da-lat'),
  ('cho-da-lat', 'tripstamp-demo-cho-da-lat'),
  ('nha-tho-con-ga', 'tripstamp-demo-nha-tho-con-ga'),
  ('quang-truong-lam-vien', 'tripstamp-demo-quang-truong-lam-vien'),
  ('nha-tho-duc-ba', 'tripstamp-demo-nha-tho-duc-ba'),
  ('buu-dien-trung-tam-sai-gon', 'tripstamp-demo-buu-dien-trung-tam-sai-gon'),
  ('cho-ben-thanh', 'tripstamp-demo-cho-ben-thanh'),
  ('dinh-doc-lap', 'tripstamp-demo-dinh-doc-lap'),
  ('pho-di-bo-nguyen-hue', 'tripstamp-demo-pho-di-bo-nguyen-hue')
) as v(slug, token)
join public.places pl on pl.slug = v.slug
on conflict (token) do nothing;

insert into public.rewards (partner_id, title, description, required_stamps, quantity)
select (select id from public.partners where name = v.partner limit 1), v.title, v.description, v.required_stamps, v.quantity
from (values
  ('Gió Biển (mẫu)', 'Giảm 10% một ly cà phê muối', 'Áp dụng tại Cà phê muối Gió Biển (mẫu).', 3, 100),
  ('Chiều Gió (mẫu)', 'Tặng một phần bánh căn', 'Tặng thêm một phần bánh căn khi gọi món chính.', 5, 50),
  ('Cát Trắng (mẫu)', 'Giảm 15% buổi workshop gốm', 'Áp dụng cho một người tại Xưởng gốm Cát Trắng (mẫu).', 8, 30)
) as v(partner, title, description, required_stamps, quantity)
where not exists (select 1 from public.rewards r where r.title = v.title);
