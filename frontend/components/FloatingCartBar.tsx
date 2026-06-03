'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

// ─── Fungsi format harga dipindahkan langsung ke sini ─────────
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export default function FloatingCartBar({ onOpenCart }: FloatingCartBarProps) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const controls = useAnimation();
  const prevItemsRef = useRef(0);

  // Bounce animation setiap kali item bertambah
  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      controls.start({
        scale: [1, 1.05, 0.97, 1.02, 1],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    }
    prevItemsRef.current = totalItems;
  }, [totalItems, controls]);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 110, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 110, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-6 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCart}
            className="w-full bg-stone-900 rounded-[24px] shadow-[0_8px_30px_rgba(28,25,23,0.35)] flex items-center overflow-hidden border border-stone-800"
          >
            {/* Left — Icon */}
            <div className="bg-stone-800 flex items-center justify-center pl-5 pr-4 py-4 flex-shrink-0 relative">
              <div className="relative">
                <ShoppingBag size={20} className="text-white" strokeWidth={2} />
                <motion.span
                  animate={controls}
                  initial={{ scale: 1.7 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                  className="absolute -top-2.5 -right-2.5 bg-white text-brand text-[9px] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              </div>
            </div>

            {/* Center — Label & total */}
            <div className="flex-1 bg-stone-900 px-4 py-4 text-left">
              <p className="text-stone-500 text-[9px] uppercase tracking-[0.18em] font-semibold leading-none">
                {totalItems} item dipilih
              </p>
              <motion.p
                key={totalPrice}
                initial={{ opacity: 0.5, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white font-bold text-[15px] leading-tight mt-0.5 tabular-nums"
              >
                {formatCurrency(totalPrice)}
              </motion.p>
            </div>

            {/* Right — CTA */}
            <div className="bg-stone-900 flex items-center gap-1 pr-4 pl-1 py-4 flex-shrink-0">
              <span className="text-brand text-[13px] font-bold">Pesan</span>
              <ChevronRight size={16} className="text-brand" strokeWidth={3} />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}