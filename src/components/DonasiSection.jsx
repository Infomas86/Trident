import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  HeartHandshake,
  QrCode,
  Building,
  CheckCircle,
  Copy,
  PlusCircle,
  Pencil,
  Trash2,
  Receipt,
  ImagePlus,
  Sparkles,
  Lock,
  TrendingUp,
  X,
  CreditCard,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function DonasiSection() {
  const {
    campaignList,
    handleAddCampaign,
    handleUpdateCampaign,
    handleDeleteCampaign,
    handleDonate,
    myDonations,
    setSelectedReceipt,
    siteContent,
    role,
    ROLES,
    currentUser,
    isAdmin,
    setIsLoginModalOpen,
    showToast,
  } = useApp();

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // campaign id being edited, null = creating
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Donation form state
  const [selectedPreset, setSelectedPreset] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('Semoga padepokan semakin jaya dan berkah!');
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris' or 'bank'
  const [copiedBank, setCopiedBank] = useState(false);

  // New Campaign Form (Examiner)
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    category: 'Sarana Padepokan',
    targetAmount: 25000000,
    deadline: '2026-12-31',
    description: '',
  });

  const hasBank = !!(siteContent.bankName || siteContent.bankAccount || siteContent.bankHolder);
  const hasPaymentInfo = hasBank || !!siteContent.qrisImageUrl;

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
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk</span>
          </button>
        </div>
      </div>
    );
  }

  const handleOpenDonateModal = (campaign) => {
    setActiveCampaign(campaign);
    setSelectedPreset(50000);
    setCustomAmount('');
    setDonorName(currentUser?.name || '');
    setIsAnonymous(false);
    setProofFile(null);
  };

  const handleCopyVa = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    showToast('Nomor rekening/VA berhasil disalin!', 'success');
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleProcessDonation = async (e) => {
    e.preventDefault();
    if (!activeCampaign || submitting) return;

    const amount = customAmount ? Number(customAmount) : selectedPreset;
    if (!Number.isInteger(amount) || amount < 1000 || amount > 1_000_000_000_000) {
      showToast('Nominal donasi harus bilangan bulat antara Rp 1.000 dan Rp 1.000.000.000.000', 'error');
      return;
    }
    if (!proofFile) {
      showToast('Pilih foto bukti transfer terlebih dahulu', 'error');
      return;
    }

    setSubmitting(true);
    const done = await handleDonate(activeCampaign.id, {
      amount,
      donorName: isAnonymous ? 'Hamba Allah (Anonim)' : donorName,
      message,
      paymentMethod: paymentMethod === 'qris' ? 'QRIS' : `Transfer ${siteContent.bankName || 'Bank'}`,
      proofFile,
    });
    setSubmitting(false);
    if (done) setActiveCampaign(null);
  };

  const emptyCampaignForm = { title: '', category: 'Sarana Padepokan', targetAmount: 25000000, deadline: '2026-12-31', description: '' };

  const openEditCampaign = (c) => {
    setEditingId(c.id);
    setNewCampaignForm({ title: c.title, category: c.category || 'Sarana Padepokan', targetAmount: c.targetAmount, deadline: c.deadlineDate, description: c.description || '' });
    setIsAddCampaignOpen(true);
  };

  const closeCampaignForm = () => {
    setIsAddCampaignOpen(false);
    setEditingId(null);
    setNewCampaignForm(emptyCampaignForm);
  };

  const confirmDeleteCampaign = (c) => {
    if (window.confirm(`Hapus program "${c.title}"?`)) handleDeleteCampaign(c.id);
  };

  const handleSubmitNewCampaign = async (e) => {
    e.preventDefault();
    const payload = {
      title: newCampaignForm.title,
      category: newCampaignForm.category,
      targetAmount: Number(newCampaignForm.targetAmount),
      deadline: newCampaignForm.deadline || null,
      description: newCampaignForm.description,
    };
    const done = editingId ? await handleUpdateCampaign(editingId, payload) : await handleAddCampaign(payload);
    if (done) closeCampaignForm();
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

        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setNewCampaignForm(emptyCampaignForm);
              setIsAddCampaignOpen(true);
            }}
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
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => openEditCampaign(camp)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold">
                      <Pencil className="w-3 h-3" /> Ubah
                    </button>
                    <button onClick={() => confirmDeleteCampaign(camp)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-300 text-[11px] font-semibold">
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}

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

      {/* Donasi Saya */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white font-['Cinzel']">Donasi Saya</h3>
        {myDonations.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada donasi.</p>
        ) : (
          <div className="space-y-2">
            {myDonations.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{d.campaignTitle}</p>
                  <p className="text-slate-400">{d.timestamp} · {d.refNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-400">Rp {d.amount.toLocaleString('id-ID')}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${d.status === 'accepted' ? 'bg-emerald-950 text-emerald-400' : d.status === 'rejected' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-300'}`}>
                    {d.status === 'accepted' ? 'Diterima' : d.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </span>
                  {d.status === 'accepted' && (
                    <button onClick={() => setSelectedReceipt(d)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                      <Receipt className="w-3 h-3" /> Resi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                  min={1000}
                  max={1000000000000}
                  step={1}
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

              {/* Payment info from admin settings */}
              {!hasPaymentInfo ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-amber-300">
                  Info pembayaran belum diatur admin
                </div>
              ) : paymentMethod === 'qris' ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                  {siteContent.qrisImageUrl ? (
                    <img src={siteContent.qrisImageUrl} alt="QRIS" className="w-40 h-40 object-contain bg-white p-2 rounded-xl mx-auto" />
                  ) : (
                    <p className="text-xs text-slate-400">QRIS belum tersedia, gunakan transfer bank.</p>
                  )}
                  <p className="text-[11px] text-slate-400">Pindai dengan aplikasi m-Banking atau e-Wallet, lalu unggah bukti transfer.</p>
                </div>
              ) : hasBank ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Rekening {siteContent.bankName}:</span>
                    {siteContent.bankAccount && (
                      <button type="button" onClick={() => handleCopyVa(siteContent.bankAccount)} className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold">
                        <Copy className="w-3 h-3" />
                        <span>{copiedBank ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-base font-mono font-bold text-white tracking-wider">{siteContent.bankAccount}</p>
                  {siteContent.bankHolder && <p className="text-[11px] text-slate-400">a.n. {siteContent.bankHolder}</p>}
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  Rekening bank belum tersedia, gunakan QRIS.
                </div>
              )}

              {/* Proof of transfer */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bukti Transfer (JPEG/PNG/WebP, maks 5 MB)</label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-dashed border-slate-700 text-xs text-slate-300 cursor-pointer hover:border-amber-500">
                  <ImagePlus className="w-4 h-4 text-amber-400" />
                  <span className="truncate">{proofFile ? proofFile.name : 'Pilih foto bukti transfer'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      const reject = (msg) => {
                        showToast(msg, 'error');
                        e.target.value = '';
                        setProofFile(null);
                      };
                      if (f && !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return reject('Bukti transfer harus berupa foto JPEG, PNG, atau WebP');
                      if (f && f.size > 5 * 1024 * 1024) return reject('Ukuran bukti transfer maksimal 5 MB');
                      setProofFile(f);
                    }}
                  />
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!hasPaymentInfo || submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Mengirim...' : 'Kirim Donasi'}</span>
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
                {editingId ? 'Ubah Program Donasi' : 'Buka Program Donasi / Gotong Royong Baru'}
              </h3>
              <button
                onClick={closeCampaignForm}
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
                  type="date"
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
                  onClick={closeCampaignForm}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  {editingId ? 'Simpan Perubahan' : 'Luncurkan Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
