import { toPng } from 'html-to-image'

/** Xuất một phần tử DOM thành PNG và tải về. */
export async function downloadNodeAsPng(node, filename = 'tripstamp.png') {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: '#fdf8ee' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
