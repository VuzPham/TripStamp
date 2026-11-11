-- File được sinh tự động bởi `npm run gen:seed`. Đừng sửa tay; hãy sửa src/data/seed.js.
-- Dữ liệu MẪU để thử nghiệm. Chạy sau supabase/schema.sql.

insert into public.categories (id, name, icon, color, sort_order) values
  ('food', 'Ẩm thực', '🍜', '#ea580c', 1),
  ('cafe', 'Cà phê', '☕', '#92400e', 2),
  ('art', 'Nghệ thuật', '🎨', '#7c3aed', 3),
  ('shopping', 'Mua sắm', '🛍️', '#db2777', 4),
  ('experience', 'Trải nghiệm', '🧭', '#0f766e', 5)
on conflict (id) do update set name = excluded.name, icon = excluded.icon, color = excluded.color, sort_order = excluded.sort_order;

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

insert into public.places (slug, name, description, category_id, partner_id, latitude, longitude, address, tags)
select v.slug, v.name, v.description, v.category_id, (select id from public.partners where name = v.partner limit 1), v.lat, v.lng, v.address, v.tags
from (values
  ('thap-ba-ponagar', 'Tháp Bà Ponagar', 'Quần thể đền tháp Chăm cổ trên đồi Cù Lao, nhìn ra cửa sông Cái.', 'experience', null, 12.2654::float8, 109.1954::float8, 'Số 2 Tháng 4, Nha Trang', array['văn hoá', 'lịch sử', 'Chăm']::text[]),
  ('nha-tho-nui', 'Nhà thờ Núi (Nhà thờ Đá)', 'Công trình kiến trúc Gothic bằng đá trên đồi cao giữa trung tâm thành phố.', 'art', null, 12.2488::float8, 109.1922::float8, 'Đường Thái Nguyên, Nha Trang', array['kiến trúc', 'chụp ảnh']::text[]),
  ('cho-dam', 'Chợ Đầm', 'Khu chợ lâu đời với đặc sản, hải sản khô và quà lưu niệm Nha Trang.', 'shopping', null, 12.2566::float8, 109.1912::float8, 'Khu Chợ Đầm, Nha Trang', array['đặc sản', 'chợ truyền thống']::text[]),
  ('vien-hai-duong-hoc', 'Viện Hải dương học', 'Bảo tàng sinh vật biển lâu đời nhất Việt Nam, bên cạnh bến Cầu Đá.', 'experience', null, 12.2056::float8, 109.2203::float8, '01 Cầu Đá, Nha Trang', array['biển', 'gia đình', 'khoa học']::text[]),
  ('hon-chong', 'Hòn Chồng', 'Cụm đá granite khổng lồ ven biển, điểm ngắm bình minh quen thuộc.', 'experience', null, 12.2707::float8, 109.2056::float8, 'Khu Hòn Chồng, Nha Trang', array['ngắm cảnh', 'bình minh']::text[]),
  ('bao-tang-yersin', 'Bảo tàng Yersin', 'Không gian lưu giữ dấu ấn của bác sĩ Alexandre Yersin tại Nha Trang.', 'art', null, 12.2397::float8, 109.1971::float8, '10 Trần Phú, Nha Trang', array['lịch sử', 'bảo tàng']::text[]),
  ('thap-tram-huong', 'Tháp Trầm Hương', 'Công trình biểu tượng hình búp sen bên bờ biển, nơi diễn ra nhiều sự kiện văn hoá.', 'art', null, 12.2386::float8, 109.197::float8, 'Đường Trần Phú, Nha Trang', array['biểu tượng', 'bãi biển']::text[]),
  ('bun-sua-bien-xanh', 'Bún sứa Biển Xanh (mẫu)', 'Quán bún sứa kiểu bản địa với nước dùng thanh, ăn sáng cực hợp.', 'food', 'Biển Xanh (mẫu)', 12.2441::float8, 109.1946::float8, 'Khu trung tâm, Nha Trang', array['ăn sáng', 'đặc sản']::text[]),
  ('nem-nuong-hem-nho', 'Nem nướng Hẻm Nhỏ (mẫu)', 'Nem nướng cuốn bánh tráng, nước chấm đậm đà kiểu Nha Trang.', 'food', 'Hẻm Nhỏ (mẫu)', 12.2465::float8, 109.1931::float8, 'Khu trung tâm, Nha Trang', array['đặc sản', 'ăn tối']::text[]),
  ('banh-can-chieu-gio', 'Bánh căn Chiều Gió (mẫu)', 'Bánh căn nóng hổi ăn kèm mắm nêm, chén nước chấm và rau sống.', 'food', 'Chiều Gió (mẫu)', 12.2519::float8, 109.1938::float8, 'Khu trung tâm, Nha Trang', array['ăn vặt', 'bản địa']::text[]),
  ('ca-phe-muoi-gio-bien', 'Cà phê muối Gió Biển (mẫu)', 'Cà phê muối mát lạnh, ngồi nhìn biển và nghe sóng.', 'cafe', 'Gió Biển (mẫu)', 12.2372::float8, 109.1962::float8, 'Đường Trần Phú, Nha Trang', array['view biển', 'check-in']::text[]),
  ('ca-phe-vuon-chieu', 'Cà phê Vườn Chiều (mẫu)', 'Quán cà phê sân vườn yên tĩnh, hợp làm việc hoặc đọc sách.', 'cafe', 'Vườn Chiều (mẫu)', 12.2431::float8, 109.1899::float8, 'Khu trung tâm, Nha Trang', array['yên tĩnh', 'làm việc']::text[]),
  ('xuong-gom-cat-trang', 'Xưởng gốm Cát Trắng (mẫu)', 'Tự tay nặn và vẽ gốm, mang sản phẩm của mình về làm kỷ niệm.', 'art', 'Cát Trắng (mẫu)', 12.2493::float8, 109.2001::float8, 'Khu trung tâm, Nha Trang', array['workshop', 'thủ công']::text[]),
  ('tiem-qua-yen-hai-san', 'Tiệm quà biển Nha Trang (mẫu)', 'Đặc sản khô, quà lưu niệm làm từ vỏ sò và vật liệu địa phương.', 'shopping', 'Quà biển (mẫu)', 12.2538::float8, 109.1925::float8, 'Khu trung tâm, Nha Trang', array['quà lưu niệm', 'đặc sản']::text[]),
  ('tour-lan-ngam-san-ho', 'Tour lặn ngắm san hô (mẫu)', 'Hành trình ra đảo, lặn ống thở ngắm san hô với hướng dẫn viên bản địa.', 'experience', 'Lặn biển (mẫu)', 12.2178::float8, 109.2142::float8, 'Bến Cầu Đá, Nha Trang', array['biển', 'phiêu lưu']::text[])
) as v(slug, name, description, category_id, partner, lat, lng, address, tags)
on conflict (slug) do nothing;

-- Địa điểm được ghim Hot (cần chạy supabase/reviews.sql trước)
update public.places set is_featured = true where slug in ('thap-ba-ponagar', 'cho-dam', 'ca-phe-muoi-gio-bien');

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
  ('tour-lan-ngam-san-ho', 'Tem Tour lặn ngắm san hô', 'Bạn đã ghé Tour lặn ngắm san hô.', 'epic')
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
  ('tour-lan-ngam-san-ho', 'tripstamp-demo-tour-lan-ngam-san-ho')
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
