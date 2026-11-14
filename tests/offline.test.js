import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueScore, enqueueForUser, withoutUser, syncQueue, overlayQueued, mineScores } from '../src/lib/offline.js';

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
test('sync online: error per item disimpan sebagai failed, sisanya tetap terkirim', async () => {
  const q = [{ candidateId: 'a' }, { candidateId: 'b' }, { candidateId: 'c' }];
  const r = await syncQueue(q, async (i) => { if (i.candidateId === 'b') throw new Error('ditolak'); return 'ok'; }, { online: () => true });
  assert.equal(r.synced, 2);
  assert.deepEqual(r.remaining.map((i) => [i.candidateId, i.failed]), [['b', 'ditolak']]);
});
test('enqueueForUser: item pengguna lain utuh, tanpa duplikat, base lama dipertahankan', () => {
  const q0 = [{ userId: 'u', candidateId: 'Y', baseUpdatedAt: 'y0' }, { userId: 'o', candidateId: 'Z', baseUpdatedAt: 'z0' }];
  const q1 = enqueueForUser(q0, 'u', { userId: 'u', candidateId: 'X', baseUpdatedAt: 'x0' });
  assert.deepEqual(q1.map((i) => i.candidateId).sort(), ['X', 'Y', 'Z']);
  const q2 = enqueueForUser(q1, 'u', { userId: 'u', candidateId: 'Y', baseUpdatedAt: 'y9', posScores: 'new' });
  assert.equal(q2.length, 3);
  const y = q2.find((i) => i.candidateId === 'Y');
  assert.equal(y.baseUpdatedAt, 'y0');
  assert.equal(y.posScores, 'new');
});
test('withoutUser membuang hanya item satu pengguna', () => {
  assert.deepEqual(withoutUser([{ userId: 'a' }, { userId: 'b' }], 'a'), [{ userId: 'b' }]);
});

test('overlayQueued: nilai & catatan antrean saya menimpa data server, updatedAt tetap', () => {
  const cands = [{ id: 'c1', posScores: 'srv', examinerNotes: 's', updatedAt: 't0' }, { id: 'c2', posScores: 'srv2' }];
  const out = overlayQueued(cands, [{ candidateId: 'c1', posScores: 'mine', notes: 'n' }]);
  assert.deepEqual(out[0], { id: 'c1', posScores: 'mine', examinerNotes: 'n', updatedAt: 't0' });
  assert.equal(out[1], cands[1]);
});
test('enqueueScore menggabung posKeys; null (evaluasi penuh) menang', () => {
  let q = enqueueScore([], { candidateId: 'c', posKeys: ['pos1'] });
  q = enqueueScore(q, { candidateId: 'c', posKeys: ['pos2'] });
  assert.deepEqual(q[0].posKeys, ['pos1', 'pos2']);
  q = enqueueScore(q, { candidateId: 'c', posKeys: null });
  assert.equal(q[0].posKeys, null);
  q = enqueueScore(q, { candidateId: 'c', posKeys: ['pos3'] });
  assert.equal(q[0].posKeys, null);
});
test('mineScores: pos milik saya saja yang diganti di baris terbaru; evaluasi penuh pakai semua nilai saya', () => {
  const fresh = { posScores: { pos1: { score: 1 }, pos2: { score: 2 }, pos3: { score: 3 }, pos4: { score: 4 } } };
  const mine = { pos1: { score: 10 }, pos2: { score: 20 }, pos3: { score: 30 }, pos4: { score: 40 } };
  assert.deepEqual(mineScores(fresh, { posKeys: ['pos2'], posScores: mine }), { ...fresh.posScores, pos2: { score: 20 } });
  assert.equal(mineScores(fresh, { posKeys: null, posScores: mine }), mine);
});
