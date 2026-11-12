import { supabase, isDemo } from './supabase'
import { demoReviews, demoMyReview, demoSubmitReview, demoDeleteReview } from './demoStore'

/** Đánh giá công khai của một địa điểm (chỉ các đánh giá đang hiển thị). */
export async function fetchReviews(placeId) {
  if (isDemo) return demoReviews(placeId)
  const { data, error } = await supabase
    .from('public_reviews')
    .select('id, rating, comment, created_at, display_name')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    displayName: r.display_name,
  }))
}

/** Đánh giá của chính người dùng hiện tại (kể cả khi đã bị admin ẩn). */
export async function fetchMyReview(placeId, userId) {
  if (isDemo) return demoMyReview(placeId)
  if (!userId) return null
  const { data, error } = await supabase
    .from('reviews')
    .select('rating, comment')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? { rating: data.rating, comment: data.comment ?? '' } : null
}

/** Server kiểm tra: đã đăng nhập, đã check-in tại địa điểm, điểm 1–5, độ dài bình luận. */
export async function submitReview(placeId, rating, comment) {
  if (isDemo) return demoSubmitReview(placeId, rating, comment)
  const { data, error } = await supabase.rpc('submit_review', {
    p_place_id: placeId,
    p_rating: rating,
    p_comment: comment,
  })
  if (error) throw error
  return data
}

export async function deleteMyReview(placeId) {
  if (isDemo) return demoDeleteReview(placeId)
  const { data, error } = await supabase.rpc('delete_my_review', { p_place_id: placeId })
  if (error) throw error
  return data
}
