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
