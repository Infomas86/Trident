import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueScore, enqueueForUser, withoutUser, syncQueue } from '../src/lib/offline.js';

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
