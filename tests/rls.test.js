import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { adminClient, anonClient, createTestUser, cleanup, RUN } from './helpers.js';

const admin = adminClient();
const anon = anonClient();
let anggota, penguji, adminU, campaignId, agendaId;

before(async () => {
  anggota = await createTestUser('anggota');
  penguji = await createTestUser('penguji');
  adminU = await createTestUser('admin');
  const c = await admin.from('campaigns').insert({ title: `T-rls-${RUN}`, target_amount: 1000 }).select('id').single();
  assert.ifError(c.error);
  campaignId = c.data.id;
  const a = await admin.from('agendas').insert({ title: `T-agenda-${RUN}` }).select('id').single();
  assert.ifError(a.error);
  agendaId = a.data.id;
});
after(cleanup);

test('final_score dihitung database', async () => {
  const { data, error } = await admin.from('ukt_candidates').insert({ reg_number: `T-1-${RUN}`, name: 'Uji', pos1: 88, pos2: 86, pos3: 92, pos4: 84 }).select('final_score').single();
  assert.ifError(error);
  assert.equal(Number(data.final_score), 87.2);
});

test('nilai 150 ditolak database', async () => {
  const { error } = await admin.from('ukt_candidates').insert({ reg_number: `T-2-${RUN}`, name: 'Uji', pos1: 150 });
  assert.ok(error);
});

test('peserta terhubung ke akun lewat reg_number, dua arah', async () => {
  const reg = `T-3-${RUN}`;
  const a = await createTestUser('anggota', { reg_number: reg });
  const { data } = await admin.from('ukt_candidates').insert({ reg_number: reg, name: 'Uji' }).select('user_id').single();
  assert.equal(data.user_id, a.id);
  const b = await createTestUser('anggota');
  assert.ifError((await admin.from('profiles').update({ reg_number: null }).eq('id', a.id)).error);
  const { data: u } = await admin.from('ukt_candidates').select('user_id').eq('reg_number', reg).single();
  assert.equal(u.user_id, null); // a sudah terlepas
  assert.ifError((await admin.from('profiles').update({ reg_number: reg }).eq('id', b.id)).error);
  const { data: c } = await admin.from('ukt_candidates').select('user_id').eq('reg_number', reg).single();
  assert.equal(c.user_id, b.id);
});

test('campaign_totals hanya menghitung donasi accepted', async () => {
  const { data: camp, error } = await admin.from('campaigns').insert({ title: `T-camp-${RUN}`, target_amount: 1000000 }).select('id').single();
  assert.ifError(error);
  const base = { campaign_id: camp.id, donor_name: `T-donor-${RUN}` };
  const r = await admin.from('donations').insert([{ ...base, amount: 100000, proof_path: `dummy/${RUN}-a.jpg` }, { ...base, amount: 50000, proof_path: `dummy/${RUN}-b.jpg` }]).select('id');
  assert.ifError(r.error);
  // trigger memaksa pending; terima satu lewat update
  await admin.from('donations').update({ status: 'accepted' }).eq('id', r.data[0].id);
  const { data } = await admin.from('campaign_totals').select('*').eq('campaign_id', camp.id).single();
  assert.equal(Number(data.collected_amount), 100000);
  assert.equal(Number(data.donors_count), 1);
});

test('seed: hero dan 4 pilar', async () => {
  const { data: s } = await admin.from('site_content').select('hero_title_main').eq('id', 1).single();
  assert.equal(s.hero_title_main, 'TRIDENT');
  const { data: p } = await admin.from('pillars').select('icon');
  for (const i of ['Shield', 'Zap', 'Users', 'Award']) assert.ok(p.some((x) => x.icon === i), `pilar seed ${i}`);
});

// ---- RLS ----

