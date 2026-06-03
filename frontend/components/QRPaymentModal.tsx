'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
  Smartphone,
  Loader2,
  PartyPopper,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency, formatTime } from '@/lib/Utils';

// Dynamic import — hindari SSR issue pada qrcode.react
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => m.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <div className="w-48 h-48 bg-stone-100 animate-pulse rounded-xl" />
    ),
  }
);

interface QRPaymentModalProps {
  isOpen: boolean;
  /** ID pesanan dari response POST /orders */
  orderId: string;
  tableNumber: string;
  /** Nama pelanggan dari form checkout */
  customerName: string;
  /** Grand total sudah termasuk pajak — diteruskan dari CheckoutModal */
  grandTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

const COUNTDOWN_SECONDS = 300; // 5 menit

export default function QRPaymentModal({
  isOpen,
  orderId,
  tableNumber,
  customerName,
  grandTotal,
  onClose,
  onSuccess,
}: QRPaymentModalProps) {
  const [isPaid, setIsPaid] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const clearCart = useCartStore((s) => s.clearCart);

  /**
   * Payload QR — format menyerupai QRIS agar terlihat realistis.
   * Berisi: ID Merchant, Order ID, Nama Pelanggan, Meja, Total.
   * Pada implementasi nyata, string ini diganti dengan payload QRIS
   * resmi dari payment gateway (Xendit, Midtrans, dll).
   */
  const qrData = [
    'QRIS',
    'ID.CO.WARUNGS.WWW01',
    `WARUNG-SAFFRON`,
    `ORD:${orderId}`,
    `MEJA:${tableNumber}`,
    customerName.toUpperCase(),
    String(grandTotal),
    'IDR',
  ].join('|');

  // Reset state setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setIsPaid(false);
      setIsSimulating(false);
      setCountdown(COUNTDOWN_SECONDS);
      setIsExpired(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isPaid || isExpired) return;
    if (countdown <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid, isExpired, countdown]);

  const handleSimulatePay = useCallback(async () => {
    if (isSimulating || isExpired) return;
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsSimulating(false);
    setIsPaid(true);
  }, [isSimulating, isExpired]);

