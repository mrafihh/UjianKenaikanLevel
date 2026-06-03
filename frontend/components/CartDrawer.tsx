'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

// ─── Fungsi format harga ──────────────────────────────────────
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px]"
          />

          {/* ── Bottom Sheet Panel ──────────────────────── */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 rounded-t-[28px] max-h-[88vh] flex flex-col overflow-hidden max-w-lg mx-auto"
          >
            {/* Drag handle */}
            <div className="w-10 h-[3px] bg-stone-700 rounded-full mx-auto mt-3 flex-shrink-0" />

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-800/60 flex-shrink-0">
              <div>
                <h2 className="font-display font-bold text-white text-xl leading-tight">
                  Pesanan Kamu
                </h2>
                <p className="text-stone-500 text-xs mt-0.5">
                  {items.length === 0
                    ? 'Belum ada yang dipilih'
                    : `${items.length} jenis menu`}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                aria-label="Tutup keranjang"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-stone-400" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* ── Items List ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-14 text-center"
                >
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-stone-500" />
                  </div>
                  <p className="text-stone-400 font-medium">Keranjang masih kosong</p>
                  <p className="text-stone-600 text-sm mt-1">Yuk, pilih menu favoritmu!</p>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 bg-stone-800/40 p-2.5 rounded-2xl border border-stone-800"
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-800">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] font-semibold leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-brand text-[13px] font-bold mt-0.5 tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-stone-500 text-[11px] tabular-nums">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        )}
                      </div>

                      {/* Qty controls */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-stone-500 hover:text-red-400 p-1 transition-colors"
                          aria-label="Hapus item"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </motion.button>

                        <div className="flex items-center bg-stone-900 rounded-lg overflow-hidden border border-stone-700">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-stone-300 px-2 py-1.5 hover:bg-stone-700 transition-colors"
                          >
                            <Minus size={11} strokeWidth={2.5} />
                          </motion.button>
                          <span className="text-white text-[11px] font-extrabold w-5 text-center select-none tabular-nums">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.jumlahStock}
                            className={`px-2 py-1.5 transition-colors ${item.quantity >= item.jumlahStock ? 'text-stone-600 cursor-not-allowed' : 'text-stone-300 hover:bg-stone-700'}`}
                          >
                            <Plus size={11} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ── Footer ─────────────────────────────────── */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-stone-800/60 bg-stone-900 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-stone-400 text-[13px]">Total Tagihan</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    className="text-white font-extrabold text-xl tabular-nums"
                  >
                    {formatCurrency(totalPrice)}
                  </motion.span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-2xl transition-colors shadow-brand text-[15px]"
                >
                  <span>Lanjut ke Checkout</span>
                  <ChevronRight size={17} strokeWidth={2.5} />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}