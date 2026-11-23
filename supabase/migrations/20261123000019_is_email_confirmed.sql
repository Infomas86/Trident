-- Dipakai Edge Function `login` untuk membedakan pesan "password salah" vs "email belum
-- dikonfirmasi" (GoTrue sengaja membalas error yang sama untuk keduanya). Skema auth tidak
-- diekspos PostgREST, jadi dibungkus fungsi SECURITY DEFINER; hanya service_role yang boleh
-- memanggil (edge function saja, tidak bisa dipanggil anon/authenticated langsung).
create or replace function public.is_email_confirmed(p_email text)
returns boolean language sql security definer stable set search_path = public, auth as $$
  select email_confirmed_at is not null from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.is_email_confirmed(text) from public, anon, authenticated;
grant execute on function public.is_email_confirmed(text) to service_role;
