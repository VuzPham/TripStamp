-- =====================================================================
-- TripStamp – Đánh giá, bình luận và trạng thái "Hot".
-- Chạy SAU schema.sql và admin.sql, TRƯỚC seed.sql (có thể chạy lại nhiều lần).
-- =====================================================================

-- Địa điểm được admin ghim là Hot
alter table public.places add column if not exists is_featured boolean not null default false;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) <= 1000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, user_id) -- mỗi người một đánh giá cho mỗi địa điểm
);
create index if not exists reviews_place_idx on public.reviews (place_id, created_at desc);

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;

-- Người dùng chỉ đọc được đánh giá của chính mình; ghi qua hàm submit_review bên dưới.
grant select on public.reviews to authenticated;
drop policy if exists "reviews_read_own" on public.reviews;
create policy "reviews_read_own" on public.reviews for select to authenticated using (user_id = auth.uid());

-- Admin kiểm duyệt: xem / ẩn / xoá
grant update, delete on public.reviews to authenticated;
drop policy if exists "admin_all" on public.reviews;
create policy "admin_all" on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- View công khai ----------
-- Lưu ý: view chạy với quyền của chủ sở hữu nên đọc được bảng gốc; chỉ lộ cột an toàn
-- (tên hiển thị, không lộ email / user_id).
create or replace view public.public_reviews as
select r.id, r.place_id, r.rating, r.comment, r.created_at,
       coalesce(nullif(p.display_name, ''), 'Du khách') as display_name
from public.reviews r
left join public.profiles p on p.id = r.user_id
where r.status = 'visible';

-- Thống kê mỗi địa điểm: điểm trung bình, số đánh giá, % tích cực, điểm "hot".
-- hot_score = số thẻ nhận trong 14 ngày + 2 x số đánh giá trong 14 ngày.
-- is_hot = admin ghim HOẶC hot_score >= 5 (đổi ngưỡng ở đây nếu cần).
create or replace view public.place_stats as
select
  pl.id as place_id,
  coalesce(rv.cnt, 0)::int as review_count,
  round(rv.avg_rating, 1) as avg_rating,
  coalesce(rv.pos, 0)::int as positive_count,
  coalesce(st.total, 0)::int as stamp_count,
  (coalesce(st.recent, 0) + 2 * coalesce(rv.recent, 0))::int as hot_score,
  (pl.is_featured or (coalesce(st.recent, 0) + 2 * coalesce(rv.recent, 0)) >= 5) as is_hot
from public.places pl
left join lateral (
  select count(*) as cnt,
         avg(r.rating) as avg_rating,
         count(*) filter (where r.rating >= 4) as pos,
         count(*) filter (where r.created_at > now() - interval '14 days') as recent
  from public.reviews r
  where r.place_id = pl.id and r.status = 'visible'
) rv on true
left join lateral (
  select count(*) as total,
         count(*) filter (where us.claimed_at > now() - interval '14 days') as recent
  from public.user_stamps us
  join public.stamps s on s.id = us.stamp_id
  where s.place_id = pl.id
) st on true
where pl.status = 'active';

grant select on public.public_reviews, public.place_stats to anon, authenticated;

-- ---------- Gửi / sửa đánh giá ----------
-- status: ok | unauthenticated | invalid_rating | too_long | not_found | not_checked_in | rate_limited
create or replace function public.submit_review(p_place_id uuid, p_rating int, p_comment text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthenticated');
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('status', 'invalid_rating');
  end if;
  if v_comment is not null and length(v_comment) > 1000 then
    return jsonb_build_object('status', 'too_long');
  end if;
  if not exists (select 1 from public.places where id = p_place_id and status = 'active') then
    return jsonb_build_object('status', 'not_found');
  end if;
  -- Chỉ người đã check-in (đã nhận thẻ của địa điểm này) mới được đánh giá
  if not exists (
    select 1 from public.user_stamps us
    join public.stamps s on s.id = us.stamp_id
    where us.user_id = v_uid and s.place_id = p_place_id
  ) then
    return jsonb_build_object('status', 'not_checked_in');
  end if;
  if (select count(*) from public.reviews where user_id = v_uid and updated_at > now() - interval '1 minute') >= 5 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  insert into public.reviews (place_id, user_id, rating, comment)
  values (p_place_id, v_uid, p_rating, v_comment)
  on conflict (place_id, user_id)
  do update set rating = excluded.rating, comment = excluded.comment, updated_at = now();
  -- (nếu admin đã ẩn đánh giá, sửa lại vẫn giữ trạng thái ẩn)

  return jsonb_build_object('status', 'ok');
end;
$$;

create or replace function public.delete_my_review(p_place_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('status', 'unauthenticated');
  end if;
  delete from public.reviews where place_id = p_place_id and user_id = auth.uid();
  return jsonb_build_object('status', 'ok');
end;
$$;

-- ---------- Admin: danh sách đánh giá kèm tên/email người viết ----------
create or replace function public.admin_list_reviews()
returns table (
  id uuid, place_name text, rating int, comment text, status text,
  created_at timestamptz, display_name text, email text
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, pl.name, r.rating, r.comment, r.status, r.created_at, pr.display_name, u.email::text
  from public.reviews r
  join public.places pl on pl.id = r.place_id
  left join public.profiles pr on pr.id = r.user_id
  left join auth.users u on u.id = r.user_id
  where public.is_admin()
  order by r.created_at desc
  limit 200;
$$;

revoke all on function public.submit_review(uuid, int, text) from public, anon;
revoke all on function public.delete_my_review(uuid) from public, anon;
revoke all on function public.admin_list_reviews() from public, anon;
grant execute on function public.submit_review(uuid, int, text) to authenticated;
grant execute on function public.delete_my_review(uuid) to authenticated;
grant execute on function public.admin_list_reviews() to authenticated;
