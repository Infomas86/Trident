# Backend Supabase Trident — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti data contoh di `AppContext` dengan Supabase (database, login, file, RLS) supaya Trident bisa dipakai sungguhan di web dan APK.

**Architecture:** Frontend React memanggil Supabase langsung lewat `@supabase/supabase-js` dengan kunci `anon`. Semua hak akses dijaga RLS di PostgreSQL. Satu Edge Function `manage-user` memegang kunci `service_role` untuk kelola akun. `AppContext` tetap menjadi satu-satunya tempat komponen mengambil data dan handler.

**Tech Stack:** React 19, Vite 8, Capacitor 8, Supabase (Postgres, Auth, Storage, Edge Functions/Deno), Supabase CLI (devDependency `supabase`), `node --test` (bawaan Node 26).

**Spec:** `docs/superpowers/specs/2026-11-14-backend-supabase-design.md`

## Global Constraints

- Paket Supabase Free; biaya Rp0. Tidak ada GitHub Actions (backup manual).
- Kunci `service_role` dan URL koneksi DB **tidak boleh** berawalan `VITE_` dan tidak boleh di-import dari `src/`. Hanya di `.env.local` (dibaca skrip Node) dan secret Edge Function.
- Variabel frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` di `.env.local` (sudah ter-ignore oleh `*.local`).
- Peran di database: `anggota | penguji | admin`. Tamu = tidak login. Di frontend `ROLES = { PUBLIC: 'public', MEMBER: 'anggota', EXAMINER: 'penguji', ADMIN: 'admin' }`.
- Basis kode: upstream `75cbe64` (sudah ada `LoginPage.jsx`, peran Admin, CMS pilar/hero/tempat latihan, antrean offline, `structure` pada peserta). Spec bagian "Pembaruan: setelah pull upstream" menang bila bertentangan.
- `localStorage` hanya untuk mode offline penilaian UKT (`trident_offline_queue`, `trident_cache_candidates`, `trident_cache_profile`), semuanya lewat `src/lib/offline.js`. Penyimpanan `localStorage` lain dari upstream dan tombol simulasi sinyal dihapus.
- Bobot skor: Pos1 0.25, Pos2 0.30, Pos3 0.20, Pos4 0.25, dibulatkan 1 desimal. Predikat: `>= 85.0` "LULUS DENGAN PUJIAN", `>= 70.0` "LULUS", selain itu "PERLU HER / TUNDA".
- Nilai pos: 0–100 (CHECK di database **dan** validasi impor).
- Daftar mandiri dimatikan; akun hanya dibuat admin.
- Donasi baru selalu `pending`; dana terkumpul hanya dari donasi `accepted`.
- Tidak ada data contoh di database; app mulai kosong dengan tampilan "belum ada data".
- Teks UI dalam Bahasa Indonesia, mengikuti gaya komponen yang ada.
- Tanpa dependensi baru selain `@supabase/supabase-js` dan `supabase` (dev).

## Review Focus

1. **Sinyal putus di tengah menyimpan nilai, atau app dibuka tanpa sinyal** → nilai masuk antrean (tidak hilang), daftar peserta tampil dari cache, app tidak crash. (Task 8b: test `syncQueue` berhenti saat error jaringan + verifikasi manual mode pesawat.)
6. **Dua penguji mengubah peserta yang sama, salah satunya offline** → tidak ada nilai yang tertimpa diam-diam; muncul daftar bentrok. (Task 8b: test RLS `saveCandidateScores` dengan `baseUpdatedAt` lama → `'conflict'`.)
2. **Akun dinonaktifkan saat sedang login** → request berikutnya ditolak dan app kembali ke layar login. (Task 5: test `ban` → login gagal.)
3. **Anggota tanpa `reg_number` cocok membuka tab UKT** → "Anda belum terdaftar sebagai peserta UKT", bukan nilai orang lain. (Task 4: test RLS anggota tanpa peserta mendapat 0 baris.)
4. **Unggah bukti transfer bukan gambar / > 5 MB** → ditolak sebelum donasi dibuat. (Task 9: bucket `allowed_mime_types` + `file_size_limit`, test unggah PDF ditolak.)
5. **Impor CSV dengan `reg_number` yang sudah ada** → baris lama diperbarui, tidak dobel; nilai 0 tetap 0. (Task 1 parser test + Task 8 upsert test.)

---

## Struktur file

| File | Tanggung jawab |
|---|---|
| `src/lib/ukt.js` | Logika murni UKT: skor, predikat, parse & build CSV |
| `src/lib/supabase.js` | Satu klien Supabase |
| `src/lib/api.js` | Semua query/mutasi Supabase per entitas, mengembalikan objek camelCase |
| `src/context/AppContext.jsx` | Sesi, profil, state list, handler (memanggil `api.js`) |
| `src/components/LoginPage.jsx` (sudah ada) | Diubah jadi form login email + sandi saja |
| `src/lib/phone.js` | Normalisasi nomor WhatsApp |
| `src/components/AkunSection.jsx` | Kelola akun (admin) |
| `src/components/DonasiVerifikasi.jsx` | Daftar donasi pending + Terima/Tolak (admin) |
| `supabase/migrations/20261114000001_schema.sql` | Tabel, view, trigger |
| `supabase/migrations/20261114000002_rls.sql` | Fungsi `my_role()`, RLS, storage policy |
| `supabase/functions/manage-user/index.ts` | Edge Function kelola akun |
| `scripts/backup.mjs` | Backup manual |
| `tests/ukt.test.js` | Test logika UKT |
| `tests/rls.test.js` | Test aturan akses terhadap proyek Supabase |
| `tests/helpers.js` | Buat/hapus user uji via service role |

Dihapus: `src/components/AdminCodeModal.jsx`, `src/components/RoleBanner.jsx`, isi mock di `src/data/mockData.js` (kecuali `INITIAL_TIMELINE` dan `TRIDENT_BELT_LEVELS`, dipindah ke `src/data/static.js`; `INITIAL_PILLARS` dan `INITIAL_HERO_DATA` menjadi isi awal di migrasi).

---

### Task 1: Logika UKT murni + test

**Files:**
- Create: `src/lib/ukt.js`, `src/lib/phone.js`, `tests/ukt.test.js`, `tests/phone.test.js`
- Modify: `package.json` (script `"test": "node --test tests/ukt.test.js tests/phone.test.js"`), `src/components/UktSection.jsx` (import dari `../lib/ukt`, pakai `parseCandidatesCsv`/`buildCandidatesCsv`), `src/components/VisiMisiSection.jsx:549` (pakai `waNumber`), `src/data/mockData.js` (hapus `calculateUktScore`)

**Interfaces:**
- Produces:
  - `calculateUktScore(pos1, pos2, pos3, pos4) -> { score: number, status: string, statusColor: string, badgeVariant: 'cumlaude'|'pass'|'her' }` (perilaku sama seperti versi lama)
  - `statusFromScore(score: number) -> { status, statusColor, badgeVariant }`
  - `parseCandidatesCsv(text: string) -> { rows: CandidateInput[], errors: string[] }` dengan `CandidateInput = { regNumber, name, branch, currentBelt, targetBelt, pos1, pos2, pos3, pos4, examinerNotes, structure: { pp, pw, pc, pac, pr, par } }` (kolom 12–17, berbasis 0; kosong → `''`)
  - `buildCandidatesCsv(candidates: Candidate[]) -> string` (header seperti `handleExportCSV` sekarang + `PP,PW,PC,PAC,PR,PAR`; setiap kolom teks di-quote dan `"` → `""`)
  - `src/lib/phone.js`: `waNumber(phone: string) -> string` (hanya angka; awalan `0` → `62`; kosong → `''`)

