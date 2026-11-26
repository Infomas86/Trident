// Rubrik penilaian UKT resmi: materi berbeda per tingkat, predikat huruf per materi (tanpa angka).
// Murni (tanpa React/DOM) agar bisa diuji. Isi materi disalin dari lembar nilai resmi PAC.
// Pecah teks CSV jadi record { cols, line }; menangani kutip, "" dan baris baru dalam kutip.
// Dipindah dari lib/ukt.js (sudah dihapus - modul lama tanpa pemakai lain, hanya splitCsv yang
// masih dibutuhkan).
function splitCsv(text) {
  const records = [];
  let cols = [], cur = '', inQ = false, line = 1, start = 1;
  const endRecord = () => {
    cols.push(cur);
    if (cols.length > 1 || cols[0].trim() !== '') records.push({ cols, line: start });
    cols = []; cur = '';
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else { if (ch === '\n') line++; cur += ch; }
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { cols.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRecord(); line++; start = line;
    } else cur += ch;
  }
  endRecord();
  return records;
}

export const GRADES = ['A', 'B', 'C', 'D', 'E'];

const FISIK = { no: 'I', judul: 'FISIK', sub: [] };
const materi = (teknik, jurus, pagarnusa) => [
  FISIK,
  { no: 'II', ...teknik },
  { no: 'III', ...jurus },
  { no: 'IV', ...pagarnusa },
];

export const TEMPLATE = [
  {
    dari: 'Strip Putih', ke: 'Strip Kuning', warnaKe: '#F9C80E', jenis: 'UKT',
    materi: materi(
      { judul: 'Teknik Dasar 1 Gerakan', sub: ['Kuda-kuda', 'Pukulan', 'Tendangan', 'Tangkisan', 'Langkah Dua'] },
      { judul: 'Jurus', sub: [] },
      { judul: 'Ke-Pagar Nusa-an', sub: ['Prasetya Pagar Nusa', 'Arti Lambang Pagar Nusa'] },
    ),
  },
  {
    dari: 'Strip Kuning', ke: 'Strip Merah', warnaKe: '#D32F2F', jenis: 'UKT',
    materi: materi(
      { judul: 'Teknik Dasar Kombinasi 2 Gerakan', sub: ['Kuda-kuda', 'Langkah & Geseran (Egos)', 'Pukulan', 'Tendangan', 'Tangkisan', 'Tangkapan Bantingan'] },
      { judul: 'Jurus', sub: ['Langkah 17', 'Salam NU', 'Jurus Tunggal'] },
      { judul: 'Ke-Pagar Nusa-an', sub: ['Prasetya Pagar Nusa', 'Sejarah Singkat Pagar Nusa'] },
    ),
  },
  {
    dari: 'Strip Merah', ke: 'Strip Biru', warnaKe: '#1E5BD8', jenis: 'UKT',
    materi: materi(
      { judul: 'Teknik Dasar Kombinasi 3 Gerakan', sub: ['Kuda-kuda', 'Langkah & Geseran (Egos)', 'Pukulan', 'Tendangan', 'Tangkisan', 'Tangkapan Bantingan', 'Sapuan'] },
      { judul: 'Jurus', sub: ['Buka Gelanggang', 'Jurus Wudlu', 'Jurus Tunggal Golok'] },
      { judul: 'Ke-Pagar Nusa-an', sub: ['Sejarah Singkat Pagar Nusa', 'Pengenalan Amaliyah NU'] },
    ),
  },
  {
    dari: 'Strip Biru', ke: 'Strip Cokelat', warnaKe: '#7B4A2E', jenis: 'UKT',
    materi: materi(
      { judul: 'Teknik Dasar Kombinasi 4 Gerakan', sub: ['Kuda-kuda', 'Langkah & Geseran (Egos)', 'Pukulan', 'Tendangan', 'Tangkisan', 'Tangkapan Bantingan', 'Sapuan', 'Guntingan & Kempitan'] },
      { judul: 'Jurus', sub: ['Jurus Paket 1A', 'Jurus Paket 1B', 'Jurus Tunggal Toya'] },
      { judul: 'Ke-Pagar Nusa-an', sub: ['Penghafalan Amaliyah Dzikir Sholat'] },
    ),
  },
  {
    dari: 'Strip Cokelat', ke: 'Strip Hitam', warnaKe: '#151515', jenis: 'Pendadaran',
    materi: materi(
      { judul: 'Teknik Dasar Kombinasi 4 Gerakan', sub: ['Kuda-kuda', 'Langkah & Geseran (Egos)', 'Tendangan & Pukulan', 'Tangkisan, Tangkapan Bantingan', 'Sapuan', 'Guntingan & Kempitan'] },
      { judul: 'Jurus', sub: ['Jurus Paket 1A', 'Jurus Paket 1B', 'Jurus Beregu 1-5'] },
      { judul: 'Ke-Pagar Nusa-an', sub: ['Penghafalan Amaliyah Tahlil'] },
    ),
  },
];

