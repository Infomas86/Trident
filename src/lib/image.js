// Kecilkan foto di browser sebelum diunggah (hemat storage dan egress Supabase): sisi terpanjang <= maxSide, WebP.
// Bila gagal (browser lama, format tak didukung) atau hasilnya tidak lebih kecil, file asli dipakai apa adanya.
export async function compressImage(file, { maxSide = 1600, quality = 0.8 } = {}) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    return blob && blob.type === 'image/webp' && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export const extOf = (blob) => ({ 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' })[blob.type] ?? 'webp';