test('anggota tidak bisa mengubah nilai', async () => {
  const reg = `T-4-${RUN}`;
  const m = await createTestUser('anggota', { reg_number: reg });
  assert.ifError((await admin.from('ukt_candidates').insert({ reg_number: reg, name: 'Uji' })).error);
  const { data, error } = await m.client.from('ukt_candidates').update({ pos1: 100 }).eq('reg_number', reg).select();
  assert.ifError(error);
  assert.equal(data.length, 0);
  const { data: d } = await admin.from('ukt_candidates').select('pos1').eq('reg_number', reg).single();
  assert.equal(Number(d.pos1), 0);
});

test('anggota hanya melihat peserta miliknya', async () => {
  const reg = `T-5-${RUN}`;
  const m = await createTestUser('anggota', { reg_number: reg });
  assert.ifError((await admin.from('ukt_candidates').insert([{ reg_number: reg, name: 'Uji' }, { reg_number: `T-6-${RUN}`, name: 'Lain' }])).error);
  const { data, error } = await m.client.from('ukt_candidates').select('reg_number');
  assert.ifError(error);
  assert.deepEqual(data.map((x) => x.reg_number), [reg]);
});

test('anggota tanpa peserta melihat 0 baris', async () => {
  assert.ifError((await admin.from('ukt_candidates').insert({ reg_number: `T-7-${RUN}`, name: 'Lain' })).error);
  const { data, error } = await anggota.client.from('ukt_candidates').select('id');
  assert.ifError(error);
  assert.equal(data.length, 0);
});

test('upsert dua kali dengan reg_number sama → 1 baris, nilai terbaru', async () => {
  const reg = `T-8-${RUN}`;
  const row = (pos1) => ({ reg_number: reg, name: 'Uji', pos1 });
  for (const v of [60, 90]) {
    assert.ifError((await penguji.client.from('ukt_candidates').upsert(row(v), { onConflict: 'reg_number' })).error);
  }
  const { data, error } = await admin.from('ukt_candidates').select('pos1').eq('reg_number', reg);
  assert.ifError(error);
  assert.equal(data.length, 1);
  assert.equal(Number(data[0].pos1), 90);
});

test("simpan nilai dengan baseUpdatedAt lama → 'conflict', nilai server tidak berubah; dengan force → 'ok'", async () => {
  const reg = `T-9-${RUN}`;
  const { data: row, error } = await admin.from('ukt_candidates').insert({ reg_number: reg, name: 'Uji', pos1: 50 }).select('id, updated_at').single();
  assert.ifError(error);
  const save = async (pos1, base, force) => { // query yang sama dengan api.saveCandidateScores
    let q = penguji.client.from('ukt_candidates').update({ pos1 }).eq('id', row.id);
    if (!force) q = q.eq('updated_at', base);
    const r = await q.select('id');
    assert.ifError(r.error);
    return r.data.length ? 'ok' : 'conflict';
  };
  assert.equal(await save(60, row.updated_at), 'ok'); // base segar
  assert.equal(await save(70, row.updated_at), 'conflict'); // base lama
  const { data: d } = await admin.from('ukt_candidates').select('pos1').eq('id', row.id).single();
  assert.equal(Number(d.pos1), 60);
  assert.equal(await save(80, row.updated_at, true), 'ok');
  const { data: f } = await admin.from('ukt_candidates').select('pos1').eq('id', row.id).single();
  assert.equal(Number(f.pos1), 80);
});

test('anggota tidak bisa menerima donasi sendiri', async () => {
  const { data, error } = await anggota.client.from('donations')
    .insert({ campaign_id: campaignId, donor_name: `T-own-${RUN}`, amount: 5000, proof_path: `${anggota.id}/x.png`, status: 'accepted' })
    .select('id, status, user_id').single();
  assert.ifError(error);
  assert.equal(data.status, 'pending'); // trigger memaksa pending
  assert.equal(data.user_id, anggota.id);
  const up = await anggota.client.from('donations').update({ status: 'accepted' }).eq('id', data.id).select();
  assert.ifError(up.error);
  assert.equal(up.data.length, 0);
  const { data: d } = await admin.from('donations').select('status').eq('id', data.id).single();
  assert.equal(d.status, 'pending');
});

