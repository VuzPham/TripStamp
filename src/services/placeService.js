import { supabase, isDemo } from './supabase'
import { demoPlacesWithStats, demoCategories, demoCities, demoAreas } from './demoStore'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null

function normalizePlace(row, catById, stats) {
  const stamp = one(row.stamps)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    cityId: row.city_id ?? 'nha-trang',
    areaId: row.area_id ?? null,
    category: catById[row.category_id] ?? null,
    lat: row.latitude,
    lng: row.longitude,
    address: row.address,
    image: row.image_url,
    imageCredit: row.image_credit ?? null,
    imageSource: row.image_source_url ?? null,
    tags: row.tags ?? [],
    partnerName: one(row.partners)?.name ?? null,
    rating: stats?.avg_rating != null ? Number(stats.avg_rating) : null,
    reviewCount: stats?.review_count ?? 0,
    positiveCount: stats?.positive_count ?? 0,
    stampCount: stats?.stamp_count ?? 0,
    hotScore: stats?.hot_score ?? 0,
    isHot: Boolean(stats?.is_hot ?? row.is_featured),
    featured: Boolean(row.is_featured),
    stamp: stamp
      ? { id: stamp.id, name: stamp.name, description: stamp.description, rarity: stamp.rarity, image: stamp.image_url }
      : null,
  }
}

/** Thành phố mặc định khi chưa tải được danh sách (hoặc chưa chạy supabase/cities.sql). */
export const fallbackCities = [demoCities[0]]

export async function fetchCities() {
  if (isDemo) return demoCities
  const { data, error } = await supabase.from('cities').select('*').eq('is_active', true).order('sort_order')
  if (error || !data?.length) return fallbackCities
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    province: c.province,
    tagline: c.tagline,
    slogan: c.slogan,
    lat: c.latitude,
    lng: c.longitude,
    zoom: c.zoom,
    primary: c.color_primary,
    accent: c.color_accent,
    heroImage: c.hero_image,
  }))
}

/** Khu vực (quận/huyện) của các thành phố. Chưa chạy cities.sql thì trả về rỗng. */
export async function fetchAreas() {
  if (isDemo) return demoAreas
  const { data, error } = await supabase.from('areas').select('*').eq('is_active', true).order('sort_order')
  if (error) return []
  return data.map((a) => ({ id: a.id, cityId: a.city_id, name: a.name }))
}

export async function fetchCategories() {
  if (isDemo) return demoCategories
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return data
}

export async function fetchPlaces() {
  if (isDemo) return demoPlacesWithStats()
  const [categories, { data, error }, statsRes] = await Promise.all([
    fetchCategories(),
    supabase
      .from('places')
      .select('*, partners(name), stamps(id, name, description, rarity, image_url)')
      .eq('status', 'active')
      .order('name'),
    supabase.from('place_stats').select('*'),
  ])
  if (error) throw error
  // Nếu chưa chạy reviews.sql thì vẫn hiển thị địa điểm bình thường (không có đánh giá).
  const statsById = Object.fromEntries((statsRes.data ?? []).map((s) => [s.place_id, s]))
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))
  return data.map((row) => normalizePlace(row, catById, statsById[row.id]))
}
