import { supabase, isDemo } from './supabase'
import { demoRewards, demoRedeem, demoRedemptions } from './demoStore'

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? null

/** Danh sách ưu đãi đang mở, kèm mã đã đổi (nếu người dùng đã đổi). */
export async function fetchRewards() {
  if (isDemo) {
    const mine = demoRedemptions()
    return demoRewards.map((r) => ({ ...r, redeemedCode: mine[r.id] ?? null }))
  }
  const { data: rewards, error } = await supabase
    .from('rewards')
    .select('id, title, description, required_stamps, quantity, redeemed_count, expires_at, partners(name)')
    .order('required_stamps')
  if (error) throw error

  const { data: { session } } = await supabase.auth.getSession()
  let codes = {}
  if (session) {
    const { data: mine, error: e2 } = await supabase.from('redemptions').select('reward_id, code')
    if (e2) throw e2
    codes = Object.fromEntries(mine.map((m) => [m.reward_id, m.code]))
  }

  return rewards.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    requiredStamps: r.required_stamps,
    partnerName: one(r.partners)?.name ?? null,
    remaining: r.quantity == null ? null : Math.max(r.quantity - r.redeemed_count, 0),
    expiresAt: r.expires_at,
    redeemedCode: codes[r.id] ?? null,
  }))
}

/** Yêu cầu server cấp ưu đãi; server tự kiểm tra số thẻ, số lượng, hạn dùng. */
export async function redeemReward(rewardId) {
  if (isDemo) return demoRedeem(rewardId)
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId })
  if (error) throw error
  return data
}
