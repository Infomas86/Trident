import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Sparkles,
  Lock,
  UserCheck,
  X,
  User,
} from 'lucide-react';

export default function AgendaSection() {
  const {
    agendaList,
    handleAddAgenda,
    role,
    ROLES,
    handleRoleChange,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for Examiner
  const [newAgendaForm, setNewAgendaForm] = useState({
    title: '',
    date: '25 November 2026',
    time: '16:00 - 18:30 WIB',
    location: 'Padepokan Pusat - Dojo Cakra Bhakti',
    speaker: 'Dewan Pelatih Utama',
    description: '',
  });

  // If Guest, show locked state teaser per PRD
  if (role === ROLES.PUBLIC) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Agenda Kegiatan Khusus Anggota & Penguji
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Jadwal kegiatan resmi, latihan gabungan, dan agenda ujian padepokan hanya dapat diakses oleh anggota dan pengurus perguruan.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleRoleChange(ROLES.MEMBER)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Masuk sebagai Anggota (Ahmad Fauzi)</span>
          </button>
          <button
            onClick={() => handleRoleChange(ROLES.EXAMINER)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Masuk sebagai Penguji UKT</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitNewAgenda = (e) => {
    e.preventDefault();
    handleAddAgenda({
      title: newAgendaForm.title,
      date: newAgendaForm.date,
      time: newAgendaForm.time,
      location: newAgendaForm.location,
      speaker: newAgendaForm.speaker,
      description: newAgendaForm.description,
    });
    setNewAgendaForm({
      title: '',
      date: '25 November 2026',
      time: '16:00 - 18:30 WIB',
      location: 'Padepokan Pusat - Dojo Cakra Bhakti',
      speaker: 'Dewan Pelatih Utama',
      description: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Kanal Informasi Jadwal & Kegiatan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Agenda Kegiatan Padepokan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Informasi lengkap jadwal latihan gabungan, persiapan ujian kenaikan tingkat, dan kegiatan resmi perguruan Trident.
          </p>
        </div>

        {role === ROLES.EXAMINER && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Bagikan Agenda Baru (Penguji)</span>
          </button>
        )}
      </div>

      {/* Agenda Cards List (Pure event share, no RSVP) */}
      <div className="space-y-5">
        {agendaList.map((agenda) => (
          <div
            key={agenda.id}
            className="trident-card rounded-2xl p-6 border border-slate-800 hover:border-blue-700/50 transition-all duration-300 relative flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left Side: Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-700/40 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {agenda.date}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {agenda.time}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {agenda.location}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white font-['Cinzel']">
                {agenda.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {agenda.description}
              </p>

              <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                <span>Pembina / Instruktur:</span>
                <strong className="text-amber-400 font-semibold">{agenda.speaker}</strong>
              </div>
            </div>

            {/* Right Side: Status Tag */}
            <div className="md:w-56 bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-1.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Kegiatan Resmi
              </span>
              <p className="text-[11px] text-slate-400">
                Wajib dihadiri seluruh pesilat sesuai jadwal
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Agenda Baru (Examiner only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Bagikan Agenda Kegiatan Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAgenda} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Nama Agenda / Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Latihan Gabungan & Pemantapan Jurus Pokok..."
                  value={newAgendaForm.title}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 28 November 2026"
                    value={newAgendaForm.date}
                    onChange={(e) => setNewAgendaForm({ ...newAgendaForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 15:30 - 18:00 WIB"
                    value={newAgendaForm.time}
                    onChange={(e) => setNewAgendaForm({ ...newAgendaForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Lokasi Padepokan / Gedung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Padepokan Pusat - Dojo Cakra Bhakti"
                  value={newAgendaForm.location}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Instruktur / Pembina
                </label>
                <input
                  type="text"
                  value={newAgendaForm.speaker}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, speaker: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Deskripsi / Rincian Kegiatan
                </label>
                <textarea
                  rows={3}
                  value={newAgendaForm.description}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, description: e.target.value })}
                  placeholder="Rincian materi latihan, seragam sakral yang dikenakan, perlengkapan yang wajib dibawa..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
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
                  Bagikan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
