-- Ảnh địa điểm: thêm cột ghi nguồn/tác giả ảnh. Chạy SAU schema.sql, TRƯỚC seed.sql (chạy lại an toàn).
alter table public.places add column if not exists image_credit text;
alter table public.places add column if not exists image_source_url text;
