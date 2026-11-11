import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { Camera, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/card'

/**
 * Quét QR bằng camera sau. Gọi onResult(text) đúng một lần cho mỗi lần quét thành công,
 * sau đó tự tắt camera. Cần HTTPS (hoặc localhost) và quyền camera.
 */
export default function QRScanner({ onResult, paused = false }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const handledRef = useRef(false)
  const [state, setState] = useState('idle') // idle | starting | scanning | denied | nocamera | error
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (paused || attempt === 0) return undefined
    let cancelled = false
    handledRef.current = false
    setState('starting')

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error')
      return undefined
    }

    const reader = new BrowserQRCodeReader()
    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        (result) => {
          if (result && !handledRef.current) {
            handledRef.current = true
            controlsRef.current?.stop()
            onResult(result.getText())
          }
        },
      )
      .then((controls) => {
        if (cancelled) controls.stop()
        else {
          controlsRef.current = controls
          setState('scanning')
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') setState('denied')
        else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') setState('nocamera')
        else setState('error')
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [attempt, paused, onResult])

  const start = () => setAttempt((n) => n + 1)

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-black">
        <video ref={videoRef} className="size-full object-cover" muted playsInline />
        {state === 'scanning' && (
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
        )}
        {state !== 'scanning' && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
            {state === 'starting' ? (
              <p>Đang mở camera…</p>
            ) : (
              <div className="space-y-3">
                {state === 'denied' || state === 'nocamera' ? <CameraOff className="mx-auto size-10" /> : <Camera className="mx-auto size-10" />}
                <p className="text-sm text-white/80">Cho phép TripStamp dùng camera để quét mã QR tại điểm check-in.</p>
                <Button variant="accent" onClick={start}>
                  {state === 'idle' ? 'Bật camera' : 'Thử lại'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {state === 'denied' && (
        <Notice tone="warn">
          Bạn đã từ chối quyền camera. Hãy bật lại quyền camera cho trang này trong cài đặt trình duyệt, rồi nhấn
          “Thử lại”. Bạn vẫn có thể nhập mã thủ công bên dưới.
        </Notice>
      )}
      {state === 'nocamera' && <Notice tone="warn">Không tìm thấy camera trên thiết bị. Hãy nhập mã thủ công bên dưới.</Notice>}
      {state === 'error' && (
        <Notice tone="error">
          Không mở được camera. Camera chỉ hoạt động trên kết nối HTTPS (hoặc localhost) và trình duyệt hỗ trợ.
        </Notice>
      )}
    </div>
  )
}
