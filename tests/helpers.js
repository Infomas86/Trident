import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
export const RUN = Date.now(); // unik per run, supaya sisa run yang crash tidak mengganggu
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, opts);
export const adminClient = () => admin;

export async function createTestUser(role, extra = {}) {
  const email = `u${RUN}-${Math.random().toString(36).slice(2, 8)}@test.trident.local`;
  const password = `Pw-${Math.random().toString(36).slice(2)}A1`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const id = data.user.id;
  const { error: pe } = await admin.from('profiles').insert({ id, full_name: 'Uji ' + role, role, ...extra });
  if (pe) throw pe;
  const client = createClient(url, process.env.VITE_SUPABASE_ANON_KEY, opts);
  const { error: se } = await client.auth.signInWithPassword({ email, password });
  if (se) throw se;
  return { id, email, password, client };
}

// Hapus semua data uji (semua run): donasi -> kampanye -> peserta -> user (profil ikut cascade).
export async function cleanup() {
  await admin.from('donations').delete().like('donor_name', 'T-%');
  await admin.from('campaigns').delete().like('title', 'T-%');
  await admin.from('ukt_candidates').delete().like('reg_number', 'T-%');
  for (let page = 1; ; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const users = data?.users ?? [];
    for (const u of users) if (u.email?.endsWith('@test.trident.local')) await admin.auth.admin.deleteUser(u.id);
    if (users.length < 200) break;
  }
}
