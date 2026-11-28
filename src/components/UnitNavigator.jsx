import React, { useState } from 'react';
import { ChevronRight, Plus, Trash2, Building2, MapPin } from 'lucide-react';
import MotionCard from './MotionCard';

const input = 'flex-1 min-w-0 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';

// Penelusuran PAC -> Ranting. Tempat latihan (Anak Ranting) ditampilkan induknya setelah Ranting dipilih.
// Admin menambah/menghapus PAC dan Ranting di sini; unit yang masih berisi tidak bisa dihapus.
export default function UnitNavigator({ units, grounds, isAdmin, pacId, rantingId, onSelect, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const pac = units.find((u) => u.id === pacId);
  const ranting = units.find((u) => u.id === rantingId);
  const rantingsOf = (id) => units.filter((u) => u.parentId === id);
  const groundsOf = (rid) => grounds.filter((g) => g.rantingId === rid).length;
  const groundsInPac = (id) => rantingsOf(id).reduce((n, r) => n + groundsOf(r.id), 0);

  // Level yang ditampilkan: PAC (belum memilih), Ranting (PAC dipilih), atau tidak ada kartu (Ranting dipilih).
  const level = !pac ? 'PAC' : !ranting ? 'Ranting' : null;
  const list = level === 'PAC' ? units.filter((u) => u.level === 'PAC') : level === 'Ranting' ? rantingsOf(pac.id) : [];

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ level, name, parentId: level === 'Ranting' ? pac.id : null });
    setName('');
  };

  const crumb = (label, target, active) => (
    <button type="button" onClick={() => onSelect(target)} disabled={active}
      className={active ? 'font-bold text-slate-900' : 'text-teal-700 hover:underline'}>{label}</button>
  );

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-1 text-xs">
        {crumb('Semua PAC', {}, !pac)}
        {pac && <><ChevronRight className="w-3 h-3 text-slate-400" />{crumb(pac.name, { pacId: pac.id }, !ranting)}</>}
        {ranting && <><ChevronRight className="w-3 h-3 text-slate-400" /><span className="font-bold text-slate-900">{ranting.name}</span></>}
      </nav>

      {level && (
        <>
          {list.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">{level === 'PAC' ? 'Belum ada PAC.' : 'Belum ada Ranting di PAC ini.'}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((u) => {
              const isPac = level === 'PAC';
              const sub = isPac ? `${rantingsOf(u.id).length} Ranting · ${groundsInPac(u.id)} Tempat Latihan` : `${groundsOf(u.id)} Tempat Latihan`;
              const empty = isPac ? rantingsOf(u.id).length === 0 : groundsOf(u.id) === 0;
              return (
                <MotionCard key={u.id} className="trident-card rounded-2xl p-5 border border-slate-200 hover:border-teal-300 transition-colors duration-300 cursor-pointer flex items-center gap-4"
                  onClick={() => onSelect(isPac ? { pacId: u.id } : { pacId: pac.id, rantingId: u.id })}>
                  <div className="w-11 h-11 rounded-xl bg-teal-600/15 text-teal-700 flex items-center justify-center shrink-0">
                    {isPac ? <Building2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900 font-['Cinzel'] truncate">{u.name}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                  {isAdmin && (
                    <button type="button" disabled={!empty} title={empty ? 'Hapus' : 'Tidak bisa dihapus: masih ada isinya'}
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`Hapus ${u.name}?`)) onDelete(u.id); }}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </MotionCard>
              );
            })}
          </div>
          {isAdmin && (
            <form onSubmit={submit} className="flex gap-2 max-w-xl">
              <input className={input} value={name} onChange={(e) => setName(e.target.value)}
                placeholder={level === 'PAC' ? 'Nama PAC baru (mis. PAC Batam Kota)' : `Nama Ranting baru di ${pac.name}`} />
              <button type="submit" className="flex items-center gap-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0">
                <Plus className="w-4 h-4" />{level === 'PAC' ? 'Tambah PAC' : 'Tambah Ranting'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
