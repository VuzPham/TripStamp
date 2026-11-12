import { supabase } from '@/services/supabase'

// Mọi thao tác ở đây chỉ thành công nếu tài khoản có role = 'admin' (RLS/RPC ở supabase/admin.sql).
const ok = ({ data, error }) => {
  if (error) throw error
  return data
}

export const adminStats = async () => ok(await supabase.rpc('admin_stats'))

/* ---------- Ảnh ---------- */
async function resizeImage(file, maxSize = 1200) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
}

/** Nén ảnh về tối đa 1200px rồi tải lên bucket place-images; trả về URL công khai. */
export async function uploadPlaceImage(file, { folder = '', maxSize = 1200 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Tệp không phải hình ảnh.')
  const blob = await resizeImage(file, maxSize)
  const path = `${folder}${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage
    .from('place-images')
    .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('place-images').getPublicUrl(path).data.publicUrl
}

/* ---------- Địa điểm + thẻ ---------- */
export async function adminListPlaces() {
  return ok(
    await supabase
      .from('places')
      .select('*, stamps(id, name, description, rarity), partners(name)')
      .order('name'),
  )
}

export async function savePlace(f) {
  const row = {
    slug: f.slug,
    name: f.name,
    description: f.description || null,
    category_id: f.category_id || null,
    partner_id: f.partner_id || null,
    latitude: Number(f.latitude),
    longitude: Number(f.longitude),
    address: f.address || null,
    image_url: f.image_url || null,
    image_credit: f.image_credit || null,
    image_source_url: f.image_source_url || null,
    tags: f.tags,
    city_id: f.city_id,
    area_id: f.area_id || null,
    status: f.status,
    is_featured: Boolean(f.is_featured),
  }
  let id = f.id
  if (id) ok(await supabase.from('places').update(row).eq('id', id))
  else id = ok(await supabase.from('places').insert(row).select('id').single()).id

  ok(
    await supabase.from('stamps').upsert(
      { place_id: id, name: f.stampName, description: f.stampDescription || null, rarity: f.rarity },
      { onConflict: 'place_id' },
    ),
  )
  return id
}

export async function deletePlace(id) {
  ok(await supabase.from('places').delete().eq('id', id))
}

/* ---------- Thành phố ---------- */
export async function adminListCities() {
  return ok(await supabase.from('cities').select('*').order('sort_order'))
}

export async function saveCity(f, isNew) {
  const row = {
    name: f.name,
    province: f.province || null,
    tagline: f.tagline || null,
    slogan: f.slogan || null,
    latitude: Number(f.latitude),
    longitude: Number(f.longitude),
    zoom: Number(f.zoom),
    color_primary: f.color_primary,
    color_accent: f.color_accent,
    hero_image: f.hero_image || null,
    sort_order: Number(f.sort_order) || 0,
    is_active: Boolean(f.is_active),
  }
  if (isNew) ok(await supabase.from('cities').insert({ id: f.id, ...row }))
  else ok(await supabase.from('cities').update(row).eq('id', f.id))
}

export async function deleteCity(id) {
  ok(await supabase.from('cities').delete().eq('id', id))
}

/* ---------- Khu vực (quận/huyện) ---------- */
export async function adminListAreas() {
  return ok(await supabase.from('areas').select('*').order('city_id').order('sort_order'))
}

export async function saveArea(f, isNew) {
  const row = { city_id: f.city_id, name: f.name, sort_order: Number(f.sort_order) || 0, is_active: Boolean(f.is_active) }
  if (isNew) ok(await supabase.from('areas').insert({ id: f.id, ...row }))
  else ok(await supabase.from('areas').update(row).eq('id', f.id))
}

export async function deleteArea(id) {
  ok(await supabase.from('areas').delete().eq('id', id))
}

/* ---------- Đánh giá (kiểm duyệt) ---------- */
export const adminListReviews = async () => ok(await supabase.rpc('admin_list_reviews'))

export async function setReviewStatus(id, status) {
  ok(await supabase.from('reviews').update({ status }).eq('id', id))
}

export async function deleteReview(id) {
  ok(await supabase.from('reviews').delete().eq('id', id))
}

/* ---------- Đối tác ---------- */
export const adminListPartners = async () => ok(await supabase.rpc('admin_list_partners'))

export async function savePartner(f) {
  const row = {
    name: f.name,
    contact_name: f.contact_name || null,
    contact_phone: f.contact_phone || null,
    contact_email: f.contact_email || null,
    status: f.status,
  }
  if (f.id) ok(await supabase.from('partners').update(row).eq('id', f.id))
  else ok(await supabase.from('partners').insert(row))
}

export async function deletePartner(id) {
  ok(await supabase.from('partners').delete().eq('id', id))
}

/* ---------- Mã QR ---------- */
export async function adminListQr() {
  return ok(await supabase.from('qr_codes').select('*, places(name, slug)').order('created_at', { ascending: false }))
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createQr({ place_id, expires_at, max_total_claims }) {
  const row = {
    place_id,
    token: randomToken(), // 128-bit ngẫu nhiên, không đoán được
    expires_at: expires_at || null,
    max_total_claims: max_total_claims ? Number(max_total_claims) : null,
  }
  ok(await supabase.from('qr_codes').insert(row))
}

export async function setQrActive(id, is_active) {
  ok(await supabase.from('qr_codes').update({ is_active }).eq('id', id))
}

export async function deleteQr(id) {
  ok(await supabase.from('qr_codes').delete().eq('id', id))
}

/* ---------- Ưu đãi ---------- */
export async function adminListRewards() {
  return ok(await supabase.from('rewards').select('*, partners(name)').order('created_at', { ascending: false }))
}

export async function saveReward(f) {
  const row = {
    title: f.title,
    description: f.description || null,
    partner_id: f.partner_id || null,
    required_stamps: Number(f.required_stamps),
    quantity: f.quantity === '' || f.quantity == null ? null : Number(f.quantity),
    expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null,
    is_active: f.is_active,
  }
  if (f.id) ok(await supabase.from('rewards').update(row).eq('id', f.id))
  else ok(await supabase.from('rewards').insert(row))
}

export async function deleteReward(id) {
  ok(await supabase.from('rewards').delete().eq('id', id))
}

/* ---------- Đổi thưởng ---------- */
export const adminListRedemptions = async (code = null) =>
  ok(await supabase.rpc('admin_list_redemptions', { p_code: code }))

export const adminMarkRedeemed = async (code) => ok(await supabase.rpc('admin_mark_redeemed', { p_code: code }))
