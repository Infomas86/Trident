// Nomor WhatsApp: hanya angka, awalan 0 -> 62.
export function waNumber(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  return digits.startsWith('0') ? '62' + digits.slice(1) : digits;
}
