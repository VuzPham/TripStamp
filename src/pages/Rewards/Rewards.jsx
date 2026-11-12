import { useState } from 'react'
import { Gift, Lock, Ticket } from 'lucide-react'
import AuthGate from '@/components/AuthGate'
import { Button } from '@/components/ui/button'
import { Card, Notice, Spinner } from '@/components/ui/card'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/contexts/AuthContext'
import { fetchMyCollection } from '@/services/stampService'
import { fetchRewards, redeemReward } from '@/services/rewardService'

export default function Rewards() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-800">Ưu đãi từ đối tác</h1>
        <p className="text-sm text-gray-600">Sưu tầm đủ số thẻ để đổi ưu đãi. Đưa mã cho nhân viên tại cửa hàng để sử dụng.</p>
      </div>
      <AuthGate reason="Đăng nhập để đổi ưu đãi bằng thẻ đã sưu tầm.">
        <RewardsInner />
      </AuthGate>
    </div>
  )
}

const failMessages = {
  not_enough_stamps: 'Bạn chưa đủ số thẻ để đổi ưu đãi này.',
  sold_out: 'Ưu đãi này đã hết lượt.',
  expired: 'Ưu đãi này đã hết hạn.',
  not_found: 'Ưu đãi không còn khả dụng.',
  unauthenticated: 'Bạn cần đăng nhập để đổi ưu đãi.',
}

function RewardsInner() {
  const { user } = useAuth()
  const stamps = useAsync(fetchMyCollection, [user?.id])
  const rewards = useAsync(fetchRewards, [user?.id])
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)

  const have = stamps.data?.length ?? 0

  async function redeem(r) {
    setBusyId(r.id)
    setMessage(null)
    try {
      const res = await redeemReward(r.id)
      if (res.status === 'ok' || res.status === 'already_redeemed') {
        setMessage({ tone: 'success', text: `Mã ưu đãi của bạn: ${res.code}` })
        rewards.reload()
      } else {
        setMessage({ tone: 'warn', text: failMessages[res.status] ?? 'Không thể đổi ưu đãi lúc này.' })
      }
    } catch (e) {
      console.error(e)
      setMessage({ tone: 'error', text: 'Không kết nối được máy chủ. Vui lòng thử lại.' })
    } finally {
      setBusyId(null)
    }
  }

  if (rewards.loading || stamps.loading) return <div className="grid place-items-center py-16"><Spinner /></div>
  if (rewards.error) return <Notice tone="error">Không tải được danh sách ưu đãi.</Notice>

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-brand-800">Bạn đang có {have} thẻ</p>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <div className="grid gap-3 md:grid-cols-2">
        {rewards.data.map((r) => {
          const enough = have >= r.requiredStamps
          const soldOut = r.remaining === 0 && !r.redeemedCode
          return (
            <Card key={r.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-stamp">
                  <Gift className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold leading-snug">{r.title}</h3>
                  {r.partnerName && <p className="text-xs text-gray-500">{r.partnerName}</p>}
                  <p className="mt-1 text-sm text-gray-600">{r.description}</p>
                </div>
              </div>
              <div className="mt-auto space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, (have / r.requiredStamps) * 100)}%` }} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-600">{Math.min(have, r.requiredStamps)}/{r.requiredStamps} thẻ</span>
                  {r.redeemedCode ? (
                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 font-mono text-sm font-bold text-emerald-800">
                      <Ticket className="size-4" /> {r.redeemedCode}
                    </span>
                  ) : (
                    <Button size="sm" variant={enough ? 'accent' : 'outline'} disabled={!enough || soldOut || busyId === r.id} onClick={() => redeem(r)}>
                      {!enough && <Lock className="size-3.5" />}
                      {soldOut ? 'Hết lượt' : busyId === r.id ? 'Đang đổi…' : enough ? 'Đổi ưu đãi' : 'Chưa đủ thẻ'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
