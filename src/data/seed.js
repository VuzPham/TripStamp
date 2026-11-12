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
const nhaTrangPlaces = [
  {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_115.jpg?width=900',
    imageCredit: 'Ảnh: Wikimedia Commons (giấy phép mở, xem trang nguồn)',
    imageSource: 'https://commons.wikimedia.org/wiki/File:04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_115.jpg',
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

// Thành phố / tỉnh. Màu chủ đạo (primary) phải đủ tối để chữ trắng đọc rõ.
export const cities = [
  { id: 'nha-trang', slogan: 'Explore beautiful destinations and collect unforgettable memories.', name: 'Nha Trang', province: 'Khánh Hòa', tagline: 'Biển xanh, hoàng hôn và những quán ăn bản địa.', lat: 12.2388, lng: 109.1967, zoom: 13, color_primary: '#0f6b66', color_accent: '#ff6b4a', hero_image: '/images/hero.svg', sort_order: 1 },
  { id: 'ha-noi', slogan: 'Wander old streets and lakeside paths, and collect the flavours that stay with you.', name: 'Hà Nội', province: 'Hà Nội', tagline: 'Phố cổ, mặt hồ và ly cà phê trứng buổi sáng.', lat: 21.0285, lng: 105.8412, zoom: 14, color_primary: '#8a2b2b', color_accent: '#f2b134', hero_image: '/images/city-ha-noi.svg', sort_order: 2 },
  { id: 'hue', slogan: 'Slow down in the old capital beside the Perfume River.', name: 'Huế', province: 'Thừa Thiên Huế', tagline: 'Cố đô trầm mặc bên dòng sông Hương.', lat: 16.4637, lng: 107.5909, zoom: 13, color_primary: '#5b3a82', color_accent: '#e9b44c', hero_image: '/images/city-hue.svg', sort_order: 3 },
  { id: 'da-nang', slogan: 'Cross the bridges, walk the long beaches and stamp the best of the city.', name: 'Đà Nẵng', province: 'Đà Nẵng', tagline: 'Thành phố của những cây cầu và bãi biển dài.', lat: 16.0678, lng: 108.2208, zoom: 13, color_primary: '#0e6ba8', color_accent: '#ff8a3d', hero_image: '/images/city-da-nang.svg', sort_order: 4 },
  { id: 'da-lat', slogan: 'Chase misty mornings and pine forests, and collect cool-weather memories.', name: 'Đà Lạt', province: 'Lâm Đồng', tagline: 'Sương sớm, rừng thông và những góc phố se lạnh.', lat: 11.9404, lng: 108.4583, zoom: 14, color_primary: '#2a6b45', color_accent: '#ec6b9a', hero_image: '/images/city-da-lat.svg', sort_order: 5 },
  { id: 'ho-chi-minh', slogan: 'From historic landmarks to lively streets, stamp your way through Saigon.', name: 'Hồ Chí Minh', province: 'TP. Hồ Chí Minh', tagline: 'Sài Gòn sôi động, từ kiến trúc cổ đến phố đi bộ.', lat: 10.7769, lng: 106.7009, zoom: 15, color_primary: '#b4410a', color_accent: '#1aa3b5', hero_image: '/images/city-ho-chi-minh.svg', sort_order: 6 },
]

// Khu vực (quận/huyện) trong từng thành phố. Địa điểm gán vào khu vực qua areaOf bên dưới.
export const areas = [
  { id: 'nha-trang-trung-tam', city: 'nha-trang', name: 'Trung tâm & Trần Phú', sort_order: 1 },
  { id: 'nha-trang-bac', city: 'nha-trang', name: 'Bắc Nha Trang', sort_order: 2 },
  { id: 'nha-trang-nam', city: 'nha-trang', name: 'Cầu Đá & phía Nam', sort_order: 3 },
  { id: 'ha-noi-hoan-kiem', city: 'ha-noi', name: 'Hoàn Kiếm', sort_order: 1 },
  { id: 'ha-noi-ba-dinh', city: 'ha-noi', name: 'Ba Đình', sort_order: 2 },
  { id: 'ha-noi-dong-da', city: 'ha-noi', name: 'Đống Đa', sort_order: 3 },
  { id: 'hue-trung-tam', city: 'hue', name: 'Kinh thành & trung tâm', sort_order: 1 },
  { id: 'hue-ngoai-thanh', city: 'hue', name: 'Ngoại thành', sort_order: 2 },
  { id: 'da-nang-hai-chau', city: 'da-nang', name: 'Hải Châu', sort_order: 1 },
  { id: 'da-nang-son-tra', city: 'da-nang', name: 'Sơn Trà', sort_order: 2 },
  { id: 'da-lat-trung-tam', city: 'da-lat', name: 'Quanh hồ Xuân Hương', sort_order: 1 },
  { id: 'da-lat-phia-dong', city: 'da-lat', name: 'Phía đông', sort_order: 2 },
  { id: 'ho-chi-minh-quan-1', city: 'ho-chi-minh', name: 'Quận 1', sort_order: 1 },
]

const areaOf = {
  'thap-ba-ponagar': 'nha-trang-bac', 'hon-chong': 'nha-trang-bac',
  'vien-hai-duong-hoc': 'nha-trang-nam', 'tour-lan-ngam-san-ho': 'nha-trang-nam',
  'ho-hoan-kiem': 'ha-noi-hoan-kiem', 'nha-tho-lon-ha-noi': 'ha-noi-hoan-kiem', 'cho-dong-xuan': 'ha-noi-hoan-kiem',
  'hoang-thanh-thang-long': 'ha-noi-ba-dinh', 'van-mieu-quoc-tu-giam': 'ha-noi-dong-da',
  'dai-noi-hue': 'hue-trung-tam', 'cho-dong-ba': 'hue-trung-tam', 'cau-truong-tien': 'hue-trung-tam',
  'chua-thien-mu': 'hue-ngoai-thanh', 'lang-khai-dinh': 'hue-ngoai-thanh',
  'cau-rong': 'da-nang-hai-chau', 'cho-han': 'da-nang-hai-chau', 'bao-tang-cham-da-nang': 'da-nang-hai-chau',
  'bai-bien-my-khe': 'da-nang-son-tra', 'chua-linh-ung-son-tra': 'da-nang-son-tra',
  'ho-xuan-huong': 'da-lat-trung-tam', 'cho-da-lat': 'da-lat-trung-tam', 'nha-tho-con-ga': 'da-lat-trung-tam', 'quang-truong-lam-vien': 'da-lat-trung-tam',
  'ga-da-lat': 'da-lat-phia-dong',
}
const defaultAreaOfCity = { 'nha-trang': 'nha-trang-trung-tam', 'ho-chi-minh': 'ho-chi-minh-quan-1' }

// Các thành phố khác: chỉ dùng landmark có thật. Tọa độ xấp xỉ, hãy kiểm tra lại trước khi dùng thật.
const otherPlaces = [
  // Hà Nội
  { city: 'ha-noi', slug: 'ho-hoan-kiem', name: 'Hồ Hoàn Kiếm', category: 'experience', lat: 21.0285, lng: 105.8522, address: 'Phường Hoàn Kiếm, Hà Nội', description: 'Mặt hồ giữa lòng thủ đô với Tháp Rùa và cầu Thê Húc.', tags: ['dạo bộ', 'biểu tượng'], rarity: 'common', featured: true },
  { city: 'ha-noi', slug: 'van-mieu-quoc-tu-giam', name: 'Văn Miếu – Quốc Tử Giám', category: 'art', lat: 21.0293, lng: 105.8355, address: '58 Quốc Tử Giám, Hà Nội', description: 'Quần thể di tích gắn với trường đại học đầu tiên của Việt Nam, lập năm 1076.', tags: ['lịch sử', 'kiến trúc'], rarity: 'rare' },
  { city: 'ha-noi', slug: 'nha-tho-lon-ha-noi', name: 'Nhà thờ Lớn Hà Nội', category: 'art', lat: 21.0287, lng: 105.8489, address: '40 Nhà Chung, Hà Nội', description: 'Nhà thờ kiến trúc Gothic xây cuối thế kỷ 19 ở khu phố cổ.', tags: ['kiến trúc', 'chụp ảnh'], rarity: 'common' },
  { city: 'ha-noi', slug: 'cho-dong-xuan', name: 'Chợ Đồng Xuân', category: 'shopping', lat: 21.0382, lng: 105.8497, address: 'Phường Đồng Xuân, Hà Nội', description: 'Khu chợ đầu mối lâu đời của phố cổ, đủ loại hàng hoá và đồ ăn vặt.', tags: ['chợ truyền thống', 'phố cổ'], rarity: 'common' },
  { city: 'ha-noi', slug: 'hoang-thanh-thang-long', name: 'Hoàng thành Thăng Long', category: 'experience', lat: 21.0345, lng: 105.8402, address: '19C Hoàng Diệu, Hà Nội', description: 'Di sản thế giới UNESCO, trung tâm quyền lực qua nhiều triều đại.', tags: ['di sản', 'lịch sử'], rarity: 'rare' },
  // Huế
  { city: 'hue', slug: 'dai-noi-hue', name: 'Đại Nội Huế', category: 'experience', lat: 16.4698, lng: 107.5786, address: 'Phú Hậu, Huế', description: 'Kinh thành triều Nguyễn, di sản thế giới bên bờ sông Hương.', tags: ['di sản', 'cung đình'], rarity: 'epic', featured: true },
  { city: 'hue', slug: 'chua-thien-mu', name: 'Chùa Thiên Mụ', category: 'art', lat: 16.4538, lng: 107.5445, address: 'Kim Long, Huế', description: 'Ngôi chùa cổ bên sông Hương với tháp Phước Duyên bảy tầng.', tags: ['chùa', 'sông Hương'], rarity: 'rare' },
  { city: 'hue', slug: 'cau-truong-tien', name: 'Cầu Trường Tiền', category: 'experience', lat: 16.4693, lng: 107.5887, address: 'Sông Hương, Huế', description: 'Cây cầu thép biểu tượng của Huế, lên đèn rất đẹp về đêm.', tags: ['biểu tượng', 'ngắm cảnh'], rarity: 'common' },
  { city: 'hue', slug: 'cho-dong-ba', name: 'Chợ Đông Ba', category: 'shopping', lat: 16.4727, lng: 107.5878, address: 'Đường Trần Hưng Đạo, Huế', description: 'Chợ lớn nhất Huế, nơi mua đặc sản, đồ thủ công và ăn vặt xứ Huế.', tags: ['đặc sản', 'chợ'], rarity: 'common' },
  { city: 'hue', slug: 'lang-khai-dinh', name: 'Lăng Khải Định', category: 'art', lat: 16.3986, lng: 107.5887, address: 'Thủy Bằng, Huế', description: 'Lăng tẩm pha trộn kiến trúc Đông – Tây với nội thất khảm sành sứ.', tags: ['kiến trúc', 'lăng tẩm'], rarity: 'rare' },
  // Đà Nẵng
  { city: 'da-nang', slug: 'cau-rong', name: 'Cầu Rồng', category: 'experience', lat: 16.0611, lng: 108.2278, address: 'Sông Hàn, Đà Nẵng', description: 'Cây cầu hình rồng bắc qua sông Hàn, phun lửa và nước vào cuối tuần.', tags: ['biểu tượng', 'ban đêm'], rarity: 'rare', featured: true },
  { city: 'da-nang', slug: 'bai-bien-my-khe', name: 'Bãi biển Mỹ Khê', category: 'experience', lat: 16.0544, lng: 108.2480, address: 'Phường Phước Mỹ, Đà Nẵng', description: 'Bãi biển cát trắng dài, nước trong, hợp tắm biển và ngắm bình minh.', tags: ['biển', 'bình minh'], rarity: 'common' },
  { city: 'da-nang', slug: 'cho-han', name: 'Chợ Hàn', category: 'shopping', lat: 16.0689, lng: 108.2237, address: '119 Trần Phú, Đà Nẵng', description: 'Chợ trung tâm gần sông Hàn, nhiều đặc sản và hải sản khô.', tags: ['đặc sản', 'chợ'], rarity: 'common' },
  { city: 'da-nang', slug: 'bao-tang-cham-da-nang', name: 'Bảo tàng Điêu khắc Chăm', category: 'art', lat: 16.0602, lng: 108.2236, address: '02 Đường 2 Tháng 9, Đà Nẵng', description: 'Nơi lưu giữ bộ sưu tập điêu khắc Chăm lớn nhất thế giới.', tags: ['bảo tàng', 'Chăm'], rarity: 'rare' },
  { city: 'da-nang', slug: 'chua-linh-ung-son-tra', name: 'Chùa Linh Ứng Sơn Trà', category: 'art', lat: 16.1002, lng: 108.2778, address: 'Bán đảo Sơn Trà, Đà Nẵng', description: 'Ngôi chùa trên bán đảo Sơn Trà với tượng Quan Âm cao nhìn ra biển.', tags: ['chùa', 'ngắm biển'], rarity: 'common' },
  // Đà Lạt
  { city: 'da-lat', slug: 'ho-xuan-huong', name: 'Hồ Xuân Hương', category: 'experience', lat: 11.9437, lng: 108.4419, address: 'Trung tâm Đà Lạt', description: 'Hồ nước hình vầng trăng khuyết giữa lòng thành phố, hợp dạo bộ và đạp vịt.', tags: ['dạo bộ', 'hồ'], rarity: 'common', featured: true },
  { city: 'da-lat', slug: 'ga-da-lat', name: 'Ga Đà Lạt', category: 'art', lat: 11.9420, lng: 108.4550, address: '1 Quang Trung, Đà Lạt', description: 'Nhà ga cổ kiến trúc độc đáo, nơi có chuyến tàu du lịch chạy Trại Mát.', tags: ['kiến trúc', 'tàu hoả'], rarity: 'rare' },
  { city: 'da-lat', slug: 'cho-da-lat', name: 'Chợ Đà Lạt', category: 'shopping', lat: 11.9430, lng: 108.4376, address: 'Khu Hòa Bình, Đà Lạt', description: 'Chợ trung tâm với rau củ, mứt, hoa tươi và đồ len.', tags: ['đặc sản', 'chợ'], rarity: 'common' },
  { city: 'da-lat', slug: 'nha-tho-con-ga', name: 'Nhà thờ Con Gà', category: 'art', lat: 11.9395, lng: 108.4363, address: '15 Trần Phú, Đà Lạt', description: 'Nhà thờ Chánh Tòa với con gà trên đỉnh tháp chuông.', tags: ['kiến trúc', 'chụp ảnh'], rarity: 'common' },
  { city: 'da-lat', slug: 'quang-truong-lam-vien', name: 'Quảng trường Lâm Viên', category: 'experience', lat: 11.9451, lng: 108.4430, address: 'Bên hồ Xuân Hương, Đà Lạt', description: 'Quảng trường với công trình hoa dã quỳ và bông hoa khổng lồ bên hồ.', tags: ['check-in', 'hoa'], rarity: 'common' },
  // TP. Hồ Chí Minh
  { city: 'ho-chi-minh', slug: 'nha-tho-duc-ba', name: 'Nhà thờ Đức Bà Sài Gòn', category: 'art', lat: 10.7798, lng: 106.6990, address: '01 Công xã Paris, Quận 1', description: 'Nhà thờ gạch đỏ hai tháp chuông giữa trung tâm Sài Gòn.', tags: ['kiến trúc', 'biểu tượng'], rarity: 'rare', featured: true },
  { city: 'ho-chi-minh', slug: 'buu-dien-trung-tam-sai-gon', name: 'Bưu điện Trung tâm Sài Gòn', category: 'art', lat: 10.7799, lng: 106.6999, address: '02 Công xã Paris, Quận 1', description: 'Toà nhà kiến trúc Pháp còn hoạt động, nơi gửi tem và bưu thiếp.', tags: ['kiến trúc', 'bưu thiếp'], rarity: 'rare' },
  { city: 'ho-chi-minh', slug: 'cho-ben-thanh', name: 'Chợ Bến Thành', category: 'shopping', lat: 10.7725, lng: 106.6980, address: 'Đường Lê Lợi, Quận 1', description: 'Khu chợ biểu tượng với đặc sản, quà lưu niệm và ẩm thực đường phố.', tags: ['đặc sản', 'ẩm thực'], rarity: 'common' },
  { city: 'ho-chi-minh', slug: 'dinh-doc-lap', name: 'Dinh Độc Lập', category: 'experience', lat: 10.7770, lng: 106.6955, address: '135 Nam Kỳ Khởi Nghĩa, Quận 1', description: 'Di tích lịch sử gắn với thời khắc 30/4/1975, có hầm chỉ huy và phòng khánh tiết.', tags: ['lịch sử', 'di tích'], rarity: 'common' },
  { city: 'ho-chi-minh', slug: 'pho-di-bo-nguyen-hue', name: 'Phố đi bộ Nguyễn Huệ', category: 'experience', lat: 10.7745, lng: 106.7040, address: 'Đường Nguyễn Huệ, Quận 1', description: 'Phố đi bộ rộng dẫn ra bờ sông Sài Gòn, nơi diễn ra nhiều sự kiện.', tags: ['dạo phố', 'sự kiện'], rarity: 'common' },
]

export const places = [...nhaTrangPlaces.map((p) => ({ city: 'nha-trang', ...p })), ...otherPlaces].map((p) => ({
  ...p,
  area: areaOf[p.slug] ?? defaultAreaOfCity[p.city] ?? null,
}))

export const rewards = [
  { title: 'Giảm 10% một ly cà phê muối', description: 'Áp dụng tại Cà phê muối Gió Biển (mẫu).', required_stamps: 3, partner: 'Gió Biển (mẫu)', quantity: 100 },
  { title: 'Tặng một phần bánh căn', description: 'Tặng thêm một phần bánh căn khi gọi món chính.', required_stamps: 5, partner: 'Chiều Gió (mẫu)', quantity: 50 },
  { title: 'Giảm 15% buổi workshop gốm', description: 'Áp dụng cho một người tại Xưởng gốm Cát Trắng (mẫu).', required_stamps: 8, partner: 'Cát Trắng (mẫu)', quantity: 30 },
]

// Token QR dùng cho DEMO. Trước khi chạy thật hãy thay bằng token ngẫu nhiên (xem README).
export const demoToken = (slug) => `tripstamp-demo-${slug}`

export const stampName = (place) => `Tem ${place.name.replace(/\s*\(mẫu\)/, '')}`