const TARGET_WORDS = [['kuning'], ['merah'], ['biru'], ['cokelat', 'coklat'], ['hitam']];
const CURRENT_WORDS = [['putih'], ['kuning'], ['merah'], ['biru'], ['cokelat', 'coklat']];
// Kata utuh (bukan substring), dan kemunculan PALING AWAL di teks yang menang - bukan urutan daftar
// warna di atas. Tanpa ini, "Strip Biru (dari Merah)" salah terbaca Merah karena merah dicek duluan.
const find = (words, text) => {
  let bestIdx = -1;
  let bestPos = Infinity;
  words.forEach((ws, i) => {
    ws.forEach((w) => {
      const m = new RegExp(`\\b${w}\\b`).exec(text);
      if (m && m.index < bestPos) { bestPos = m.index; bestIdx = i; }
    });
  });
  return bestIdx;
};

// Tingkat dikenali dari sabuk target ("Strip Merah" -> 1); bila tak dikenali, dari sabuk saat ini. -1 = tidak dikenali.
export function templateIndex(targetBelt = '', currentBelt = '') {
  const t = find(TARGET_WORDS, String(targetBelt).toLowerCase());
  return t >= 0 ? t : find(CURRENT_WORDS, String(currentBelt).toLowerCase());
}

export const templateFor = (c) => TEMPLATE[templateIndex(c.targetBelt, c.currentBelt)] ?? null;

// Berapa materi yang sudah diberi predikat.
export function gradedCount(c) {
  const tpl = templateFor(c);
  if (!tpl) return { done: 0, total: 0 };
  return { done: tpl.materi.filter((m) => c.predikat?.[m.no]).length, total: tpl.materi.length };
}

// ---- Impor / ekspor CSV peserta (tanpa nilai: nilai diisi penguji di aplikasi) ----
export const IMPORT_HEADER = 'N.I.A,Nama Peserta,Ranting,Sabuk Saat Ini,Sabuk Target';
export const IMPORT_SAMPLE = `${IMPORT_HEADER}
"PNKB-2026-0001","Ahmad Imam Wahyudi","Ranting Sei Beduk","Strip Putih","Strip Kuning"
"PNKB-2026-0002","Rizki Pratama","Ranting Duriangkang","Strip Biru","Strip Cokelat"`;

export function parseRubrikCsv(text) {
  const rows = [];
  const errors = [];
  for (const { cols: raw, line } of splitCsv(String(text || '').replace(/^﻿/, '')).slice(1)) {
    const c = raw.map((v) => v.trim());
    const bad = [];
    if (!c[0]) bad.push('N.I.A wajib diisi');
    if (!c[1]) bad.push('Nama Peserta wajib diisi');
    if (templateIndex(c[4], c[3]) < 0) bad.push('Sabuk Target tidak dikenali (pakai Strip Kuning, Merah, Biru, Cokelat, atau Hitam)');
    if (bad.length) { errors.push(`baris ${line}: ${bad.join(', ')}`); continue; }
    rows.push({ regNumber: c[0], name: c[1], branch: c[2] ?? '', currentBelt: c[3] ?? '', targetBelt: c[4] ?? '' });
  }
  // Semua-atau-tidak-sama-sekali: satu error membatalkan seluruh impor.
  return errors.length ? { rows: [], errors } : { rows, errors };
}

// Nama peserta diisi bebas oleh pendaftar: awalan = + - @ diberi tanda kutip agar tidak jadi rumus di Excel.
const q = (v) => {
  const s = String(v ?? '');
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export function buildRubrikCsv(candidates) {
  const head = `${IMPORT_HEADER},I,II,III,IV`;
  const rows = candidates.map((c) => [
    q(c.regNumber), q(c.name), q(c.branch), q(c.currentBelt), q(c.targetBelt),
    ...['I', 'II', 'III', 'IV'].map((no) => q(c.predikat?.[no] ?? '')),
  ].join(','));
  return [head, ...rows].join('\n');
}
