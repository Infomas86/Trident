import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { useApp } from '../context/AppContext';

// Photo input: paste a URL or pick a file (uploaded to Supabase Storage, URL filled in).
export default function ImageField({ label, value, onChange, folder }) {
  const { showToast } = useApp();
  const [uploading, setUploading] = useState(false);
  const input = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      onChange(await api.uploadPublicImage(file, folder));
      showToast('Foto berhasil diunggah', 'success');
    } catch (err) {
      console.error(err);
      showToast(err instanceof api.UserError ? err.message : 'Gagal mengunggah foto, periksa koneksi', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs text-slate-700 font-semibold block mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tempel URL foto atau pilih file"
          className={input}
          required
        />
        <label className={`shrink-0 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${uploading ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'}`}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{uploading ? 'Mengunggah…' : 'Pilih File'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} disabled={uploading} className="hidden" />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-24 rounded-lg object-cover border border-slate-200" />}
    </div>
  );
}
