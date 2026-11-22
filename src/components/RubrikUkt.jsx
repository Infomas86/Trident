import React, { useState } from 'react';
import { Search, X, FileText, Trash2 } from 'lucide-react';
import { TEMPLATE, GRADES, templateIndex, gradedCount } from '../lib/rubrik';
import SertifikatUkt from './SertifikatUkt';

const tingkatLabel = (ti, short = true) => {
  if (ti < 0) return 'Tingkat tak dikenali';
  const t = TEMPLATE[ti];
  return short ? `${t.dari.replace('Strip ', '')} → ${t.ke.replace('Strip ', '')}` : `${t.dari} → ${t.ke}`;
};

function Progress({ c }) {
  const { done, total } = gradedCount(c);
  const [cls, label] =
    total === 0 ? ['bg-rose-50 text-rose-600', 'Sabuk?']
    : done === total ? ['bg-emerald-50 text-emerald-700', 'Lengkap']
    : done > 0 ? ['bg-amber-50 text-amber-700', `${done}/${total} materi`]
    : ['bg-slate-100 text-slate-500', 'Belum dinilai'];
  return <span className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// Penilaian UKT model rubrik: pilih peserta, beri predikat A-E per materi. Tersimpan otomatis tiap ketukan.
export default function RubrikUkt({ candidates, onGrade, onDelete, area }) {
  const [view, setView] = useState('input'); // 'input' | 'hasil'
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [showCert, setShowCert] = useState(false);

  const items = candidates.map((c) => ({ c, ti: templateIndex(c.targetBelt, c.currentBelt) }));
  const rank = (ti) => (ti < 0 ? 99 : ti); // tingkat tak dikenali selalu di urutan akhir
  const present = [...new Set(items.map((x) => x.ti))].sort((a, b) => rank(a) - rank(b));
  const needle = q.trim().toLowerCase();
  const shown = items
    .filter((x) => (filter === 'all' || x.ti === filter) && [x.c.name, x.c.regNumber, x.c.branch].some((v) => v?.toLowerCase().includes(needle)))
    .sort((a, b) => rank(a.ti) - rank(b.ti) || a.c.name.localeCompare(b.c.name));
  // Panel selalu milik peserta yang terlihat di daftar: bila yang dipilih tersaring/terhapus, pakai yang teratas.
  const active = shown.find((x) => x.c.id === activeId) ?? shown[0] ?? null;
  const tpl = active && active.ti >= 0 ? TEMPLATE[active.ti] : null;

  const tab = (key, label, color) => (
    <button
      key={String(key)}
      onClick={() => setFilter(key)}
      aria-pressed={filter === key}
      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap ${
        filter === key ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      {color && <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ background: color }} />}
      {label}
    </button>
  );

  // Tab per sabuk tujuan + pencarian nama; dipakai bersama oleh "Input Penilaian" dan "Lihat Hasil".
  const filterBar = (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tab('all', `Semua (${items.length})`)}
        {present.map((ti) =>
          tab(ti, `${ti < 0 ? 'Tingkat tak dikenali' : TEMPLATE[ti].ke} (${items.filter((x) => x.ti === ti).length})`, ti < 0 ? null : TEMPLATE[ti].warnaKe),
        )}
      </div>
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama peserta"
          aria-label="Cari nama peserta"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:border-teal-600 outline-none"
        />
        {q && (
          <button onClick={() => setQ('')} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (candidates.length === 0) {
    return <div className="trident-card rounded-2xl p-6 border border-slate-200 text-sm text-slate-600">Belum ada peserta di UKT ini. Tambah lewat tombol "Tambah Peserta" atau "Impor Peserta (CSV)".</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['input', 'Input Penilaian'], ['hasil', 'Lihat Hasil']].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${view === k ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filterBar}

      {view === 'hasil' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
              <tr>{['Peserta', 'Kenaikan', 'I', 'II', 'III', 'IV', 'Status'].map((h) => <th key={h} className={`px-2.5 py-2 ${h === 'Status' ? 'hidden sm:table-cell' : ''}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan={7} className="px-2.5 py-6 text-center text-slate-500">Tidak ada peserta yang cocok.</td></tr>
              )}
              {shown.map(({ c, ti }) => (
                <tr key={c.id} className="border-t border-slate-200 text-slate-800">
                  <td className="px-2.5 py-2 min-w-28"><b>{c.name}</b><div className="text-[11px] text-slate-500">{c.branch}</div></td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{tingkatLabel(ti)}</td>
                  {['I', 'II', 'III', 'IV'].map((no) => (
                    <td key={no} className="px-2.5 py-2 text-center font-bold">{c.predikat?.[no] ?? <span className="text-slate-300 font-normal">–</span>}</td>
                  ))}
                  <td className="px-2.5 py-2 hidden sm:table-cell"><Progress c={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold text-slate-900">Daftar Peserta</h3>
              <span className="text-xs text-slate-500">{shown.length} dari {items.length} peserta</span>
            </div>
            {shown.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Tidak ada peserta yang cocok.</p>}
            {shown.map(({ c, ti }, i) => (
              <React.Fragment key={c.id}>
                {filter === 'all' && (i === 0 || shown[i - 1].ti !== ti) && (
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 pt-2">{tingkatLabel(ti, false)}</div>
                )}
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border bg-white text-left ${active?.c.id === c.id ? 'border-teal-700 ring-1 ring-teal-700' : 'border-slate-200'}`}
                >
                  <span className="w-9 h-9 shrink-0 rounded-full bg-teal-50 text-teal-800 font-bold text-sm flex items-center justify-center">
                    {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 truncate">{c.name}</span>
                    <span className="block text-[11px] text-slate-500 truncate">{c.branch || c.regNumber}</span>
                  </span>
                  <Progress c={c} />
                </button>
              </React.Fragment>
            ))}
          </div>

          {active && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 bg-teal-900 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-lg font-bold">{active.c.name}</div>
                    <div className="text-xs text-teal-100">{[active.c.branch, active.c.regNumber].filter(Boolean).join(' · ')}</div>
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => window.confirm(`Hapus peserta ${active.c.name} beserta nilainya?`) && onDelete(active.c.id)}
                      className="shrink-0 p-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100"
                      title="Hapus peserta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {tpl && (
                  <div className="flex items-center gap-2 mt-3 text-sm font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-white bg-white" />{tpl.dari}</span>
                    <span className="text-amber-300">→</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: tpl.warnaKe }} />{tpl.ke}</span>
                    <span className="ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">{tpl.jenis}</span>
                  </div>
                )}
              </div>

              {!tpl ? (
                <div className="trident-card rounded-2xl p-4 border border-rose-200 text-sm text-slate-700">
                  Tingkat peserta ini tidak dikenali dari sabuk targetnya ("{active.c.targetBelt || 'kosong'}"). Impor ulang dengan Sabuk Target Strip Kuning, Merah, Biru, Cokelat, atau Hitam.
                </div>
              ) : (
                <>
                  {tpl.materi.map((m) => {
                    const val = active.c.predikat?.[m.no];
                    return (
                      <div key={m.no} className="trident-card rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-amber-600">{m.no}</span>
                          <h4 className="text-sm font-bold text-slate-900">{m.judul}</h4>
                        </div>
                        {m.sub.length > 0 && (
                          <ul className="mt-2 mb-3 pl-5 list-disc text-xs text-slate-600 space-y-0.5">
                            {m.sub.map((s) => <li key={s}>{s}</li>)}
                          </ul>
                        )}
                        <div className={`flex flex-wrap gap-1.5 ${m.sub.length ? '' : 'mt-3'}`}>
                          {GRADES.map((g) => (
                            <button
                              key={g}
                              onClick={() => onGrade(active.c.id, m.no, val === g ? null : g)}
                              aria-pressed={val === g}
                              className={`w-11 h-10 rounded-lg border text-sm font-bold ${
                                val === g ? 'bg-teal-700 border-teal-700 text-white' : `bg-slate-50 text-slate-600 ${val ? 'border-slate-200' : 'border-dashed border-slate-300'}`
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Ringkasan predikat</h4>
                    {tpl.materi.map((m) => (
                      <div key={m.no} className="flex justify-between text-sm py-1.5 border-b border-dashed border-slate-200 last:border-0">
                        <span className="text-slate-700">{m.no}. {m.judul}</span>
                        <b className="text-slate-900">{active.c.predikat?.[m.no] ?? '–'}</b>
                      </div>
                    ))}
                    <p className="text-[11px] text-slate-500 mt-2">Tersimpan otomatis setiap kali predikat dipilih. Ketuk huruf yang sama sekali lagi untuk mengosongkan.</p>
                  </div>

                  <button
                    onClick={() => setShowCert(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lihat Lembar Hasil</span>
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {showCert && active && tpl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto p-3 sm:p-6" onClick={() => setShowCert(false)}>
          <div className="max-w-xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCert(false)} aria-label="Tutup" className="ml-auto mb-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold">
              <X className="w-4 h-4" /> Tutup
            </button>
            <SertifikatUkt candidate={active.c} template={tpl} area={active.c.structure?.pac || area} />
          </div>
        </div>
      )}
    </div>
  );
}
