import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../lib/api';

// Admin: one-time codes that let a self-registered member become penguji.
export default function ExaminerCodesPanel({ users }) {
  const { showToast } = useApp();
  const [codes, setCodes] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.listExaminerCodes().then(setCodes).catch((e) => {
      console.error(e);
      showToast('Gagal memuat kode penguji', 'error');
    });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nameOf = (id) => users.find((u) => u.id === id)?.full_name ?? 'akun terhapus';

  const create = async () => {
    setBusy(true);
    try {
      const code = await api.createExaminerCode();
      showToast(`Kode penguji dibuat: ${code}`, 'success');
      await load();
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat kode penguji', 'error');
    }
    setBusy(false);
  };

  const remove = async (code) => {
    if (!window.confirm(`Hapus kode ${code}?`)) return;
    try {
      await api.deleteExaminerCode(code);
      await load();
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus kode', 'error');
    }
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
    <div className="trident-card rounded-2xl p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          Kode Penguji
        </h3>
        <button
          onClick={create}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Kode</span>
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        Berikan kode ke calon penguji. Saat mendaftar, ia mencentang "Saya penguji" dan memasukkan kode ini. Setiap kode hanya bisa dipakai sekali.
      </p>
      {codes.length === 0 ? (
        <p className="text-xs text-slate-500">Belum ada kode.</p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {codes.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-2 py-2 text-xs">
              <span className="font-mono tracking-widest text-white">{c.code}</span>
              {c.used_by ? (
                <span className="text-slate-400">Dipakai oleh {nameOf(c.used_by)}</span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400 mr-1">Belum dipakai</span>
                  <button onClick={() => copy(c.code)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="Salin">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(c.code)} className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300" title="Hapus">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
