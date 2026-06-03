'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChefHat, 
  Receipt, 
  Utensils, 
  PartyPopper,
  MapPin,
  Clock,
  X,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import axios from 'axios'; // 👈 Tambahkan import Axios

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.1 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function SuccessModal({ isOpen, onClose, orderId }: SuccessModalProps) {
  const clearCart = useCartStore((s) => s.clearCart);

  // ── State untuk download ──────────────────────────────────
  const [downloadStatus, setDownloadStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (isOpen) {
      clearCart();
      // Reset download state setiap kali modal dibuka
      setDownloadStatus('idle');
      setDownloadError('');
    }
  }, [isOpen, clearCart]);

  // ── Implementasi Download PDF menggunakan AXIOS ───────────
  const handleDownloadReceipt = useCallback(async () => {
    if (!orderId || downloadStatus === 'loading') return;

    setDownloadStatus('loading');
    setDownloadError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // 1. Tembak API dengan menggunakan Axios dan WAJIB ada responseType: 'blob'
      const response = await axios.get(`${apiUrl}/orders/${orderId}/receipt`, {
        responseType: 'blob', 
        // headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') ?? ''}` },
      });

      // 2. Ubah data biner menjadi objek URL yang bisa dibaca browser
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // 3. Buat elemen <a> fiktif untuk memicu proses download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `struk-warung-saffron-${orderId}.pdf`);
      document.body.appendChild(link);
      
      // 4. Klik link secara otomatis, lalu segera hapus dari HTML
      link.click();
      link.remove();

      // 5. Bersihkan memori browser setelah beberapa detik (Penting agar RAM tidak bocor!)
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 5000);

      setDownloadStatus('idle');
    } catch (err) {
      console.error('Download error:', err);
      
      let msg = 'Terjadi kesalahan saat mengunduh struk.';
      
      // Error handling khusus Axios agar pesan lebih jelas
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          msg = 'Struk tidak ditemukan di server (404).';
        } else {
          msg = `Gagal mengunduh: ${err.message}`;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setDownloadError(msg);
      setDownloadStatus('error');
    }
  }, [orderId, downloadStatus]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            <div className="h-2 bg-stone-900 w-full" />
            
            <div className="p-8 pt-8 text-center">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-20 h-20 bg-green-50 rounded-[28px] flex items-center justify-center mx-auto mb-5 relative"
              >
                <CheckCircle2 size={44} className="text-green-500" strokeWidth={1.5} />
                <motion.div 
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 text-amber-400"
                >
                  <PartyPopper size={20} />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-900 mb-1.5">
                  Pembayaran Berhasil!
                </h2>
                <p className="text-stone-500 text-[13px] leading-relaxed max-w-[280px] mx-auto">
                  Terima kasih. Pesananmu telah diteruskan ke dapur.
                </p>
              </motion.div>

              {/* Kartu detail transaksi */}
              <motion.div
                variants={itemVariants}
                className="mt-6 bg-stone-50 rounded-3xl p-4 border border-stone-100 text-left"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      ID Pesanan
                    </span>
                    <span className="font-mono text-sm font-bold text-stone-900">
                      #{orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      Metode
                    </span>
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                      <Receipt size={14} className="text-stone-400" />
                      Xendit
                    </span>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-dashed border-stone-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-900">Status</span>
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                      Lunas
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Estimasi waktu */}
              <motion.div
                variants={itemVariants}
                className="mt-6 flex items-center justify-center gap-4 text-stone-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <ChefHat size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase">Dimasak</span>
                </div>
                <div className="w-8 h-[1px] bg-stone-200" />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase">Meja</span>
                </div>
              </motion.div>

              {/* Error message download */}
              <AnimatePresence>
                {downloadStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-3 py-2.5 rounded-xl text-left">
                      <AlertCircle size={14} className="flex-shrink-0" strokeWidth={2} />
                      <span className="leading-tight">{downloadError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <motion.div variants={itemVariants} className="mt-6 space-y-3">
                {/* ── Tombol Download Struk ── */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadReceipt}
                  disabled={downloadStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-hover disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-brand text-sm"
                >
                  {downloadStatus === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                      <span>Menyiapkan struk...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} strokeWidth={2.5} />
                      <span>Download Struk (PDF)</span>
                    </>
                  )}
                </motion.button>

                {/* ── Tombol Tutup ── */}
                <button 
                  onClick={onClose}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-stone-200 active:scale-[0.98] text-sm"
                >
                  Tutup & Lanjut Pesan
                </button>

                <p className="text-stone-400 text-[11px] font-medium flex items-center justify-center gap-1.5">
                  <Clock size={12} /> Tiba dalam ~15 menit
                </p>
              </motion.div>
            </div>
            
            {/* Footer brand */}
            <div className="bg-stone-50 py-3 px-8 border-t border-stone-100 flex items-center justify-center gap-2">
              <Utensils size={12} className="text-stone-300" />
              <span className="text-[9px] font-bold text-stone-400 tracking-[0.2em] uppercase">
                Warung Saffron
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}