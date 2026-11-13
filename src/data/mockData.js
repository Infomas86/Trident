// Initial Mock Data for Trident Martial Arts Academy Management & UKT System

export const TRIDENT_BELT_LEVELS = [
  "Sabuk Hijau Strip Putih",
  "Sabuk Hijau Strip Kuning",
  "Sabuk Hijau Strip Merah",
  "Sabuk Hijau Strip Biru",
  "Sabuk Hijau Strip Cokelat",
  "Sabuk Hijau Strip Hitam",
];

export const INITIAL_STATS = {
  activeMembers: 1284,
  medalsCount: 342,
  padepokanBranches: 28,
  uktPassRate: 94.8,
  masterCouncil: 12,
};

export const INITIAL_TIMELINE = [
  {
    year: "1984",
    title: "Pendirian Padepokan Utama",
    desc: "Didirikan oleh Guru Besar Raden Mas Hardjo dengan 15 murid perdana, berfokus pada pelestarian jurus asli dan olah batin kesatria.",
    badge: "Akar Tradisi",
  },
  {
    year: "1998",
    title: "Ekspansi & Standarisasi Kurikulum",
    desc: "Penyusunan kurikulum resmi 4 Pos Evaluasi dan penggabungan teknik beladiri praktis dengan pembinaan fisik terukur.",
    badge: "Kurikulum Modern",
  },
  {
    year: "2012",
    title: "Kejuaraan Dunia & Prestasi Emas",
    desc: "Meraih juara umum pada Kejuaraan Seni Bela Diri Internasional di Chiang Mai dan pengakuan federasi dunia.",
    badge: "Prestasi Internasional",
  },
  {
    year: "2026",
    title: "Digitalisasi Sistem Trident UKT",
    desc: "Peluncuran sistem manajemen modern terintegrasi, transparansi evaluasi 4 Pos, dan penguatan kemandirian perguruan.",
    badge: "Transformasi Digital",
  },
];

export const INITIAL_PILLARS = [
  {
    id: 1,
    title: "Integritas & Kehormatan Kesatria",
    desc: "Menjunjung tinggi sportivitas, kejujuran batin, dan pantang menyerah dalam setiap langkah kehidupan.",
    icon: "Shield",
  },
  {
    id: 2,
    title: "Keunggulan Fisik & Teknik Jurus",
    desc: "Mempertajam refleks, ketahanan stamina prima, dan presisi eksekusi setiap jurus secara disiplin.",
    icon: "Zap",
  },
  {
    id: 3,
    title: "Persaudaraan Selaras Jiwa",
    desc: "Menyatukan pesilat dari berbagai latar belakang dalam satu ikatan kekeluargaan padepokan yang kokoh.",
    icon: "Users",
  },
  {
    id: 4,
    title: "Pengabdian bagi Bangsa",
    desc: "Menggunakan kemampuan beladiri untuk membela kebenaran, menjaga kedamaian, dan berprestasi membanggakan negeri.",
    icon: "Award",
  },
];

