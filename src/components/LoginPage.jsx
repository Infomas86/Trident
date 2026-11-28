import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Turnstile from './Turnstile';
import { X, Lock, Sparkles, Eye, EyeOff, UserPlus } from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-amber-500 outline-none';

function PasswordInput({ value, onChange, autoComplete, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        autoComplete={autoComplete}
        minLength={minLength}
        className={`${inputCls} pr-11`}
        required
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-amber-500"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const Label = ({ children }) => <label className="text-xs text-slate-700 font-medium block mb-1">{children}</label>;

export default function LoginPage() {
  const { isLoginModalOpen, setIsLoginModalOpen, signIn, signUp } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  if (!isLoginModalOpen) return null;

  const run = async (fn) => {
    setSubmitting(true);
    try {
      if (await fn()) setPassword('');
    } finally {
      setCaptcha(null);
      setCaptchaKey((k) => k + 1); // token sekali pakai
      setSubmitting(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    run(() => signIn(email.trim(), password, captcha));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    run(() =>
      signUp({ fullName: fullName.trim(), email: email.trim(), regCode: regCode.trim(), password, captchaToken: captcha }),
    );
  };

  const tab = (key, label) => (
    <button
      type="button"
      onClick={() => setMode(key)}
      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
        mode === key ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-50 via-slate-100 to-white border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5 my-auto">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setIsLoginModalOpen(false)}
          aria-label="Tutup"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 relative z-10 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Akun Resmi Perguruan</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel']">
            Portal <span className="text-green-600">PAGAR NUSA</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {mode === 'login'
              ? 'Masuk untuk membuka Agenda, Donasi, dan Ujian Kenaikan Tingkat.'
              : 'Daftar sebagai anggota perguruan.'}
          </p>
        </div>

        <div className="flex rounded-xl bg-white p-1 border border-slate-200 relative z-10">
          {tab('login', 'Masuk')}
          {tab('register', 'Daftar')}
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <Label>Email</Label>
              <input
                type="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="username"
                className={inputCls}
                required
              />
            </div>
            <div>
              <Label>Kata Sandi</Label>
              <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
            </div>
            <Turnstile key={mode} resetKey={captchaKey} onToken={setCaptcha} />
            <button
              type="submit"
              disabled={submitting || !captcha}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Memproses...' : 'Masuk'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            <div>
              <Label>Nama Lengkap</Label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama sesuai KTA"
                autoComplete="name"
                className={inputCls}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <input
                type="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className={inputCls}
                required
              />
            </div>
            <div>
              <Label>Kode Pendaftaran</Label>
              <input
                type="text"
                autoCapitalize="characters"
                value={regCode}
                onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                placeholder="Kode dari admin perguruan"
                className={`${inputCls} font-mono tracking-widest`}
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Belum punya kode? Minta ke admin PAC Anda.</p>
            </div>
            <div>
              <Label>Kata Sandi (minimal 8 karakter)</Label>
              <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
            </div>
            <Turnstile key={mode} resetKey={captchaKey} onToken={setCaptcha} />
            <button
              type="submit"
              disabled={submitting || !captcha}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Memproses...' : 'Daftar'}</span>
            </button>
          </form>
        )}

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 relative z-10">
          Pagar Nusa Kota Batam © 2026
        </div>
      </div>
    </div>
  );
}
