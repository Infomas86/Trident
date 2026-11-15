import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  CheckCircle,
  Printer,
  X,
  QrCode,
  Sparkles,
  Download,
  Sword,
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
      <div className="relative w-full max-w-xl bg-slate-50 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        
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
            <Sword className="w-72 h-72 text-amber-500" />
          </div>

          {/* Header of Receipt */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-700 to-amber-600 p-[2px]">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Sword className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-amber-500 font-['Cinzel'] tracking-wide">
                  PAGAR NUSA KOTA BATAM
                </h2>
                <p className="text-[11px] text-slate-500">
                  Yayasan Perguruan Agung Seni Bela Diri Kesatria
                </p>
                <p className="text-[10px] text-slate-500">
                  SK Kemenkumham RI No. AHU-0019284.AH.01.07.2026
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
              Tanda Terima Donasi Sarana Perguruan
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

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
              <span className="text-slate-500">Metode Pembayaran</span>
              <span className="font-medium text-slate-800">
                {selectedReceipt.paymentMethod || 'QRIS Dinamis / Bank Transfer'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
              <span className="text-slate-500">Pesan / Doa Keberkahan</span>
              <span className="italic text-slate-700 text-right max-w-[280px]">
                "{selectedReceipt.message}"
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-amber-500">Total Nilai Donasi</span>
              <span className="text-xl font-extrabold text-amber-500 font-mono">
                Rp {selectedReceipt.amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Footer & QR Verification */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="space-y-1">
              <p className="text-slate-700 font-semibold">
                Bendahara Kas Perguruan
              </p>
              <p className="text-slate-500">
                Dicetak secara otomatis & sah melalui Sistem Informasi Perguruan
              </p>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white p-1 rounded-lg">
                {/* Simulated QR Code matrix */}
                <div className="w-full h-full bg-white flex items-center justify-center text-slate-900 text-[9px] font-mono text-center p-0.5">
                  QRIS VERIFIED
                </div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1">E-Verify Code</span>
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
