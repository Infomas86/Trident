import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Enter a UKT's examiner code (from that PAC's admin) to score that one UKT.
export default function ExaminerCodeCard() {
  const { joinUktByCode } = useApp();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (await joinUktByCode(code)) setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="trident-card rounded-2xl p-5 border border-amber-500/30 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900">Bertugas sebagai Penguji UKT?</h3>
      </div>
      <p className="text-xs text-slate-500">
        Masukkan kode UKT dari admin PAC penyelenggara untuk membuka meja penilaian UKT tersebut.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          autoCapitalize="characters"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: K7M2Q9XA"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono tracking-widest focus:border-amber-500 outline-none"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-bold"
        >
          {busy ? 'Memeriksa...' : 'Verifikasi'}
        </button>
      </div>
    </form>
  );
}
