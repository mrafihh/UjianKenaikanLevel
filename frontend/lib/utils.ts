/**
 * Format angka ke format Rupiah Indonesia.
 * Contoh: 45000 → "Rp 45.000"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate unique order ID.
 * Contoh: "WS-M5X3K2-AB9F"
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WS-${timestamp}-${random}`;
};

/**
 * Format detik ke format MM:SS.
 * Contoh: 245 → "04:05"
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};