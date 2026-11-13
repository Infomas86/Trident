import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { calculateUktScore } from '../data/mockData';
import {
  GraduationCap,
  Shield,
  Activity,
  Sword,
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  Sliders,
  UserCheck,
  Lock,
  Search,
  Download,
  Upload,
  Save,
  X,
  KeyRound,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function UktSection() {
  const {
    candidatesList,
    handleUpdateCandidateScores,
    handleImportCandidates,
    role,
    ROLES,
    currentUser,
    handleRoleChange,
    requestExaminerAccess,
    showToast,
  } = useApp();

  // Active Pos Sub-Tab: 'all' | 'pos1' | 'pos2' | 'pos3' | 'pos4'
  const [activePosTab, setActivePosTab] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateForEval, setSelectedCandidateForEval] = useState(null);
  const [evalScores, setEvalScores] = useState(null);
  const [examinerNotesInput, setExaminerNotesInput] = useState('');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');

  // Fast single-pos scoring modal
  const [quickPosModal, setQuickPosModal] = useState(null); // { candidate, posKey: 'pos1' | 'pos2' | 'pos3' | 'pos4' }

  // If Guest, show locked state teaser per PRD
  if (role === ROLES.PUBLIC) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Ujian Kenaikan Tingkat Terkunci
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Sesuai spesifikasi RBAC, sistem penilaian dan lembar evaluasi Ujian Kenaikan Tingkat hanya dapat diakses oleh Anggota (melihat hasil pribadi) dan Penguji (hak penuh penilaian Pos 1 - 4).
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <Sword className="w-4 h-4" />
            <span>Masuk sebagai Penguji UKT (Master Bambang)</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle open full evaluation slider modal
  const handleOpenEvaluation = (candidate) => {
    setSelectedCandidateForEval(candidate);
    setExaminerNotesInput(candidate.examinerNotes || '');
    setEvalScores({
      pos1: {
        stamina: candidate.posScores?.pos1?.sub?.stamina ?? 85,
        physicalEndurance: candidate.posScores?.pos1?.sub?.physicalEndurance ?? 85,
        agility: candidate.posScores?.pos1?.sub?.agility ?? 85,
      },
      pos2: {
        jurusPrecision: candidate.posScores?.pos2?.sub?.jurusPrecision ?? 85,
        strikeAccuracy: candidate.posScores?.pos2?.sub?.strikeAccuracy ?? 85,
        stancesStability: candidate.posScores?.pos2?.sub?.stancesStability ?? 85,
      },
      pos3: {
        theory: candidate.posScores?.pos3?.sub?.theory ?? 85,
        history: candidate.posScores?.pos3?.sub?.history ?? 85,
        ethicsRespect: candidate.posScores?.pos3?.sub?.ethicsRespect ?? 85,
      },
      pos4: {
        fightingCourage: candidate.posScores?.pos4?.sub?.fightingCourage ?? 85,
        techniqueApplication: candidate.posScores?.pos4?.sub?.techniqueApplication ?? 85,
        emotionalControl: candidate.posScores?.pos4?.sub?.emotionalControl ?? 85,
      },
    });
  };

  // Calculate live average of sub-criteria
  const getSubAverage = (subObj) => {
    if (!subObj) return 0;
    const values = Object.values(subObj).map(Number);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  };

  // Live calculation for full modal
  const liveP1 = evalScores ? getSubAverage(evalScores.pos1) : 0;
  const liveP2 = evalScores ? getSubAverage(evalScores.pos2) : 0;
  const liveP3 = evalScores ? getSubAverage(evalScores.pos3) : 0;
  const liveP4 = evalScores ? getSubAverage(evalScores.pos4) : 0;
  const liveResult = calculateUktScore(liveP1, liveP2, liveP3, liveP4);

  const handleSaveEvaluation = () => {
    if (!selectedCandidateForEval || !evalScores) return;

    const newPosScores = {
      pos1: { score: liveP1, sub: evalScores.pos1 },
      pos2: { score: liveP2, sub: evalScores.pos2 },
      pos3: { score: liveP3, sub: evalScores.pos3 },
      pos4: { score: liveP4, sub: evalScores.pos4 },
    };

    handleUpdateCandidateScores(selectedCandidateForEval.id, newPosScores, examinerNotesInput);
    setSelectedCandidateForEval(null);
  };

  // Quick Pos scoring submit
  const handleSaveQuickPos = (candidateId, posKey, updatedSub) => {
    const candidate = candidatesList.find((c) => c.id === candidateId);
    if (!candidate) return;

    const updatedAvg = getSubAverage(updatedSub);
    const newPosScores = {
      ...candidate.posScores,
      [posKey]: {
        score: updatedAvg,
        sub: updatedSub,
      },
    };

    handleUpdateCandidateScores(candidateId, newPosScores, candidate.examinerNotes || '');
    setQuickPosModal(null);
  };

  // Filter candidates
  const filteredCandidates = candidatesList.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate summary counts for Examiner
  const cumlaudeCount = candidatesList.filter(
    (c) => calculateUktScore(c.posScores.pos1.score, c.posScores.pos2.score, c.posScores.pos3.score, c.posScores.pos4.score).score >= 85.0
  ).length;

  const passCount = candidatesList.filter((c) => {
    const sc = calculateUktScore(c.posScores.pos1.score, c.posScores.pos2.score, c.posScores.pos3.score, c.posScores.pos4.score).score;
    return sc >= 70.0 && sc < 85.0;
  }).length;

  const herCount = candidatesList.filter(
    (c) => calculateUktScore(c.posScores.pos1.score, c.posScores.pos2.score, c.posScores.pos3.score, c.posScores.pos4.score).score < 70.0
  ).length;

  // Member View Data (Ahmad Fauzi)
  const myCandidateData = candidatesList.find((c) => c.name.toLowerCase().includes('ahmad fauzi')) || candidatesList[0];
  const myP1 = myCandidateData.posScores.pos1.score;
  const myP2 = myCandidateData.posScores.pos2.score;
  const myP3 = myCandidateData.posScores.pos3.score;
  const myP4 = myCandidateData.posScores.pos4.score;
  const myResult = calculateUktScore(myP1, myP2, myP3, myP4);

  // EXPORT TO CSV
  const handleExportCSV = () => {
    const headers = [
      'No Registrasi',
      'Nama Peserta',
      'Cabang Padepokan',
      'Sabuk Saat Ini',
      'Sabuk Target',
      'Pos 1 Fisik (25%)',
      'Pos 2 Jurus (30%)',
      'Pos 3 Etika (20%)',
      'Pos 4 Sabung (25%)',
      'Skor Akhir',
      'Status Kelulusan',
      'Catatan Penguji',
    ];

    const rows = candidatesList.map((c) => {
      const res = calculateUktScore(
        c.posScores.pos1.score,
        c.posScores.pos2.score,
        c.posScores.pos3.score,
        c.posScores.pos4.score
      );
      return [
        `"${c.regNumber}"`,
        `"${c.name}"`,
        `"${c.branch}"`,
        `"${c.currentBelt}"`,
        `"${c.targetBelt}"`,
        c.posScores.pos1.score,
        c.posScores.pos2.score,
        c.posScores.pos3.score,
        c.posScores.pos4.score,
        res.score.toFixed(1),
        `"${res.status}"`,
        `"${(c.examinerNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta-ujian-kenaikan-tingkat-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data peserta berhasil diekspor ke file CSV!', 'success');
  };

  // IMPORT CSV PROCESSOR
  const handleProcessImportCsv = () => {
    if (!importCsvText.trim()) {
      showToast('Harap tempel atau unggah isi data CSV terlebih dahulu!', 'error');
      return;
    }

    try {
      const lines = importCsvText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        showToast('Format CSV minimal memiliki 1 baris header dan 1 baris data peserta.', 'error');
        return;
      }

      // Check header or parse lines
      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV columns respecting quotes
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.replace(/^"|"$/g, '').trim());

        if (cols.length >= 2) {
          const regNumber = cols[0] || `TRD-UKT-${Date.now().toString().slice(-4)}`;
          const name = cols[1] || 'Pesilat Baru';
          const branch = cols[2] || 'Padepokan Pusat';
          const currentBelt = cols[3] || 'Sabuk Putih (Tingkat 1)';
          const targetBelt = cols[4] || 'Sabuk Hijau (Tingkat 2)';
          const p1 = Number(cols[5]) || 75;
          const p2 = Number(cols[6]) || 75;
          const p3 = Number(cols[7]) || 75;
          const p4 = Number(cols[8]) || 75;
          const notes = cols[11] || 'Peserta diimpor via file CSV';

          imported.push({
            id: `cand-${Date.now()}-${i}`,
            regNumber,
            name,
            currentBelt,
            targetBelt,
            branch,
            photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            posScores: {
              pos1: { score: p1, sub: { stamina: p1, physicalEndurance: p1, agility: p1 } },
              pos2: { score: p2, sub: { jurusPrecision: p2, strikeAccuracy: p2, stancesStability: p2 } },
              pos3: { score: p3, sub: { theory: p3, history: p3, ethicsRespect: p3 } },
              pos4: { score: p4, sub: { fightingCourage: p4, techniqueApplication: p4, emotionalControl: p4 } },
            },
            examinerNotes: notes,
            dateExam: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            examinerName: currentUser.name,
          });
        }
      }

      if (imported.length > 0) {
        handleImportCandidates(imported);
        setIsImportModalOpen(false);
        setImportCsvText('');
      } else {
        showToast('Tidak ada data valid yang dapat diimpor.', 'error');
      }
    } catch (err) {
      showToast('Gagal memproses file CSV: ' + err.message, 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const template = `No Registrasi,Nama Peserta,Cabang Padepokan,Sabuk Saat Ini,Sabuk Target,Pos 1 Fisik (25%),Pos 2 Jurus (30%),Pos 3 Etika (20%),Pos 4 Sabung (25%),Skor Akhir,Status Kelulusan,Catatan Penguji
"TRD-UKT-2026-091","Dimas Prasetyo","Padepokan Cabang Solo","Sabuk Hijau (Tingkat 2)","Sabuk Kuning (Tingkat 3)",85,82,88,84,84.4,"LULUS","Teknik tendangan bagus"
"TRD-UKT-2026-092","Aris Budiman","Padepokan Cabang Malang","Sabuk Kuning (Tingkat 3)","Sabuk Biru (Tingkat 4)",90,92,94,88,91.0,"LULUS DENGAN PUJIAN","Kuda-kuda sangat kokoh"`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-impor-peserta-ukt.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pos configuration helper
  const posConfig = {
    pos1: {
      title: 'Pos 1: Pengujian Fisik',
      weight: 'Bobot 25%',
      icon: Activity,
      color: 'blue',
      subCriteria: [
        { key: 'stamina', label: 'Daya Tahan Stamina' },
        { key: 'physicalEndurance', label: 'Push-Up / Sit-Up' },
        { key: 'agility', label: 'Agilitas & Refleks' },
      ],
    },
    pos2: {
      title: 'Pos 2: Pengujian Teknik Jurus',
      weight: 'Bobot 30%',
      icon: Sword,
      color: 'amber',
      subCriteria: [
        { key: 'jurusPrecision', label: 'Presisi Jurus Wajib' },
        { key: 'strikeAccuracy', label: 'Akurasi Tendangan & Tangkis' },
        { key: 'stancesStability', label: 'Kestabilan Kuda-Kuda' },
      ],
    },
    pos3: {
      title: 'Pos 3: Pemahaman Materi & Etika',
      weight: 'Bobot 20%',
      icon: BookOpen,
      color: 'blue',
      subCriteria: [
        { key: 'theory', label: 'Teori Bela Diri' },
        { key: 'history', label: 'Sejarah Perguruan' },
        { key: 'ethicsRespect', label: 'Etika & Penghormatan Kesatria' },
      ],
    },
    pos4: {
      title: 'Pos 4: Pertarungan Sabung / Sparring',
      weight: 'Bobot 25%',
      icon: Shield,
      color: 'amber',
      subCriteria: [
        { key: 'fightingCourage', label: 'Keberanian Tanding' },
        { key: 'techniqueApplication', label: 'Penerapan Teknik Bertarung' },
        { key: 'emotionalControl', label: 'Sportivitas & Kontrol Emosi' },
      ],
    },
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Digitalisasi Evaluasi Tingkatan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Ujian Kenaikan Tingkat
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Penilaian bertingkat stasiun Pos 1 s/d Pos 4 dengan kalkulasi otomatis dan manajemen peserta terpadu.
          </p>
        </div>

        {/* Action Buttons for Examiner: Import & Export */}
        {role === ROLES.EXAMINER && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-md transition-all"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Impor Peserta (CSV)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-950 transition-all"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>Ekspor Data (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* POS SELECTOR TABS (Pos 1, Pos 2, Pos 3, Pos 4, Semua Pos) - Khusus Penguji */}
      {role === ROLES.EXAMINER && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/70 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActivePosTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePosTab === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Semua Pos (Rekapitulasi)</span>
          </button>

          <button
            onClick={() => setActivePosTab('pos1')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePosTab === 'pos1'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-300" />
            <span>Pos 1: Fisik (25%)</span>
          </button>

          <button
            onClick={() => setActivePosTab('pos2')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePosTab === 'pos2'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sword className="w-4 h-4 text-amber-300" />
            <span>Pos 2: Teknik Jurus (30%)</span>
          </button>

          <button
            onClick={() => setActivePosTab('pos3')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePosTab === 'pos3'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-300" />
            <span>Pos 3: Materi & Etika (20%)</span>
          </button>

          <button
            onClick={() => setActivePosTab('pos4')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePosTab === 'pos4'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>Pos 4: Pertarungan Sabung (25%)</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 1: MEMBER VIEW (Read Hasil Pribadi & Otorisasi Kode Admin)           */}
      {/* ========================================================================= */}
      {role === ROLES.MEMBER && (
        <div className="space-y-6">
          
          {/* Banner Otorisasi Penguji bagi Anggota */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-['Cinzel']">
                  Mau Melakukan Tes Ujian Kenaikan Tingkat Sebagai Penguji?
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sebagai Anggota, Anda wajib memasukkan <span className="text-amber-400 font-semibold">Kode Otorisasi Admin</span> untuk membuka Meja Pengujian Pos 1 s/d Pos 4.
                </p>
              </div>
            </div>

            <button
              onClick={requestExaminerAccess}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105"
            >
              <KeyRound className="w-4 h-4" />
              <span>Input Kode Admin Penguji</span>
            </button>
          </div>

          {/* KARTU INFORMASI PRIBADI PENDAFTARAN PESERTA UKT */}
          <div className="trident-card rounded-2xl p-6 sm:p-8 border border-blue-900/40 relative overflow-hidden space-y-6 shadow-2xl">
            
            {/* Header Data Pendaftaran */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={myCandidateData.photo}
                  alt={myCandidateData.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-['Cinzel']">
                      {myCandidateData.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                      {myCandidateData.regNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Kenaikan Tingkat: <strong className="text-amber-400">{myCandidateData.currentBelt} ➔ {myCandidateData.targetBelt}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ranting / Cabang: <strong className="text-slate-200">{myCandidateData.branch}</strong>
                  </p>
                </div>
              </div>

              {/* Status Pendaftaran Badge */}
              <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Status Registrasi Peserta:
                </span>
                <div className="px-4 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider text-center text-emerald-400 bg-emerald-950/60 border-emerald-600/50 flex items-center gap-2 shadow-md">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>TERDAFTAR & TERVERIFIKASI</span>
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white font-['Cinzel'] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Informasi Pribadi & Data Registrasi Pendaftaran
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Berikut adalah rincian data diri resmi yang diisi saat mendaftarkan diri pada Ujian Kenaikan Tingkat.
                </p>
              </div>
            </div>

            {/* Grid Data Pribadi yang diisi ketika daftar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Nama Lengkap Pesilat</span>
                <p className="text-sm font-bold text-white">{myCandidateData.name}</p>
                <p className="text-[10px] text-slate-500">Sesuai KTP / Akta Kelahiran</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Nomor Registrasi / No. Anggota</span>
                <p className="text-sm font-mono font-bold text-amber-400">{myCandidateData.regNumber}</p>
                <p className="text-[10px] text-slate-500">Terdaftar di Buku Induk Padepokan</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Ranting / Asal Cabang</span>
                <p className="text-sm font-bold text-white">{myCandidateData.branch}</p>
                <p className="text-[10px] text-slate-500">Wilayah Pembinaan Silat</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Tingkatan Sabuk Saat Ini</span>
                <p className="text-sm font-bold text-emerald-400">{myCandidateData.currentBelt}</p>
                <p className="text-[10px] text-slate-500">Tingkat Kemahiran Aktif</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Target Kenaikan Jenjang</span>
                <p className="text-sm font-bold text-amber-400">{myCandidateData.targetBelt}</p>
                <p className="text-[10px] text-slate-500">Tingkat Ujian yang Ditempuh</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Pelatih / Pembina Ranting</span>
                <p className="text-sm font-bold text-white">Pendekar Hendro Suwarno</p>
                <p className="text-[10px] text-slate-500">Rekomendasi Dewan Pelatih</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Tempat & Tanggal Lahir</span>
                <p className="text-sm font-semibold text-slate-200">Jakarta, 14 Juli 2004 (22 Th)</p>
                <p className="text-[10px] text-slate-500">Kategori Usia: Dewasa</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Kontak WhatsApp / HP</span>
                <p className="text-sm font-mono font-semibold text-slate-200">+62 812-9842-1084</p>
                <p className="text-[10px] text-slate-500">Nomor Aktif Pemberitahuan</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Lokasi & Jadwal Ujian UKT</span>
                <p className="text-sm font-semibold text-white">Padepokan Pusat • 22 Nov 2026</p>
                <p className="text-[10px] text-slate-500">Pukul 07:30 WIB - Selesai</p>
              </div>

            </div>

            {/* Perlengkapan yang harus dibawa */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                Catatan Perlengkapan Saat Mengikuti Ujian:
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside leading-relaxed">
                <li>Mengenakan seragam sakral resmi perguruan lengkap dengan sabuk saat ini ({myCandidateData.currentBelt}).</li>
                <li>Membawa perlengkapan pelindung pribadi: gumshield, pelindung tulang kering, dan body protector.</li>
                <li>Wajib hadir di lokasi padepokan minimal 30 menit sebelum apel pembukaan ujian dimulai.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: EXAMINER VIEW                                                     */}
      {/* ========================================================================= */}
      {role === ROLES.EXAMINER && (
        <div className="space-y-6">
          
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Total Peserta UKT</p>
              <p className="text-2xl font-black text-white font-['Cinzel'] mt-1">
                {candidatesList.length} Pesilat
              </p>
            </div>

            <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-600/30">
              <p className="text-xs text-amber-300">Lulus Dengan Pujian (≥85)</p>
              <p className="text-2xl font-black text-amber-400 font-['Cinzel'] mt-1">
                {cumlaudeCount}
              </p>
            </div>

            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-600/30">
              <p className="text-xs text-emerald-300">Lulus Reguler (70 - 84.9)</p>
              <p className="text-2xl font-black text-emerald-400 font-['Cinzel'] mt-1">
                {passCount}
              </p>
            </div>

            <div className="bg-rose-950/30 p-4 rounded-xl border border-rose-600/30">
              <p className="text-xs text-rose-300">Perlu HER / Tunda (&lt;70)</p>
              <p className="text-2xl font-black text-rose-400 font-['Cinzel'] mt-1">
                {herCount}
              </p>
            </div>
          </div>

          {/* Search bar & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama peserta, nomor registrasi, atau cabang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Menampilkan {filteredCandidates.length} dari {candidatesList.length} peserta ujian
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SUB-VIEW A: SEMUA POS (REKAPITULASI)                                  */}
          {/* ===================================================================== */}
          {activePosTab === 'all' && (
            <div className="trident-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Peserta UKT</th>
                      <th className="py-3 px-3">Jenjang Kenaikan</th>
                      <th className="py-3 px-2 text-center">Pos 1 (25%)</th>
                      <th className="py-3 px-2 text-center">Pos 2 (30%)</th>
                      <th className="py-3 px-2 text-center">Pos 3 (20%)</th>
                      <th className="py-3 px-2 text-center">Pos 4 (25%)</th>
                      <th className="py-3 px-3 text-right">Skor Akhir</th>
                      <th className="py-3 px-3 text-center">Status Kelulusan</th>
                      <th className="py-3 px-4 text-center">Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredCandidates.map((c) => {
                      const p1 = c.posScores.pos1.score;
                      const p2 = c.posScores.pos2.score;
                      const p3 = c.posScores.pos3.score;
                      const p4 = c.posScores.pos4.score;
                      const res = calculateUktScore(p1, p2, p3, p4);

                      return (
                        <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.photo}
                                alt={c.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{c.name}</p>
                                <p className="text-[10px] text-amber-400 font-mono">{c.regNumber}</p>
                                <p className="text-[10px] text-slate-500">{c.branch}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-300">
                            <p className="text-[11px] text-slate-400">{c.currentBelt}</p>
                            <p className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                              ➔ {c.targetBelt}
                            </p>
                          </td>

                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">{p1}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-amber-300">{p2}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">{p3}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-amber-300">{p4}</td>

                          <td className="py-3 px-3 text-right">
                            <span className="text-sm font-black font-mono text-white">
                              {res.score.toFixed(1)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${res.statusColor}`}>
                              {res.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenEvaluation(c)}
                              className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800 text-blue-300 border border-blue-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Evaluasi Nilai</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SUB-VIEW B: POS SPESIFIK (POS 1, POS 2, POS 3, ATAU POS 4)          */}
          {/* ===================================================================== */}
          {activePosTab !== 'all' && (
            <div className="space-y-4">
              
              {/* Pos Banner Header */}
              {(() => {
                const conf = posConfig[activePosTab];
                const Icon = conf.icon;
                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-['Cinzel']">
                            {conf.title}
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {conf.weight}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sub-kriteria penilaian: {conf.subCriteria.map((s) => s.label).join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Meja Penguji Stasiun Aktif</span>
                    </div>
                  </div>
                );
              })()}

              {/* Pos Specific Candidates Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((c) => {
                  const conf = posConfig[activePosTab];
                  const currentPosData = c.posScores[activePosTab];
                  const posScore = currentPosData?.score || 0;
                  const subData = currentPosData?.sub || {};

                  return (
                    <div
                      key={c.id}
                      className="trident-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.photo}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{c.name}</p>
                              <p className="text-[10px] text-amber-400 font-mono">{c.regNumber}</p>
                              <p className="text-[10px] text-slate-400">{c.branch}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              Nilai {activePosTab.toUpperCase()}
                            </span>
                            <span className="text-xl font-black font-mono text-amber-400">
                              {posScore} <span className="text-[11px] text-slate-500 font-normal">pts</span>
                            </span>
                          </div>
                        </div>

                        {/* Sub-criteria breakdown */}
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                          {conf.subCriteria.map((sub) => (
                            <div key={sub.key} className="flex justify-between items-center text-slate-300">
                              <span className="text-[11px] text-slate-400">{sub.label}</span>
                              <strong className="text-slate-200 font-mono">
                                {subData[sub.key] ?? posScore}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {c.currentBelt} ➔ {c.targetBelt}
                        </span>
                        <button
                          onClick={() => setQuickPosModal({ candidate: c, posKey: activePosTab })}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Beri Nilai {activePosTab.toUpperCase()}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL IMPOR PESERTA (CSV)                                                 */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Cinzel']">
                  Impor Data Peserta Ujian Kenaikan Tingkat
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Unggah file <strong>.CSV</strong> atau tempel teks tabular langsung pada kolom di bawah. Data peserta akan otomatis ditambahkan ke sistem rekapitulasi ujian.
            </p>

            {/* Template sample button */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Belum memiliki format CSV?</span>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Contoh Format Template CSV</span>
              </button>
            </div>

            {/* File Upload input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Pilih File CSV dari Komputer:
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900/60 file:text-blue-300 hover:file:bg-blue-800 cursor-pointer"
              />
            </div>

            {/* Paste CSV Textarea */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Atau Tempel (Paste) Isi CSV di Sini:
              </label>
              <textarea
                rows={5}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder="No Registrasi,Nama Peserta,Cabang Padepokan,Sabuk Saat Ini,Sabuk Target,Pos 1 Fisik,Pos 2 Jurus,Pos 3 Etika,Pos 4 Sabung,Skor Akhir,Status Kelulusan,Catatan..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessImportCsv}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Mulai Impor Peserta</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL QUICK POS EVALUATION (UNTUK POS 1, POS 2, POS 3, ATAU POS 4)        */}
      {/* ========================================================================= */}
      {quickPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            
            {(() => {
              const conf = posConfig[quickPosModal.posKey];
              const cand = quickPosModal.candidate;
              const subObj = { ...cand.posScores[quickPosModal.posKey]?.sub };

              return (
                <QuickPosEditor
                  candidate={cand}
                  posConfig={conf}
                  posKey={quickPosModal.posKey}
                  initialSub={subObj}
                  onClose={() => setQuickPosModal(null)}
                  onSave={(updatedSub) => handleSaveQuickPos(cand.id, quickPosModal.posKey, updatedSub)}
                />
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EVALUASI PENUH 4 POS (Sliders Komprehensif)                        */}
      {/* ========================================================================= */}
      {selectedCandidateForEval && evalScores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Header of Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidateForEval.photo}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-['Cinzel']">
                    Evaluasi Lengkap UKT: {selectedCandidateForEval.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {selectedCandidateForEval.regNumber} • {selectedCandidateForEval.currentBelt} ➔ {selectedCandidateForEval.targetBelt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidateForEval(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE AUTO-CALCULATION BANNER */}
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Hasil Kalkulasi Otomatis Berbasis Slider:
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-amber-300 font-mono">
                    {liveResult.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({(liveP1 * 0.25).toFixed(1)} + {(liveP2 * 0.30).toFixed(1)} + {(liveP3 * 0.20).toFixed(1)} + {(liveP4 * 0.25).toFixed(1)})
                  </span>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-center ${liveResult.statusColor}`}>
                {liveResult.status}
              </div>
            </div>

            {/* 4 POS SLIDERS SECTION */}
            <div className="space-y-6">
              
              {/* POS 1: FISIK (Bobot 25%) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pos 1: Pengujian Fisik (Bobot 25%)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-300">
                    Rata-rata: {liveP1} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Daya Tahan Stamina</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos1.stamina}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos1.stamina}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos1: { ...evalScores.pos1, stamina: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Push-Up / Sit-Up</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos1.physicalEndurance}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos1.physicalEndurance}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos1: { ...evalScores.pos1, physicalEndurance: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Agilitas & Refleks</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos1.agility}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos1.agility}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos1: { ...evalScores.pos1, agility: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* POS 2: TEKNIK JURUS (Bobot 30%) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pos 2: Pengujian Teknik Jurus (Bobot 30%)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Rata-rata: {liveP2} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Presisi Jurus Wajib</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos2.jurusPrecision}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos2.jurusPrecision}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos2: { ...evalScores.pos2, jurusPrecision: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Akurasi Tendangan & Tangkis</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos2.strikeAccuracy}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos2.strikeAccuracy}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos2: { ...evalScores.pos2, strikeAccuracy: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Kestabilan Kuda-Kuda</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos2.stancesStability}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos2.stancesStability}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos2: { ...evalScores.pos2, stancesStability: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* POS 3: MATERI & ETIKA (Bobot 20%) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pos 3: Pemahaman Materi & Etika (Bobot 20%)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-300">
                    Rata-rata: {liveP3} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Teori Bela Diri</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos3.theory}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos3.theory}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos3: { ...evalScores.pos3, theory: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Sejarah Perguruan</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos3.history}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos3.history}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos3: { ...evalScores.pos3, history: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Etika & Penghormatan</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos3.ethicsRespect}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos3.ethicsRespect}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos3: { ...evalScores.pos3, ethicsRespect: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* POS 4: PERTARUNGAN SABUNG / SPARRING (Bobot 25%) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pos 4: Pertarungan Sabung / Sparring (Bobot 25%)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Rata-rata: {liveP4} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Keberanian Tanding</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos4.fightingCourage}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos4.fightingCourage}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos4: { ...evalScores.pos4, fightingCourage: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Penerapan Teknik Bertarung</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos4.techniqueApplication}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos4.techniqueApplication}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos4: { ...evalScores.pos4, techniqueApplication: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Sportivitas / Kontrol Emosi</span>
                      <strong className="text-amber-400 font-mono">{evalScores.pos4.emotionalControl}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evalScores.pos4.emotionalControl}
                      onChange={(e) =>
                        setEvalScores({
                          ...evalScores,
                          pos4: { ...evalScores.pos4, emotionalControl: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Examiner Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Catatan Dewan Penguji untuk Peserta:
                </label>
                <textarea
                  rows={2}
                  value={examinerNotesInput}
                  onChange={(e) => setExaminerNotesInput(e.target.value)}
                  placeholder="Berikan masukan koreksi teknik, apresiasi stamina, atau catatan kesiapan naik sabuk..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCandidateForEval(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nilai Ujian</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for Quick Pos Scoring
function QuickPosEditor({ candidate, posConfig, posKey, initialSub, onClose, onSave }) {
  const [subValues, setSubValues] = useState({ ...initialSub });

  const values = Object.values(subValues).map(Number);
  const currentAvg = Math.round((values.reduce((a, b) => a + b, 0) / (values.length || 1)) * 10) / 10;

  return (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white font-['Cinzel']">
            Penilaian {posConfig.title}
          </h3>
          <p className="text-xs text-amber-400 font-mono">
            {candidate.name} • {candidate.regNumber}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-300">Nilai Rata-rata {posKey.toUpperCase()}:</span>
        <span className="text-2xl font-black font-mono text-amber-400">
          {currentAvg} <span className="text-xs text-slate-500 font-normal">pts</span>
        </span>
      </div>

      <div className="space-y-4 py-2">
        {posConfig.subCriteria.map((sub) => (
          <div key={sub.key} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>{sub.label}</span>
              <strong className="text-amber-400 font-mono">{subValues[sub.key] ?? 80}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={subValues[sub.key] ?? 80}
              onChange={(e) => setSubValues({ ...subValues, [sub.key]: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => onSave(subValues)}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
        >
          Simpan Nilai Pos
        </button>
      </div>
    </>
  );
}
