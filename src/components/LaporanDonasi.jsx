import React, { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Users2, Wallet } from 'lucide-react';
import * as api from '../lib/api';
import { useApp } from '../context/AppContext';
import { memoGet, memoLoad } from '../lib/memo';

const fmtRp = (n) => `Rp ${n.toLocaleString('id-ID')}`;
const fmtMonth = (iso) => new Date(iso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

const saveFile = (name, text, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type })); // BOM: Excel baca UTF-8 dengan benar
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Grafik batang bulanan sederhana (SVG inline, tanpa library tambahan). Satu seri (total per
// bulan) jadi tidak perlu legenda - batang diberi label langsung + tooltip saat hover/tap.
function MonthlyBarChart({ data }) {
  const [hover, setHover] = useState(null);
  if (data.length === 0) return <p className="text-xs text-slate-500 text-center py-8">Belum ada data untuk ditampilkan.</p>;

  const W = 640, H = 220, padL = 8, padR = 8, padB = 28, padT = 12;
  const chartW = W - padL - padR;
  const max = Math.max(1, ...data.map((d) => d.total));
  const barW = Math.min(56, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: `${data.length * 70}px` }} role="img" aria-label="Grafik total donasi per bulan">
        {/* garis dasar, warna recessive */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#e2e8f0" strokeWidth="1" />
        {data.map((d, i) => {
          const h = ((H - padB - padT) * d.total) / max;
          const x = padL + i * gap + (gap - barW) / 2;
          const y = H - padB - h;
          const isHover = hover === i;
          return (
            <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4} fill={isHover ? '#0f766e' : '#0d9488'} />
              <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="#64748b">{d.label}</text>
              {isHover && (
                <g>
                  <rect x={Math.min(Math.max(x + barW / 2 - 44, 0), W - 88)} y={Math.max(y - 26, 0)} width="88" height="20" rx={5} fill="#0f172a" />
                  <text x={Math.min(Math.max(x + barW / 2, 44), W - 44)} y={Math.max(y - 26, 0) + 14} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">
                    {fmtRp(d.total)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Laporan donasi (admin): ringkasan per bulan & per program, dari view donation_report (dihitung
// di database, bukan menarik seluruh baris donasi mentah). Data dimuat & di-cache sendiri (pola
// sama seperti AkunSection/RegCodesSection), bukan lewat loader AppContext - supaya tidak
// menambah beban saat admin tidak membuka laporan ini.
export default function LaporanDonasi() {
  const { showToast } = useApp();
  const [rows, setRows] = useState(() => memoGet('donationReport') ?? null);
  const [campaignFilter, setCampaignFilter] = useState('all');

  const load = (force = false) => memoLoad('donationReport', api.listDonationReport, force).then(setRows).catch((e) => {
    console.error(e);
    showToast('Gagal memuat laporan donasi', 'error');
  });
  useEffect(() => { if (rows === null) load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const campaigns = useMemo(() => [...new Map((rows ?? []).map((r) => [r.campaignId, r.campaignTitle])).entries()], [rows]);
  const filtered = useMemo(() => (rows ?? []).filter((r) => campaignFilter === 'all' || r.campaignId === campaignFilter), [rows, campaignFilter]);

  const totals = useMemo(() => ({
    amount: filtered.reduce((s, r) => s + r.totalAmount, 0),
    donors: filtered.reduce((s, r) => s + r.donorsCount, 0),
  }), [filtered]);

  const monthly = useMemo(() => {
    const byMonth = new Map();
    filtered.forEach((r) => {
      const cur = byMonth.get(r.periodMonth) ?? 0;
      byMonth.set(r.periodMonth, cur + r.totalAmount);
    });
    return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, total]) => ({ key, total, label: fmtMonth(key) }));
  }, [filtered]);

  const exportCsv = () => {
    const head = 'Bulan,Program,Jumlah Donatur,Total (Rp)';
    const body = filtered
      .slice()
      .sort((a, b) => a.periodMonth.localeCompare(b.periodMonth))
      .map((r) => [fmtMonth(r.periodMonth), `"${r.campaignTitle.replace(/"/g, '""')}"`, r.donorsCount, r.totalAmount].join(','));
    saveFile(`laporan-donasi-${new Date().toISOString().slice(0, 10)}.csv`, [head, ...body].join('\n'));
  };

  if (rows === null) return <p className="text-xs text-slate-500">Memuat laporan…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">Laporan Donasi</h3>
        <div className="flex items-center gap-2">
          <select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900">
            <option value="all">Semua Program</option>
            {campaigns.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>
          <button onClick={() => load(true)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold">Muat ulang</button>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold">
            <Download className="w-3.5 h-3.5" /> Ekspor CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="trident-card rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><Wallet className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500">Total Donasi Diterima</p>
            <p className="text-base font-bold text-slate-900 truncate">{fmtRp(totals.amount)}</p>
          </div>
        </div>
        <div className="trident-card rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Users2 className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500">Transaksi Diterima</p>
            <p className="text-base font-bold text-slate-900">{totals.donors}</p>
          </div>
        </div>
      </div>

      <div className="trident-card rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
          <span>Total Donasi per Bulan</span>
        </div>
        <MonthlyBarChart data={monthly} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
            <tr>{['Bulan', 'Program', 'Donatur', 'Total'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">Belum ada donasi diterima.</td></tr>
            )}
            {filtered
              .slice()
              .sort((a, b) => b.periodMonth.localeCompare(a.periodMonth) || a.campaignTitle.localeCompare(b.campaignTitle))
              .map((r) => (
                <tr key={`${r.campaignId}-${r.periodMonth}`} className="border-t border-slate-200 text-slate-800">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtMonth(r.periodMonth)}</td>
                  <td className="px-3 py-2">{r.campaignTitle}</td>
                  <td className="px-3 py-2 text-center">{r.donorsCount}</td>
                  <td className="px-3 py-2 font-mono font-bold">{fmtRp(r.totalAmount)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
