-- TripStamp: hồ sơ người dùng + đăng nhập Google/Facebook. Chạy SAU schema.sql và admin.sql. Chạy lại nhiều lần được.

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists home_city text;
alter table public.profiles add column if not exists birthday date;

alter table public.profiles drop constraint if exists profiles_phone_check;
alter table public.profiles add constraint profiles_phone_check check (phone is null or phone ~ '^[0-9+() .-]{6,20}$');
alter table public.profiles drop constraint if exists profiles_bio_check;
alter table public.profiles add constraint profiles_bio_check check (bio is null or char_length(bio) <= 300);
alter table public.profiles drop constraint if exists profiles_name_check;
alter table public.profiles add constraint profiles_name_check check (display_name is null or char_length(display_name) between 1 and 60);

-- Người dùng chỉ được sửa các cột này của chính mình (role vẫn không sửa được từ client).
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, full_name, phone, bio, home_city, birthday) on public.profiles to authenticated;

-- Đăng ký bằng Google/Facebook: lấy tên + ảnh từ nhà cung cấp.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ), 60),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), nullif(new.raw_user_meta_data ->> 'picture', ''))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Ảnh đại diện: bucket công khai để đọc, mỗi người chỉ ghi vào thư mục mang id của mình.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_read" on storage.objects;
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
