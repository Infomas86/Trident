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
