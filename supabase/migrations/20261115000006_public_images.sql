-- Public images for news and achievements, uploaded by staff from a file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-images', 'public-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy public_images_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-images' and public.is_staff());

create policy public_images_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-images' and public.is_staff());
