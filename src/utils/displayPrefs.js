import { useSyncExternalStore } from 'react'

const KEY = 'tripstamp-display'
export const defaultPrefs = { largeText: false, reduceMotion: false, theme: 'light' } // theme: light | dark | system

function read() {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { ...defaultPrefs }
  }
}

let prefs = read()
const listeners = new Set()
const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

/** Áp dụng lên <html> (CSS ở index.css). */
function apply() {
  const root = document.documentElement
  const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && media?.matches)
  root.dataset.theme = dark ? 'dark' : 'light'
  root.dataset.text = prefs.largeText ? 'large' : 'normal'
  root.dataset.motion = prefs.reduceMotion ? 'reduce' : 'normal'
}

export function readDisplayPrefs() {
  return prefs
}

export function applyDisplayPrefs() {
  apply()
}

export function setDisplayPrefs(patch) {
  prefs = { ...prefs, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch { /* bỏ qua */ }
  apply()
  listeners.forEach((l) => l())
}

media?.addEventListener?.('change', () => prefs.theme === 'system' && apply())

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** [prefs, setDisplayPrefs] — đồng bộ giữa menu tài khoản, footer… */
export function useDisplayPrefs() {
  return [useSyncExternalStore(subscribe, () => prefs, () => prefs), setDisplayPrefs]
}