export const INITIAL_NEWS = [
  {
    id: "news-1",
    title: "Pengumuman Jadwal Ujian Kenaikan Tingkat (UKT) Semester Gasal 2026",
    category: "Pengumuman",
    date: "12 November 2026",
    author: "Sekretariat Padepokan",
    summary: "Seluruh calon peserta sabuk Hijau Strip Putih dan Kuning diwajibkan mendaftar verifikasi pos fisik.",
    content: "Pelaksanaan UKT Semester Gasal 2026 akan dipusatkan di Padepokan Agung Gedung Mandala Krida. Pengujian mencakup 4 Pos Penilaian standar Trident: Pengujian Fisik (25%), Teknik Jurus (30%), Pemahaman Materi & Etika (20%), serta Pertarungan Sabung / Sparring (25%). Peserta diharapkan membawa seragam sakral lengkap beserta pelindung kaki dan tulang kering.",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80",
    tags: ["UKT", "Ujian", "Pengumuman"],
  },
  {
    id: "news-2",
    title: "Tim Atlet Trident Boyong 5 Medali Emas di Kejuaraan Nasional Silat Open",
    category: "Prestasi",
    date: "08 November 2026",
    author: "Bidang Pembinaan Prestasi",
    summary: "Kontingen Trident berhasil menembus podium utama pada kategori tanding dewasa dan seni tunggal putri.",
    content: "Keberhasilan luar biasa diraih oleh tim pesilat Trident setelah bertarung sengit selama empat hari di GOR Jayabaya. Atlet andalan kita, Gilang Pratama (Kelas F Putra) dan Siti Rahmawati (Seni Baku Tunggal), meraih poin mutlak dari juri nasional. Perguruan menyampaikan apresiasi setinggi-tingginya kepada para pelatih.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    tags: ["Kejurnas", "Medali Emas", "Prestasi"],
  },
  {
    id: "news-3",
    title: "Latihan Gabungan Serentak 28 Cabang dan Sarasehan Sesepuh Pendekar",
    category: "Perguruan",
    date: "01 November 2026",
    author: "Humas Perguruan",
    summary: "Ratusan pesilat dari penjuru nusantara berkumpul mempererat silaturahmi dan pemantapan jurus tradisi.",
    content: "Latihan gabungan triwulanan berlangsung khidmat di pelataran utama padepokan. Agenda dibuka dengan penghormatan bendera perguruan dilanjutkan dengan bedah sejarah jurus pusaka bersama Dewan Pendekar. Kegiatan ini sekaligus meresmikan pembaruan sistem digitalisasi UKT berbasis aplikasi Trident.",
    image: "https://images.unsplash.com/photo-1509563033688-b666666572e9?auto=format&fit=crop&w=800&q=80",
    tags: ["Latgab", "Silaturahmi", "Perguruan"],
  },
  {
    id: "news-4",
    title: "Workshop Penguji UKT: Penerapan Standarisasi Nilai 4 Pos Terintegrasi",
    category: "Pengumuman",
    date: "25 Oktober 2026",
    author: "Dewan Penguji",
    summary: "Pelatihan khusus bagi seluruh penguji sabuk hijau strip hitam untuk menjamin objektivitas kelulusan.",
    content: "Dewan Penguji Trident menyelenggarakan bimbingan teknis penggunaan platform penilaian digital. Dengan bobot terkalibrasi (Fisik 25%, Teknik 30%, Etika 20%, Sabung 25%), diharapkan hasil evaluasi menjadi transparan, adil, dan memotivasi pesilat mencapai predikat Lulus dengan Pujian.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    tags: ["Workshop", "Penguji", "Akademi"],
  },
];

export const INITIAL_ACHIEVEMENTS = [
  {
    id: "ach-1",
    athleteName: "Gilang Pratama",
    championship: "Kejuaraan Nasional Silat Open 2026",
    scope: "Nasional",
    medal: "Emas",
    category: "Tanding Bebas Putra Kelas F (70-75 Kg)",
    year: "2026",
    notes: "Menang TKO di babak final dengan teknik kuncian bantingan.",
    photo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ach-2",
    athleteName: "Siti Rahmawati",
    championship: "World Martial Arts Festival Chiang Mai",
    scope: "Internasional",
    medal: "Emas",
    category: "Seni Baku Tunggal Senjata Golok & Tongkat",
    year: "2026",
    notes: "Skor tertinggi 489 poin mengungguli 18 kontingen negara.",
    photo: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ach-3",
    athleteName: "Budi Santoso & Dimas Wahyu",
    championship: "Pekan Olahraga Daerah (Porda) Jawa Barat",
    scope: "Daerah",
    medal: "Perak",
    category: "Ganda Putra Seni Pertarungan Realistis",
    year: "2026",
    notes: "Koreografi jurus sinkronisasi tingkat tinggi.",
    photo: "https://images.unsplash.com/photo-1509563033688-b666666572e9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ach-4",
    athleteName: "Aditya Wardhana",
    championship: "Southeast Asian Open Championship",
    scope: "Internasional",
    medal: "Perunggu",
    category: "Tanding Tarung Bebas Kelas E (65-70 Kg)",
    year: "2025",
    notes: "Bertarung dengan dedikasi tinggi meski mengalami cedera bahu.",
    photo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ach-5",
    athleteName: "Nanda Putri Kusuma",
    championship: "Kejuaraan Mahasiswa Piala Menpora",
    scope: "Nasional",
    medal: "Emas",
    category: "Tanding Putri Kelas C (55-60 Kg)",
    year: "2025",
    notes: "Sapuan kaki telak menghasilkan 3 kali jatuhan lawan.",
    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
  },
];

