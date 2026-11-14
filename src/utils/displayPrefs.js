const KEY = 'tripstamp-display'
export const defaultPrefs = { largeText: false, reduceMotion: false }

export function readDisplayPrefs() {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { ...defaultPrefs }
  }
}

/** Áp dụng lên <html> (CSS ở index.css) và lưu lại trên thiết bị. */
export function applyDisplayPrefs(prefs, { save = false } = {}) {
  const root = document.documentElement
  root.dataset.text = prefs.largeText ? 'large' : 'normal'
  root.dataset.motion = prefs.reduceMotion ? 'reduce' : 'normal'
  if (save) {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs))
    } catch { /* bỏ qua */ }
  }
}
