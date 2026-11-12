-- =====================================================================
-- TripStamp – schema, RLS và hàm nghiệp vụ phía server (Supabase/PostgreSQL)
-- Chạy toàn bộ file này trong Supabase → SQL Editor (có thể chạy lại nhiều lần).
-- Sau đó chạy supabase/seed.sql để có dữ liệu mẫu.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Bảng ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text,
  color text,
  sort_order int not null default 0
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text not null default 'pending' check (status in ('pending', 'active', 'paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id text references public.categories (id),
  partner_id uuid references public.partners (id) on delete set null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text,
  image_url text,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists places_category_idx on public.places (category_id);

create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null unique references public.places (id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic')),
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  token text not null unique check (length(token) between 8 and 200),
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  max_total_claims int check (max_total_claims is null or max_total_claims > 0),
  claim_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stamp_id uuid not null references public.stamps (id) on delete cascade,
  qr_code_id uuid references public.qr_codes (id) on delete set null,
  claimed_at timestamptz not null default now(),
  unique (user_id, stamp_id) -- mỗi người chỉ nhận mỗi thẻ một lần
);
create index if not exists user_stamps_user_idx on public.user_stamps (user_id);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete set null,
  title text not null,
  description text,
  required_stamps int not null default 1 check (required_stamps > 0),
  quantity int check (quantity is null or quantity >= 0), -- null = không giới hạn
  redeemed_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reward_id uuid not null references public.rewards (id) on delete cascade,
  code text not null unique,
  status text not null default 'issued' check (status in ('issued', 'used', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

-- Nhật ký lần quét, dùng để giới hạn tần suất / chống dò token.
create table if not exists public.claim_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists claim_attempts_user_time_idx on public.claim_attempts (user_id, created_at desc);

-- ---------- Tự tạo profile khi đăng ký ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.partners enable row level security;
alter table public.places enable row level security;
alter table public.stamps enable row level security;
alter table public.qr_codes enable row level security;
alter table public.user_stamps enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.claim_attempts enable row level security;

-- Bắt đầu từ "không ai có quyền gì", rồi cấp lại đúng những gì cần.
revoke all on all tables in schema public from anon, authenticated;

-- Dữ liệu công khai (chỉ đọc)
grant select on public.categories, public.places, public.stamps, public.rewards to anon, authenticated;
-- partners: chỉ lộ tên & logo, KHÔNG lộ thông tin liên hệ
grant select (id, name, logo_url, status) on public.partners to anon, authenticated;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select using (true);

drop policy if exists "places_read_active" on public.places;
create policy "places_read_active" on public.places for select using (status = 'active');

drop policy if exists "stamps_read" on public.stamps;
create policy "stamps_read" on public.stamps for select
  using (exists (select 1 from public.places p where p.id = place_id and p.status = 'active'));

drop policy if exists "partners_read_active" on public.partners;
create policy "partners_read_active" on public.partners for select using (status = 'active');

drop policy if exists "rewards_read_active" on public.rewards;
create policy "rewards_read_active" on public.rewards for select
  using (is_active and (expires_at is null or expires_at > now()));

-- Dữ liệu cá nhân: chỉ đọc của chính mình. KHÔNG có quyền insert/update/delete
-- trên user_stamps / redemptions – chỉ hàm claim_stamp / redeem_reward bên dưới mới ghi được.
grant select on public.user_stamps, public.redemptions to authenticated;

drop policy if exists "user_stamps_read_own" on public.user_stamps;
create policy "user_stamps_read_own" on public.user_stamps for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "redemptions_read_own" on public.redemptions;
create policy "redemptions_read_own" on public.redemptions for select to authenticated
  using (user_id = auth.uid());

-- Profile: đọc/sửa hồ sơ của mình, chỉ được sửa display_name và avatar_url
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- qr_codes và claim_attempts: không có policy và không có grant => client không đọc/ghi được.

-- ---------- Hàm nghiệp vụ: nhận stamp ----------
-- Trả về jsonb { status, stamp?, place?, total_stamps? }
-- status: ok | already_claimed | invalid | inactive | expired | limit_reached | rate_limited | unauthenticated
create or replace function public.claim_stamp(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_token text := btrim(coalesce(p_token, ''));
  v_qr public.qr_codes;
  v_place public.places;
  v_stamp public.stamps;
  v_failed int;
  v_inserted uuid;
  v_total int;
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthenticated');
  end if;

  -- Chống dò token: tối đa 10 lần thất bại / 5 phút
  select count(*) into v_failed
  from public.claim_attempts
  where user_id = v_uid and success = false and created_at > now() - interval '5 minutes';
  if v_failed >= 10 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  if length(v_token) < 8 or length(v_token) > 200 then
    insert into public.claim_attempts (user_id, success) values (v_uid, false);
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into v_qr from public.qr_codes where token = v_token for update;
  if not found then
    insert into public.claim_attempts (user_id, success) values (v_uid, false);
    return jsonb_build_object('status', 'invalid');
  end if;

  if not v_qr.is_active then
    return jsonb_build_object('status', 'inactive');
  end if;
  if (v_qr.starts_at is not null and now() < v_qr.starts_at)
     or (v_qr.expires_at is not null and now() > v_qr.expires_at) then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_place from public.places where id = v_qr.place_id and status = 'active';
  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into v_stamp from public.stamps where place_id = v_place.id;
  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  if exists (select 1 from public.user_stamps where user_id = v_uid and stamp_id = v_stamp.id) then
    return jsonb_build_object(
      'status', 'already_claimed',
      'stamp', jsonb_build_object('id', v_stamp.id, 'name', v_stamp.name, 'description', v_stamp.description,
                                  'rarity', v_stamp.rarity, 'image_url', v_stamp.image_url),
      'place', jsonb_build_object('id', v_place.id, 'slug', v_place.slug, 'name', v_place.name,
                                  'category_id', v_place.category_id)
    );
  end if;

  if v_qr.max_total_claims is not null and v_qr.claim_count >= v_qr.max_total_claims then
    return jsonb_build_object('status', 'limit_reached');
  end if;

  insert into public.user_stamps (user_id, stamp_id, qr_code_id)
  values (v_uid, v_stamp.id, v_qr.id)
  on conflict (user_id, stamp_id) do nothing
  returning id into v_inserted;

  if v_inserted is null then
    return jsonb_build_object('status', 'already_claimed');
  end if;

  update public.qr_codes set claim_count = claim_count + 1 where id = v_qr.id;
  insert into public.claim_attempts (user_id, success) values (v_uid, true);
  select count(*) into v_total from public.user_stamps where user_id = v_uid;

  return jsonb_build_object(
    'status', 'ok',
    'total_stamps', v_total,
    'stamp', jsonb_build_object('id', v_stamp.id, 'name', v_stamp.name, 'description', v_stamp.description,
                                'rarity', v_stamp.rarity, 'image_url', v_stamp.image_url),
    'place', jsonb_build_object('id', v_place.id, 'slug', v_place.slug, 'name', v_place.name,
                                'category_id', v_place.category_id)
  );
end;
$$;

-- ---------- Hàm nghiệp vụ: đổi ưu đãi ----------
-- status: ok | already_redeemed | not_enough_stamps | sold_out | expired | not_found | unauthenticated
create or replace function public.redeem_reward(p_reward_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reward public.rewards;
  v_have int;
  v_existing public.redemptions;
  v_code text;
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthenticated');
  end if;

  select * into v_reward from public.rewards where id = p_reward_id for update;
  if not found or not v_reward.is_active then
    return jsonb_build_object('status', 'not_found');
  end if;
  if v_reward.expires_at is not null and v_reward.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_existing from public.redemptions where user_id = v_uid and reward_id = p_reward_id;
  if found then
    return jsonb_build_object('status', 'already_redeemed', 'code', v_existing.code);
  end if;

  select count(*) into v_have from public.user_stamps where user_id = v_uid;
  if v_have < v_reward.required_stamps then
    return jsonb_build_object('status', 'not_enough_stamps', 'have', v_have, 'need', v_reward.required_stamps);
  end if;

  if v_reward.quantity is not null and v_reward.redeemed_count >= v_reward.quantity then
    return jsonb_build_object('status', 'sold_out');
  end if;

  v_code := 'TS-' || upper(encode(gen_random_bytes(4), 'hex'));
  insert into public.redemptions (user_id, reward_id, code) values (v_uid, p_reward_id, v_code);
  update public.rewards set redeemed_count = redeemed_count + 1 where id = p_reward_id;

  return jsonb_build_object('status', 'ok', 'code', v_code);
end;
$$;

revoke all on function public.claim_stamp(text) from public, anon;
revoke all on function public.redeem_reward(uuid) from public, anon;
grant execute on function public.claim_stamp(text) to authenticated;
grant execute on function public.redeem_reward(uuid) to authenticated;
