// Logika UKT murni (tanpa React/DOM) agar bisa diuji.
// Skor Akhir = Pos1*0.25 + Pos2*0.30 + Pos3*0.20 + Pos4*0.25

export function statusFromScore(score) {
  if (score >= 85.0) {
    return { status: 'LULUS DENGAN PUJIAN', statusColor: 'text-amber-400 bg-amber-950/40 border-amber-500/50', badgeVariant: 'cumlaude' };
  }
  if (score >= 70.0) {
    return { status: 'LULUS', statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-600/50', badgeVariant: 'pass' };
  }
  return { status: 'PERLU HER / TUNDA', statusColor: 'text-rose-400 bg-rose-950/40 border-rose-700/50', badgeVariant: 'her' };
}

export function calculateUktScore(pos1, pos2, pos3, pos4) {
  const total = (Number(pos1) || 0) * 0.25 + (Number(pos2) || 0) * 0.30 + (Number(pos3) || 0) * 0.20 + (Number(pos4) || 0) * 0.25;
  const score = Math.round(total * 10) / 10;
  return { score, ...statusFromScore(score) };
}

const HEADERS = [
  'No Registrasi', 'Nama Peserta', 'Cabang Padepokan', 'Sabuk Saat Ini', 'Sabuk Target',
  'Pos 1 Fisik (25%)', 'Pos 2 Jurus (30%)', 'Pos 3 Etika (20%)', 'Pos 4 Sabung (25%)',
  'Skor Akhir', 'Status Kelulusan', 'Catatan Penguji',
  'PP', 'PW', 'PC', 'PAC', 'PR', 'PAR',
];
const STRUCT_KEYS = ['pp', 'pw', 'pc', 'pac', 'pr', 'par'];

const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function buildCandidatesCsv(candidates) {
  const rows = candidates.map((c) => {
    const res = calculateUktScore(c.pos1, c.pos2, c.pos3, c.pos4);
    const s = c.structure || {};
    return [
      q(c.regNumber), q(c.name), q(c.branch), q(c.currentBelt), q(c.targetBelt),
      c.pos1, c.pos2, c.pos3, c.pos4,
      res.score.toFixed(1), q(res.status), q(c.examinerNotes),
      ...STRUCT_KEYS.map((k) => q(s[k])),
    ].join(',');
  });
  return [HEADERS.join(','), ...rows].join('\n');
}

// Pecah teks CSV jadi record { cols, line }; menangani kutip, "" dan baris baru dalam kutip.
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

export function parseCandidatesCsv(text) {
  const rows = [];
  const errors = [];
  for (const { cols: raw, line } of splitCsv(String(text || '').replace(/^\uFEFF/, '')).slice(1)) {
    const c = raw.map((v) => v.trim());
    const bad = [];
    if (!c[0]) bad.push('No Registrasi wajib diisi');
    if (!c[1]) bad.push('Nama Peserta wajib diisi');
    const pos = [5, 6, 7, 8].map((i) => {
      const v = c[i] ?? '';
      const n = v !== '' ? Number(v) : NaN;
      if (!Number.isFinite(n) || n < 0 || n > 100) bad.push(`nilai Pos ${i - 4} harus angka 0-100`);
      return n;
    });
    if (bad.length) { errors.push(`baris ${line}: ${bad.join(', ')}`); continue; }
    rows.push({
      regNumber: c[0], name: c[1], branch: c[2] ?? '', currentBelt: c[3] ?? '', targetBelt: c[4] ?? '',
      pos1: pos[0], pos2: pos[1], pos3: pos[2], pos4: pos[3],
      examinerNotes: c[11] ?? '',
      structure: Object.fromEntries(STRUCT_KEYS.map((k, j) => [k, c[12 + j] ?? ''])),
    });
  }
  // Semua-atau-tidak-sama-sekali: satu error membatalkan seluruh impor.
  return errors.length ? { rows: [], errors } : { rows, errors };
}
