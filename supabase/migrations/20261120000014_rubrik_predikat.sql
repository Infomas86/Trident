-- Penilaian UKT model rubrik resmi: predikat huruf (A-E) per materi, bukan angka 4-Pos.
-- predikat = {"I":"B","II":"B","III":"A","IV":"B"} (kunci = nomor materi, nilai = huruf).
-- Kolom angka lama (pos1..pos4, final_score) sengaja dibiarkan agar data lama tidak hilang.
alter table public.ukt_candidates add column predikat jsonb not null default '{}';

alter table public.ukt_candidates add constraint ukt_candidates_predikat_valid check (
  jsonb_typeof(predikat) = 'object'
  and not jsonb_path_exists(predikat, '$.keyvalue() ? (!(@.key like_regex "^(I|II|III|IV)$"))')
  and not jsonb_path_exists(predikat, '$.* ? (@.type() != "string")')
  and not jsonb_path_exists(predikat, '$.* ? (!(@ like_regex "^[A-E]$"))')
);

-- Satu materi sekali simpan, atomik: dua penguji yang menilai materi berbeda pada peserta yang
-- sama tidak saling menimpa. SECURITY INVOKER: RLS scorer_update tetap berlaku (hanya penguji/admin
-- UKT itu). p_grade null = hapus predikat materi tersebut.
create or replace function public.set_predikat(p_id uuid, p_materi text, p_grade text)
returns void language plpgsql security invoker set search_path = public as $$
begin
  update public.ukt_candidates c set
    predikat = case when p_grade is null then c.predikat - p_materi
                    else c.predikat || jsonb_build_object(p_materi, p_grade) end,
    examiner_id = auth.uid(),
    examiner_name = (select full_name from public.profiles where id = auth.uid()),
    -- Tanggal ujian = tanggal UKT-nya, bukan tanggal terakhir diedit: koreksi di hari lain tidak menggeser
    -- tanggal di lembar hasil. Anggota tidak bisa membaca ukt_events, jadi tanggalnya disalin ke peserta.
    exam_date = coalesce(
      (select e.exam_date from public.ukt_events e where e.id = c.event_id),
      (now() at time zone 'Asia/Jakarta')::date)
  where c.id = p_id;
  if not found then
    raise exception 'peserta tidak ditemukan atau tidak diizinkan';
  end if;
end;
$$;

revoke all on function public.set_predikat(uuid, text, text) from public, anon;
grant execute on function public.set_predikat(uuid, text, text) to authenticated;