test('anggota tidak bisa merujuk bukti di folder orang lain', async () => {
  const { error } = await anggota.client.from('donations')
    .insert({ campaign_id: campaignId, donor_name: `T-foreign-${RUN}`, amount: 1000, proof_path: `${penguji.id}/x-${RUN}.png` });
  assert.ok(error, 'proof_path folder lain harus ditolak');
});

test('ref_number dan created_at dari anggota diabaikan', async () => {
  const { data, error } = await anggota.client.from('donations')
    .insert({ campaign_id: campaignId, donor_name: `T-ref-${RUN}`, amount: 1000, proof_path: `${anggota.id}/ref-${RUN}.png`,
      ref_number: `TRD-FAKE-${RUN}`, created_at: '2000-01-01T00:00:00Z' })
    .select('ref_number, created_at').single();
  assert.ifError(error);
  assert.match(data.ref_number, /^TRD-DON-\d{8}-[0-9A-F]{6}$/);
  assert.ok(Date.now() - new Date(data.created_at).getTime() < 10 * 60 * 1000, 'created_at diisi now()');
});

test('proof_path yang sudah dipakai ditolak', async () => {
  const row = { campaign_id: campaignId, donor_name: `T-dup-${RUN}`, amount: 1000, proof_path: `${anggota.id}/dup-${RUN}.png` };
  assert.ifError((await anggota.client.from('donations').insert(row)).error);
  const { error } = await anggota.client.from('donations').insert(row);
  assert.ok(error, 'proof_path ganda harus ditolak');
});

test('anggota tidak bisa mengubah perannya', async () => {
  const { data, error } = await anggota.client.from('profiles').update({ role: 'admin' }).eq('id', anggota.id).select();
  assert.ifError(error);
  assert.equal(data.length, 0);
  const { data: p } = await admin.from('profiles').select('role').eq('id', anggota.id).single();
  assert.equal(p.role, 'anggota');
});

test('tamu bisa baca berita, tidak bisa baca agenda', async () => {
  assert.ifError((await admin.from('news').insert({ title: `T-news-${RUN}` })).error);
  const n = await anon.from('news').select('id').eq('title', `T-news-${RUN}`);
  assert.ifError(n.error);
  assert.equal(n.data.length, 1);
  const a = await anon.from('agendas').select('id').eq('id', agendaId);
  assert.ifError(a.error);
  assert.equal(a.data.length, 0);
  assert.ok((await anon.from('news').insert({ title: `T-anon-${RUN}` })).error, 'tamu menulis berita');
});

test('alasan izin tidak terlihat anggota lain', async () => {
  const b = await createTestUser('anggota');
  const ins = await anggota.client.from('agenda_rsvps').insert({ agenda_id: agendaId, full_name: 'Uji A', status: 'izin', reason: 'sakit' });
  assert.ifError(ins.error);
  const own = await b.client.from('agenda_rsvps').select('*').eq('user_id', anggota.id);
  assert.ifError(own.error);
  assert.equal(own.data.length, 0);
  const pub = await b.client.from('agenda_rsvps_public').select('*').eq('agenda_id', agendaId);
  assert.ifError(pub.error);
  assert.equal(pub.data.length, 1);
  assert.equal(pub.data[0].user_id, anggota.id);
  assert.equal(pub.data[0].status, 'izin');
  assert.ok(!('reason' in pub.data[0]));
  const staff = await penguji.client.from('agenda_rsvps').select('reason').eq('agenda_id', agendaId);
  assert.deepEqual(staff.data, [{ reason: 'sakit' }]);
});

