import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  HeartHandshake,
  QrCode,
  Building,
  CheckCircle,
  Copy,
  PlusCircle,
  Sparkles,
  Lock,
  UserCheck,
  TrendingUp,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function DonasiSection() {
  const {
    campaignList,
    handleAddCampaign,
    handleDonate,
    role,
    ROLES,
    currentUser,
    handleRoleChange,
    showToast,
  } = useApp();

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);

  // Donation form state
  const [selectedPreset, setSelectedPreset] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(currentUser.name || 'Ahmad Fauzi');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('Semoga padepokan semakin jaya dan berkah!');
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris' or 'bank'
  const [copiedBank, setCopiedBank] = useState(false);

  // New Campaign Form (Examiner)
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    category: 'Sarana Padepokan',
    targetAmount: 25000000,
    deadline: '31 Desember 2026',
    description: '',
  });

  const presetAmounts = [25000, 50000, 100000, 250000, 500000];

  // If Guest, show locked state teaser per PRD
  if (role === ROLES.PUBLIC) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Program Donasi & Gotong Royong Perguruan
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Fitur kontribusi sarana padepokan dan beasiswa atlet bersifat eksklusif bagi anggota terdaftar dan pengurus perguruan.
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
            <span>Masuk sebagai Penguji / Admin</span>
          </button>
        </div>
      </div>
    );
  }

  const handleOpenDonateModal = (campaign) => {
    setActiveCampaign(campaign);
    setSelectedPreset(50000);
    setCustomAmount('');
    setDonorName(currentUser.name);
    setIsAnonymous(false);
  };

  const handleCopyVa = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    showToast('Nomor rekening/VA berhasil disalin!', 'success');
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleProcessDonation = (e) => {
    e.preventDefault();
    if (!activeCampaign) return;

    const amount = customAmount ? Number(customAmount) : selectedPreset;
    if (!amount || amount <= 0) {
      showToast('Masukkan nominal donasi yang valid!', 'error');
      return;
    }

    const finalDonorName = isAnonymous ? 'Hamba Allah (Anonim)' : donorName;

    handleDonate(activeCampaign.id, {
      amount,
      donorName: finalDonorName,
      message,
      paymentMethod: paymentMethod === 'qris' ? 'QRIS Dinamis Padepokan' : 'Virtual Account Bank Mandiri (137-00-9821-002)',
    });

    setActiveCampaign(null);
  };

  const handleSubmitNewCampaign = (e) => {
    e.preventDefault();
    handleAddCampaign({
      title: newCampaignForm.title,
      category: newCampaignForm.category,
      targetAmount: Number(newCampaignForm.targetAmount),
      deadline: newCampaignForm.deadline,
      description: newCampaignForm.description,
    });
    setNewCampaignForm({
      title: '',
      category: 'Sarana Padepokan',
      targetAmount: 25000000,
      deadline: '31 Desember 2026',
      description: '',
    });
    setIsAddCampaignOpen(false);
  };

  return (
    <div className="space-y-8 py-6">
      <ReceiptModal />

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Kemandirian Finansial & Gotong Royong</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Program Donasi Sarana & Beasiswa Perguruan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Wujudkan fasilitas padepokan yang representatif dan dukung atlet berprestasi secara transparan.
          </p>
        </div>

        {role === ROLES.EXAMINER && (
          <button
            onClick={() => setIsAddCampaignOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buka Program Donasi (Admin)</span>
          </button>
        )}
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {campaignList.map((camp) => {
          const percent = Math.min(100, Math.round((camp.collectedAmount / camp.targetAmount) * 100));

          return (
            <div
              key={camp.id}
              className="trident-card rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50 uppercase tracking-wide">
                    {camp.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Batas: <strong className="text-slate-200">{camp.deadline}</strong>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white font-['Cinzel'] leading-snug">
                  {camp.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {camp.description}
                </p>

                {/* Progress bar visual */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="text-slate-400">Terkumpul: </span>
                      <strong className="text-base text-amber-400 font-bold">
                        Rp {camp.collectedAmount.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Target: </span>
                      <span className="text-slate-200 font-medium">
                        Rp {camp.targetAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-amber-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold text-amber-300">{percent}% Tercapai</span>
                    <span>{camp.donorsCount} Donatur Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Recent Feed Preview */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <button
                  onClick={() => handleOpenDonateModal(camp)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Salurkan Donasi Sekarang</span>
                </button>

                {/* Mini feed */}
                {camp.recentDonations && camp.recentDonations.length > 0 && (
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Donasi Terkini:
                    </span>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span className="font-medium text-white truncate max-w-[180px]">
                        {camp.recentDonations[0].donorName}
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        +Rp {camp.recentDonations[0].amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Donation Form Modal */}
      {activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-['Cinzel']">
                  Formulir Donasi Gotong Royong
                </h3>
                <p className="text-xs text-amber-400 truncate max-w-xs">
                  {activeCampaign.title}
                </p>
              </div>
              <button
                onClick={() => setActiveCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessDonation} className="space-y-4">
              
              {/* Preset Nominal */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Pilih Nominal Donasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedPreset === amt && !customAmount
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Atau Masukkan Nominal Lain (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 750000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Donor Name & Anonymous */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Nama Donatur
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Sembunyikan Nama (Hamba Allah)</span>
                  </label>
                </div>
                {!isAnonymous && (
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                )}
              </div>

              {/* Doa / Pesan */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Doa / Pesan untuk Padepokan
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan atau doa semangat untuk saudara seperguruan..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold">QRIS Dinamis</p>
                      <p className="text-[10px] text-slate-400">Gopay, OVO, Dana, BCA</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'bank'
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold">Virtual Account</p>
                      <p className="text-[10px] text-slate-400">Bank Mandiri / BCA</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details Simulator */}
              {paymentMethod === 'qris' ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto shadow-md flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 border-2 border-slate-950 rounded flex flex-col items-center justify-center text-white text-[9px] p-1 font-mono">
                      <span>SCAN QRIS</span>
                      <span className="text-[12px] font-bold text-amber-400">TRIDENT</span>
                      <span>RESMI</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pindai menggunakan aplikasi m-Banking atau e-Wallet apa pun.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Nomor Rekening Mandiri Padepokan:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyVa('137009821002')}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedBank ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="text-base font-mono font-bold text-white tracking-wider">
                    137-00-9821-002
                  </p>
                  <p className="text-[11px] text-slate-400">
                    a.n. Yayasan Padepokan Trident Kesatria
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Konfirmasi & Cetak Bukti Resi Digital</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Buka Program Baru (Admin only) */}
      {isAddCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Buka Program Donasi / Gotong Royong Baru
              </h3>
              <button
                onClick={() => setIsAddCampaignOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewCampaign} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Nama Program / Pengadaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Renovasi Gelanggang Latihan Dojo Timur..."
                  value={newCampaignForm.title}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Kategori Donasi
                  </label>
                  <select
                    value={newCampaignForm.category}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Sarana Padepokan">Sarana Padepokan</option>
                    <option value="Pemberdayaan Atlet">Pemberdayaan Atlet</option>
                    <option value="Sosial Kemasyarakatan">Sosial Kemasyarakatan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Target Dana (Rp)
                  </label>
                  <input
                    type="number"
                    value={newCampaignForm.targetAmount}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Batas Akhir Program (Deadline)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 31 Desember 2026"
                  value={newCampaignForm.deadline}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Deskripsi & Peruntukan Dana
                </label>
                <textarea
                  rows={3}
                  value={newCampaignForm.description}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, description: e.target.value })}
                  placeholder="Jelaskan kebutuhan pengadaan, estimasi biaya, dan dampak bagi pesilat..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCampaignOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Luncurkan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
