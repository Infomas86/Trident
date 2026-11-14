import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waNumber } from '../src/lib/phone.js';

test('nomor WhatsApp', () => {
  assert.equal(waNumber('0812-7721-9988'), '6281277219988');
  assert.equal(waNumber('+62 812-7721-9988'), '6281277219988');
  assert.equal(waNumber(''), '');
});