export const INITIAL_AGENDAS = [
  {
    id: "agenda-1",
    title: "Latihan Pemantapan Jurus Sabuk Hijau Strip Putih & Kuning",
    date: "18 November 2026",
    time: "15:30 - 18:00 WIB",
    location: "Padepokan Pusat - Dojo Cakra Bhakti",
    speaker: "Pendekar Madya Hendro & Pelatih Utama",
    description: "Fokus pada penguasaan 12 Jurus Pokok, langkah geseran egos, dan simulasi tangkisan beruntun untuk persiapan pos teknik Ujian Kenaikan Tingkat.",
  },
  {
    id: "agenda-2",
    title: "Ujian Kenaikan Tingkat (UKT) Akbar 4 Pos",
    date: "22 November 2026",
    time: "07:30 - 16:30 WIB",
    location: "Gedung Serbaguna Padepokan Trident",
    speaker: "Dewan Penguji Utama Master Bambang Wijaya",
    description: "Pelaksanaan UKT terpadu: Pos 1 Fisik, Pos 2 Jurus, Pos 3 Materi Etika, dan Pos 4 Sabung. Wajib hadir 30 menit sebelum apel pembukaan dengan seragam sakral lengkap.",
  },
  {
    id: "agenda-3",
    title: "Workshop Olah Pernafasan Tenaga Dalam & Meditasi",
    date: "29 November 2026",
    time: "06:00 - 09:30 WIB",
    location: "Bukit Padepokan Giri Tirta",
    speaker: "Guru Besar Raden Mas Hardjo",
    description: "Pendalaman teknik pernafasan diafragma dan penyelarasan energi batin untuk ketenangan jiwa serta pengendalian emosi pesilat.",
  },
];

export const INITIAL_CAMPAIGNS = [
  {
    id: "camp-1",
    title: "Pengadaan Matras Tanding Standar WKF/PERSILAT & Body Protector",
    category: "Sarana Padepokan",
    targetAmount: 35000000,
    collectedAmount: 26750000,
    deadline: "30 November 2026",
    description: "Pembaruan 2 gelanggang matras tebal 3cm dengan sertifikasi benturan aman demi melindungi atlet saat latihan bantingan intensif.",
    donorsCount: 64,
    recentDonations: [
      { id: "d-1", donorName: "Ahmad Fauzi (Anggota)", amount: 150000, date: "13 Nov 2026", message: "Semoga berkah untuk padepokan kita tercinta!" },
      { id: "d-2", donorName: "Hamba Allah", amount: 500000, date: "12 Nov 2026", message: "Maju terus pesilat Trident!" },
      { id: "d-3", donorName: "Alumni Angkatan 2018", amount: 2000000, date: "11 Nov 2026", message: "Salam persaudaraan dari cabang Bandung." },
    ],
  },
  {
    id: "camp-2",
    title: "Dana Beasiswa Pelatnas & Nutrisi Atlet Berprestasi Dhuafa",
    category: "Pemberdayaan Atlet",
    targetAmount: 20000000,
    collectedAmount: 14200000,
    deadline: "15 Desember 2026",
    description: "Bantuan suplemen nutrisi, perlengkapan seragam tanding, serta uang saku pembinaan bagi atlet potensial yang kurang mampu secara ekonomi.",
    donorsCount: 42,
    recentDonations: [
      { id: "d-4", donorName: "Master Bambang Wijaya", amount: 1000000, date: "10 Nov 2026", message: "Torehkan prestasi demi martabat perguruan." },
      { id: "d-5", donorName: "Keluarga Besar Cab. Surabaya", amount: 1500000, date: "09 Nov 2026", message: "Semangat adik-adik atlet!" },
    ],
  },
];