  const handleRefreshQR = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);
    setIsExpired(false);
  }, []);

  const handleDone = useCallback(() => {
    clearCart();
    onSuccess();
    onClose();
  }, [clearCart, onSuccess, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/72 backdrop-blur-[5px] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: 56, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 56, scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="bg-white w-full max-w-sm rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-[3px] bg-stone-200 rounded-full mx-auto mt-3 sm:hidden" />

            <AnimatePresence mode="wait">
              {!isPaid ? (
                /* ══════════════════════════════════════════
                   PAYMENT VIEW — QR Code
                   ══════════════════════════════════════════ */
                <motion.div
                  key="payment-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display font-bold text-stone-900 text-xl leading-tight">
                        Scan & Bayar
                      </h2>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        {customerName} · Meja {tableNumber}
                      </p>
                      <p className="text-stone-300 text-[10px] font-mono mt-0.5">
                        {orderId}
                      </p>
                    </div>
                    {!isSimulating && (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={onClose}
                        aria-label="Tutup"
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center"
                      >
                        <X size={14} className="text-stone-500" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="text-center mb-5">
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.18em] font-bold mb-1">
                      Total Pembayaran
                    </p>
                    <p className="font-extrabold text-[32px] text-stone-900 tabular-nums leading-none">
                      {formatCurrency(grandTotal)}
                    </p>
                    <p className="text-stone-400 text-[11px] mt-1.5">
                      Sudah termasuk PPN 11%
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div
                        className={`p-4 rounded-2xl border-2 bg-white shadow-warm transition-opacity duration-200 ${
                          isExpired ? 'border-stone-200 opacity-40' : 'border-brand/40'
                        }`}
                      >
                        {isSimulating ? (
                          <div className="w-48 h-48 flex flex-col items-center justify-center gap-3">
                            <Loader2
                              size={34}
                              className="text-brand animate-spin"
                              strokeWidth={2}
                            />
                            <p className="text-stone-500 text-[12px] font-medium text-center">
                              Memverifikasi pembayaran...
                            </p>
                          </div>
                        ) : (
                          <QRCodeSVG
                            value={qrData}
                            size={192}
                            level="M"
                            bgColor="#FFFFFF"
                            fgColor="#1C1917"
                            includeMargin={false}
                          />
                        )}
                      </div>

                      {/* Expired overlay */}
                      {isExpired && !isSimulating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/92 rounded-2xl">
                          <Clock
                            size={28}
                            className="text-stone-400 mb-2"
                            strokeWidth={1.5}
                          />
                          <p className="text-stone-700 text-[13px] font-semibold">
                            QR Kedaluwarsa
                          </p>
                          <button
                            onClick={handleRefreshQR}
                            className="mt-3 flex items-center gap-1.5 text-brand text-[12px] font-bold"
                          >
                            <RefreshCw size={12} strokeWidth={2.5} />
                            Perbarui QR
                          </button>
                        </div>
                      )}

                      {/* Pulse ring saat QR aktif */}
                      {!isExpired && !isSimulating && (
                        <motion.div
                          animate={{
                            scale: [1, 1.07, 1],
                            opacity: [0.55, 0, 0.55],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 border-2 border-brand rounded-2xl pointer-events-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* QRIS Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px bg-stone-100 flex-1" />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-100 rounded-full">
                      <span className="text-brand font-black text-[11px] tracking-widest">
                        QRIS
                      </span>
                      <span className="text-stone-300 text-xs">·</span>
                      <span className="text-stone-500 text-[11px] font-medium">
                        Semua e-wallet
                      </span>
                    </div>
                    <div className="h-px bg-stone-100 flex-1" />
                  </div>

                  {/* Countdown */}
                  {!isExpired && !isSimulating && (
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Clock size={12} className="text-stone-400" strokeWidth={2} />
                      <span className="text-stone-500 text-[12px]">
                        Berlaku dalam{' '}
                        <span
                          className={`font-extrabold tabular-nums ${
                            countdown < 60 ? 'text-red-500' : 'text-stone-800'
                          }`}
                        >
                          {formatTime(countdown)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Instruction */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 mb-4">
                    <div className="flex items-start gap-2.5">
                      <Smartphone
                        size={15}
                        className="text-brand mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <p className="text-stone-500 text-[12px] leading-relaxed">
                        Buka GoPay, OVO, Dana, atau app bank kamu → pilih{' '}
                        <strong className="text-stone-700">Scan QR</strong> →
                        arahkan ke kode di atas
                      </p>
                    </div>
                  </div>

                  {/* Demo Simulation Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSimulatePay}
                    disabled={isSimulating || isExpired}
                    className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-100 text-white disabled:text-stone-400 font-semibold text-[13px] rounded-xl transition-colors"
                  >
                    {isSimulating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Memverifikasi...
                      </span>
                    ) : (
                      '🔄 Simulasi Pembayaran (Demo)'
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                /* ══════════════════════════════════════════
                   SUCCESS VIEW
                   ══════════════════════════════════════════ */
                <motion.div
                  key="success-view"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 text-center"
                >
                  {/* Animated check */}
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 16,
                      delay: 0.08,
                    }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle2
                      size={52}
                      className="text-green-500"
                      strokeWidth={1.8}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    <h2 className="font-display font-bold text-stone-900 text-2xl mb-1.5">
                      Pembayaran Berhasil!
                    </h2>
                    <p className="text-stone-400 text-sm">
                      Pesananmu sedang diproses dapur 👨‍🍳
                    </p>
                  </motion.div>

                  {/* Receipt summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="bg-stone-50 rounded-2xl p-4 mt-5 mb-4 text-left space-y-2.5"
                  >
                    <div className="flex justify-between text-[13px]">
                      <span className="text-stone-400">No. Pesanan</span>
                      <span className="font-mono font-bold text-stone-700 text-[11px]">
                        {orderId}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-stone-400">Pelanggan</span>
                      <span className="font-bold text-stone-800">{customerName}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-stone-400">Nomor Meja</span>
                      <span className="font-bold text-stone-800">
                        Meja {tableNumber}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-stone-400">Total Dibayar</span>
                      <span className="font-extrabold text-stone-900 tabular-nums">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </motion.div>

                  {/* ETA */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.46 }}
                    className="bg-green-50 rounded-2xl p-3.5 mb-5 flex items-center gap-2.5"
                  >
                    <PartyPopper
                      size={16}
                      className="text-green-600 flex-shrink-0"
                      strokeWidth={1.8}
                    />
                    <p className="text-green-700 text-[12px] font-medium text-left">
                      Makananmu akan diantar ke{' '}
                      <strong>Meja {tableNumber}</strong> dalam ~15 menit
                    </p>
                  </motion.div>

                  {/* Done button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDone}
                    className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-colors shadow-brand text-[15px]"
                  >
                    Selesai 🎉
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}