- [ ] **Step 1: Tulis test yang gagal** di `tests/ukt.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateUktScore, parseCandidatesCsv, buildCandidatesCsv } from '../src/lib/ukt.js';

test('batas predikat', () => {
  assert.equal(calculateUktScore(85, 85, 85, 85).status, 'LULUS DENGAN PUJIAN');
  assert.equal(calculateUktScore(84.9, 84.9, 84.9, 84.9).status, 'LULUS');
  assert.equal(calculateUktScore(70, 70, 70, 70).status, 'LULUS');
  assert.equal(calculateUktScore(69.9, 69.9, 69.9, 69.9).status, 'PERLU HER / TUNDA');
  assert.equal(calculateUktScore(88, 86, 92, 84).score, 87.2);
});

const HEADER = 'No Registrasi,Nama Peserta,Cabang Padepokan,Sabuk Saat Ini,Sabuk Target,Pos 1,Pos 2,Pos 3,Pos 4,Skor Akhir,Status,Catatan';

test('nilai 0 tetap 0, kutip ganda dikembalikan', () => {
  const { rows, errors } = parseCandidatesCsv(`${HEADER}\n"A-1","Budi ""Kancil""","Pusat","x","y",0,80,80,80,,,"ok, sip"`);
  assert.deepEqual(errors, []);
  assert.equal(rows[0].pos1, 0);
  assert.equal(rows[0].name, 'Budi "Kancil"');
  assert.equal(rows[0].examinerNotes, 'ok, sip');
});

test('nilai di luar 0-100 atau bukan angka ditolak dengan nomor baris', () => {
  const { rows, errors } = parseCandidatesCsv(`${HEADER}\n"A-1","Budi","P","x","y",150,80,80,80\n"A-2","Ani","P","x","y",abc,80,80,80`);
  assert.equal(rows.length, 0);
  assert.match(errors[0], /baris 2/);
  assert.match(errors[1], /baris 3/);
});

test('reg_number kosong ditolak', () => {
  const { errors } = parseCandidatesCsv(`${HEADER}\n"","Budi","P","x","y",80,80,80,80`);
  assert.match(errors[0], /baris 2/);
});

test('build lalu parse menghasilkan data yang sama', () => {
  const c = { regNumber: 'A-1', name: 'Budi "K"', branch: 'P#1', currentBelt: 'x', targetBelt: 'y', pos1: 80, pos2: 81, pos3: 82, pos4: 83, examinerNotes: 'juara #1',
    structure: { pp: 'PP', pw: 'PW Kepri', pc: 'PC Batam', pac: 'PAC Sungai Beduk', pr: 'PR Tanjung Piayu', par: 'PAR Buana Garden' } };
  const { rows } = parseCandidatesCsv(buildCandidatesCsv([c]));
  assert.deepEqual(rows[0], c);
});

test('file lama tanpa kolom struktur tetap bisa diimpor', () => {
  const { rows, errors } = parseCandidatesCsv(`${HEADER}\n"A-1","Budi","P","x","y",80,80,80,80`);
  assert.deepEqual(errors, []);
  assert.deepEqual(rows[0].structure, { pp: '', pw: '', pc: '', pac: '', pr: '', par: '' });
});
```

Dan `tests/phone.test.js`:

```js
test('nomor WhatsApp', () => {
  assert.equal(waNumber('0812-7721-9988'), '6281277219988');
  assert.equal(waNumber('+62 812-7721-9988'), '6281277219988');
  assert.equal(waNumber(''), '');
});
```

- [ ] **Step 2: Jalankan, pastikan gagal.** Run: `npm test` — Expected: FAIL, modul `src/lib/ukt.js` tidak ada.
- [ ] **Step 3: Implementasi `src/lib/ukt.js`.** Pindahkan `calculateUktScore` dari `mockData.js`. Parser: tolak baris kosong; kolom 0 (`regNumber`) dan 1 (`name`) wajib; kolom 5–8 wajib angka 0–100 (`Number(v)` dengan cek `v.trim() !== ''` dan `Number.isFinite`); kolom 11 = catatan. Nomor baris di pesan = nomor baris file (header = baris 1). Unquote dengan menghapus kutip luar lalu `""` → `"`.
- [ ] **Step 4: Ganti di `UktSection.jsx`:** ekspor memakai `Blob([ '﻿' + buildCandidatesCsv(candidatesList) ], { type: 'text/csv;charset=utf-8' })` + `URL.createObjectURL` (seperti `downloadSampleTemplate`); impor memakai `parseCandidatesCsv` dan menampilkan `errors` lewat `showToast(errors.join('; '), 'error')` tanpa mengimpor apa pun bila ada error.
- [ ] **Step 5: Jalankan, pastikan lulus.** Run: `npm test` — Expected: 7 test PASS. Lalu `npm run build` — Expected: build sukses.
- [ ] **Step 6: Commit**

```bash
git add src/lib/ukt.js src/lib/phone.js tests/ukt.test.js tests/phone.test.js package.json src/components/UktSection.jsx src/components/VisiMisiSection.jsx src/data/mockData.js
git commit -m "feat(ukt): pure score + CSV logic with tests"
```

---

### Task 2: Proyek Supabase, CLI, klien

