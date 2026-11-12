// Sinh supabase/seed.sql từ src/data/seed.js
import { writeFileSync } from 'node:fs'
import { categories, cities, areas, places, rewards, demoToken, stampName } from '../src/data/seed.js'

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`
const out = []

out.push('-- File được sinh tự động bởi `npm run gen:seed`. Đừng sửa tay; hãy sửa src/data/seed.js.')
out.push('-- Dữ liệu MẪU để thử nghiệm. Chạy sau supabase/schema.sql.\n')

out.push('insert into public.categories (id, name, icon, color, sort_order) values')
out.push(categories.map((c) => `  (${q(c.id)}, ${q(c.name)}, ${q(c.icon)}, ${q(c.color)}, ${c.sort_order})`).join(',\n'))
out.push('on conflict (id) do update set name = excluded.name, icon = excluded.icon, color = excluded.color, sort_order = excluded.sort_order;\n')

out.push('insert into public.cities (id, name, province, tagline, slogan, latitude, longitude, zoom, color_primary, color_accent, hero_image, sort_order) values')
out.push(cities.map((c) => `  (${q(c.id)}, ${q(c.name)}, ${q(c.province)}, ${q(c.tagline)}, ${q(c.slogan)}, ${c.lat}, ${c.lng}, ${c.zoom}, ${q(c.color_primary)}, ${q(c.color_accent)}, ${q(c.hero_image)}, ${c.sort_order})`).join(',\n'))
out.push('on conflict (id) do update set name = excluded.name, province = excluded.province, tagline = excluded.tagline, slogan = excluded.slogan, latitude = excluded.latitude, longitude = excluded.longitude, zoom = excluded.zoom, color_primary = excluded.color_primary, color_accent = excluded.color_accent, hero_image = excluded.hero_image, sort_order = excluded.sort_order\nwhere public.cities.tagline is null; -- chỉ điền hàng thành phố còn trống; không ghi đè ảnh/màu bạn đã chỉnh trong admin\n')

out.push('insert into public.areas (id, city_id, name, sort_order) values')
out.push(areas.map((a) => `  (${q(a.id)}, ${q(a.city)}, ${q(a.name)}, ${a.sort_order})`).join(',\n'))
out.push('on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;\n')

const partners = [...new Set(places.map((p) => p.partner).filter(Boolean))]
out.push('insert into public.partners (name, status)')
out.push('select v.name, \'active\' from (values')
out.push(partners.map((n) => `  (${q(n)})`).join(',\n'))
out.push(') as v(name)')
out.push('where not exists (select 1 from public.partners p where p.name = v.name);\n')

out.push('insert into public.places (slug, name, description, category_id, partner_id, latitude, longitude, address, tags, city_id, area_id)')
out.push('select v.slug, v.name, v.description, v.category_id, (select id from public.partners where name = v.partner limit 1), v.lat, v.lng, v.address, v.tags, v.city_id, v.area_id')
out.push('from (values')
out.push(
  places
    .map(
      (p) =>
        `  (${q(p.slug)}, ${q(p.name)}, ${q(p.description)}, ${q(p.category)}, ${q(p.partner ?? null)}, ${p.lat}::float8, ${p.lng}::float8, ${q(p.address)}, ${arr(p.tags)}, ${q(p.city)}, ${q(p.area)})`,
    )
    .join(',\n'),
)
out.push(') as v(slug, name, description, category_id, partner, lat, lng, address, tags, city_id, area_id)')
out.push('on conflict (slug) do update set city_id = excluded.city_id, area_id = excluded.area_id;\n')

out.push('-- Ảnh địa điểm (cần chạy supabase/media.sql trước). Địa điểm không có ảnh sẽ dùng ảnh minh hoạ theo danh mục.')
for (const p of places.filter((x) => x.image)) {
  out.push(`update public.places set image_url = ${q(p.image)}, image_credit = ${q(p.imageCredit)}, image_source_url = ${q(p.imageSource)} where slug = ${q(p.slug)};`)
}
out.push('')

out.push('-- Địa điểm được ghim Hot (cần chạy supabase/reviews.sql trước)')
out.push(`update public.places set is_featured = true where slug in (${places.filter((p) => p.featured).map((p) => q(p.slug)).join(', ')});\n`)

out.push('insert into public.stamps (place_id, name, description, rarity)')
out.push('select pl.id, v.name, v.description, v.rarity from (values')
out.push(
  places
    .map((p) => `  (${q(p.slug)}, ${q(stampName(p))}, ${q(`Bạn đã ghé ${p.name.replace(/\s*\(mẫu\)/, '')}.`)}, ${q(p.rarity)})`)
    .join(',\n'),
)
out.push(') as v(slug, name, description, rarity)')
out.push('join public.places pl on pl.slug = v.slug')
out.push('on conflict (place_id) do nothing;\n')

out.push('-- Mã QR DEMO (token cố định, dễ đoán). TRƯỚC KHI CHẠY THẬT: xoá và tạo token ngẫu nhiên, xem README.')
out.push('insert into public.qr_codes (place_id, token)')
out.push('select pl.id, v.token from (values')
out.push(places.map((p) => `  (${q(p.slug)}, ${q(demoToken(p.slug))})`).join(',\n'))
out.push(') as v(slug, token)')
out.push('join public.places pl on pl.slug = v.slug')
out.push('on conflict (token) do nothing;\n')

out.push('insert into public.rewards (partner_id, title, description, required_stamps, quantity)')
out.push('select (select id from public.partners where name = v.partner limit 1), v.title, v.description, v.required_stamps, v.quantity')
out.push('from (values')
out.push(rewards.map((r) => `  (${q(r.partner)}, ${q(r.title)}, ${q(r.description)}, ${r.required_stamps}, ${r.quantity})`).join(',\n'))
out.push(') as v(partner, title, description, required_stamps, quantity)')
out.push('where not exists (select 1 from public.rewards r where r.title = v.title);\n')

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n'))
console.log('Đã ghi supabase/seed.sql')
