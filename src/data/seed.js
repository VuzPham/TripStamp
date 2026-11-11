// Nguồn dữ liệu mẫu DUY NHẤT cho TripStamp.
// - Chế độ demo (không có Supabase) đọc trực tiếp file này.
// - `npm run gen:seed` sinh ra supabase/seed.sql từ file này, để hai nơi luôn khớp nhau.
//
// LƯU Ý: các địa điểm có hậu tố "(mẫu)" là đối tác GIẢ LẬP dùng để thử nghiệm.
// Tọa độ chỉ mang tính tương đối – hãy thay bằng đối tác thật khi triển khai.

export const categories = [
  { id: 'food', name: 'Ẩm thực', icon: '🍜', color: '#ea580c', sort_order: 1 },
  { id: 'cafe', name: 'Cà phê', icon: '☕', color: '#92400e', sort_order: 2 },
  { id: 'art', name: 'Nghệ thuật', icon: '🎨', color: '#7c3aed', sort_order: 3 },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: '#db2777', sort_order: 4 },
  { id: 'experience', name: 'Trải nghiệm', icon: '🧭', color: '#0f766e', sort_order: 5 },
]

// partner: tên đối tác (chỉ các địa điểm mẫu có đối tác)
export const places = [
  {
    slug: 'thap-ba-ponagar', featured: true, name: 'Tháp Bà Ponagar', category: 'experience',
    lat: 12.2654, lng: 109.1954, address: 'Số 2 Tháng 4, Nha Trang',
    description: 'Quần thể đền tháp Chăm cổ trên đồi Cù Lao, nhìn ra cửa sông Cái.',
    tags: ['văn hoá', 'lịch sử', 'Chăm'], rarity: 'rare',
  },
  {
    slug: 'nha-tho-nui', name: 'Nhà thờ Núi (Nhà thờ Đá)', category: 'art',
    lat: 12.2488, lng: 109.1922, address: 'Đường Thái Nguyên, Nha Trang',
    description: 'Công trình kiến trúc Gothic bằng đá trên đồi cao giữa trung tâm thành phố.',
    tags: ['kiến trúc', 'chụp ảnh'], rarity: 'common',
  },
  {
    slug: 'cho-dam', featured: true, name: 'Chợ Đầm', category: 'shopping',
    lat: 12.2566, lng: 109.1912, address: 'Khu Chợ Đầm, Nha Trang',
    description: 'Khu chợ lâu đời với đặc sản, hải sản khô và quà lưu niệm Nha Trang.',
    tags: ['đặc sản', 'chợ truyền thống'], rarity: 'common',
  },
  {
    slug: 'vien-hai-duong-hoc', name: 'Viện Hải dương học', category: 'experience',
    lat: 12.2056, lng: 109.2203, address: '01 Cầu Đá, Nha Trang',
    description: 'Bảo tàng sinh vật biển lâu đời nhất Việt Nam, bên cạnh bến Cầu Đá.',
    tags: ['biển', 'gia đình', 'khoa học'], rarity: 'common',
  },
  {
    slug: 'hon-chong', name: 'Hòn Chồng', category: 'experience',
    lat: 12.2707, lng: 109.2056, address: 'Khu Hòn Chồng, Nha Trang',
    description: 'Cụm đá granite khổng lồ ven biển, điểm ngắm bình minh quen thuộc.',
    tags: ['ngắm cảnh', 'bình minh'], rarity: 'common',
  },
  {
    slug: 'bao-tang-yersin', name: 'Bảo tàng Yersin', category: 'art',
    lat: 12.2397, lng: 109.1971, address: '10 Trần Phú, Nha Trang',
    description: 'Không gian lưu giữ dấu ấn của bác sĩ Alexandre Yersin tại Nha Trang.',
    tags: ['lịch sử', 'bảo tàng'], rarity: 'rare',
  },
  {
    slug: 'thap-tram-huong', name: 'Tháp Trầm Hương', category: 'art',
    lat: 12.2386, lng: 109.1970, address: 'Đường Trần Phú, Nha Trang',
    description: 'Công trình biểu tượng hình búp sen bên bờ biển, nơi diễn ra nhiều sự kiện văn hoá.',
    tags: ['biểu tượng', 'bãi biển'], rarity: 'common',
  },
  {
    slug: 'bun-sua-bien-xanh', name: 'Bún sứa Biển Xanh (mẫu)', category: 'food',
    lat: 12.2441, lng: 109.1946, address: 'Khu trung tâm, Nha Trang',
    description: 'Quán bún sứa kiểu bản địa với nước dùng thanh, ăn sáng cực hợp.',
    tags: ['ăn sáng', 'đặc sản'], rarity: 'common', partner: 'Biển Xanh (mẫu)',
  },
  {
    slug: 'nem-nuong-hem-nho', name: 'Nem nướng Hẻm Nhỏ (mẫu)', category: 'food',
    lat: 12.2465, lng: 109.1931, address: 'Khu trung tâm, Nha Trang',
    description: 'Nem nướng cuốn bánh tráng, nước chấm đậm đà kiểu Nha Trang.',
    tags: ['đặc sản', 'ăn tối'], rarity: 'common', partner: 'Hẻm Nhỏ (mẫu)',
  },
  {
    slug: 'banh-can-chieu-gio', name: 'Bánh căn Chiều Gió (mẫu)', category: 'food',
    lat: 12.2519, lng: 109.1938, address: 'Khu trung tâm, Nha Trang',
    description: 'Bánh căn nóng hổi ăn kèm mắm nêm, chén nước chấm và rau sống.',
    tags: ['ăn vặt', 'bản địa'], rarity: 'common', partner: 'Chiều Gió (mẫu)',
  },
  {
    slug: 'ca-phe-muoi-gio-bien', featured: true, name: 'Cà phê muối Gió Biển (mẫu)', category: 'cafe',
    lat: 12.2372, lng: 109.1962, address: 'Đường Trần Phú, Nha Trang',
    description: 'Cà phê muối mát lạnh, ngồi nhìn biển và nghe sóng.',
    tags: ['view biển', 'check-in'], rarity: 'common', partner: 'Gió Biển (mẫu)',
  },
  {
    slug: 'ca-phe-vuon-chieu', name: 'Cà phê Vườn Chiều (mẫu)', category: 'cafe',
    lat: 12.2431, lng: 109.1899, address: 'Khu trung tâm, Nha Trang',
    description: 'Quán cà phê sân vườn yên tĩnh, hợp làm việc hoặc đọc sách.',
    tags: ['yên tĩnh', 'làm việc'], rarity: 'common', partner: 'Vườn Chiều (mẫu)',
  },
  {
    slug: 'xuong-gom-cat-trang', name: 'Xưởng gốm Cát Trắng (mẫu)', category: 'art',
    lat: 12.2493, lng: 109.2001, address: 'Khu trung tâm, Nha Trang',
    description: 'Tự tay nặn và vẽ gốm, mang sản phẩm của mình về làm kỷ niệm.',
    tags: ['workshop', 'thủ công'], rarity: 'rare', partner: 'Cát Trắng (mẫu)',
  },
  {
    slug: 'tiem-qua-yen-hai-san', name: 'Tiệm quà biển Nha Trang (mẫu)', category: 'shopping',
    lat: 12.2538, lng: 109.1925, address: 'Khu trung tâm, Nha Trang',
    description: 'Đặc sản khô, quà lưu niệm làm từ vỏ sò và vật liệu địa phương.',
    tags: ['quà lưu niệm', 'đặc sản'], rarity: 'common', partner: 'Quà biển (mẫu)',
  },
  {
    slug: 'tour-lan-ngam-san-ho', name: 'Tour lặn ngắm san hô (mẫu)', category: 'experience',
    lat: 12.2178, lng: 109.2142, address: 'Bến Cầu Đá, Nha Trang',
    description: 'Hành trình ra đảo, lặn ống thở ngắm san hô với hướng dẫn viên bản địa.',
    tags: ['biển', 'phiêu lưu'], rarity: 'epic', partner: 'Lặn biển (mẫu)',
  },
]

export const rewards = [
  { title: 'Giảm 10% một ly cà phê muối', description: 'Áp dụng tại Cà phê muối Gió Biển (mẫu).', required_stamps: 3, partner: 'Gió Biển (mẫu)', quantity: 100 },
  { title: 'Tặng một phần bánh căn', description: 'Tặng thêm một phần bánh căn khi gọi món chính.', required_stamps: 5, partner: 'Chiều Gió (mẫu)', quantity: 50 },
  { title: 'Giảm 15% buổi workshop gốm', description: 'Áp dụng cho một người tại Xưởng gốm Cát Trắng (mẫu).', required_stamps: 8, partner: 'Cát Trắng (mẫu)', quantity: 30 },
]

// Token QR dùng cho DEMO. Trước khi chạy thật hãy thay bằng token ngẫu nhiên (xem README).
export const demoToken = (slug) => `tripstamp-demo-${slug}`

export const stampName = (place) => `Tem ${place.name.replace(/\s*\(mẫu\)/, '')}`
