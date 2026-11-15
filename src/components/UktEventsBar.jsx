import React, { useState } from 'react';
import { CalendarPlus, KeyRound, RefreshCw, Trash2, Copy, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ExaminerCodeCard from './ExaminerCodeCard';

const input = 'w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none';
const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const purgeDate = (d) => fmt(new Date(new Date(`${d}T00:00:00`).getTime() + 8 * 86400000).toLocaleDateString('en-CA'));

// Top of the UKT tab: admins create UKT events for their PAC and share each event's code;
// everyone else enters a code to become examiner of that one event.
export default function UktEventsBar() {
  const {
    currentUser, canManageEvents, uktEvents, selectedEvent, setSelectedEventId,
    handleCreateUktEvent, handleRegenerateEventCode, handleDeleteUktEvent, showToast,
  } = useApp();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const [form, setForm] = useState(null); // null = closed

  const create = async (e) => {
    e.preventDefault();
    if (await handleCreateUktEvent(form)) setForm(null);
  };
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Kode disalin', 'info');
    } catch {
      showToast(`Salin manual: ${code}`, 'info');
    }
  };

  return (
    <div className="space-y-4">
      {!canManageEvents && <ExaminerCodeCard />}

      {(canManageEvents || uktEvents.length > 0) && (
        <div className="trident-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">
              {canManageEvents ? `UKT ${currentUser?.pac ? currentUser.pac : '(semua PAC)'}` : 'UKT yang Anda uji'}
            </h3>
            {canManageEvents && (
              <button
                onClick={() => setForm({ name: '', examDate: today, location: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Buat UKT Baru</span>
              </button>
            )}
          </div>

          {form && (
            <form onSubmit={create} className="grid sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <input className={input} required placeholder="Nama UKT, mis. UKT Semester Gasal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} type="date" required min={today} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              <input className={input} placeholder="Lokasi (opsional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button type="button" onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Batal</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold">Simpan UKT</button>
              </div>
            </form>
          )}

          {uktEvents.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada UKT. Tekan "Buat UKT Baru".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {uktEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`px-3 py-2 rounded-xl border text-left text-xs transition-colors ${
                    selectedEvent?.id === ev.id ? 'bg-amber-500/15 border-amber-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block font-bold">{ev.name}</span>
                  <span className="block text-[10px] text-slate-400">{fmt(ev.examDate)}{ev.pac ? ` • ${ev.pac}` : ''}</span>
                </button>
              ))}
            </div>
          )}

          {selectedEvent && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
                <span className="font-bold text-white">{selectedEvent.name}</span>
                <span>{fmt(selectedEvent.examDate)}</span>
                {selectedEvent.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedEvent.location}</span>
                )}
              </div>
              {canManageEvents && (
                <div className="flex flex-wrap items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Kode penguji:</span>
                  <span className="font-mono tracking-widest text-amber-300 text-sm">{selectedEvent.examinerCode ?? '-'}</span>
                  {selectedEvent.examinerCode && (
                    <button onClick={() => copy(selectedEvent.examinerCode)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="Salin kode">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Buat kode baru? Kode lama langsung tidak berlaku.')) handleRegenerateEventCode(selectedEvent.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Kode</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus "${selectedEvent.name}" beserta semua peserta dan nilainya? Tidak bisa dikembalikan.`)) handleDeleteUktEvent(selectedEvent.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus UKT</span>
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                Otomatis terhapus beserta seluruh nilai pada {purgeDate(selectedEvent.examDate)}. Ekspor CSV sebelumnya bila perlu arsip.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
