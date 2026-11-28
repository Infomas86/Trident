import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../lib/api';
import { memoGet, memoLoad } from '../lib/memo';

const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';
const gen = () => Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

// Admin membuat & membagikan kode pendaftaran; hanya pemegang kode yang bisa daftar mandiri.
export default function RegCodesSection() {
  const { showToast, currentUser } = useApp();
  const [codes, setCodes] = useState(() => memoGet('regcodes') ?? []);
  const [form, setForm] = useState({ code: gen(), label: '', pac: currentUser?.pac ?? '' });
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(null); // { code, label, pac }

  const load = (force = false) => memoLoad('regcodes', api.listRegCodes, force).then(setCodes).catch(() => showToast('Gagal memuat kode', 'error'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (call, ok) => {
    setBusy(true);
    try { await call(); showToast(ok); await load(true); return true; }
    catch (e) { showToast(e instanceof api.UserError ? e.message : 'Operasi gagal', 'error'); return false; }
    finally { setBusy(false); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (form.code.trim().length < 6) return showToast('Kode minimal 6 karakter', 'error');
    if (await run(() => api.createRegCode(form), 'Kode pendaftaran dibuat'))
      setForm({ code: gen(), label: '', pac: currentUser?.pac ?? '' });
  };
  const saveEdit = async () => {
    if (await run(() => api.updateRegCode(edit.code, edit), 'Kode diperbarui')) setEdit(null);
  };
  const pacList = [...new Set(codes.map((c) => c.pac).filter(Boolean))];
  const copy = (c) => { navigator.clipboard?.writeText(c); showToast('Kode disalin'); };
  const remove = (c) => window.confirm(`Hapus kode ${c}? Yang belum daftar tak bisa pakai kode ini lagi.`)
    && run(() => api.deleteRegCode(c), 'Kode dihapus');

  return (
    <div className="space-y-4">
      <datalist id="pac-options">{pacList.map((p) => <option key={p} value={p} />)}</datalist>
      <div>
        <h3 className="text-sm font-bold text-slate-900">Kode Pendaftaran Anggota</h3>
        <p className="text-xs text-slate-500">Bagikan kode ini hanya ke anggota resmi. Tanpa kode, orang tidak bisa mendaftar.</p>
      </div>

      <form onSubmit={create} className="grid sm:grid-cols-4 gap-2 items-start">
        <div className="flex gap-1">
          <input className={`${input} font-mono tracking-widest`} value={form.code} readOnly title="Kode dibuat acak supaya tidak bisa ditebak; klik Acak untuk kode lain" />
          <button type="button" onClick={() => setForm({ ...form, code: gen() })} className="shrink-0 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700">Acak</button>
        </div>
        <input className={input} placeholder="Label (opsional, mis. Angkatan 2026)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <input className={input} list="pac-options" placeholder="PAC (kosong = pusat)" value={form.pac} onChange={(e) => setForm({ ...form, pac: e.target.value })} disabled={!!currentUser?.pac} />
        <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold">Buat Kode</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>{['Kode', 'Label', 'PAC', 'Status', 'Aksi'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {codes.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-slate-500">Belum ada kode.</td></tr>}
            {codes.map((c) => (
              <tr key={c.code} className="border-t border-slate-200 text-slate-800">
                <td className="px-3 py-2 font-mono font-bold text-slate-900">{c.code}</td>
                {edit?.code === c.code ? (
                  <>
                    <td className="px-3 py-2"><input className={input} value={edit.label ?? ''} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></td>
                    <td className="px-3 py-2"><input className={input} list="pac-options" placeholder="kosong = pusat" value={edit.pac ?? ''} onChange={(e) => setEdit({ ...edit, pac: e.target.value })} disabled={!!currentUser?.pac} /></td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{c.label ?? '-'}</td>
                    <td className="px-3 py-2">{c.pac ?? 'Pusat'}</td>
                  </>
                )}
                <td className="px-3 py-2">{c.active ? <span className="text-emerald-600">Aktif</span> : <span className="text-slate-400">Nonaktif</span>}</td>
                <td className="px-3 py-2 whitespace-nowrap space-x-1">
                  {edit?.code === c.code ? (
                    <>
                      <button disabled={busy} onClick={saveEdit} className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Simpan</button>
                      <button disabled={busy} onClick={() => setEdit(null)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Batal</button>
                    </>
                  ) : (
                    <button disabled={busy} onClick={() => setEdit({ code: c.code, label: c.label ?? '', pac: c.pac ?? '' })} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Ubah</button>
                  )}
                  <button disabled={busy} onClick={() => copy(c.code)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Salin</button>
                  <button disabled={busy} onClick={() => run(() => api.setRegCodeActive(c.code, !c.active), c.active ? 'Kode dinonaktifkan' : 'Kode diaktifkan')} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">{c.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                  <button disabled={busy} onClick={() => remove(c.code)} className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
