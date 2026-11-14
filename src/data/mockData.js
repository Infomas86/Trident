// Initial Mock Data for Trident Martial Arts Academy Management & UKT System

// Hierarki Struktural Resmi Organisasi Perguruan:
// Pimpinan Pusat ➔ Pimpinan Wilayah ➔ Pimpinan Cabang ➔ Pimpinan Anak Cabang ➔ Pimpinan Ranting ➔ Pimpinan Anak Ranting (Tempat Latihan)
export const ORGANIZATIONAL_HIERARCHY = [
  {
    level: 1,
    tier: "Pimpinan Pusat (PP)",
    short: "PP",
    scope: "Tingkat Nasional / Pusat",
    desc: "Penetapan AD/ART, kurikulum baku bela diri, standarisasi Ujian Kenaikan Tingkat (UKT) nasional, dan sertifikasi dewan penguji utama.",
    example: "PP Pagar Nusa Trident",
    badge: "Otoritas Tertinggi",
  },
  {
    level: 2,
    tier: "Pimpinan Wilayah (PW)",
    short: "PW",
    scope: "Tingkat Provinsi",
    desc: "Koordinasi wilayah provinsi, pengawasan standarisasi kurikulum daerah, serta pembinaan dan seleksi kejuaraan tingkat provinsi.",
    example: "PW Kepulauan Riau",
    badge: "Tingkat Provinsi",
  },
  {
    level: 3,
    tier: "Pimpinan Cabang (PC)",
    short: "PC",
    scope: "Tingkat Kota / Kabupaten",
    desc: "Registrasi anggota terpadu (E-KTA), pembinaan anak cabang se-kabupaten/kota, dan koordinasi kejuaraan antar ranting.",
    example: "PC Kota Batam",
    badge: "Kota / Kabupaten",
  },
  {
    level: 4,
    tier: "Pimpinan Anak Cabang (PAC)",
    short: "PAC",
    scope: "Tingkat Kecamatan",
    desc: "Penyelenggara teknis Ujian Kenaikan Tingkat (UKT), penerbitan nomor registrasi kelulusan, dan pengesahan kenaikan strip sabuk.",
    example: "PAC Kecamatan Sungai Beduk",
    badge: "Tingkat Kecamatan",
  },
  {
    level: 5,
    tier: "Pimpinan Ranting (PR)",
    short: "PR",
    scope: "Tingkat Kelurahan / Desa",
    desc: "Kaderisasi langsung santri/pesilat di lingkungan desa/kelurahan, bimbingan akhlak moral kesatria, dan pengawasan rayon.",
    example: "PR Kelurahan Tanjung Piayu",
    badge: "Kelurahan / Desa",
  },
  {
    level: 6,
    tier: "Pimpinan Anak Ranting (PAR)",
    short: "PAR",
    scope: "Tempat Latihan / Rayon / RW",
    desc: "Ujung tombak latihan fisik, teknik jurus dasar, latihan pernafasan, dan penggemblengan rutin berkala setiap minggu.",
    example: "PAR Buana Garden (Tempat Latihan)",
    badge: "Tempat Latihan",
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

// Candidates with complete structural lineage:
// PP ➔ PW ➔ PC ➔ PAC ➔ PR ➔ PAR (Tempat Latihan)
export const INITIAL_CANDIDATES = [
  {
    id: "cand-1",
    regNumber: "TRD-UKT-2026-084",
    name: "Ahmad Fauzi",
    currentBelt: "Sabuk Hijau Strip Putih",
    targetBelt: "Sabuk Hijau Strip Kuning",
    branch: "PAC Sungai Beduk - PR Tanjung Piayu",
    structure: {
      pp: "Pimpinan Pusat (PP) Trident",
      pw: "PW Kepulauan Riau",
      pc: "PC Kota Batam",
      pac: "PAC Sungai Beduk",
      pr: "PR Tanjung Piayu",
      par: "PAR Buana Garden (Tempat Latihan)",
    },
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
    branch: "PAC Sungai Beduk - PR Mangsang",
    structure: {
      pp: "Pimpinan Pusat (PP) Trident",
      pw: "PW Kepulauan Riau",
      pc: "PC Kota Batam",
      pac: "PAC Sungai Beduk",
      pr: "PR Mangsang",
      par: "PAR Puri Agung (Tempat Latihan)",
    },
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
    branch: "PAC Batam Kota - PR Belian",
    structure: {
      pp: "Pimpinan Pusat (PP) Trident",
      pw: "PW Kepulauan Riau",
      pc: "PC Kota Batam",
      pac: "PAC Batam Kota",
      pr: "PR Belian",
      par: "PAR Duta Mas (Tempat Latihan)",
    },
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
    branch: "PAC Sungai Beduk - PR Duriangkang",
    structure: {
      pp: "Pimpinan Pusat (PP) Trident",
      pw: "PW Kepulauan Riau",
      pc: "PC Kota Batam",
      pac: "PAC Sungai Beduk",
      pr: "PR Duriangkang",
      par: "PAR Bida Asri (Tempat Latihan)",
    },
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
