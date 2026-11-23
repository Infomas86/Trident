import React from 'react';
import logo from '../assets/logo-pagarnusa.png';

// Lembar hasil UKT, tata letak mengikuti lembar nilai resmi (hitam-putih, huruf predikat bergaris bawah).
export default function SertifikatUkt({ candidate, template, area }) {
  const wilayah = String(area || 'Kota Batam').replace(/^PAC\s+/i, '').toUpperCase();
  return (
    <div className="print-card bg-white text-black p-4 sm:p-6 border border-slate-300 font-serif">
      <div className="flex items-center justify-center gap-3 sm:gap-5 pb-2 border-b-2 border-black">
        <img src={logo} alt="Lambang Pagar Nusa" className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0" />
        <div className="text-center leading-tight">
          <div className="text-[11px] sm:text-sm tracking-wide">PIMPINAN ANAK CABANG</div>
          <div className="text-[11px] sm:text-sm tracking-wide">PENCAK SILAT NAHDLATUL ULAMA&apos;</div>
          <div className="text-base sm:text-2xl">PAGAR NUSA – {wilayah}</div>
        </div>
      </div>

      <p className="text-[11px] sm:text-sm mt-3 leading-relaxed">
        Siswa / Santri yang bersangkutan telah mengikuti UJIAN KENAIKAN TINGKAT (UKT){' '}
        <b className="underline">{template.dari.toUpperCase()}</b> dengan predikat :
      </p>
      <div className="flex justify-between text-[11px] sm:text-sm mt-2">
        <span>Nama: <b>{candidate.name}</b></span>
        <span>{candidate.dateExam ?? ''}</span>
      </div>

      <table className="w-full border-collapse border border-black mt-2 text-[11px] sm:text-sm table-fixed">
        <thead>
          <tr>
            <th className="border border-black p-1.5 w-9 font-normal">No</th>
            <th className="border border-black p-1.5 font-normal">Materi</th>
            <th className="border border-black p-1.5 w-20 font-normal">Predikat</th>
          </tr>
        </thead>
        <tbody>
          {template.materi.map((m) => (
            <tr key={m.no}>
              <td className="border border-black p-2 text-center align-middle">{m.no}</td>
              <td className="border border-black p-2 align-middle">
                <b className="uppercase">{m.judul}</b>
                {m.sub.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {m.sub.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                )}
              </td>
              <td className="border border-black text-center align-middle text-2xl underline">
                {candidate.predikat?.[m.no] ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-center text-xs sm:text-base mt-3 font-semibold [font-variant:small-caps]">
        Tingkatkan prestasimu dengan semangat latihan.
      </p>
    </div>
  );
}