test('view hanya bisa dibaca anggota login', async () => {
  for (const v of ['agenda_rsvps_public', 'campaign_totals', 'public_donations']) {
    const r = await anon.from(v).select('*').limit(1);
    assert.ok(r.error, `tamu membaca ${v}`);
  }
  // view pemilik tidak boleh jadi jalan pintas menulis tabel di baliknya
  const w = await anggota.client.from('agenda_rsvps_public').update({ status: 'hadir' }).eq('agenda_id', agendaId).select();
  assert.ok(w.error, 'view bisa ditulis');
  const t = await anggota.client.from('campaign_totals').select('collected_amount').eq('campaign_id', campaignId).single();
  assert.ifError(t.error);
});

test('penguji tidak bisa verifikasi donasi', async () => {
  const r = await admin.from('donations').insert({ campaign_id: campaignId, donor_name: `T-pj-${RUN}`, amount: 1000, proof_path: `x/${RUN}-pj.png` }).select('id').single();
  assert.ifError(r.error);
  const { data, error } = await penguji.client.from('donations').update({ status: 'accepted' }).eq('id', r.data.id).select();
  assert.ifError(error);
  assert.equal(data.length, 0);
  const { data: d } = await admin.from('donations').select('status').eq('id', r.data.id).single();
  assert.equal(d.status, 'pending');
});

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test('bukti bukan gambar ditolak', async () => {
  const { error } = await anggota.client.storage.from('donation-proofs')
    .upload(`${anggota.id}/x.pdf`, new Uint8Array([0x25, 0x50, 0x44, 0x46]), { contentType: 'application/pdf' });
  assert.ok(error);
});

test('anggota tidak bisa unggah ke folder orang lain', async () => {
  const ok = await anggota.client.storage.from('donation-proofs').upload(`${anggota.id}/ok.png`, png, { contentType: 'image/png' });
  assert.ifError(ok.error); // folder sendiri boleh
  const { error } = await anggota.client.storage.from('donation-proofs').upload(`${penguji.id}/x.png`, png, { contentType: 'image/png' });
  assert.ok(error);
  const other = await penguji.client.storage.from('donation-proofs').download(`${anggota.id}/ok.png`);
  assert.ok(other.error, 'penguji membaca bukti orang lain');
});

test('penguji bisa ubah statistik, tidak bisa ubah pilar/tempat latihan/hero', async () => {
  const { data: cur } = await admin.from('site_stats').select('active_members').eq('id', 1).single();
  const st = await penguji.client.from('site_stats').update({ active_members: cur.active_members }).eq('id', 1).select();
  assert.ifError(st.error);
  assert.equal(st.data.length, 1);
  assert.ok((await penguji.client.from('pillars').insert({ title: `T-p-${RUN}` })).error);
  assert.ok((await penguji.client.from('training_grounds').insert({ name: `T-tg-${RUN}` })).error);
  // tulis nilai yang sama, supaya bila policy bocor data produksi tetap utuh
  const sc = await penguji.client.from('site_content').update({ hero_title_main: 'TRIDENT' }).eq('id', 1).select();
  assert.ifError(sc.error);
  assert.equal(sc.data.length, 0);
});

test('tamu bisa baca pilar, tempat latihan, hero', async () => {
  const p = await anon.from('pillars').select('id');
  assert.ifError(p.error);
  assert.ok(p.data.length >= 1);
  const t = await anon.from('training_grounds').select('id');
  assert.ifError(t.error);
  const s = await anon.from('site_content').select('hero_title_main');
  assert.ifError(s.error);
  assert.equal(s.data.length, 1);
});
test('anggota bisa hapus unggahan yang belum dipakai, bukan bukti yang sudah dirujuk donasi', async () => {
  const bucket = anggota.client.storage.from('donation-proofs');
  const free = `${anggota.id}/free-${RUN}.png`;
  assert.ifError((await bucket.upload(free, png, { contentType: 'image/png' })).error);
  const r1 = await bucket.remove([free]);
  assert.ifError(r1.error);
  assert.equal(r1.data.length, 1, 'unggahan sendiri yang yatim terhapus');

  const used = `${anggota.id}/used-${RUN}.png`;
  assert.ifError((await bucket.upload(used, png, { contentType: 'image/png' })).error);
  const d = await anggota.client.from('donations').insert({ campaign_id: campaignId, donor_name: `T-del-${RUN}`, amount: 1000, proof_path: used }).select('id').single();
  assert.ifError(d.error);
  const r2 = await bucket.remove([used]);
  assert.equal(r2.data?.length ?? 0, 0, 'bukti yang sudah dirujuk tidak boleh terhapus');
  assert.ifError((await bucket.download(used)).error);
});

