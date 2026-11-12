import { useCallback, useState } from 'react'
import { Keyboard } from 'lucide-react'
import AuthGate from '@/components/AuthGate'
import QRScanner from '@/components/QRScanner/QRScanner'
import ClaimResult from '@/components/StampCard/ClaimResult'
import { Button } from '@/components/ui/button'
import { Notice, Spinner } from '@/components/ui/card'
import { useClaim } from '@/hooks/useClaim'

export default function Scan() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-800">Quét mã QR</h1>
        <p className="text-sm text-gray-600">Quét mã tại điểm check-in để nhận thẻ số vào bộ sưu tập.</p>
      </div>
      <AuthGate reason="Đăng nhập để thẻ số được lưu vào tài khoản của bạn.">
        <ScanInner />
      </AuthGate>
    </div>
  )
}

function ScanInner() {
  const { phase, result, error, claim, reset } = useClaim()
  const [manual, setManual] = useState('')
  const onResult = useCallback((text) => claim(text), [claim])

  if (phase === 'claiming') {
    return (
      <div className="grid place-items-center gap-3 py-20 text-gray-600">
        <Spinner className="size-8" />
        <p>Đang xác thực mã…</p>
      </div>
    )
  }
  if (phase === 'done') return <ClaimResult result={result} onReset={reset} />

  return (
    <div className="space-y-4">
      {phase === 'error' && <Notice tone="error">{error}</Notice>}
      <QRScanner onResult={onResult} />
      <form
        className="space-y-2 rounded-2xl border border-black/5 bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (manual.trim()) claim(manual)
        }}
      >
        <label htmlFor="manual-code" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Keyboard className="size-4" /> Nhập mã thủ công
        </label>
        <div className="flex gap-2">
          <input
            id="manual-code"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Dán mã hoặc liên kết từ QR"
            className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 px-3 outline-none focus:border-brand-600"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <Button type="submit" variant="outline">
            Gửi
          </Button>
        </div>
      </form>
    </div>
  )
}
