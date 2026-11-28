import test from 'node:test';
import assert from 'node:assert/strict';
import { withoutUser, enqueuePredikat, removePredikatItem } from '../src/lib/offline.js';

const item = (o = {}) => ({ userId: 'u1', candidateId: 'c1', materi: 'jurus', grade: 'A', ...o });

test('withoutUser membuang hanya item satu pengguna', () => {
  const q = [item(), item({ userId: 'u2' })];
  assert.deepEqual(withoutUser(q, 'u1'), [item({ userId: 'u2' })]);
});

test('enqueuePredikat: ketuk ulang materi yang sama menimpa item lama, bukan menambah', () => {
  const q = enqueuePredikat([item({ grade: 'A' })], item({ grade: 'C' }));
  assert.equal(q.length, 1);
  assert.equal(q[0].grade, 'C');
});

test('enqueuePredikat: materi/peserta/pengguna berbeda tidak saling menimpa', () => {
  let q = enqueuePredikat([], item());
  q = enqueuePredikat(q, item({ materi: 'tarung' }));
  q = enqueuePredikat(q, item({ candidateId: 'c2' }));
  q = enqueuePredikat(q, item({ userId: 'u2' }));
  assert.equal(q.length, 4);
});

test('removePredikatItem membuang tepat satu item (kunci peserta+materi+pengguna)', () => {
  const q = [item(), item({ materi: 'tarung' }), item({ userId: 'u2' })];
  assert.equal(removePredikatItem(q, item()).length, 2);
  assert.ok(removePredikatItem(q, item()).every((i) => !(i.userId === 'u1' && i.materi === 'jurus')));
});
