-- Tes aturan keamanan peran, PAC, dan donasi. Jalankan di SQL Editor Supabase (atau lewat Management API).
-- Semua perubahan di-rollback (blok selalu berakhir dengan exception); baca pesan: "OK ..." atau "GAGAL ...".
-- Butuh minimal: 1 super admin, 2 admin lain (bukan super), 1 anggota di tabel profiles.
do $$
declare
  s uuid; a uuid; o uuid; m uuid; camp uuid; don uuid; n int; bad text := ''; v_by uuid;
begin
  select id into s from profiles where is_super limit 1;
  select id into a from profiles where role = 'admin' and not is_super order by full_name, id limit 1;
  select id into o from profiles where role = 'admin' and not is_super and id <> a limit 1;
  select id into m from profiles where role = 'anggota' limit 1;
  if s is null or a is null or o is null or m is null then raise exception 'GAGAL data uji kurang (butuh super, 2 admin, 1 anggota)'; end if;
  update profiles set pac = 'PAC-X1' where id in (a, m);
  update profiles set pac = 'PAC-X2' where id = o;
  insert into campaigns (title, target_amount) values ('T-uji', 1000) returning id into camp;
  insert into donations (campaign_id, donor_name, amount, proof_path) values (camp, 'uji', 5000, 'uji/' || gen_random_uuid() || '.jpg') returning id into don;

  -- Sebagai admin biasa (a, PAC-X1)
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin update profiles set role = 'admin' where id = m; bad := bad || '[admin biasa mengangkat admin] '; exception when others then null; end;
  begin update profiles set is_super = true where id = a; bad := bad || '[admin biasa jadi super] '; exception when others then null; end;
  begin update profiles set role = 'anggota' where id = s; get diagnostics n = row_count; if n <> 0 then bad := bad || '[admin biasa menurunkan super] '; end if; exception when others then null; end;
  update profiles set full_name = full_name where id = m; get diagnostics n = row_count;
  if n <> 1 then bad := bad || '[admin tidak bisa edit anggota PAC sendiri] '; end if;
  update profiles set full_name = 'x' where id = o; get diagnostics n = row_count;
  if n <> 0 then bad := bad || '[admin mengubah profil PAC lain] '; end if;
  begin update donations set amount = 999999 where id = don; bad := bad || '[nominal donasi bisa diubah] '; exception when others then null; end;
  begin update donations set status = 'accepted' where id = don; exception when others then bad := bad || '[admin gagal menerima donasi] '; end;
  select verified_by into v_by from donations where id = don;
  if v_by is distinct from a then bad := bad || '[verified_by tidak diisi server] '; end if;
  begin update donations set status = 'pending' where id = don; bad := bad || '[donasi diputuskan bisa dibatalkan] '; exception when others then null; end;

  -- Sebagai super admin
  perform set_config('request.jwt.claims', json_build_object('sub', s, 'role', 'authenticated')::text, true);
  begin update profiles set role = 'admin' where id = m; exception when others then bad := bad || '[super gagal mengangkat admin] '; end;
  begin update profiles set role = 'admin', is_super = true where id = o; exception when others then bad := bad || '[super gagal mengangkat super] '; end;
  begin update profiles set is_super = false where id = o; exception when others then bad := bad || '[super gagal mencabut super lain] '; end;
  begin update profiles set is_super = false where id = s; bad := bad || '[super mencabut dirinya] '; exception when others then null; end;
  update profiles set full_name = full_name where id = a; get diagnostics n = row_count;
  if n <> 1 then bad := bad || '[super tidak bisa edit lintas PAC] '; end if;

  if bad = '' then raise exception 'OK semua aturan lolos'; else raise exception 'GAGAL %', bad; end if;
end $$;
