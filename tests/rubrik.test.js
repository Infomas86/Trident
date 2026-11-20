import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TEMPLATE, GRADES, templateIndex, templateFor, gradedCount, parseRubrikCsv, buildRubrikCsv, IMPORT_SAMPLE,
} from '../src/lib/rubrik.js';

test('lima tingkat, tiap tingkat 4 materi I-IV, hanya Cokelat->Hitam yang Pendadaran', () => {
  assert.equal(TEMPLATE.length, 5);
  for (const t of TEMPLATE) assert.deepEqual(t.materi.map((m) => m.no), ['I', 'II', 'III', 'IV']);
  assert.deepEqual(TEMPLATE.map((t) => t.jenis), ['UKT', 'UKT', 'UKT', 'UKT', 'Pendadaran']);
  assert.deepEqual(GRADES, ['A', 'B', 'C', 'D', 'E']);
});

test('tingkat dikenali dari sabuk target, ejaan coklat/cokelat sama', () => {
  assert.equal(templateIndex('Strip Kuning', 'Strip Putih'), 0);
  assert.equal(templateIndex('strip MERAH', ''), 1);
  assert.equal(templateIndex('Strip Biru'), 2);
  assert.equal(templateIndex('Strip Cokelat'), 3);
  assert.equal(templateIndex('Strip Coklat'), 3);
  assert.equal(templateIndex('Strip Hitam', 'Strip Cokelat'), 4);
});

test('sabuk target tak dikenali memakai sabuk saat ini; keduanya tak dikenali = -1', () => {
  assert.equal(templateIndex('', 'Strip Biru'), 3);
  assert.equal(templateIndex('Sabuk Hijau (Tingkat 2)', 'Sabuk Ungu'), -1);
  assert.equal(templateFor({ targetBelt: 'x', currentBelt: 'y' }), null);
});

test('isi materi sesuai lembar resmi: Biru punya Toya, Cokelat punya Beregu', () => {
  assert.ok(TEMPLATE[3].materi[2].sub.includes('Jurus Tunggal Toya'));
  assert.ok(TEMPLATE[4].materi[2].sub.includes('Jurus Beregu 1-5'));
  assert.deepEqual(TEMPLATE[0].materi[1].sub, ['Kuda-kuda', 'Pukulan', 'Tendangan', 'Tangkisan', 'Langkah Dua']);
});

test('progres: hitung materi yang sudah berpredikat', () => {
  const c = { targetBelt: 'Strip Kuning', currentBelt: '', predikat: { I: 'B', III: 'A' } };
  assert.deepEqual(gradedCount(c), { done: 2, total: 4 });
  assert.deepEqual(gradedCount({ ...c, predikat: {} }), { done: 0, total: 4 });
  assert.deepEqual(gradedCount({ targetBelt: 'x', currentBelt: 'y' }), { done: 0, total: 0 });
});

test('impor CSV: contoh bawaan valid, tanpa kolom nilai', () => {
  const { rows, errors } = parseRubrikCsv(IMPORT_SAMPLE);
  assert.deepEqual(errors, []);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    regNumber: 'PNKB-2026-0001', name: 'Ahmad Imam Wahyudi', branch: 'Ranting Sei Beduk',
    currentBelt: 'Strip Putih', targetBelt: 'Strip Kuning',
  });
});

test('impor CSV: satu baris salah membatalkan semuanya, pesan memuat nomor baris', () => {
  const csv = `${IMPORT_SAMPLE}\n"","Tanpa Nomor","R","Strip Putih","Strip Kuning"\n"X-1","Sabuk Aneh","R","a","b"`;
  const { rows, errors } = parseRubrikCsv(csv);
  assert.equal(rows.length, 0);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /baris 4.*No Registrasi/);
  assert.match(errors[1], /baris 5.*Sabuk Target/);
});

test('ekspor CSV memuat predikat; nama berawalan rumus diberi kutip agar aman di Excel', () => {
  const csv = buildRubrikCsv([
    { regNumber: 'A-1', name: '=HYPERLINK("x")', branch: 'R', currentBelt: 'Strip Putih', targetBelt: 'Strip Kuning', predikat: { I: 'B', II: 'A' } },
  ]);
  const [head, row] = csv.split('\n');
  assert.equal(head, 'No Registrasi,Nama Peserta,Ranting,Sabuk Saat Ini,Sabuk Target,I,II,III,IV');
  assert.ok(row.includes(`"'=HYPERLINK(""x"")"`), row);
  assert.ok(row.endsWith(',"B","A","",""'));
});
