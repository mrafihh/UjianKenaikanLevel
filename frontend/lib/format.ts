// lib/format.ts

// Format ke Rupiah: 35000 → "Rp 35.000"
export const fmt = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

// Format tanggal: "12 Juni 2025, 14:30"
export const fmtDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));