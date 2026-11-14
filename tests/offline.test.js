import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueScore, syncQueue } from '../src/lib/offline.js';

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
