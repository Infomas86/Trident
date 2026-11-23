import logoUrl from '../assets/logo.webp';

// Logo trisula Pagar Nusa (gambar). className mengatur ukurannya (mis. w-7 h-7).
export default function TridentIcon({ className = '' }) {
  return (
    <img
      src={logoUrl}
      alt="Logo Pagar Nusa"
      className={className}
      style={{ objectFit: 'contain' }}
      aria-hidden="true"
    />
  );
}
