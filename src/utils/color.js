const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/** Trộn hai màu hex: t = 0 là màu a, t = 1 là màu b. */
export function mix(a, b, t) {
  const A = toRgb(a)
  const B = toRgb(b)
  return toHex(A.map((v, i) => v + (B[i] - v) * t))
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Tỉ lệ tương phản của màu này với chữ trắng (cần >= 4.5 để chữ trắng đọc rõ). */
export const contrastWithWhite = (hex) => 1.05 / (luminance(hex) + 0.05)

/** Chữ đặt trên nền accent: chọn tối hoặc trắng để đủ tương phản. */
export const onColor = (hex) => (luminance(hex) > 0.28 ? '#0b2236' : '#ffffff')

/** Sinh bộ biến màu của giao diện từ màu chủ đạo + màu nhấn của một thành phố. */
export function themeVars(primary, accent) {
  return {
    '--color-brand-50': mix(primary, '#ffffff', 0.94),
    '--color-brand-100': mix(primary, '#ffffff', 0.85),
    '--color-brand-500': mix(primary, '#ffffff', 0.4),
    '--color-brand-600': mix(primary, '#ffffff', 0.18),
    '--color-brand-700': primary,
    '--color-brand-800': mix(primary, '#000000', 0.25),
    '--color-paper': mix(primary, '#ffffff', 0.96),
    '--color-ink': mix(primary, '#000000', 0.6),
    '--color-stamp': accent,
    '--color-on-stamp': onColor(accent),
  }
}