**Files:**
- Create: `src/lib/supabase.js`, `.env.example`, `supabase/config.toml` (via `npx supabase init`)
- Modify: `package.json` (deps), `.gitignore` (tambah `backups/`, `supabase/.temp/`)

**Interfaces:**
- Produces: `export const supabase` dari `src/lib/supabase.js` (`createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`).
- `.env.local` berisi: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_PROJECT_REF`. `.env.example` berisi nama yang sama tanpa nilai.

- [ ] **Step 1: (Pengguna, manual)** Buat proyek di supabase.com (region Singapore). Authentication → Sign In / Providers: matikan "Allow new users to sign up"; Email provider aktif; matikan "Confirm email". Salin Project URL, anon key, service_role key, connection string (session pooler) dan project ref ke `.env.local`.
- [ ] **Step 2:** `npm i @supabase/supabase-js` dan `npm i -D supabase`; `npx supabase init`; `npx supabase link --project-ref <ref>`.
- [ ] **Step 3:** Buat `src/lib/supabase.js` dan `.env.example`; tambahkan `.gitignore`.
- [ ] **Step 4: Verifikasi.** Run: `node -e "import('@supabase/supabase-js').then(async m=>{const s=m.createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY);console.log((await s.auth.getSession()).error)})"` dengan `--env-file=.env.local` — Expected: `null`. Pastikan `git status` tidak menampilkan `.env.local`.
- [ ] **Step 5: Commit** `src/lib/supabase.js .env.example supabase/config.toml package.json package-lock.json .gitignore` — `chore: add supabase client and CLI`.

---

### Task 3: Skema database

**Files:**
- Create: `supabase/migrations/20261114000001_schema.sql`
- Test: `tests/rls.test.js` (bagian skema), `tests/helpers.js`

**Interfaces:**
- Produces (nama tabel/kolom dipakai `api.js`):
  - `profiles(id uuid pk → auth.users on delete cascade, full_name text not null, role text check in ('anggota','penguji','admin') default 'anggota', belt text, branch text, reg_number text unique, photo_url text, created_at timestamptz default now())`
  - `news(id uuid pk default gen_random_uuid(), title, category, summary, content, image_url, tags text[] default '{}', author_id uuid default auth.uid(), author_name text, created_at)`
  - `achievements(id, athlete_name, championship, scope, medal, category, year text, notes, photo_url, created_at)`
  - `agendas(id, title, date date, time_text, location, speaker, description, created_by uuid default auth.uid(), created_at)`
  - `agenda_rsvps(agenda_id → agendas on delete cascade, user_id → profiles default auth.uid(), full_name text, status text check in ('hadir','izin'), reason text, updated_at, primary key(agenda_id,user_id))`
  - view `agenda_rsvps_public(agenda_id, user_id, full_name, status)` (tanpa `reason`; aksesnya diatur di Task 4)
  - `campaigns(id, title, category, target_amount bigint check > 0, deadline date, description, created_at)`
  - `donations(id, ref_number text unique default 'TRD-DON-' || to_char(now() at time zone 'Asia/Jakarta','YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6)), campaign_id → campaigns on delete restrict, user_id uuid default auth.uid() → profiles, donor_name text not null, amount bigint check > 0, message text, payment_method text, proof_path text not null, status text check in ('pending','accepted','rejected') default 'pending', verified_by uuid, verified_at timestamptz, created_at)`
  - view `campaign_totals(campaign_id, collected_amount, donors_count)` dari donasi `accepted` (coalesce 0, left join dari `campaigns`)
  - view `public_donations(id, campaign_id, donor_name, amount, message, created_at)` donasi `accepted`
  - `ukt_candidates(id, reg_number text unique not null, name text not null, branch, current_belt, target_belt, photo_url, user_id uuid → profiles on delete set null, pos1..pos4 numeric(4,1) default 0 check between 0 and 100, sub_scores jsonb default '{}', final_score numeric generated always as (round(pos1*0.25+pos2*0.30+pos3*0.20+pos4*0.25, 1)) stored, examiner_notes, examiner_id uuid, examiner_name text, exam_date date, struct_pp, struct_pw, struct_pc, struct_pac, struct_pr, struct_par text default '', updated_at)`
  - `site_stats(id int pk check (id = 1), active_members int default 0, medals_count int default 0, padepokan_branches int default 0, ukt_pass_rate numeric default 0, master_council int default 0)` + `insert ... values (1)`
  - `site_content(id int pk check (id = 1), hero_badge, hero_title_main, hero_title_highlight, hero_subtitle, bank_name, bank_account, bank_holder, qris_image_url text)` + baris id 1 berisi teks hero dari `INITIAL_HERO_DATA` upstream
  - `pillars(id uuid pk, title text not null, "desc" text, icon text, sort_order int default 0)` + 4 baris dari `INITIAL_PILLARS` upstream (urutan sama)
  - `training_grounds(id uuid pk, name text not null, tier, parent_pr, address, trainer_name, trainer_belt, trainer_phone, trainer_photo_url, schedule, facilities text[] default '{}', active_students int default 0, badge, description, created_at)` (tanpa isi awal)
  - Trigger `link_candidate_user`: sebelum insert/update `reg_number` di `ukt_candidates` → set `user_id` dari `profiles` dengan `reg_number` sama (atau null). Trigger `link_profile_candidates`: setelah insert/update `reg_number` di `profiles` → update `ukt_candidates.user_id` (lepas yang lama, pasang yang baru).
  - Trigger `force_pending_donation`: sebelum insert `donations` → `status := 'pending'`, `verified_by := null`, `verified_at := null`, `user_id := auth.uid()`.
  - Trigger `set_updated_at` untuk `ukt_candidates`, `agenda_rsvps`.

- [ ] **Step 1: Tulis `tests/helpers.js`:** `adminClient()` (service role, dari `process.env`), `createTestUser(role, extra = {}) -> { id, email, password, client }` (buat user via `auth.admin.createUser({ email_confirm: true })`, insert `profiles`, login, kembalikan klien anon yang sudah login), `cleanup()` menghapus semua user uji (email berakhiran `@test.trident.local`) dan baris yang mereka buat.
- [ ] **Step 2: Tulis test skema yang gagal** di `tests/rls.test.js`:

```js
test('final_score dihitung database', async () => {
  const { data } = await admin.from('ukt_candidates').insert({ reg_number: 'T-1', name: 'Uji', pos1: 88, pos2: 86, pos3: 92, pos4: 84 }).select('final_score').single();
  assert.equal(Number(data.final_score), 87.2);
});
test('nilai 150 ditolak database', async () => {
  const { error } = await admin.from('ukt_candidates').insert({ reg_number: 'T-2', name: 'Uji', pos1: 150 });
  assert.ok(error);
});
test('peserta terhubung ke akun lewat reg_number, dua arah', async () => {
  const a = await createTestUser('anggota', { reg_number: 'T-3' });
  const { data } = await admin.from('ukt_candidates').insert({ reg_number: 'T-3', name: 'Uji' }).select('user_id').single();
  assert.equal(data.user_id, a.id);
  const b = await createTestUser('anggota');
  await admin.from('profiles').update({ reg_number: null }).eq('id', a.id);
  await admin.from('profiles').update({ reg_number: 'T-3' }).eq('id', b.id);
  const { data: c } = await admin.from('ukt_candidates').select('user_id').eq('reg_number', 'T-3').single();
  assert.equal(c.user_id, b.id);
});
test('campaign_totals hanya menghitung donasi accepted', async () => { /* buat campaign, 1 donasi accepted 100000 + 1 pending 50000 via admin → collected_amount 100000, donors_count 1 */ });
```

Script: `"test:rls": "node --env-file=.env.local --test tests/rls.test.js"`.
- [ ] **Step 3: Jalankan.** Run: `npm run test:rls` — Expected: FAIL (tabel belum ada).
- [ ] **Step 4: Tulis migrasi** sesuai Interfaces. RLS diaktifkan di Task 4, jadi file ini hanya struktur.
- [ ] **Step 5: Terapkan.** Run: `npx supabase db push` — Expected: migrasi diterapkan tanpa error.
- [ ] **Step 6: Jalankan.** Run: `npm run test:rls` — Expected: semua test skema PASS.
- [ ] **Step 7: Commit** — `feat(db): schema, views and triggers`.

---

### Task 4: Aturan akses (RLS + Storage)

**Files:**
- Create: `supabase/migrations/20261114000002_rls.sql`
- Test: `tests/rls.test.js`

**Interfaces:**
- Produces: `public.my_role() returns text` (`security definer`, `stable`, `search_path = public`): role dari `profiles` untuk `auth.uid()`, null bila tamu. `public.is_staff() returns boolean` = role in ('penguji','admin'). `public.is_admin() returns boolean`.
- Bucket `donation-proofs`: privat, `file_size_limit` 5 MB, `allowed_mime_types` `{image/jpeg,image/png,image/webp}`; path `<user_id>/<uuid>.<ext>`.

Aturan (persis dari spec "Aturan akses"):

| Tabel | select | insert | update | delete |
|---|---|---|---|---|
| news, achievements | semua (anon juga) | staff | staff | staff |
| site_stats | semua (anon juga) | — | staff | — |
| site_content | semua (anon juga) | — | admin | — |
| pillars, training_grounds | semua (anon juga) | admin | admin | admin |
| agendas | login | staff | staff | staff |
| agenda_rsvps | milik sendiri atau staff | milik sendiri | milik sendiri | milik sendiri |
| agenda_rsvps_public | login | — | — | — |
| campaigns, campaign_totals, public_donations | login | admin | admin | admin |
| donations | milik sendiri atau admin | login (trigger memaksa pending) | admin | — |
| ukt_candidates | staff, atau `user_id = auth.uid()` | staff | staff | staff |
| profiles | milik sendiri atau staff | — (lewat Edge Function) | admin | — |
| storage donation-proofs | folder sendiri atau admin | folder sendiri | — | — |

`agenda_rsvps_public` dibuat `security_invoker = false` (pemilik view) supaya anggota bisa melihat nama + status orang lain tanpa `reason`; grant select hanya ke `authenticated`.

- [ ] **Step 1: Tulis test yang gagal** (satu `test` per baris, anggota/penguji/admin/anon dari `createTestUser` dan klien anon):

```js
test('anggota tidak bisa mengubah nilai', async () => { const { data } = await anggota.client.from('ukt_candidates').update({ pos1: 100 }).eq('reg_number', 'T-1').select(); assert.equal(data.length, 0); });
test('anggota hanya melihat peserta miliknya', async () => { /* anggota dengan reg_number T-3 → select ukt_candidates → tepat 1 baris T-3 */ });
test('anggota tanpa peserta melihat 0 baris', async () => { /* anggota tanpa reg_number → 0 baris */ });
test('anggota tidak bisa menerima donasi sendiri', async () => { /* insert donasi dengan status:'accepted' → tersimpan 'pending'; update status → 0 baris */ });
test('anggota tidak bisa mengubah perannya', async () => { /* update profiles set role='admin' where id=self → 0 baris */ });
test('tamu bisa baca berita, tidak bisa baca agenda', async () => { /* anon: news ok, agendas 0 baris */ });
test('alasan izin tidak terlihat anggota lain', async () => { /* anggota A rsvp izin "sakit"; anggota B: agenda_rsvps 0 baris milik A, agenda_rsvps_public berisi A tanpa kolom reason */ });
test('penguji tidak bisa verifikasi donasi', async () => { /* update donations set status → 0 baris */ });
test('bukti bukan gambar ditolak', async () => { /* anggota upload application/pdf ke donation-proofs/<id>/x.pdf → error */ });
test('anggota tidak bisa unggah ke folder orang lain', async () => { /* path <id lain>/x.png → error */ });
test('penguji bisa ubah statistik, tidak bisa ubah pilar/tempat latihan/hero', async () => { /* update site_stats → 1 baris; insert pillars, insert training_grounds, update site_content → error / 0 baris */ });
test('tamu bisa baca pilar, tempat latihan, hero', async () => { /* anon select pillars → 4 baris, site_content → 1 baris */ });
```

- [ ] **Step 2: Jalankan.** Run: `npm run test:rls` — Expected: test RLS FAIL.
- [ ] **Step 3: Tulis migrasi** (enable RLS di semua tabel, policy sesuai tabel, bucket + `storage.objects` policy dengan `(storage.foldername(name))[1] = auth.uid()::text`).
- [ ] **Step 4: Terapkan + jalankan.** `npx supabase db push` lalu `npm run test:rls` — Expected: semua PASS.
- [ ] **Step 5: Commit** — `feat(db): row level security and storage policies`.

---

### Task 5: Edge Function `manage-user`

**Files:**
- Create: `supabase/functions/manage-user/index.ts`
- Test: `tests/rls.test.js` (bagian akun)

**Interfaces:**
- Produces: `POST /functions/v1/manage-user`, body JSON `{ action, ... }`, dipanggil dari frontend dengan `supabase.functions.invoke('manage-user', { body })`:
  - `{ action: 'create', email, password, full_name, role, belt?, branch?, reg_number? }` → `{ id }`
  - `{ action: 'reset_password', user_id, password }` → `{ ok: true }`
  - `{ action: 'set_active', user_id, active: boolean }` → `{ ok: true }` (`ban_duration: '876000h'` / `'none'`)
  - `{ action: 'update_profile', user_id, full_name?, role?, belt?, branch?, reg_number? }` → `{ ok: true }`
  - `{ action: 'list' }` → `{ users: [{ id, email, full_name, role, belt, branch, reg_number, active }] }`
  - Error: status 401 (tanpa token), 403 (bukan admin), 400 (input salah: email kosong, sandi < 8 karakter, role di luar 3 nilai). Admin tidak boleh menonaktifkan atau menurunkan peran dirinya sendiri (400).

- [ ] **Step 1: Tulis test yang gagal:**

```js
test('anggota ditolak 403', async () => { const { error } = await anggota.client.functions.invoke('manage-user', { body: { action: 'list' } }); assert.equal(error.context.status, 403); });
test('admin membuat akun dan akun bisa login', async () => { /* create → signInWithPassword ok → profiles role 'anggota' */ });
test('akun dinonaktifkan tidak bisa login', async () => { /* set_active false → signInWithPassword error */ });
test('reset sandi: sandi lama gagal, baru berhasil', async () => {});
test('sandi < 8 karakter ditolak 400', async () => {});
```

- [ ] **Step 2: Jalankan** `npm run test:rls` — Expected: FAIL (404).
- [ ] **Step 3: Implementasi.** Ambil JWT dari header `Authorization`, `getUser`, cek `profiles.role = 'admin'` dengan klien service role (`Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`, otomatis tersedia). `create` menghapus user Auth bila insert `profiles` gagal. CORS untuk `capacitor://localhost`, `https://localhost`, dan origin web.
- [ ] **Step 4: Deploy + jalankan.** `npx supabase functions deploy manage-user` lalu `npm run test:rls` — Expected: PASS.
- [ ] **Step 5: Commit** — `feat(auth): manage-user edge function`.

---

### Task 6: Login di frontend, hapus simulasi peran

**Files:**
- Create: `src/lib/api.js` (bagian auth/profil), `src/data/static.js`
- Modify: `src/components/LoginPage.jsx`, `src/context/AppContext.jsx`, `src/App.jsx`, `src/components/Navbar.jsx`, `src/components/LockedFeatureModal.jsx`, layar terkunci di `AgendaSection.jsx`, `DonasiSection.jsx`, `UktSection.jsx`, semua `role === ROLES.EXAMINER` / `ROLES.ADMIN`
- Delete: `src/components/AdminCodeModal.jsx`, `src/components/RoleBanner.jsx`

**Interfaces:**
- Consumes: `supabase` (Task 2), tabel `profiles` (Task 3).
- Produces dari `useApp()`:
  - `ROLES = { PUBLIC: 'public', MEMBER: 'anggota', EXAMINER: 'penguji', ADMIN: 'admin' }`
  - `role` (salah satu nilai `ROLES`), `isStaff: boolean`, `isAdmin: boolean`, `currentUser: { id, name, email, role, belt, branch, regNumber, avatar } | null`, `authLoading: boolean`
  - `signIn(email, password) -> Promise<boolean>` (toast error "Email atau kata sandi salah" bila gagal), `signOut() -> Promise<void>` (menggantikan `handleLogin`/`handleLogout` upstream), `isLoginModalOpen`, `setIsLoginModalOpen` (nama upstream dipertahankan)
  - `refresh() -> Promise<void>`: memuat ulang semua list yang boleh dilihat peran saat ini
- `api.js`: `getProfile(userId) -> Profile`

- [ ] **Step 1:** `AppContext`: `supabase.auth.getSession()` saat mount + `onAuthStateChange`; ambil profil; `role = profile?.role ?? 'public'`. Hapus `USER_PROFILES`, `handleRoleChange`, `handleLogin`, `handleLogout`, `verifyAndUnlockExaminer`, `requestExaminerAccess`, `isAdminCodeModalOpen`, `handleUpdateTimeline`, seluruh mesin offline (`isOnline`, `isSimulatingOffline`, `offlineQueue`, `syncOfflineQueue`, `toggleOfflineSimulation`, listener `online/offline`) dan semua `localStorage` data. `checkAccess` dan `navigateToTab` digabung (audit no. 10): `navigateToTab` membuka login untuk tamu.
- [ ] **Step 2:** `LoginPage`: hapus tab "1-Klik Akses Cepat", tab "Input KTA", petunjuk "ketik admin", dan `handleManualSubmit`; sisakan satu form email + kata sandi yang memanggil `signIn` (tombol nonaktif + teks "Memproses..." selama menunggu). `Navbar`: hapus dropdown ganti peran; tamu melihat **Masuk Akun**, yang login melihat nama + badge peran + **Keluar**. `LockedFeatureModal` dan layar terkunci di Agenda/Donasi/UKT: tombol pilih peran diganti tombol **Masuk**. `UktSection`: hapus status bar koneksi, tombol simulasi, "Sinkronkan Sekarang", badge antrean, dan tombol "Penguji" yang memanggil `requestExaminerAccess`.
- [ ] **Step 3:** Ganti `role === ROLES.EXAMINER || role === ROLES.ADMIN` dan `role === ROLES.EXAMINER` → `isStaff` (Berita, Prestasi, Agenda, UKT, Edit Statistik) dan `role === ROLES.ADMIN` → `isAdmin` (Donasi: kelola program; VisiMisi: pilar, hero, tempat latihan).
- [ ] **Step 4: Verifikasi manual** dengan `npm run dev` + akun dari Task 5: tamu melihat tombol Masuk dan tab terkunci; login dengan sandi salah → toast error, tetap tamu; login anggota → badge Anggota, tidak ada tombol tambah berita; login admin → semua tombol termasuk CMS; Keluar → kembali tamu; reload tetap login; matikan internet lalu reload → tidak layar putih. `grep -rn "trident_candidates\|trident_role\|toggleOfflineSimulation\|handleRoleChange" src` → tidak ada hasil. `npm run build` sukses.
- [ ] **Step 5: Commit** — `feat(auth): real login, remove role simulation and admin code`.

---

### Task 7: Berita, prestasi, agenda + RSVP, statistik, CMS Visi-Misi

**Files:**
- Modify: `src/lib/api.js`, `src/context/AppContext.jsx`, `BeritaSection.jsx`, `PrestasiSection.jsx`, `AgendaSection.jsx`, `VisiMisiSection.jsx`; `src/data/mockData.js` (hapus `INITIAL_NEWS`, `INITIAL_ACHIEVEMENTS`, `INITIAL_AGENDAS`, `INITIAL_STATS`, `INITIAL_PILLARS`, `INITIAL_HERO_DATA`, `INITIAL_TRAINING_GROUNDS`)

**Interfaces:**
- Consumes: tabel Task 3, `refresh` Task 6.
- Produces di `api.js` (semua `throw` bila error; select memakai alias PostgREST supaya bentuk objek sama dengan mock lama, misalnya `imageUrl:image_url`, `date:created_at`):
  - `listNews()`, `addNews(input)`, `deleteNews(id)`
  - `listAchievements()`, `addAchievement(input)`, `deleteAchievement(id)`
  - `listAgendas()` → tiap agenda punya `attendees: [{ id, name, status }]` dari `agenda_rsvps_public` dan `myRsvp: { status, reason } | null`
  - `addAgenda(input)`, `deleteAgenda(id)`, `upsertRsvp(agendaId, status, reason)`
  - `getSiteStats()`, `updateSiteStats(patch)`
  - `getSiteContent() -> { heroData: { badge, titleMain, titleHighlight, subtitle }, bankName, bankAccount, bankHolder, qrisImageUrl }`, `updateSiteContent(patch)`
  - `listPillars()` (urut `sort_order`), `addPillar(input)`, `updatePillar(id, patch)`, `deletePillar(id)`
  - `listTrainingGrounds()` (bentuk sama dengan `INITIAL_TRAINING_GROUNDS` upstream: `trainerPhone`, `parentPR`, `facilities`, ...), `addTrainingGround(input)`, `updateTrainingGround(id, patch)`, `deleteTrainingGround(id)`
- `useApp()` tetap menyediakan nama upstream: `newsList, handleAddNews, achievementsList, handleAddAchievement, agendaList, handleAddAgenda, handleRsvp, stats, handleUpdateStats, heroData, handleUpdateHero, pillars, handleAddPillar, handleUpdatePillar, handleDeletePillar, trainingGrounds, handleAddTrainingGround, handleUpdateTrainingGround, handleDeleteTrainingGround, timeline` (dari `src/data/static.js`), ditambah `handleDeleteNews(id)`, `handleDeleteAchievement(id)`, `handleDeleteAgenda(id)`.

- [ ] **Step 1:** Tambah fungsi `api.js`; handler di context memanggilnya, menampilkan toast sukses/gagal, lalu memperbarui list. Tanggal: simpan `date` agenda sebagai `date` ISO dari input form; tampilkan dengan `toLocaleDateString('id-ID', ...)`.
- [ ] **Step 2:** Tombol **Hapus** (dengan `confirm()`) di kartu berita/prestasi/agenda untuk `isStaff`. Tampilan "Belum ada berita/prestasi/agenda" bila list kosong.
- [ ] **Step 3: Verifikasi manual:** penguji menambah dan menghapus berita → tampil di HP/browser lain setelah reload; tamu melihat berita, pilar, hero, dan tempat latihan tanpa login; anggota RSVP izin → anggota lain melihat namanya sebagai "izin" tanpa alasan; admin mengubah hero dan menambah tempat latihan dengan nomor `0812...` → tombol WhatsApp membuka `wa.me/62812...`; penguji bisa ubah statistik tapi tidak melihat tombol edit pilar/tempat latihan. `npm run build` sukses.
- [ ] **Step 4: Commit** — `feat: persist news, achievements, agenda, stats and Visi-Misi CMS`.

---

### Task 8: UKT terhubung ke database

**Files:**
- Modify: `src/lib/api.js`, `src/context/AppContext.jsx`, `src/components/UktSection.jsx`; `src/data/mockData.js` (hapus `INITIAL_CANDIDATES`)
- Test: `tests/rls.test.js` (upsert)

**Interfaces:**
- Consumes: `parseCandidatesCsv`, `buildCandidatesCsv`, `statusFromScore` (Task 1); tabel `ukt_candidates`.
- Produces di `api.js`:
  - `listCandidates() -> Candidate[]` dengan `Candidate = { id, regNumber, name, branch, currentBelt, targetBelt, photo, userId, posScores: { pos1: { score, sub }, ... }, finalScore, examinerNotes, examinerName, dateExam, structure: { pp, pw, pc, pac, pr, par } }` (bentuk `posScores` dan `structure` sama dengan mock upstream, dibangun dari `pos1..4` + `sub_scores` dan `struct_*`)
  - `saveCandidateScores(id, posScores, notes, { baseUpdatedAt, force = false }) -> Promise<'ok' | 'conflict'>` (tanpa `force`: `.update(...).eq('id', id).eq('updated_at', baseUpdatedAt).select('id')`, 0 baris → `'conflict'`; error jaringan → `throw`), `Candidate` juga punya `updatedAt`, `upsertCandidates(rows: CandidateInput[]) -> number` (`onConflict: 'reg_number'`; tidak pernah mengirim `user_id`), `deleteCandidate(id)`
- `useApp()`: `candidatesList`, `handleUpdateCandidateScores`, `handleImportCandidates` (toast memakai jumlah dari `upsertCandidates`), `handleDeleteCandidate(id)`, `myCandidate: Candidate | null` (baris dengan `userId === currentUser.id`).

- [ ] **Step 1: Tulis test yang gagal:** `upsert dua kali dengan reg_number sama → 1 baris, nilai terbaru` (sebagai penguji).
- [ ] **Step 2:** Implementasi. Tampilan anggota memakai `myCandidate`; bila null tampilkan "Anda belum terdaftar sebagai peserta UKT. Hubungi penguji." Skor akhir yang ditampilkan memakai `finalScore` dari database + `statusFromScore`. Ringkasan jumlah pujian/lulus/her dihitung sekali per peserta (audit no. 14). Opsi filter ranting = nilai unik `structure.pr` yang tidak kosong dari `candidatesList` (urut abjad), menggantikan 4 opsi tetap di kode; filter mencocokkan `structure.pr` persis. Bila simpan nilai gagal, toast error "Gagal menyimpan, periksa koneksi" dan modal nilai **tidak** ditutup.
- [ ] **Step 3: Jalankan** `npm run test:rls` dan `npm test` — Expected: PASS. Verifikasi manual: penguji impor template CSV, ubah nilai, ekspor; anggota dengan `reg_number` cocok melihat nilainya saja.
- [ ] **Step 4: Commit** — `feat(ukt): candidates and scores in database`.

---

### Task 8b: Penilaian UKT offline + sinkron otomatis

**Files:**
- Create: `src/lib/offline.js`, `tests/offline.test.js`
- Modify: `src/context/AppContext.jsx`, `src/components/UktSection.jsx`, `package.json` (tambah `tests/offline.test.js` ke script `test`)
- Test: `tests/rls.test.js` (bentrok)

**Interfaces:**
- Consumes: `saveCandidateScores`, `listCandidates`, `getProfile` (Task 6/8).
- Produces di `src/lib/offline.js` (fungsi murni + pembungkus `localStorage` dengan `try/catch`):
  - `QueueItem = { candidateId, candidateName, posScores, notes, baseUpdatedAt, savedAt }`
  - `enqueueScore(queue: QueueItem[], item: QueueItem) -> QueueItem[]` (item lama untuk `candidateId` sama diganti; `baseUpdatedAt` item lama **dipertahankan**)
  - `syncQueue(queue, save: (item) => Promise<'ok'|'conflict'>) -> Promise<{ remaining: QueueItem[], conflicts: QueueItem[], synced: number }>` (urut; `'ok'` → dibuang; `'conflict'` → ke `conflicts`, lanjut; `throw` → berhenti, item itu dan sisanya ke `remaining`)
  - `loadQueue()`, `saveQueue(q)`, `loadCache(key)`, `saveCache(key, value)`, `clearOfflineData()` dengan kunci `trident_offline_queue`, `trident_cache_candidates`, `trident_cache_profile`
- `useApp()`: `isOnline`, `offlineQueue`, `conflicts`, `syncNow() -> Promise<void>`, `resolveConflict(candidateId, 'mine' | 'server')`. `handleUpdateCandidateScores(candidateId, posScores, notes)` tetap namanya; sekarang: offline atau error jaringan → `enqueueScore` + toast "Disimpan di HP ini, dikirim saat sinyal kembali"; `'conflict'` saat online → masuk `conflicts`.

- [ ] **Step 1: Tulis test yang gagal** di `tests/offline.test.js`:

```js
test('simpan ulang peserta sama mengganti item, base lama dipertahankan', () => {
  let q = enqueueScore([], { candidateId: 'c1', posScores: 'A', baseUpdatedAt: 't0' });
  q = enqueueScore(q, { candidateId: 'c1', posScores: 'B', baseUpdatedAt: 't1' });
  assert.equal(q.length, 1);
  assert.equal(q[0].posScores, 'B');
  assert.equal(q[0].baseUpdatedAt, 't0');
});
test('sync: ok dibuang, conflict dipisah, error jaringan berhenti', async () => {
  const q = [{ candidateId: 'a' }, { candidateId: 'b' }, { candidateId: 'c' }, { candidateId: 'd' }];
  const res = { a: 'ok', b: 'conflict', c: 'throw', d: 'ok' };
  const r = await syncQueue(q, async (i) => { if (res[i.candidateId] === 'throw') throw new Error('net'); return res[i.candidateId]; });
  assert.equal(r.synced, 1);
  assert.deepEqual(r.conflicts.map((i) => i.candidateId), ['b']);
  assert.deepEqual(r.remaining.map((i) => i.candidateId), ['c', 'd']);
});
```

Dan di `tests/rls.test.js`: `saveCandidateScores dengan baseUpdatedAt lama → 'conflict', nilai server tidak berubah; dengan force → 'ok'` (sebagai penguji, setelah penguji kedua mengubah peserta).
- [ ] **Step 2: Jalankan** `npm test` dan `npm run test:rls` — Expected: test baru FAIL.
- [ ] **Step 3: Implementasi `src/lib/offline.js`** lalu sambungkan di `AppContext`: `isOnline` dari `navigator.onLine` + event `online`/`offline`; `syncNow` dipanggil saat `online`, saat app dibuka setelah login, dan dari tombol; satu sinkron berjalan pada satu waktu (flag `syncing` di `useRef`). Penguji/admin: setiap `listCandidates` yang berhasil → `saveCache('trident_cache_candidates')`; gagal → pakai cache. Profil login juga di-cache dan dipakai bila `getProfile` gagal karena offline. `signOut` dengan antrean tidak kosong → `confirm("Ada N nilai belum terkirim. Keluar dan buang?")`; setelah keluar → `clearOfflineData()`.
- [ ] **Step 4: `UktSection`:** status bar dengan teks jujur ("Online" / "Offline: nilai disimpan di HP ini dan dikirim saat sinyal kembali"), badge jumlah antrean, tombol **Sinkronkan Sekarang** (aktif bila online dan antrean > 0). Panel **Nilai bentrok**: per item tampilkan nama, skor akhir milik penguji vs server, tombol **Pakai nilai saya** (`force`) dan **Pakai nilai server** (buang). Modal nilai selalu tertutup setelah Simpan (nilai sudah aman di server atau antrean).
- [ ] **Step 5: Jalankan** `npm test`, `npm run test:rls` — Expected: PASS. Verifikasi manual di APK (`npm run android` + build): login penguji online → mode pesawat → tutup dan buka app → daftar peserta tampil, nilai 2 peserta → badge "2" → matikan mode pesawat → toast "2 nilai terkirim", badge hilang, nilai terlihat dari HP lain. Bentrok: HP A offline menilai peserta X, HP B online mengubah X, HP A online → X muncul di panel bentrok.
- [ ] **Step 6: Commit** — `feat(ukt): offline scoring queue with conflict detection`.

---

### Task 9: Donasi dengan bukti transfer dan verifikasi

**Files:**
- Create: `src/components/DonasiVerifikasi.jsx`
- Modify: `src/lib/api.js`, `src/context/AppContext.jsx`, `src/components/DonasiSection.jsx`, `src/components/ReceiptModal.jsx`, `src/components/Navbar.jsx` (tab/badge "Verifikasi" untuk admin); `src/data/mockData.js` (hapus `INITIAL_CAMPAIGNS`)

**Interfaces:**
- Consumes: `campaigns`, `campaign_totals`, `public_donations`, `donations`, bucket `donation-proofs`, `getSiteContent`/`updateSiteContent` (Task 7, untuk bank/QRIS).
- Produces di `api.js`:
  - `listCampaigns() -> [{ id, title, category, targetAmount, deadline, description, collectedAmount, donorsCount, recentDonations }]` (`recentDonations` = 5 terbaru dari `public_donations`)
  - `addCampaign(input)`, `updateCampaign(id, patch)`, `deleteCampaign(id)` (gagal dengan pesan jelas bila sudah ada donasi)
  - `submitDonation({ campaignId, amount, donorName, message, paymentMethod, proofFile }) -> Donation` (upload dulu ke `<uid>/<crypto.randomUUID()>.<ext>`, lalu insert; hapus file bila insert gagal)
  - `listMyDonations()`, `listPendingDonations()` (admin, dengan `signedProofUrl` dari `createSignedUrl(path, 600)`), `setDonationStatus(id, 'accepted'|'rejected')` (set `verified_by`, `verified_at`)
- `useApp()`: `campaignList`, `handleAddCampaign`, `handleDonate` (sekarang menerima `proofFile`; toast "Donasi terkirim, menunggu verifikasi admin"; **tidak** membuka resi), `myDonations`, `pendingDonations`, `handleVerifyDonation(id, status)`, `siteContent`, `handleUpdateSiteContent(patch)` (juga dipakai `handleUpdateHero`).

- [ ] **Step 1:** Alur donasi: pilih nominal (bilangan bulat ≥ 1.000) → tampilkan `bank_name/bank_account/bank_holder` + gambar `qris_image_url` dari `siteContent` (bila kosong: "Info pembayaran belum diatur admin", tombol kirim nonaktif) → pilih foto bukti (jpeg/png/webp, ≤ 5 MB, dicek di klien juga) → Kirim.
- [ ] **Step 2:** Bagian "Donasi Saya" dengan status (Menunggu / Diterima / Ditolak); tombol **Resi** hanya untuk `accepted` (`ReceiptModal` memakai `refNumber`, `donorName`, `campaignTitle`, `amount`, `created_at`).
- [ ] **Step 3:** `DonasiVerifikasi` (admin): daftar pending, gambar bukti, tombol Terima/Tolak; form info rekening/QRIS (`handleUpdateSiteContent`). Di `DonasiSection`, admin mendapat tombol **Ubah** (form yang sama dengan buat program, memanggil `updateCampaign`) dan **Hapus** per program.
- [ ] **Step 4: Verifikasi manual:** anggota berdonasi → dana terkumpul tidak berubah → admin Terima → dana dan donatur bertambah, resi tersedia untuk anggota; unggah PDF ditolak. `npm run test:rls` tetap PASS, `npm run build` sukses.
- [ ] **Step 5: Commit** — `feat(donasi): proof upload and admin verification`.

---

### Task 10: Halaman Kelola Akun (admin)

**Files:**
- Create: `src/components/AkunSection.jsx`
- Modify: `src/App.jsx` (tab `akun`), `src/components/Navbar.jsx` (menu "Kelola Akun" hanya `isAdmin`), `src/context/AppContext.jsx` (`navigateToTab('akun')` hanya admin), `src/lib/api.js`

**Interfaces:**
- Consumes: Edge Function `manage-user` (Task 5).
- Produces di `api.js`: `listUsers()`, `createUser(input)`, `resetPassword(userId, password)`, `setUserActive(userId, active)`, `updateUserProfile(userId, patch)` — masing-masing `supabase.functions.invoke('manage-user', { body: { action, ... } })` dan `throw` dengan pesan dari server bila error.

- [ ] **Step 1:** Tabel akun (nama, email, peran, sabuk, cabang, no. registrasi, aktif) + pencarian; form "Tambah Akun" (email, sandi awal min 8, nama, peran, sabuk dari daftar 6 tingkatan, cabang, no. registrasi); aksi per baris: Ubah, Reset Sandi, Nonaktifkan/Aktifkan.
- [ ] **Step 2: Verifikasi manual:** admin membuat akun anggota dengan `reg_number` peserta yang sudah ada → anggota login dan langsung melihat nilainya; nonaktifkan → anggota tidak bisa login. `npm run build` sukses.
- [ ] **Step 3: Commit** — `feat(akun): admin account management page`.

---

### Task 11: Backup manual, bersih-bersih, README, APK

**Files:**
- Create: `scripts/backup.mjs`
- Modify: `package.json` (`"backup": "node --env-file=.env.local scripts/backup.mjs"`), `README.md`; hapus `src/data/mockData.js` (isi yang masih dipakai sudah di `src/data/static.js` sejak Task 6)

**Interfaces:**
- `scripts/backup.mjs`: membuat `backups/<YYYY-MM-DD>/`; menjalankan `npx supabase db dump --db-url $SUPABASE_DB_URL -f schema.sql` dan `... --data-only -f data.sql`; mengunduh semua objek bucket `donation-proofs` (service role, rekursif per folder) ke `backups/<tanggal>/donation-proofs/`. Keluar dengan kode ≠ 0 dan pesan jelas bila ada langkah gagal.

- [ ] **Step 1:** Tulis skrip; jalankan `npm run backup` — Expected: folder berisi `schema.sql`, `data.sql` (ada `INSERT`/`COPY` untuk `profiles`), dan file bukti.
- [ ] **Step 2:** README bagian "Backend Supabase": setup `.env.local`, `npx supabase db push`, `npx supabase functions deploy manage-user`, membuat admin pertama (dashboard → Authentication → Add user, lalu SQL `insert into profiles (id, full_name, role) values ('<id>', '<nama>', 'admin')`), `npm run backup` sebulan sekali, cara **Restore** proyek yang berhenti, build ulang APK (`npm run android` lalu `gradlew.bat assembleDebug`; variabel `VITE_` ikut ter-build).
- [ ] **Step 3:** `grep -rnE "mockData|handleRoleChange|toggleOfflineSimulation|ROLES\.EXAMINER \|\|" src` dan `grep -rln localStorage src` — Expected: grep pertama kosong; grep kedua hanya `src/lib/offline.js`. `npm test`, `npm run test:rls`, `npm run build`, `npm run android` — Expected: semua sukses.
- [ ] **Step 4: Commit** — `chore: manual backup script, docs, remove mock data`.