test('admin tidak bisa memutuskan ulang donasi yang sudah diputuskan', async () => {
  const r = await admin.from('donations').insert({ campaign_id: campaignId, donor_name: `T-re-${RUN}`, amount: 1000, proof_path: `x/${RUN}-re.png` }).select('id').single();
  assert.ifError(r.error);
  const decide = (st) => adminU.client.from('donations').update({ status: st }).eq('id', r.data.id).eq('status', 'pending').select('id');
  assert.equal((await decide('rejected')).data.length, 1);
  assert.equal((await decide('accepted')).data.length, 0);
  const { data } = await admin.from('donations').select('status').eq('id', r.data.id).single();
  assert.equal(data.status, 'rejected');
});

// ---- admin positif ----

test('admin bisa ubah site_content, terima donasi, baca bukti orang lain', async () => {
  const sc = await adminU.client.from('site_content').update({ hero_title_main: 'TRIDENT' }).eq('id', 1).select();
  assert.ifError(sc.error);
  assert.equal(sc.data.length, 1);
  const r = await admin.from('donations').insert({ campaign_id: campaignId, donor_name: `T-adm-${RUN}`, amount: 1000, proof_path: `x/${RUN}-adm.png` }).select('id').single();
  assert.ifError(r.error);
  const up = await adminU.client.from('donations').update({ status: 'accepted' }).eq('id', r.data.id).select();
  assert.ifError(up.error);
  assert.equal(up.data.length, 1);
  assert.ifError((await anggota.client.storage.from('donation-proofs').upload(`${anggota.id}/adm.png`, png, { contentType: 'image/png' })).error);
  const dl = await adminU.client.storage.from('donation-proofs').download(`${anggota.id}/adm.png`);
  assert.ifError(dl.error);
});

// ---- manage-user ----

const call = (u, body) => u.client.functions.invoke('manage-user', { body });
const status = (r) => r.error?.context?.status;
const newEmail = () => `u${RUN}-${Math.random().toString(36).slice(2, 8)}@test.trident.local`;

test('manage-user: tanpa token 401, anggota/penguji 403', async () => {
  const r = await anon.functions.invoke('manage-user', { body: { action: 'list' } });
  assert.equal(status(r), 401);
  assert.equal(status(await call(anggota, { action: 'list' })), 403);
  assert.equal(status(await call(penguji, { action: 'list' })), 403);
});

test('manage-user: admin membuat akun, bisa login; sandi < 8 / role / email salah 400', async () => {
  const email = newEmail(), password = 'Sandi-Baru-1';
  const r = await call(adminU, { action: 'create', email, password, full_name: 'Uji Baru', role: 'anggota', belt: 'Putih' });
  assert.ifError(r.error);
  const { error } = await anonClient().auth.signInWithPassword({ email, password });
  assert.ifError(error);
  const { data: p } = await admin.from('profiles').select('role, belt').eq('id', r.data.id).single();
  assert.deepEqual(p, { role: 'anggota', belt: 'Putih' });
  const bad = (x) => call(adminU, { action: 'create', email: newEmail(), password: 'Sandi-Baru-1', full_name: 'X', role: 'anggota', ...x });
  assert.equal(status(await bad({ password: 'short' })), 400);
  assert.equal(status(await bad({ role: 'superadmin' })), 400);
  assert.equal(status(await bad({ email: '' })), 400);
});

