import React, { useState } from 'react';
import ImageField from './ImageField';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Medal,
  Award,
  Globe,
  MapPin,
  PlusCircle,
  X,
  User,
  Star,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function PrestasiSection() {
  const { achievementsList, handleAddAchievement, handleDeleteAchievement, isStaff } = useApp();
  const [selectedScope, setSelectedScope] = useState('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for Examiner
  const [newAchForm, setNewAchForm] = useState({
    athleteName: '',
    championship: '',
    scope: 'Nasional',
    medal: 'Emas',
    category: '',
    notes: '',
    photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  });

  const scopes = ['Semua', 'Internasional', 'Nasional', 'Daerah'];

  const filteredAchievements = achievementsList.filter((item) => {
    return selectedScope === 'Semua' || item.scope === selectedScope;
  });

  const handleSubmitAchievement = (e) => {
    e.preventDefault();
    handleAddAchievement({
      athleteName: newAchForm.athleteName,
      championship: newAchForm.championship,
      scope: newAchForm.scope,
      medal: newAchForm.medal,
      category: newAchForm.category,
      notes: newAchForm.notes,
      photo: newAchForm.photo,
    });
    setNewAchForm({
      athleteName: '',
      championship: '',
      scope: 'Nasional',
      medal: 'Emas',
      category: '',
      notes: '',
      photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    });
    setIsAddModalOpen(false);
  };

  const getMedalBadge = (medal) => {
    switch (medal.toLowerCase()) {
      case 'emas':
        return {
          bg: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black',
          border: 'border-amber-400/80',
          glow: 'shadow-lg shadow-amber-500/30',
          label: 'MEDALI EMAS',
        };
      case 'perak':
        return {
          bg: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-900 font-black',
          border: 'border-slate-300/80',
          glow: 'shadow-lg shadow-slate-300/20',
          label: 'MEDALI PERAK',
        };
      case 'perunggu':
        return {
          bg: 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white font-black',
          border: 'border-amber-700/80',
          glow: 'shadow-lg shadow-amber-700/20',
          label: 'MEDALI PERUNGGU',
        };
      default:
        return {
          bg: 'bg-blue-600 text-white font-bold',
          border: 'border-blue-500',
          glow: '',
          label: medal.toUpperCase(),
        };
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Etalase Juara & Kebanggaan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Galeri Prestasi Atlet Trident
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Rekam jejak perjuangan para pesilat Trident di gelanggang kejuaraan daerah, nasional, dan internasional.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Prestasi (Penguji)</span>
          </button>
        )}
      </div>

      {/* Scope Filter Pills */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <span className="text-xs text-slate-400 font-medium px-2 hidden sm:inline">Cakupan Wilayah:</span>
        {scopes.map((scope) => (
          <button
            key={scope}
            onClick={() => setSelectedScope(scope)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedScope === scope
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {scope}
          </button>
        ))}
      </div>

      {/* Achievements Cards Grid */}
      {achievementsList.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Belum ada prestasi</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((item) => {
          const badgeStyle = getMedalBadge(item.medal);
          return (
            <div
              key={item.id}
              className="trident-card rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col group"
            >
              {/* Photo & Badge Banner */}
              <div className="relative h-52 bg-slate-950 overflow-hidden">
                <img
                  src={item.photo}
                  alt={item.athleteName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {isStaff && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus prestasi ${item.athleteName}?`)) handleDeleteAchievement(item.id);
                    }}
                    className="absolute top-3 left-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950 text-slate-300 hover:text-rose-400 backdrop-blur-md transition-colors"
                    title="Hapus Prestasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Medal Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-lg text-[11px] border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.glow} flex items-center gap-1.5`}>
                    <Medal className="w-3.5 h-3.5" />
                    <span>{badgeStyle.label}</span>
                  </div>
                </div>

                {/* Scope Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-950/80 text-blue-300 border border-blue-500/30 backdrop-blur-md flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Tingkat {item.scope} ({item.year})
                  </span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-amber-400 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.athleteName}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-amber-400/90">
                    {item.championship}
                  </p>

                  <div className="inline-block px-2.5 py-1 rounded bg-slate-950 text-slate-300 text-xs border border-slate-800">
                    Kategori: <strong className="text-white">{item.category}</strong>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 italic pt-1 leading-relaxed">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Kontingen Padepokan Trident</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Prestasi Baru (Examiner only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Catat Prestasi Atlet Perguruan
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAchievement} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Nama Atlet / Pesilat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gilang Pratama..."
                  value={newAchForm.athleteName}
                  onChange={(e) => setNewAchForm({ ...newAchForm, athleteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Nama Kejuaraan / Turnamen
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kejuaraan Nasional Silat Open 2026..."
                  value={newAchForm.championship}
                  onChange={(e) => setNewAchForm({ ...newAchForm, championship: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Cakupan Wilayah
                  </label>
                  <select
                    value={newAchForm.scope}
                    onChange={(e) => setNewAchForm({ ...newAchForm, scope: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Internasional">Internasional</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Daerah">Daerah</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Jenis Medali
                  </label>
                  <select
                    value={newAchForm.medal}
                    onChange={(e) => setNewAchForm({ ...newAchForm, medal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Emas">Emas (Gold)</option>
                    <option value="Perak">Perak (Silver)</option>
                    <option value="Perunggu">Perunggu (Bronze)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Kategori Tanding / Seni
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tanding Dewasa Putra Kelas F (70-75 Kg)..."
                  value={newAchForm.category}
                  onChange={(e) => setNewAchForm({ ...newAchForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <ImageField

                label="Foto Atlet / Dokumentasi"

                value={newAchForm.photo}

                onChange={(url) => setNewAchForm({ ...newAchForm, photo: url })}

                folder="prestasi"

              />

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Catatan Pertandingan / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={newAchForm.notes}
                  onChange={(e) => setNewAchForm({ ...newAchForm, notes: e.target.value })}
                  placeholder="Contoh: Menang angka mutlak 5-0 di babak final..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Simpan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
