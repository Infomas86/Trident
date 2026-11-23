-- Keamanan (A07): kunci login per akun setelah beberapa kali gagal berturut-turut.
-- Supabase tidak membatasi percobaan password secara bawaan (rate_limit_verify hanya
-- mencakup OTP/magic-link, terbukti lewat pengujian). Mekanisme resminya adalah Auth Hook
-- "Password Verification Attempt": Supabase memanggil fungsi ini pada SETIAP percobaan
-- login (sebelum maupun sesudah password dicocokkan) dan bisa menolaknya. Ini tidak bisa
-- dilewati lewat panggilan API langsung, karena berjalan di sisi Supabase sendiri.

create table public.login_attempts (
  user_id uuid not null references auth.users on delete cascade,
  attempted_at timestamptz not null default now(),
  success boolean not null
);
create index login_attempts_user_time on public.login_attempts (user_id, attempted_at desc);
alter table public.login_attempts enable row level security;
-- Tidak ada policy: hanya diakses lewat fungsi SECURITY DEFINER di bawah, tak satu pun role aplikasi (anon/authenticated) bisa baca/tulis langsung.

-- Jendela geser 15 menit, maks 5 gagal berturut-turut; kunci lepas sendiri begitu 15 menit
-- berlalu tanpa percobaan gagal baru (tak perlu kolom "terkunci sampai jam berapa").
create or replace function public.hook_password_verification_attempt(event jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := (event->>'user_id')::uuid;
  v_valid boolean := coalesce((event->>'valid')::boolean, false);
  v_recent_fails int;
begin
  delete from public.login_attempts where attempted_at < now() - interval '15 minutes';

  select count(*) into v_recent_fails from public.login_attempts
    where user_id = v_user_id and success = false and attempted_at > now() - interval '15 minutes';

  if v_recent_fails >= 5 then
    insert into public.login_attempts (user_id, success) values (v_user_id, false);
    return jsonb_build_object('decision', 'reject', 'message', 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.');
  end if;

  insert into public.login_attempts (user_id, success) values (v_user_id, v_valid);
  return jsonb_build_object('decision', 'continue');
end;
$$;

revoke all on function public.hook_password_verification_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.hook_password_verification_attempt(jsonb) to supabase_auth_admin;
revoke all on public.login_attempts from public, anon, authenticated;
grant select, insert, delete on public.login_attempts to supabase_auth_admin;
