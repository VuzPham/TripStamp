-- =====================================================================
-- TripStamp – phân quyền Admin. Chạy SAU schema.sql (có thể chạy lại nhiều lần).
-- Bảo mật nằm ở database: chỉ tài khoản có profiles.role = 'admin' mới ghi được dữ liệu quản trị.
-- =====================================================================

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));
-- Người dùng chỉ được sửa display_name/avatar_url (đã giới hạn ở schema.sql) => không thể tự nâng quyền.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- Policy admin: toàn quyền trên các bảng nội dung ----------
do $$
declare t text;
begin
  foreach t in array array['categories', 'places', 'stamps', 'partners', 'qr_codes', 'rewards'] loop
    execute format('drop policy if exists "admin_all" on public.%I', t);
    execute format(
      'create policy "admin_all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    if t = 'partners' then
      -- KHÔNG cấp select toàn cột cho partners (tránh lộ thông tin liên hệ cho mọi user đã đăng nhập);
      -- admin đọc đầy đủ qua hàm admin_list_partners().
      execute 'grant insert, update, delete on public.partners to authenticated';
    else
      execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    end if;
  end loop;
end $$;

-- ---------- Hàm đọc/ghi dành cho admin ----------
create or replace function public.admin_list_partners()
returns setof public.partners
language sql
stable
security definer
set search_path = public
as $$
  select * from public.partners where public.is_admin() order by name;
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'places', (select count(*) from public.places where status = 'active'),
    'stamps_claimed', (select count(*) from public.user_stamps),
    'redemptions', (select count(*) from public.redemptions),
    'redemptions_used', (select count(*) from public.redemptions where status = 'used'),
    'by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d, 'count', c) order by d), '[]'::jsonb)
      from (
        select date_trunc('day', claimed_at)::date as d, count(*) as c
        from public.user_stamps
        where claimed_at > now() - interval '14 days'
        group by 1
      ) x
    ),
    'by_place', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', c) order by c desc), '[]'::jsonb)
      from (
        select pl.name, count(*) as c
        from public.user_stamps us
        join public.stamps s on s.id = us.stamp_id
        join public.places pl on pl.id = s.place_id
        group by pl.name
        order by c desc
        limit 10
      ) y
    )
  );
end;
$$;

create or replace function public.admin_list_redemptions(p_code text default null)
returns table (
  id uuid, code text, status text, created_at timestamptz,
  reward_title text, partner_name text, display_name text, email text
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.code, r.status, r.created_at, w.title, pt.name, pr.display_name, u.email::text
  from public.redemptions r
  join public.rewards w on w.id = r.reward_id
  left join public.partners pt on pt.id = w.partner_id
  left join public.profiles pr on pr.id = r.user_id
  left join auth.users u on u.id = r.user_id
  where public.is_admin()
    and (p_code is null or p_code = '' or r.code = upper(btrim(p_code)))
  order by r.created_at desc
  limit 100;
$$;

-- status: ok | already_used | cancelled | not_found | forbidden
create or replace function public.admin_mark_redeemed(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_status text;
begin
  if not public.is_admin() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  update public.redemptions set status = 'used' where code = v_code and status = 'issued';
  if found then
    return jsonb_build_object('status', 'ok');
  end if;
  select status into v_status from public.redemptions where code = v_code;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object('status', case v_status when 'used' then 'already_used' else v_status end);
end;
$$;

revoke all on function public.admin_list_partners() from public, anon;
revoke all on function public.admin_stats() from public, anon;
revoke all on function public.admin_list_redemptions(text) from public, anon;
revoke all on function public.admin_mark_redeemed(text) from public, anon;
grant execute on function public.admin_list_partners() to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_list_redemptions(text) to authenticated;
grant execute on function public.admin_mark_redeemed(text) to authenticated;

-- ---------- Storage: ảnh địa điểm (đọc công khai, chỉ admin được ghi) ----------
insert into storage.buckets (id, name, public)
values ('place-images', 'place-images', true)
on conflict (id) do nothing;

drop policy if exists "place_images_admin_write" on storage.objects;
create policy "place_images_admin_write" on storage.objects for all to authenticated
  using (bucket_id = 'place-images' and public.is_admin())
  with check (bucket_id = 'place-images' and public.is_admin());

-- ---------- Cấp quyền admin cho tài khoản của bạn ----------
-- Đăng ký tài khoản trong app trước, rồi chạy (thay email):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'ban@example.com');
