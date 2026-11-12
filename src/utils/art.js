/** Ảnh minh hoạ dự phòng khi địa điểm chưa có ảnh hoặc ảnh lỗi. */
export function categoryArt(categoryId) {
  return `/images/cat-${categoryId ?? 'experience'}.svg`
}

export function fallbackArt(cityId, categoryId) {
  // Nha Trang có bộ tranh biển theo danh mục; các thành phố khác dùng tranh của thành phố đó.
  if (!cityId || cityId === 'nha-trang') return categoryArt(categoryId)
  return `/images/city-${cityId}.svg`
}
