import React, { useState } from 'react';
import ImageField from './ImageField';
import { useApp } from '../context/AppContext';
import {
  Newspaper,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  User,
  Tag,
  ArrowRight,
  X,
  Trash2,
} from 'lucide-react';

export default function BeritaSection() {
  const { newsList, handleAddNews, handleDeleteNews, isStaff } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeArticle, setActiveArticle] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for Examiner
  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    category: 'Pengumuman',
    summary: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
    tags: 'UKT, Perguruan',
  });

  const categories = ['Semua', 'Pengumuman', 'Prestasi', 'Perguruan'];

  const filteredNews = newsList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitNews = (e) => {
    e.preventDefault();
    handleAddNews({
      title: newNewsForm.title,
      category: newNewsForm.category,
      summary: newNewsForm.summary,
      content: newNewsForm.content,
      image: newNewsForm.image,
      tags: newNewsForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNewNewsForm({
      title: '',
      category: 'Pengumuman',
      summary: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
      tags: 'UKT, Perguruan',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Kanal Informasi Resmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Warta & Berita Perguruan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Pengumuman ujian tingkatan, liputan turnamen, dan jadwal kegiatan padepokan Trident.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publikasikan Warta (Penguji)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berita atau pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          {newsList.length === 0 ? (
            <p className="text-sm font-semibold text-slate-300">Belum ada berita</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-300">Tidak ada warta yang sesuai pencarian</p>
              <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci lain atau pilih kategori "Semua".</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="trident-card rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-700/50 transition-all duration-300 flex flex-col group cursor-pointer"
              onClick={() => setActiveArticle(item)}
            >
              {/* Image banner */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isStaff && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus berita "${item.title}"?`)) handleDeleteNews(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950 text-slate-300 hover:text-rose-400 backdrop-blur-md transition-colors"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-md ${
                    item.category === 'Pengumuman'
                      ? 'bg-amber-500/90 text-slate-950 font-extrabold'
                      : item.category === 'Prestasi'
                      ? 'bg-blue-600/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                  }`}>
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content preview */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.date}</span>
                    <span>•</span>
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{item.author}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-amber-300 transition-colors">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Detail Berita */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header bar */}
            <div className="relative h-60 overflow-hidden bg-slate-950">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-amber-500 text-slate-950 uppercase tracking-wider">
                  {activeArticle.category}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  {activeArticle.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  {activeArticle.author}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Cinzel'] leading-snug">
                {activeArticle.title}
              </h2>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/40 text-xs text-blue-200 leading-relaxed italic">
                "{activeArticle.summary}"
              </div>

              <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                <p>{activeArticle.content}</p>
              </div>

              {activeArticle.tags && (
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {activeArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Tutup Warta
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Publish Berita Baru (Examiner only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Publikasikan Warta Perguruan
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNews} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Judul Warta / Pengumuman
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jadwal Ujian Kenaikan Tingkat Sabuk Hijau..."
                  value={newNewsForm.title}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Kategori Warta
                  </label>
                  <select
                    value={newNewsForm.category}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Perguruan">Perguruan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Tag (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={newNewsForm.tags}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <ImageField

                label="Gambar Pendukung"

                value={newNewsForm.image}

                onChange={(url) => setNewNewsForm({ ...newNewsForm, image: url })}

                folder="berita"

              />

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Ringkasan Singkat (Lead Summary)
                </label>
                <textarea
                  rows={2}
                  value={newNewsForm.summary}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, summary: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu depan warta..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Isi Lengkap Warta
                </label>
                <textarea
                  rows={4}
                  value={newNewsForm.content}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, content: e.target.value })}
                  placeholder="Tuliskan detail pengumuman atau berita secara lengkap..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Tayangkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
