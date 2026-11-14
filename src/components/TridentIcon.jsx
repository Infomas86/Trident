// Trisula (trident) logo, drawn in the same stroke style as lucide icons.
export default function TridentIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v20" />
      <path d="M12 2l-1.5 2.5h3z" />
      <path d="M5 4v4a7 7 0 0 0 14 0V4" />
      <path d="M5 4l-1.2 1.8M5 4l1.2 1.8" />
      <path d="M19 4l-1.2 1.8M19 4l1.2 1.8" />
      <path d="M9.5 19h5" />
    </svg>
  );
}
