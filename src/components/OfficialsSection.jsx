import React, { useState } from 'react';
import { Users, Phone, Pencil, Trash2, Save, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { waNumber } from '../lib/phone';
import RevealTitle from './RevealTitle';

const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-teal-600 outline-none';
const EMPTY = { level: 'PAC', pac: '', branch: '', fullName: '', position: '', phone: '', period: '', active: true };

// Direktori pengurus: publik lihat yang aktif saja (dikelompokkan per PAC/Ranting); admin bisa
// tambah/ubah/nonaktifkan/hapus. PAC setara kecamatan - jadi bisa ada beberapa PAC sekaligus.
export default function OfficialsSection() {
  const { officials, isAdmin, handleAddOfficial, handleUpdateOfficial, handleDeleteOfficial } = useApp();
  const [managing, setManaging] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const grouped = officials.reduce((acc, o) => {
    // Nama PAC sudah diketik admin lengkap dengan prefiksnya (mis. "PAC Batam Kota") - tidak ditambah lagi di sini.
    const key = o.level === 'PAC' ? o.pac : `Ranting ${o.branch || '-'} (${o.pac})`;
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  const startEdit = (o) => {
    setEditingId(o.id);
    setForm({ level: o.level, pac: o.pac, branch: o.branch ?? '', fullName: o.fullName, position: o.position, phone: o.phone ?? '', period: o.period ?? '', active: o.active ?? true });
  };
  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, branch: form.level === 'Ranting' ? form.branch.trim() || null : null, phone: form.phone.trim() || null, period: form.period.trim() || null };
    const ok = editingId ? await handleUpdateOfficial(editingId, payload) : await handleAddOfficial(payload);
    if (ok) resetForm();
  };

  if (!isAdmin && officials.length === 0) return null; // tidak ada data & bukan admin: jangan tampilkan seksi kosong ke publik

  return (
    <section className="space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-widest">
          <Users className="w-3.5 h-3.5" />
          <span>Direktori Pengurus</span>
        </div>
        <RevealTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel']">Pengurus PAC & Ranting</RevealTitle>
        <p className="text-xs sm:text-sm text-slate-500">Nama dan jabatan pengurus aktif di tiap Pimpinan Anak Cabang dan Ranting.</p>
      </div>

      {isAdmin && (
        <div className="flex justify-center">
          <button onClick={() => { setManaging((v) => !v); resetForm(); }} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold">
            {managing ? 'Selesai Kelola' : 'Kelola Pengurus (Admin)'}
          </button>
        </div>
      )}

      {managing && (
        <form onSubmit={submit} className="trident-card rounded-2xl p-5 border border-teal-200 space-y-3 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Ubah Pengurus' : 'Tambah Pengurus'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <select className={input} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="PAC">PAC</option>
              <option value="Ranting">Ranting</option>
            </select>
            <input className={input} placeholder="Nama PAC (mis. PAC Batam Kota)" value={form.pac} onChange={(e) => setForm({ ...form, pac: e.target.value })} required />
            {form.level === 'Ranting' && (
              <input className={input} placeholder="Nama Ranting" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required />
            )}
            <input className={input} placeholder="Nama lengkap" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <input className={input} placeholder="Jabatan (mis. Ketua)" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
            <input className={input} placeholder="No. WhatsApp (opsional, akan tampil publik)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={input} placeholder="Masa jabatan (mis. 2024-2029)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <label className="flex items-center gap-1.5 text-xs text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Tampilkan ke publik
            </label>
            <div className="flex gap-2">
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 text-xs font-semibold">Batal</button>}
              <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold">
                <Save className="w-3.5 h-3.5" /> Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {Object.entries(grouped).map(([group, list]) => (
          <div key={group} className="trident-card rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-teal-800">{group}</h4>
            <div className="space-y-2">
              {list.map((o) => {
                const cleanPhone = waNumber(o.phone);
                return (
                  <div key={o.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-xl ${o.active ? 'bg-slate-50' : 'bg-rose-50'}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{o.fullName}</p>
                      <p className="text-[11px] text-slate-500">{o.position}{o.period ? ` · ${o.period}` : ''}</p>
                      {!o.active && <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-semibold"><EyeOff className="w-3 h-3" /> Tersembunyi dari publik</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {o.phone && !managing && (
                        <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white" title="WhatsApp">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {managing && (
                        <>
                          <button onClick={() => startEdit(o)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800" title="Ubah"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => window.confirm(`Hapus pengurus ${o.fullName}?`) && handleDeleteOfficial(o.id)} className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {managing && officials.length === 0 && (
          <p className="text-xs text-slate-500 text-center col-span-2 py-4">Belum ada pengurus. Tambah lewat form di atas.</p>
        )}
      </div>
    </section>
  );
}
