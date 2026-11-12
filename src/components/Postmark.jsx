/** Dấu bưu điện Nha Trang kèm vạch huỷ tem. Màu theo currentColor. */
export default function Postmark({ date = new Date(), className, waves = true, label = 'Nha Trang' }) {
  const name = label.toUpperCase()
  const ring = `${name} • TRIPSTAMP • ${name} • TRIPSTAMP • `.slice(0, 44)
  const d = new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const [dd, mm, yyyy] = d.split('/')
  return (
    <svg
      viewBox={waves ? '0 0 430 200' : '0 0 200 200'}
      className={className}
      role="img"
      aria-label={`Dấu bưu điện ${label}, ${d}`}
      fill="none"
      stroke="currentColor"
    >
      <defs>
        <path id="pm-arc" d="M 100 100 m -72 0 a 72 72 0 1 1 144 0 a 72 72 0 1 1 -144 0" />
      </defs>
      <circle cx="100" cy="100" r="93" strokeWidth="4" />
      <circle cx="100" cy="100" r="58" strokeWidth="2.5" />
      <text fontSize="15" fontWeight="800" letterSpacing="2" fill="currentColor" stroke="none" fontFamily="Be Vietnam Pro, sans-serif">
        <textPath href="#pm-arc" textLength="440" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <g fill="currentColor" stroke="none" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800">
        <text x="100" y="97" fontSize="26">{dd}.{mm}</text>
        <text x="100" y="124" fontSize="20">{yyyy}</text>
      </g>
      {waves &&
        [60, 85, 110, 135].map((y) => (
          <path key={y} d={`M 205 ${y} q 18 -14 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0`} strokeWidth="5" strokeLinecap="round" />
        ))}
    </svg>
  )
}
