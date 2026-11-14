-- Anggota tidak boleh memilih ref_number/created_at sendiri atau merujuk bukti di folder orang lain.
-- auth.uid() null = service role (fixture/admin script): cek folder dilewati.
create or replace function force_pending_donation() returns trigger language plpgsql as $$
begin
  new.status := 'pending'; new.verified_by := null; new.verified_at := null; new.user_id := auth.uid();
  new.ref_number := 'TRD-DON-' || to_char(now() at time zone 'Asia/Jakarta','YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6));
  new.created_at := now();
  if auth.uid() is not null and split_part(new.proof_path, '/', 1) <> auth.uid()::text then
    raise exception 'bukti donasi harus di folder sendiri';
  end if;
  return new;
end $$;

-- Satu bukti hanya untuk satu donasi.
alter table donations add constraint donations_proof_path_key unique (proof_path);
