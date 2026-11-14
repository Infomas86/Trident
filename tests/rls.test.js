import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { adminClient, createTestUser, cleanup, RUN } from './helpers.js';

const admin = adminClient();
before(cleanup);
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
  await admin.from('profiles').update({ reg_number: null }).eq('id', a.id);
  await admin.from('profiles').update({ reg_number: reg }).eq('id', b.id);
  const { data: c } = await admin.from('ukt_candidates').select('user_id').eq('reg_number', reg).single();
  assert.equal(c.user_id, b.id);
});

test('campaign_totals hanya menghitung donasi accepted', async () => {
  const { data: camp, error } = await admin.from('campaigns').insert({ title: `T-camp-${RUN}`, target_amount: 1000000 }).select('id').single();
  assert.ifError(error);
  const base = { campaign_id: camp.id, donor_name: `T-donor-${RUN}`, proof_path: 'dummy/path.jpg' };
  const r = await admin.from('donations').insert([{ ...base, amount: 100000 }, { ...base, amount: 50000 }]).select('id');
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
  const { data: p } = await admin.from('pillars').select('icon').order('sort_order');
  assert.deepEqual(p.map((x) => x.icon), ['Shield', 'Zap', 'Users', 'Award']);
});
