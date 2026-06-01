'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { MenuItem } from '@/lib/menuData';
import { formatCurrency } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { items, addItem, updateQuantity } = useCartStore();

  const itemInCart = items.find((i) => i.id === item.id);
  const quantity = itemInCart?.quantity ?? 0;

  // Tambah item baru dari tombol utama
  const handleAdd = useCallback(() => {
    if (isAdding) return;
    setIsAdding(true);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    setTimeout(() => setIsAdding(false), 500);
  }, [isAdding, item, addItem]);

  // Tambah 1 dari kontrol qty
  const handleIncrease = useCallback(() => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  }, [item, addItem]);

  // Kurangi 1 (jika 0, item otomatis dihapus di store)
  const handleDecrease = useCallback(() => {
    updateQuantity(item.id, quantity - 1);
  }, [item.id, quantity, updateQuantity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.38,
        delay: Math.min(index * 0.055, 0.32),
        ease: [0.32, 0.72, 0, 1],
      }}
      className="group bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm transition-shadow duration-300 flex flex-col"
    >
      {/* ── Image Area ─────────────────────────────────── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Badges — Popular / New */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isPopular && (
            <span className="bg-brand text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              🔥 Favorit
            </span>
          )}
          {item.isNew && (
            <span className="bg-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              ✨ Baru
            </span>
          )}
        </div>

        {/* Spice level — kanan atas */}
        {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <span className="text-[11px] leading-none">
              {'🌶️'.repeat(item.spiceLevel)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ───────────────────────────────── */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-stone-900 text-[13px] leading-snug line-clamp-1 group-hover:text-brand transition-colors duration-150">
          {item.name}
        </h3>
        <p className="text-stone-400 text-[11px] mt-1 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Price row + add/qty controls */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="font-bold text-stone-900 text-sm tabular-nums">
            {formatCurrency(item.price)}
          </span>

          <AnimatePresence mode="wait" initial={false}>
            {quantity === 0 ? (
              /* ── "Tambah" Button ── */
              <motion.button
                key="add-btn"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isAdding ? [1, 1.3, 0.88, 1.08, 1] : 1,
                  opacity: 1,
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 380 }}
                onClick={handleAdd}
                className="flex-shrink-0 flex items-center gap-1 bg-brand hover:bg-brand-hover active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus size={11} strokeWidth={3} />
                <span>Tambah</span>
              </motion.button>
            ) : (
              /* ── Qty Controls ── */
              <motion.div
                key="qty-controls"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.22, type: 'spring', stiffness: 450 }}
                className="flex-shrink-0 flex items-center bg-stone-900 rounded-xl overflow-hidden"
              >
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleDecrease}
                  aria-label="Kurangi"
                  className="text-white px-2.5 py-1.5 hover:bg-stone-700 active:bg-stone-600 transition-colors"
                >
                  <Minus size={11} strokeWidth={3} />
                </motion.button>

                <motion.span
                  key={quantity}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="text-white text-[11px] font-extrabold w-5 text-center select-none"
                >
                  {quantity}
                </motion.span>

                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleIncrease}
                  aria-label="Tambah"
                  className="text-white px-2.5 py-1.5 hover:bg-brand/80 active:bg-brand transition-colors"
                >
                  <Plus size={11} strokeWidth={3} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}