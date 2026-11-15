import React, { useState } from 'react';
import TridentIcon from './TridentIcon';
import { useApp } from '../context/AppContext';
import { Shield, Heart, MapPin, Phone, Mail, Award, Edit3, Save } from 'lucide-react';

export default function Footer() {
  const { navigateToTab, siteContent, isAdmin, handleUpdateSiteContent } = useApp();
  const [secForm, setSecForm] = useState(null); // null = closed
  const sec = {
    name: siteContent.secretariatName || 'Sekretariat Perguruan',
    address: siteContent.secretariatAddress || '',
    phone: siteContent.secretariatPhone || '',
    email: siteContent.secretariatEmail || '',
  };
  const openSecEdit = () =>
    setSecForm({
      secretariatName: sec.name,
      secretariatAddress: sec.address,
      secretariatPhone: sec.phone,
      secretariatEmail: sec.email,
    });
  const saveSec = async (e) => {
    e.preventDefault();
    const saved = await handleUpdateSiteContent(secForm, 'Info sekretariat berhasil diperbarui!');
    if (saved !== false) setSecForm(null);
  };

  return (
    <footer className="mt-20 border-t border-blue-900/40 bg-slate-950 text-slate-400 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Motto */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-amber-600 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <TridentIcon className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-wider text-amber-400 font-['Cinzel']">
                PAGAR NUSA KOTA BATAM
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Perguruan Pencak Silat Nahdlatul Ulama Pagar Nusa yang berlandaskan keluhuran budi pekerti, ketangguhan fisik terukur, serta evaluasi kenaikan tingkat transparan berbasis 4 Pos Penilaian standar internasional.
            </p>

            <div className="text-[11px] text-slate-500 font-mono">
              Sistem Manajemen Perguruan & Evaluasi UKT
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Cinzel']">
              Modul Perguruan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateToTab('visi')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Visi, Misi & Sejarah Perguruan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('berita')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Warta & Berita Resmi
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('prestasi')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Galeri Prestasi Atlet
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('agenda')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Agenda Kegiatan & RSVP
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('donasi')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Donasi Sarana
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTab('ukt')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Ujian Kenaikan Tingkat
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Secretariate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Cinzel']">
                {sec.name}
              </h4>
              {isAdmin && (
                <button onClick={openSecEdit} className="p-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300" title="Edit sekretariat">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{sec.address || '-'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{sec.phone || '-'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sec.email || '-'}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Pagar Nusa Cabang Batam. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dirancang dengan kehormatan & semangat kesatria
          </p>
        </div>
      </div>
      {secForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4">Edit Sekretariat</h3>
            <form onSubmit={saveSec} className="space-y-4">
              {[
                ['secretariatName', 'Nama Sekretariat'],
                ['secretariatAddress', 'Alamat'],
                ['secretariatPhone', 'Telepon'],
                ['secretariatEmail', 'Email'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-slate-300 font-medium block mb-1">{label}</label>
                  <input
                    type="text"
                    value={secForm[key]}
                    onChange={(e) => setSecForm({ ...secForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required={key === 'secretariatName'}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSecForm(null)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                  Batal
                </button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
