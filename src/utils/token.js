/**
 * QR có thể chứa token thuần hoặc một URL dạng https://.../claim?t=<token>.
 * Hàm này trả về token (hoặc chuỗi rỗng nếu không đọc được).
 */
export function extractToken(raw) {
  const text = String(raw ?? '').trim()
  if (!text) return ''
  try {
    const url = new URL(text)
    return (url.searchParams.get('t') ?? '').trim()
  } catch {
    return text
  }
}

export function buildClaimUrl(token) {
  return `${window.location.origin}/claim?t=${encodeURIComponent(token)}`
}