// Candidates with the exact Pagar Nusa / Pencak Silat belt hierarchy:
// 1. Sabuk Hijau Strip Putih
// 2. Sabuk Hijau Strip Kuning
// 3. Sabuk Hijau Strip Merah
// 4. Sabuk Hijau Strip Biru
// 5. Sabuk Hijau Strip Cokelat
// 6. Sabuk Hijau Strip Hitam
export const INITIAL_CANDIDATES = [
  {
    id: "cand-1",
    regNumber: "TRD-UKT-2026-084",
    name: "Ahmad Fauzi",
    currentBelt: "Sabuk Hijau Strip Putih",
    targetBelt: "Sabuk Hijau Strip Kuning",
    branch: "Padepokan Pusat Jakarta",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    posScores: {
      pos1: {
        score: 88,
        sub: { stamina: 90, physicalEndurance: 85, agility: 89 },
      },
      pos2: {
        score: 86,
        sub: { jurusPrecision: 88, strikeAccuracy: 85, stancesStability: 85 },
      },
      pos3: {
        score: 92,
        sub: { theory: 90, history: 92, ethicsRespect: 94 },
      },
      pos4: {
        score: 84,
        sub: { fightingCourage: 85, techniqueApplication: 82, emotionalControl: 85 },
      },
    },
    examinerNotes: "Kuda-kuda sangat stabil, pemahaman etika luhur pesilat istimewa. Perlu sedikit melatih kecepatan tangkisan atas pada situasi pertarungan jarak dekat.",
    dateExam: "14 November 2026",
    examinerName: "Master Bambang Wijaya (Penguji Utama)",
  },
  {
    id: "cand-2",
    regNumber: "TRD-UKT-2026-085",
    name: "Rian Saputra",
    currentBelt: "Sabuk Hijau Strip Kuning",
    targetBelt: "Sabuk Hijau Strip Merah",
    branch: "Cabang Bandung Utara",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    posScores: {
      pos1: {
        score: 75,
        sub: { stamina: 72, physicalEndurance: 78, agility: 75 },
      },
      pos2: {
        score: 74,
        sub: { jurusPrecision: 75, strikeAccuracy: 72, stancesStability: 75 },
      },
      pos3: {
        score: 80,
        sub: { theory: 78, history: 82, ethicsRespect: 80 },
      },
      pos4: {
        score: 72,
        sub: { fightingCourage: 75, techniqueApplication: 70, emotionalControl: 71 },
      },
    },
    examinerNotes: "Semangat tanding baik, perlu perbaikan tarikan nafas dan fleksibilitas tendangan samping.",
    dateExam: "14 November 2026",
    examinerName: "Master Bambang Wijaya (Penguji Utama)",
  },
  {
    id: "cand-3",
    regNumber: "TRD-UKT-2026-086",
    name: "Bayu Perkasa",
    currentBelt: "Sabuk Hijau Strip Merah",
    targetBelt: "Sabuk Hijau Strip Biru",
    branch: "Cabang Surabaya Barat",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    posScores: {
      pos1: {
        score: 64,
        sub: { stamina: 60, physicalEndurance: 65, agility: 67 },
      },
      pos2: {
        score: 68,
        sub: { jurusPrecision: 67, strikeAccuracy: 69, stancesStability: 68 },
      },
      pos3: {
        score: 74,
        sub: { theory: 70, history: 75, ethicsRespect: 77 },
      },
      pos4: {
        score: 66,
        sub: { fightingCourage: 65, techniqueApplication: 66, emotionalControl: 67 },
      },
    },
    examinerNotes: "Stamina menurun drastis di pos 1 dan 4. Disarankan mengulang (HER) pada materi fisik dan sparring 2 minggu ke depan.",
    dateExam: "14 November 2026",
    examinerName: "Master Bambang Wijaya (Penguji Utama)",
  },
  {
    id: "cand-4",
    regNumber: "TRD-UKT-2026-087",
    name: "Siti Rahmawati",
    currentBelt: "Sabuk Hijau Strip Biru",
    targetBelt: "Sabuk Hijau Strip Cokelat",
    branch: "Padepokan Pusat Jakarta",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    posScores: {
      pos1: {
        score: 95,
        sub: { stamina: 96, physicalEndurance: 94, agility: 95 },
      },
      pos2: {
        score: 94,
        sub: { jurusPrecision: 95, strikeAccuracy: 93, stancesStability: 94 },
      },
      pos3: {
        score: 96,
        sub: { theory: 95, history: 96, ethicsRespect: 97 },
      },
      pos4: {
        score: 92,
        sub: { fightingCourage: 94, techniqueApplication: 90, emotionalControl: 92 },
      },
    },
    examinerNotes: "Eksekusi teknik jurus sempurna dan kontrol emosi luar biasa saat sparring. Layak direkomendasikan menjadi asisten pelatih.",
    dateExam: "14 November 2026",
    examinerName: "Master Bambang Wijaya (Penguji Utama)",
  },
];

// Helper to calculate UKT Score precisely as defined in PRD Section 3 Module 6
// Formula: Skor Akhir = (Pos1 * 0.25) + (Pos2 * 0.30) + (Pos3 * 0.20) + (Pos4 * 0.25)
export function calculateUktScore(pos1, pos2, pos3, pos4) {
  const p1 = Number(pos1) || 0;
  const p2 = Number(pos2) || 0;
  const p3 = Number(pos3) || 0;
  const p4 = Number(pos4) || 0;

  const total = (p1 * 0.25) + (p2 * 0.30) + (p3 * 0.20) + (p4 * 0.25);
  const rounded = Math.round(total * 10) / 10;

  let status = "PERLU HER / TUNDA";
  let statusColor = "text-rose-400 bg-rose-950/40 border-rose-700/50";
  let badgeVariant = "her";

  if (rounded >= 85.0) {
    status = "LULUS DENGAN PUJIAN";
    statusColor = "text-amber-400 bg-amber-950/40 border-amber-500/50";
    badgeVariant = "cumlaude";
  } else if (rounded >= 70.0) {
    status = "LULUS";
    statusColor = "text-emerald-400 bg-emerald-950/40 border-emerald-600/50";
    badgeVariant = "pass";
  }

  return {
    score: rounded,
    status,
    statusColor,
    badgeVariant,
  };
}
