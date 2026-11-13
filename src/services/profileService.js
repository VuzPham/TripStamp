import { supabase, isDemo } from './supabase'

const DEMO_KEY = 'tripstamp-demo-profile'
const FIELDS = 'display_name, avatar_url, full_name, phone, bio, home_city, birthday'

const empty = { displayName: '', avatarUrl: '', fullName: '', phone: '', bio: '', homeCity: '', birthday: '' }

function fromRow(r) {
  return {
    displayName: r?.display_name ?? '',
    avatarUrl: r?.avatar_url ?? '',
    fullName: r?.full_name ?? '',
    phone: r?.phone ?? '',
    bio: r?.bio ?? '',
    homeCity: r?.home_city ?? '',
    birthday: r?.birthday ?? '',
  }
}

export async function fetchProfile(userId) {
  if (isDemo) {
    try {
      return { ...empty, ...JSON.parse(localStorage.getItem(DEMO_KEY) ?? '{}') }
    } catch {
      return { ...empty }
    }
  }
  const { data, error } = await supabase.from('profiles').select(FIELDS).eq('id', userId).maybeSingle()
  if (error) throw error
  return fromRow(data)
}

export async function saveProfile(userId, f) {
  if (isDemo) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(f))
    return
  }
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: f.displayName.trim() || null,
      avatar_url: f.avatarUrl || null,
      full_name: f.fullName.trim() || null,
      phone: f.phone.trim() || null,
      bio: f.bio.trim() || null,
      home_city: f.homeCity.trim() || null,
      birthday: f.birthday || null,
    })
    .eq('id', userId)
  if (error) throw error
}

async function squareAvatar(file, size = 400) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(size, side)
  canvas.getContext('2d').drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}

/** Cắt vuông, nén ≤400px rồi tải lên bucket avatars/{userId}/…; trả về URL công khai. */
export async function uploadAvatar(userId, file) {
  if (!file.type.startsWith('image/')) throw new Error('Tệp không phải hình ảnh.')
  const blob = await squareAvatar(file)
  if (isDemo) {
    return new Promise((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.readAsDataURL(blob)
    })
  }
  const path = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}
