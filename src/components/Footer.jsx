import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Sword, Heart, MapPin, Phone, Mail, Award } from 'lucide-react';

export default function Footer() {
  const { navigateToTab } = useApp();

  return (
    <footer className="mt-20 border-t border-blue-900/40 bg-slate-950 text-slate-400 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Motto */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-amber-600 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sword className="w-5 h-5 text-amber-400 transform -rotate-45" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-wider text-amber-400 font-['Cinzel']">
                TRIDENT ACADEMY
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Padepokan Agung Seni Bela Diri Kesatria yang berlandaskan keluhuran budi pekerti, ketangguhan fisik terukur, serta evaluasi kenaikan tingkat transparan berbasis 4 Pos Penilaian standar internasional.
            </p>

            <div className="text-[11px] text-slate-500 font-mono">
              Sistem Manajemen Perguruan & Evaluasi UKT • PRD v1.0 Approved
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
                  Donasi Sarana & Beasiswa
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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Cinzel']">
              Sekretariat Padepokan
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Gedung Mandala Krida, Jl. Ksatria Padepokan Agung No. 128, Indonesia</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+62 (021) 884-TRIDENT</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>sekretariat@trident-martialarts.org</span>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Trident Martial Arts Academy. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dirancang dengan kehormatan & semangat kesatria
          </p>
        </div>
      </div>
    </footer>
  );
}
