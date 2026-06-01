'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

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
                  <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
                    <ShoppingBag size={26} className="text-stone-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-stone-400 text-sm font-semibold">Keranjang masih kosong</p>
                  <p className="text-stone-600 text-xs mt-1">Tambahkan menu yang kamu suka!</p>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                      className="flex items-center gap-3 bg-stone-800 rounded-2xl p-3"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="60px"
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
                          <p className="text-stone-600 text-[11px] tabular-nums">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        )}
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.82 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={item.quantity === 1 ? 'Hapus item' : 'Kurangi qty'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            item.quantity === 1
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                          }`}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={12} strokeWidth={2} />
                          ) : (
                            <Minus size={12} strokeWidth={2.5} />
                          )}
                        </motion.button>

                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 1.35 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                          className="text-white font-extrabold text-[13px] w-6 text-center select-none"
                        >
                          {item.quantity}
                        </motion.span>

                        <motion.button
                          whileTap={{ scale: 0.82 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Tambah qty"
                          className="w-7 h-7 rounded-lg bg-brand/20 text-brand hover:bg-brand/35 flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </motion.button>
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