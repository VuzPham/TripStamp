import { useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import AuthGate from '@/components/AuthGate'
import ClaimResult from '@/components/StampCard/ClaimResult'
import { Notice, Spinner } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClaim } from '@/hooks/useClaim'

/**
 * Trang đích khi người dùng quét QR bằng camera điện thoại (QR chứa URL /claim?t=TOKEN).
 */
export default function Claim() {
  const [params] = useSearchParams()
  const token = params.get('t') ?? ''
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-extrabold text-brand-800">Nhận thẻ số</h1>
      {!token ? (
        <>
          <Notice tone="warn">Liên kết không có mã QR hợp lệ.</Notice>
          <Link to="/scan"><Button>Mở trình quét</Button></Link>
        </>
      ) : (
        <AuthGate reason="Đăng nhập để nhận thẻ. Sau khi đăng nhập, thẻ sẽ tự động được thêm vào bộ sưu tập.">
          <ClaimOnce token={token} />
        </AuthGate>
      )}
    </div>
  )
}

function ClaimOnce({ token }) {
  const { phase, result, error, claim, reset } = useClaim()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    claim(token)
  }, [token, claim])

  if (phase === 'done') return <ClaimResult result={result} onReset={undefined} />
  if (phase === 'error') {
    return (
      <div className="space-y-3">
        <Notice tone="error">{error}</Notice>
        <Button onClick={() => { reset(); started.current = false; claim(token) }}>Thử lại</Button>
      </div>
    )
  }
  return (
    <div className="grid place-items-center gap-3 py-20 text-gray-600">
      <Spinner className="size-8" />
      <p>Đang xác thực mã…</p>
    </div>
  )
}
