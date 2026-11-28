import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import LaporanDonasi from './LaporanDonasi';
import RevealTitle from './RevealTitle';

const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';

export default function DonasiVerifikasi() {
  const { pendingDonations, handleVerifyDonation, siteContent, handleUpdateSiteContent } = useApp();
  const [form, setForm] = useState(null);
  const f = form ?? {
    bankName: siteContent.bankName ?? '',
    bankAccount: siteContent.bankAccount ?? '',
    bankHolder: siteContent.bankHolder ?? '',
    qrisImageUrl: siteContent.qrisImageUrl ?? '',
  };
  const set = (k) => (e) => setForm({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const blank = (v) => v.trim() || null;
    const done = await handleUpdateSiteContent(
      { bankName: blank(f.bankName), bankAccount: blank(f.bankAccount), bankHolder: blank(f.bankHolder), qrisImageUrl: blank(f.qrisImageUrl) },
      'Info pembayaran berhasil diperbarui!',
    );
    if (done) setForm(null);
  };

  return (
    <div className="space-y-8 py-6">
      <RevealTitle className="text-2xl font-extrabold text-slate-900 font-['Cinzel']">Verifikasi Donasi</RevealTitle>

      <form onSubmit={save} className="trident-card rounded-2xl p-5 border border-slate-200 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Info Rekening & QRIS</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <input className={input} placeholder="Nama bank" value={f.bankName} onChange={set('bankName')} />
          <input className={input} placeholder="Nomor rekening" value={f.bankAccount} onChange={set('bankAccount')} />
          <input className={input} placeholder="Atas nama" value={f.bankHolder} onChange={set('bankHolder')} />
        </div>
        <input className={input} placeholder="URL gambar QRIS (https://...)" value={f.qrisImageUrl} onChange={set('qrisImageUrl')} />
        <button type="submit" className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">Simpan</button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Menunggu Verifikasi ({pendingDonations.length})</h3>
        {pendingDonations.length === 0 && <p className="text-xs text-slate-500">Tidak ada donasi yang menunggu.</p>}
        {pendingDonations.map((d) => (
          <div key={d.id} className="flex flex-wrap gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {d.signedProofUrl ? (
              <a href={d.signedProofUrl} target="_blank" rel="noreferrer">
                <img src={d.signedProofUrl} alt="Bukti transfer" className="w-28 h-28 object-cover rounded-lg border border-slate-200" />
              </a>
            ) : (
              <div className="w-28 h-28 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 text-center">Bukti tidak tersedia</div>
            )}
            <div className="flex-1 min-w-[200px] space-y-1">
              <p className="font-bold text-slate-900">{d.donorName}</p>
              <p className="text-slate-500">{d.campaignTitle} · {d.paymentMethod}</p>
              <p className="font-mono font-bold text-amber-500 text-sm">Rp {d.amount.toLocaleString('id-ID')}</p>
              {d.message && <p className="italic text-slate-700">"{d.message}"</p>}
              <p className="text-slate-500">{d.timestamp} · {d.refNumber}</p>
            </div>
            <div className="flex gap-2 items-start">
              <button onClick={() => handleVerifyDonation(d.id, 'accepted')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold">Terima</button>
              <button onClick={() => handleVerifyDonation(d.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-slate-900 font-bold">Tolak</button>
            </div>
          </div>
        ))}
      </div>

      <div className="trident-card rounded-2xl p-5 border border-slate-200">
        <LaporanDonasi />
      </div>
    </div>
  );
}