test('manage-user: nonaktif tidak bisa login, aktif lagi bisa', async () => {
  const u = await createTestUser('anggota');
  assert.ifError((await call(adminU, { action: 'set_active', user_id: u.id, active: false })).error);
  assert.ok((await anonClient().auth.signInWithPassword({ email: u.email, password: u.password })).error);
  const list = await call(adminU, { action: 'list' });
  assert.equal(list.data.users.find((x) => x.id === u.id).active, false);
  assert.ifError((await call(adminU, { action: 'set_active', user_id: u.id, active: true })).error);
  assert.ifError((await anonClient().auth.signInWithPassword({ email: u.email, password: u.password })).error);
});

test('manage-user: reset sandi, lama gagal baru berhasil', async () => {
  const u = await createTestUser('anggota');
  assert.equal(status(await call(adminU, { action: 'reset_password', user_id: u.id, password: 'short' })), 400);
  assert.ifError((await call(adminU, { action: 'reset_password', user_id: u.id, password: 'Sandi-Reset-9' })).error);
  assert.ok((await anonClient().auth.signInWithPassword({ email: u.email, password: u.password })).error);
  assert.ifError((await anonClient().auth.signInWithPassword({ email: u.email, password: 'Sandi-Reset-9' })).error);
});

test('manage-user: update_profile dan list; admin tak bisa nonaktif/turun diri', async () => {
  const u = await createTestUser('anggota');
  assert.ifError((await call(adminU, { action: 'update_profile', user_id: u.id, role: 'penguji', branch: 'Cab-X' })).error);
  const { data: p } = await admin.from('profiles').select('role, branch').eq('id', u.id).single();
  assert.deepEqual(p, { role: 'penguji', branch: 'Cab-X' });
  const row = (await call(adminU, { action: 'list' })).data.users.find((x) => x.id === u.id);
  assert.equal(row.email, u.email);
  assert.equal(row.role, 'penguji');
  assert.equal(row.active, true);
  assert.equal(status(await call(adminU, { action: 'set_active', user_id: adminU.id, active: false })), 400);
  assert.equal(status(await call(adminU, { action: 'update_profile', user_id: adminU.id, role: 'anggota' })), 400);
  assert.equal(status(await call(adminU, { action: 'update_profile', user_id: u.id, role: 'dewa' })), 400);
});

test('akun baru otomatis dapat profil anggota (daftar mandiri)', async () => {
  const email = `u${RUN}-self@test.trident.local`;
  const { data, error } = await admin.auth.admin.createUser({ email, password: 'Sandi-Mandiri-1', email_confirm: true, user_metadata: { full_name: 'Pendaftar Mandiri' } });
  assert.ifError(error);
  const { data: p } = await admin.from('profiles').select('full_name, role, reg_number').eq('id', data.user.id).single();
  assert.deepEqual(p, { full_name: 'Pendaftar Mandiri', role: 'anggota', reg_number: null });
});

test('kode penguji: sekali pakai, mengubah anggota jadi penguji; anggota tak bisa lihat kode', async () => {
  const code = `T${RUN}A`.toUpperCase();
  assert.ifError((await adminU.client.from('examiner_codes').insert({ code })).error);
  const a = await createTestUser('anggota');
  const b = await createTestUser('anggota');
  const seen = await a.client.from('examiner_codes').select('code');
  assert.equal(seen.data.length, 0);
  assert.ifError((await a.client.rpc('redeem_examiner_code', { p_code: code.toLowerCase() })).error);
  const { data: pa } = await admin.from('profiles').select('role').eq('id', a.id).single();
  assert.equal(pa.role, 'penguji');
  assert.ok((await b.client.rpc('redeem_examiner_code', { p_code: code })).error);
  const { data: pb } = await admin.from('profiles').select('role').eq('id', b.id).single();
  assert.equal(pb.role, 'anggota');
  assert.ok((await a.client.from('examiner_codes').insert({ code: `T${RUN}B` })).error);
});
