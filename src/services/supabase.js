import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Chỉ dùng publishable (anon) key ở frontend. Tuyệt đối không đưa service_role key vào đây. */
export const supabase = url && key ? createClient(url, key) : null

/** Không có biến môi trường => chạy chế độ demo với dữ liệu mẫu cục bộ. */
export const isDemo = !supabase
