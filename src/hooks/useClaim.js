import { useCallback, useState } from 'react'
import { claimStamp } from '@/services/stampService'
import { extractToken } from '@/utils/token'

/** Quản lý trạng thái một lần nhận stamp: idle → claiming → done | error. */
export function useClaim() {
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const claim = useCallback(async (raw) => {
    const token = extractToken(raw)
    if (!token) {
      setResult({ status: 'invalid' })
      setPhase('done')
      return
    }
    setPhase('claiming')
    setError('')
    try {
      setResult(await claimStamp(token))
      setPhase('done')
    } catch (e) {
      console.error(e)
      setError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.')
      setPhase('error')
    }
  }, [])

  const reset = useCallback(() => {
    setPhase('idle')
    setResult(null)
    setError('')
  }, [])

  return { phase, result, error, claim, reset }
}
