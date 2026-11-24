import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import UktEventsBar from './UktEventsBar';
import RubrikUkt from './RubrikUkt';
import SertifikatUkt from './SertifikatUkt';
import { TEMPLATE, templateFor, parseRubrikCsv, buildRubrikCsv, IMPORT_SAMPLE } from '../lib/rubrik';
import { GraduationCap, Lock, Upload, Download, UserPlus, X } from 'lucide-react';

const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-teal-600 outline-none';
const EMPTY = { regNumber: '', name: '', branch: '', tingkat: 0 };

const saveFile = (name, text, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function UktSection() {
  const {
    role, ROLES, candidatesList, myCandidate, selectedEvent, canManageEvents,
    handleSetPredikat, handleImportParticipants, handleDeleteCandidate, setIsLoginModalOpen, showToast,
  } = useApp();
  const canScore = !!selectedEvent; // admin PAC UKT itu, atau penguji yang memasukkan kodenya
  const [addForm, setAddForm] = useState(null); // null = tertutup
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  if (role === ROLES.PUBLIC) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel']">Ujian Kenaikan Tingkat Terkunci</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Hasil UKT hanya dapat dilihat anggota yang sudah masuk. Penilaian hanya untuk penguji dan admin.
          </p>
        </div>
        <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs">
          Masuk / Daftar
        </button>
      </div>
    );
  }

  const addParticipant = async (e) => {
    e.preventDefault();
    const t = TEMPLATE[addForm.tingkat];
    const row = { regNumber: addForm.regNumber.trim(), name: addForm.name.trim(), branch: addForm.branch.trim(), currentBelt: t.dari, targetBelt: t.ke };
    if (await handleImportParticipants([row])) setAddForm(null);
  };

  const importCsv = async () => {
    if (!csvText.trim()) return showToast('Tempel atau unggah isi CSV terlebih dahulu', 'error');
    const { rows, errors } = parseRubrikCsv(csvText);
    if (errors.length) return showToast(errors.join('; '), 'error');
    if (!rows.length) return showToast('Tidak ada data valid yang dapat diimpor', 'error');
    if (await handleImportParticipants(rows)) {
      setImportOpen(false);
      setCsvText('');
    }
  };

  const readFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const myTemplate = myCandidate ? templateFor(myCandidate) : null;

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-widest mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Evaluasi Tingkatan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel']">Ujian Kenaikan Tingkat</h2>
          <p className="text-xs sm:text-sm text-slate-500">Penilaian predikat per materi sesuai rubrik resmi tiap tingkatan.</p>
        </div>

        {canScore && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setAddForm(addForm ? null : EMPTY)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">
              <UserPlus className="w-4 h-4" /><span>Tambah Peserta</span>
            </button>
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold">
              <Upload className="w-4 h-4" /><span>Impor Peserta (CSV)</span>
            </button>
            <button
              onClick={() => saveFile(`hasil-ukt-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + buildRubrikCsv(candidatesList))}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold"
            >
              <Download className="w-4 h-4" /><span>Ekspor Hasil (CSV)</span>
            </button>
          </div>
        )}
      </div>

      <UktEventsBar />

      {canScore && addForm && (
        <form onSubmit={addParticipant} className="trident-card rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Tambah Peserta</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className={input} required placeholder="N.I.A (mis. PNKB-2026-0001)" value={addForm.regNumber} onChange={(e) => setAddForm({ ...addForm, regNumber: e.target.value })} />
            <input className={input} required placeholder="Nama lengkap" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
            <input className={input} placeholder="Ranting" value={addForm.branch} onChange={(e) => setAddForm({ ...addForm, branch: e.target.value })} />
            <select className={input} value={addForm.tingkat} onChange={(e) => setAddForm({ ...addForm, tingkat: Number(e.target.value) })}>
              {TEMPLATE.map((t, i) => <option key={t.ke} value={i}>{t.dari} → {t.ke} ({t.jenis})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddForm(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold">Simpan Peserta</button>
          </div>
        </form>
      )}

      {canScore ? (
        <RubrikUkt
          candidates={candidatesList}
          onGrade={handleSetPredikat}
          onDelete={canManageEvents ? handleDeleteCandidate : null}
          area={selectedEvent.pac}
        />
      ) : myCandidate && myTemplate ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Hasil UKT Anda, {myCandidate.regNumber}. Predikat diisi oleh penguji; yang belum dinilai tampil kosong.
          </p>
          <SertifikatUkt candidate={myCandidate} template={myTemplate} area={myCandidate.structure?.pac} />
        </div>
      ) : role === ROLES.MEMBER || myCandidate ? (
        <div className="trident-card rounded-2xl p-6 border border-slate-200 text-sm text-slate-700">
          {myCandidate
            ? 'Data UKT Anda sudah tercatat, tetapi tingkatnya belum dikenali. Hubungi penguji.'
            : 'Anda belum terdaftar sebagai peserta UKT. Hubungi penguji atau admin PAC Anda.'}
        </div>
      ) : null}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 space-y-3 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Impor Peserta (CSV)</h3>
              <button onClick={() => setImportOpen(false)} aria-label="Tutup" className="p-1.5 rounded-lg bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">
              Kolom: N.I.A, Nama Peserta, Ranting, Sabuk Saat Ini, Sabuk Target. Tanpa nilai: penguji mengisi predikat di aplikasi.
              Sabuk Target harus Strip Kuning, Merah, Biru, Cokelat, atau Hitam.
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={7}
              placeholder={IMPORT_SAMPLE}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:border-teal-600 outline-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input type="file" accept=".csv,text/csv" onChange={readFile} className="text-xs" />
              <button onClick={() => saveFile('template-impor-peserta-ukt.csv', IMPORT_SAMPLE)} className="text-xs underline text-teal-700">Unduh contoh</button>
              <button onClick={importCsv} className="ml-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">Impor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
