import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
export const RUN = Date.now(); // unik per run; semua data uji memakai akhiran -${RUN}
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, opts);
export const adminClient = () => admin;
export const anonClient = () => createClient(url, process.env.VITE_SUPABASE_ANON_KEY, opts);

export async function createTestUser(role, extra = {}) {
  const email = `u${RUN}-${Math.random().toString(36).slice(2, 8)}@test.trident.local`;
  const password = `Pw-${Math.random().toString(36).slice(2)}A1`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const id = data.user.id;
  const { error: pe } = await admin.from('profiles').upsert({ id, full_name: 'Uji ' + role, role, ...extra }, { onConflict: 'id' });
  if (pe) throw pe;
  const client = anonClient();
  const { error: se } = await client.auth.signInWithPassword({ email, password });
  if (se) throw se;
  return { id, email, password, client };
}

const check = ({ error }) => { if (error) throw error; };

// Hapus data uji run ini saja (project ini dipakai produksi): urutan mengikuti foreign key.
export async function cleanup() {
  const like = `T-%-${RUN}`;
  check(await admin.from('donations').delete().like('donor_name', like));
  check(await admin.from('campaigns').delete().like('title', like));
  check(await admin.from('agendas').delete().like('title', like)); // rsvp ikut cascade
  check(await admin.from('news').delete().like('title', like));
  check(await admin.from('pillars').delete().like('title', like)); // hanya ada bila policy bocor
  check(await admin.from('training_grounds').delete().like('name', like));
  check(await admin.from('ukt_candidates').delete().like('reg_number', like));
  check(await admin.from('ukt_events').delete().like('name', like)); // cascades to candidates/examiners
  const ids = []; // kumpulkan dulu, supaya hapus tidak menggeser halaman
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) if (u.email?.startsWith(`u${RUN}-`)) ids.push(u.id);
    if (data.users.length < 200) break;
  }
  for (const id of ids) {
    const { data: files, error: le } = await admin.storage.from('donation-proofs').list(id);
    if (le && !/not found/i.test(le.message)) throw le; // bucket belum ada sebelum migrasi RLS
    if (files?.length) check(await admin.storage.from('donation-proofs').remove(files.map((f) => `${id}/${f.name}`)));
    const { error: de } = await admin.auth.admin.deleteUser(id);
    if (de) throw de;
  }
}
