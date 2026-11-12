// Kho dữ liệu cục bộ cho CHẾ ĐỘ DEMO (khi chưa cấu hình Supabase).
// Chỉ phục vụ trình diễn giao diện – KHÔNG an toàn và không dùng khi chạy thật.
import { places, cities, areas, categories, rewards, demoToken, stampName } from '@/data/seed'

const KEY = 'tripstamp-demo-v1'

const defaults = () => ({ stamps: {}, redemptions: {}, reviews: {} })

function read() {
  try {
    return { ...defaults(), ...(JSON.parse(localStorage.getItem(KEY)) ?? {}) }
  } catch {
    return defaults()
  }
}
function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* bỏ qua nếu storage bị chặn */
  }
}

const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

export const demoPlaces = places.map((p, i) => ({
  id: `demo-place-${i + 1}`,
  slug: p.slug,
  name: p.name,
  description: p.description,
  category: catById[p.category],
  lat: p.lat,
  lng: p.lng,
  address: p.address,
  image: p.image ?? null,
  tags: p.tags,
  partnerName: p.partner ?? null,
  featured: Boolean(p.featured),
  cityId: p.city,
  areaId: p.area,
  imageCredit: p.imageCredit ?? null,
  imageSource: p.imageSource ?? null,
  stamp: {
    id: `demo-stamp-${i + 1}`,
    name: stampName(p),
    description: `Bạn đã ghé ${p.name.replace(/\s*\(mẫu\)/, '')}.`,
    rarity: p.rarity,
  },
}))

export const demoCategories = categories

export const demoAreas = areas.map((a) => ({ id: a.id, cityId: a.city, name: a.name }))

export const demoCities = cities.map((c) => ({
  id: c.id, name: c.name, province: c.province, tagline: c.tagline, slogan: c.slogan, lat: c.lat, lng: c.lng, zoom: c.zoom,
  primary: c.color_primary, accent: c.color_accent, heroImage: c.hero_image,
}))

export const demoRewards = rewards.map((r, i) => ({
  id: `demo-reward-${i + 1}`,
  title: r.title,
  description: r.description,
  requiredStamps: r.required_stamps,
  partnerName: r.partner,
  remaining: r.quantity,
  expiresAt: null,
}))

export const demoUser = { id: 'demo-user', email: 'demo@tripstamp.local', displayName: 'Khách demo' }

export function demoClaim(token) {
  const place = demoPlaces.find((p) => demoToken(p.slug) === token)
  if (!place) return { status: 'invalid' }
  const state = read()
  const payload = {
    stamp: place.stamp,
    place: { id: place.id, slug: place.slug, name: place.name, category_id: place.category.id },
  }
  if (state.stamps[place.stamp.id]) return { status: 'already_claimed', ...payload }
  state.stamps[place.stamp.id] = new Date().toISOString()
  write(state)
  return { status: 'ok', total_stamps: Object.keys(state.stamps).length, ...payload }
}

export function demoCollection() {
  const state = read()
  return demoPlaces
    .filter((p) => state.stamps[p.stamp.id])
    .map((p) => ({ ...p.stamp, claimedAt: state.stamps[p.stamp.id], place: p }))
    .sort((a, b) => b.claimedAt.localeCompare(a.claimedAt))
}

export function demoRedemptions() {
  return read().redemptions
}

export function demoRedeem(rewardId) {
  const reward = demoRewards.find((r) => r.id === rewardId)
  if (!reward) return { status: 'not_found' }
  const state = read()
  if (state.redemptions[rewardId]) return { status: 'already_redeemed', code: state.redemptions[rewardId] }
  const have = Object.keys(state.stamps).length
  if (have < reward.requiredStamps) return { status: 'not_enough_stamps', have, need: reward.requiredStamps }
  const code = 'TS-' + Math.random().toString(16).slice(2, 10).toUpperCase()
  state.redemptions[rewardId] = code
  write(state)
  return { status: 'ok', code }
}

export function demoReset() {
  write(defaults())
}

/* ---------- Đánh giá (demo) ---------- */
/** Địa điểm kèm thống kê đánh giá / trạng thái Hot (demo: Hot = địa điểm được ghim). */
export function demoPlacesWithStats() {
  const { reviews } = read()
  return demoPlaces.map((p) => {
    const r = reviews[p.id]
    return {
      ...p,
      rating: r ? r.rating : null,
      reviewCount: r ? 1 : 0,
      positiveCount: r && r.rating >= 4 ? 1 : 0,
      stampCount: 0,
      hotScore: p.featured ? 10 : 0,
      isHot: p.featured,
    }
  })
}

export function demoReviews(placeId) {
  const r = read().reviews[placeId]
  return r ? [{ id: `${placeId}-me`, rating: r.rating, comment: r.comment, createdAt: r.createdAt, displayName: demoUser.displayName }] : []
}

export function demoMyReview(placeId) {
  const r = read().reviews[placeId]
  return r ? { rating: r.rating, comment: r.comment ?? '' } : null
}

export function demoSubmitReview(placeId, rating, comment) {
  const place = demoPlaces.find((p) => p.id === placeId)
  if (!place) return { status: 'not_found' }
  if (!(rating >= 1 && rating <= 5)) return { status: 'invalid_rating' }
  const text = (comment ?? '').trim()
  if (text.length > 1000) return { status: 'too_long' }
  const state = read()
  if (!state.stamps[place.stamp.id]) return { status: 'not_checked_in' }
  state.reviews[placeId] = { rating, comment: text || null, createdAt: new Date().toISOString() }
  write(state)
  return { status: 'ok' }
}

export function demoDeleteReview(placeId) {
  const state = read()
  delete state.reviews[placeId]
  write(state)
  return { status: 'ok' }
}
