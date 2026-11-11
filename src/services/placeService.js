import { supabase, isDemo } from './supabase'
import { demoPlacesWithStats, demoCategories } from './demoStore'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null

function normalizePlace(row, catById, stats) {
  const stamp = one(row.stamps)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: catById[row.category_id] ?? null,
    lat: row.latitude,
    lng: row.longitude,
    address: row.address,
    image: row.image_url,
    tags: row.tags ?? [],
    partnerName: one(row.partners)?.name ?? null,
    rating: stats?.avg_rating != null ? Number(stats.avg_rating) : null,
    reviewCount: stats?.review_count ?? 0,
    positiveCount: stats?.positive_count ?? 0,
    stampCount: stats?.stamp_count ?? 0,
    hotScore: stats?.hot_score ?? 0,
    isHot: Boolean(stats?.is_hot ?? row.is_featured),
    stamp: stamp
      ? { id: stamp.id, name: stamp.name, description: stamp.description, rarity: stamp.rarity, image: stamp.image_url }
      : null,
  }
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
