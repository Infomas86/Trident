import React from 'react';
import { useApp } from '../context/AppContext';
import logoPagarNusa from '../assets/logo-pagarnusa.png';
import {
  Shield,
  CheckCircle,
  Printer,
  X,
  QrCode,
  Sparkles,
  Download,
} from 'lucide-react';

export default function ReceiptModal() {
  const { selectedReceipt, setSelectedReceipt } = useApp();

  if (!selectedReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-fadeIn">
      
      {/* Outer Container */}
      <div data-lenis-prevent className="relative w-full max-w-xl bg-slate-50 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Action Header (No Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Resi Donasi Berhasil Diterbitkan
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Resi</span>
            </button>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="print-card bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 space-y-6 relative overflow-hidden">
          
          {/* Subtle Watermark */}
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-5 pointer-events-none">
            <img src={logoPagarNusa} alt="" className="w-72 h-72 object-contain grayscale" />
          </div>

          {/* Header of Receipt */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <img src={logoPagarNusa} alt="Logo Pagar Nusa" className="w-14 h-14 object-contain" />
              <div>
                <h2 className="text-xl font-black text-amber-500 font-['Cinzel'] tracking-wide">
                  PAGAR NUSA KOTA BATAM
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pencak Silat Nahdlatul Ulama
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-600 border border-emerald-700/60 uppercase">
                TERVERIFIKASI
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                {selectedReceipt.refNumber}
              </p>
              <p className="text-[10px] text-slate-500">
                {selectedReceipt.timestamp}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-1">
            <h3 className="text-base font-extrabold uppercase tracking-widest text-slate-900 font-['Cinzel']">
              BUKTI RESI GOTONG ROYONG DIGITAL
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tanda Terima Donasi Sarana Organisasi
            </p>
          </div>

          {/* Summary Table */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
              <span className="text-slate-500">Nama Donatur / Pesilat</span>
              <span className="font-bold text-slate-900">{selectedReceipt.donorName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
              <span className="text-slate-500">Program Penyaluran</span>
              <span className="font-semibold text-teal-700 text-right max-w-[280px]">
                {selectedReceipt.campaignTitle}
              </span>
            </div>

            {selectedReceipt.paymentMethod && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Metode Pembayaran</span>
                <span className="font-medium text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
            )}

            {selectedReceipt.message?.trim() && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Pesan / Doa Keberkahan</span>
                <span className="italic text-slate-700 text-right max-w-[280px]">
                  "{selectedReceipt.message}"
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-amber-500">Total Nilai Donasi</span>
              <span className="text-xl font-extrabold text-amber-500 font-mono">
                Rp {selectedReceipt.amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="space-y-1">
              <p className="text-slate-700 font-semibold">
                Bendahara Kas Perguruan
              </p>
              <p className="text-slate-500">
                Dicetak secara otomatis & sah melalui Sistem Informasi Perguruan
              </p>
            </div>
          </div>

        </div>

        {/* Close Button at bottom (No Print) */}
        <div className="mt-6 flex justify-end no-print">
          <button
            onClick={() => setSelectedReceipt(null)}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
