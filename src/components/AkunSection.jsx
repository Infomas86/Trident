import React, { useEffect, useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import * as api from '../lib/api';
import { memoGet, memoLoad } from '../lib/memo';
import RegCodesSection from './RegCodesSection';
import RevealTitle from './RevealTitle';

const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';
const ROLE_OPTIONS = [[ROLES.MEMBER, 'Anggota'], [ROLES.EXAMINER, 'Penguji'], [ROLES.ADMIN, 'Admin'], ['super', 'Super Admin']];
const roleValue = (u) => (u.is_super ? 'super' : u.role ?? ROLES.MEMBER);
const roleLabel = (u) => (ROLE_OPTIONS.find(([v]) => v === roleValue(u))?.[1] ?? '-');
// Sandi sementara acak per reset (tanpa huruf/angka yang mirip), 10 karakter > minimal 8 Supabase.
const tempPassword = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(10)), (n) => abc[n % abc.length]).join('');
};
const EMPTY = { email: '', password: '', full_name: '', role: ROLES.MEMBER, reg_number: '', pac: '' };
const blank = (v) => v.trim() || null;

export default function AkunSection() {
  const { showToast, currentUser } = useApp();
  const [users, setUsers] = useState(() => memoGet('users') ?? []);
  const [q, setQ] = useState('');
  const [pacTab, setPacTab] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  // force=false: pakai cache bila sudah pernah dimuat; setelah perubahan data / muat ulang pakai force=true.
  const load = (force = false) => memoLoad('users', api.listUsers, force).then(setUsers).catch((e) => {
    console.error(e);
    showToast(e instanceof api.UserError ? e.message : 'Gagal memuat akun', 'error');
  });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Run an admin action, toast the outcome, reload the list.
  const run = async (call, okMsg, failMsg) => {
    setBusy(true);
    try {
      await call();
    } catch (e) {
      console.error(e);
      showToast(e instanceof api.UserError ? e.message : failMsg, 'error');
      setBusy(false);
      return false;
    }
    showToast(okMsg);
    await load(true);
    setBusy(false);
    return true;
  };

  const create = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return showToast('Sandi awal minimal 8 karakter', 'error');
    const done = await run(
      () => api.createUser({
        email: form.email.trim(), password: form.password, full_name: form.full_name.trim(), role: form.role,
        reg_number: blank(form.reg_number), pac: blank(form.pac),
      }),
      'Akun berhasil dibuat', 'Gagal membuat akun',
    );
    if (done) setForm(EMPTY);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const { id, full_name, role, reg_number, pac } = edit;
    if (!full_name.trim()) return showToast('Nama wajib diisi', 'error');
    const done = await run(
      () => api.updateUserProfile(id, { full_name: full_name.trim(), role, reg_number: blank(reg_number), pac: blank(pac ?? '') }),
      'Akun berhasil diperbarui', 'Gagal memperbarui akun',
    );
    if (done) setEdit(null);
  };

  const reset = async (u) => {
    if (!window.confirm(`Reset sandi ${u.email}? Sandi sementara baru dibuat; ${u.email} wajib membuat sandi sendiri saat masuk.`)) return;
    const pw = tempPassword();
    if (await run(() => api.resetPassword(u.id, pw, true), 'Sandi berhasil direset', 'Gagal mereset sandi')) {
      window.prompt(`Sandi sementara ${u.email} (hanya ditampilkan sekali, salin lalu kirim ke anggota):`, pw);
    }
  };

  const toggle = (u) => {
    if (u.active && !window.confirm(`Nonaktifkan ${u.email}? Pengguna tidak bisa masuk lagi.`)) return;
    run(() => api.setUserActive(u.id, !u.active), u.active ? 'Akun dinonaktifkan' : 'Akun diaktifkan', 'Gagal mengubah status akun');
  };

  const remove = (u) => {
    const ok = window.confirm(
      `Hapus permanen akun ${u.full_name ?? ''} (${u.email})?

Akun dan profilnya terhapus dan tidak bisa dikembalikan. Riwayat donasinya tetap tersimpan.`,
    );
    if (ok) run(() => api.deleteUser(u.id), 'Akun berhasil dihapus', 'Gagal menghapus akun');
  };

  const needle = q.trim().toLowerCase();
  const pacs = [...new Set(users.map((u) => u.pac).filter(Boolean))].sort();
  const countOf = (pac) => users.filter((u) => (pac === '-' ? !u.pac : u.pac === pac)).length;
  const shown = users.filter((u) => (!pacTab || (pacTab === '-' ? !u.pac : u.pac === pacTab)) && (!needle || [u.full_name, u.email, u.reg_number].some((v) => v?.toLowerCase().includes(needle))));
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setE = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  const fields = (v, set, withAuth) => (
    <>
      {withAuth && (
        <>
          <input className={input} type="email" required placeholder="Email" value={v.email} onChange={set('email')} />
          <input className={input} type="password" required minLength={8} autoComplete="new-password" placeholder="Sandi awal (min. 8)" value={v.password} onChange={set('password')} />
        </>
      )}
      <input className={input} required placeholder="Nama lengkap" value={v.full_name} onChange={set('full_name')} />
      <select className={input} value={v.role} onChange={set('role')}>
        {ROLE_OPTIONS.filter(([val]) => (val !== ROLES.EXAMINER || v.role === ROLES.EXAMINER) && (currentUser?.isSuper || (val !== ROLES.ADMIN && val !== 'super') || v.role === val)).map(([val, label]) => (
          <option key={val} value={val} disabled={!currentUser?.isSuper && (val === ROLES.ADMIN || val === 'super')}>{label}</option>
        ))}
      </select>
      <input className={input} placeholder="PAC (untuk admin UKT, kosong = pusat)" value={v.pac ?? ''} onChange={set('pac')} />
      <input className={input} placeholder="N.I.A peserta UKT (opsional)" value={v.reg_number} onChange={set('reg_number')} />
    </>
  );

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between gap-3">
        <RevealTitle className="text-2xl font-extrabold text-slate-900 font-['Cinzel']">Kelola Akun</RevealTitle>
        <button type="button" onClick={() => load(true)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold">Muat ulang</button>
      </div>

      <div className="trident-card rounded-2xl p-5 border border-slate-200">
        <RegCodesSection />
      </div>

      <form onSubmit={create} className="trident-card rounded-2xl p-5 border border-slate-200 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Tambah Akun</h3>
        <div className="grid sm:grid-cols-3 gap-3">{fields(form, setF, true)}</div>
        <button type="submit" disabled={busy} className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold">Tambah</button>
      </form>

      {edit && (
        <form onSubmit={saveEdit} className="trident-card rounded-2xl p-5 border border-amber-500/40 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Ubah Akun</h3>
          <div className="grid sm:grid-cols-3 gap-3">{fields(edit, setE, false)}</div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold">Simpan</button>
            <button type="button" onClick={() => setEdit(null)} className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold">Batal</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[['', 'Semua', users.length], ...pacs.map((p) => [p, p, countOf(p)]), ['-', 'Tanpa PAC', countOf('-')]].map(([key, label, n]) => (
            <button key={key} type="button" onClick={() => setPacTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${pacTab === key ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
              {label} <span className="opacity-70">({n})</span>
            </button>
          ))}
        </div>
        <input className={input} placeholder="Cari nama, email, atau N.I.A" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{['Nama', 'Email', 'Peran', 'PAC', 'No. Reg', 'Status', 'Aksi'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-slate-500">Tidak ada akun.</td></tr>}
              {shown.map((u) => (
                <tr key={u.id} className="border-t border-slate-200 text-slate-800">
                  <td className="px-3 py-2 font-bold text-slate-900">{u.full_name ?? '-'}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{roleLabel(u)}</td>
                  <td className="px-3 py-2">{u.pac ?? '-'}</td>
                  <td className="px-3 py-2 font-mono">{u.reg_number ?? '-'}</td>
                  <td className="px-3 py-2">{u.active ? <span className="text-emerald-600">Aktif</span> : <span className="text-rose-600">Nonaktif</span>}</td>
                  <td className="px-3 py-2 whitespace-nowrap space-x-1">
                    {u.id !== currentUser?.id && u.role === ROLES.ADMIN && !currentUser?.isSuper ? (
                      <span className="text-slate-400">Dikelola super admin</span>
                    ) : (
                      <>
                        <button disabled={busy} onClick={() => setEdit({ id: u.id, full_name: u.full_name ?? '', role: roleValue(u), reg_number: u.reg_number ?? '', pac: u.pac ?? '' })} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Ubah</button>
                        <button disabled={busy} onClick={() => reset(u)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Reset Sandi</button>
                        <button disabled={busy} onClick={() => toggle(u)} className={`px-2 py-1 rounded text-slate-900 ${u.active ? 'bg-rose-700 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{u.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                        {u.id !== currentUser?.id && (
                          <button disabled={busy} onClick={() => remove(u)} className="px-2 py-1 rounded text-slate-900 bg-rose-50 hover:bg-rose-100 border border-rose-200">Hapus</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
