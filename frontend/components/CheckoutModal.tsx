'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, Receipt, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (tableNumber: string, orderId: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onPayment,
}: CheckoutModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [tableError, setTableError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, setTableNumber: saveTable, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();
  const taxAmount = Math.round(totalPrice * 0.11);
  const grandTotal = totalPrice + taxAmount;

  const handlePay = async () => {
    const input = tableNumber.trim();

    // Validation
    if (!input) {
      setTableError('Nomor meja wajib diisi sebelum membayar');
      return;
    }
    const num = Number(input);
    if (isNaN(num) || num <= 0 || num > 99) {
      setTableError('Masukkan nomor meja yang valid (1 – 99)');
      return;
    }

    setTableError('');
    setIsProcessing(true);
    saveTable(input);

    // Brief processing delay untuk UX yang lebih natural
    await new Promise((r) => setTimeout(r, 650));

    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
    const orderId = `WS-${ts}-${rnd}`;

    setIsProcessing(false);
    onPayment(input, orderId);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setTableError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-[4px] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ y: 56, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 56, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="bg-white w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-[3px] bg-stone-200 rounded-full mx-auto mt-3 flex-shrink-0 sm:hidden" />

            {/* ── Modal Header ─────────────────────────── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-stone-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-brand-light rounded-xl flex items-center justify-center">
                  <Receipt size={16} className="text-brand" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-stone-900 text-lg leading-tight">
                    Ringkasan Pesanan
                  </h2>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    {items.length} jenis menu
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                disabled={isProcessing}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <X size={15} className="text-stone-500" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* ── Scrollable Body ───────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Order items */}
              <div className="px-5 pt-4 pb-2 space-y-3">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold">
                  Detail Pesanan
                </p>

                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045 }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-800 text-[13px] font-semibold leading-tight truncate">
                        {item.name}
                      </p>
                      <p className="text-stone-400 text-[11px] mt-0.5 tabular-nums">
                        {item.quantity}x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="text-stone-900 text-[13px] font-bold tabular-nums flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="mx-5 mt-3 border-t border-dashed border-stone-200 pt-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-[13px]">Subtotal</span>
                  <span className="text-stone-600 text-[13px] font-medium tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-[13px]">PPN 11%</span>
                  <span className="text-stone-600 text-[13px] font-medium tabular-nums">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              </div>

              <div className="mx-5 mt-3 border-t border-stone-200 pt-3 pb-4 flex justify-between items-center">
                <span className="text-stone-900 font-bold text-[15px]">Total</span>
                <span className="text-stone-900 font-extrabold text-xl tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Table number input */}
              <div className="px-5 pb-5">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-3">
                  Nomor Meja
                </p>

                <div
                  className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    tableError
                      ? 'border-red-400 bg-red-50'
                      : tableNumber
                      ? 'border-brand bg-brand-light'
                      : 'border-stone-200 bg-stone-50 focus-within:border-stone-400'
                  }`}
                >
                  <MapPin
                    size={17}
                    strokeWidth={2}
                    className={
                      tableError
                        ? 'text-red-400'
                        : tableNumber
                        ? 'text-brand'
                        : 'text-stone-400'
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      setTableError('');
                    }}
                    placeholder="Masukkan nomor meja Anda (1 – 99)"
                    className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-[13px] font-semibold outline-none"
                  />
                </div>

                <AnimatePresence>
                  {tableError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-red-500 text-[11px] mt-2 px-1 font-medium"
                    >
                      ⚠️ {tableError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Footer CTA ────────────────────────────── */}
            <div className="px-5 py-4 border-t border-stone-100 bg-white flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2.5 bg-brand disabled:bg-stone-300 hover:bg-brand-hover text-white font-bold py-4 rounded-2xl transition-colors shadow-brand text-[15px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar dengan QRIS</span>
                    <ChevronRight size={17} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}