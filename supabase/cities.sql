-- =====================================================================
-- TripStamp – Nhiều tỉnh thành. Chạy SAU schema.sql, admin.sql, reviews.sql, media.sql và TRƯỚC seed.sql.
-- Có thể chạy lại nhiều lần.
-- =====================================================================

create table if not exists public.cities (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  province text,
  tagline text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  zoom int not null default 13 check (zoom between 5 and 18),
  color_primary text not null default '#0f6b66' check (color_primary ~ '^#[0-9a-fA-F]{6}$'),
  color_accent text not null default '#ff6b4a' check (color_accent ~ '^#[0-9a-fA-F]{6}$'),
  hero_image text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;
revoke all on public.cities from anon, authenticated;
grant select on public.cities to anon, authenticated;

drop policy if exists "cities_read_active" on public.cities;
create policy "cities_read_active" on public.cities for select using (is_active);

grant insert, update, delete on public.cities to authenticated;
drop policy if exists "admin_all" on public.cities;
create policy "admin_all" on public.cities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Dữ liệu cũ (chỉ có Nha Trang) được gán vào thành phố nha-trang.
insert into public.cities (id, name, province, latitude, longitude, zoom, sort_order)
values ('nha-trang', 'Nha Trang', 'Khánh Hòa', 12.2388, 109.1967, 13, 1)
on conflict (id) do nothing;

alter table public.places add column if not exists city_id text references public.cities (id);
update public.places set city_id = 'nha-trang' where city_id is null;
alter table public.places alter column city_id set not null;
create index if not exists places_city_idx on public.places (city_id);

-- ---------- Slogan + Khu vực (quận/huyện) trong mỗi thành phố ----------
alter table public.cities add column if not exists slogan text;

create table if not exists public.areas (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  city_id text not null references public.cities (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists areas_city_idx on public.areas (city_id);

alter table public.areas enable row level security;
revoke all on public.areas from anon, authenticated;
grant select on public.areas to anon, authenticated;
drop policy if exists "areas_read_active" on public.areas;
create policy "areas_read_active" on public.areas for select using (is_active);
grant insert, update, delete on public.areas to authenticated;
drop policy if exists "admin_all" on public.areas;
create policy "admin_all" on public.areas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.places add column if not exists area_id text references public.areas (id) on delete set null;
create index if not exists places_area_idx on public.places (area_id);
