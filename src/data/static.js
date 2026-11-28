export const TRIDENT_BELT_LEVELS = [
  "Sabuk Hijau Strip Putih",
  "Sabuk Hijau Strip Kuning",
  "Sabuk Hijau Strip Merah",
  "Sabuk Hijau Strip Biru",
  "Sabuk Hijau Strip Cokelat",
  "Sabuk Hijau Strip Hitam",
];

// Hierarki Struktural Resmi Organisasi:
// Pimpinan Pusat ➔ Pimpinan Wilayah ➔ Pimpinan Cabang ➔ Pimpinan Anak Cabang ➔ Ranting ➔ Anak Ranting (Tempat Latihan)
export const ORGANIZATIONAL_HIERARCHY = [
  {
    level: 1,
    tier: "Pimpinan Pusat (PP)",
    short: "PP",
    scope: "Tingkat Nasional / Pusat",
    desc: "Penetapan AD/ART, kurikulum baku bela diri, standarisasi Ujian Kenaikan Tingkat (UKT) nasional, dan sertifikasi dewan penguji utama.",
    example: "PP Pagar Nusa",
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
    tier: "Ranting (PR)",
    short: "PR",
    scope: "Tingkat Kelurahan / Desa",
    desc: "Kaderisasi langsung santri/pesilat di lingkungan desa/kelurahan, bimbingan akhlak moral kesatria, dan pengawasan rayon.",
    example: "PR Kelurahan Tanjung Piayu",
    badge: "Kelurahan / Desa",
  },
  {
    level: 6,
    tier: "Anak Ranting (PAR)",
    short: "PAR",
    scope: "Tempat Latihan / Rayon / RW",
    desc: "Ujung tombak latihan fisik, teknik jurus dasar, latihan pernafasan, dan penggemblengan rutin berkala setiap minggu.",
    example: "PAR Buana Garden (Tempat Latihan)",
    badge: "Tempat Latihan",
  },
];
