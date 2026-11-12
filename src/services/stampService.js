import { supabase, isDemo } from './supabase'
import { demoClaim, demoCollection } from './demoStore'

/**
 * Gửi token QR lên server để xác thực và cấp stamp.
 * Toàn bộ logic kiểm tra nằm trong hàm Postgres `claim_stamp` (supabase/schema.sql).
 * Trả về { status, stamp?, place?, total_stamps? }.
 */
export async function claimStamp(token) {
  if (isDemo) return demoClaim(token)
  const { data, error } = await supabase.rpc('claim_stamp', { p_token: token })
  if (error) throw error
  return data
}

/** Danh sách thẻ người dùng hiện tại đã sưu tầm. */
export async function fetchMyCollection() {
  if (isDemo) return demoCollection()
  const { data, error } = await supabase
    .from('user_stamps')
    .select('claimed_at, stamps(id, name, description, rarity, image_url, places(id, slug, name, category_id))')
    .order('claimed_at', { ascending: false })
  if (error) throw error
  return data
    .map((row) => {
      const s = Array.isArray(row.stamps) ? row.stamps[0] : row.stamps
      if (!s) return null
      const p = Array.isArray(s.places) ? s.places[0] : s.places
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        rarity: s.rarity,
        image: s.image_url,
        claimedAt: row.claimed_at,
        place: p ? { id: p.id, slug: p.slug, name: p.name, category: { id: p.category_id } } : null,
      }
    })
    .filter(Boolean)
}
