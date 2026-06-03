'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface HeaderProps {
  onCartClick: () => void;
  restaurantName: string; // 1. Tambahkan properti baru di sini
}

export default function Header({ onCartClick, restaurantName }: HeaderProps) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 bg-stone-900 shadow-[0_4px_24px_rgba(28,25,23,0.45)]"
    >
      <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Logo & Nama Warung Dinamis */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-brand transition-transform"
          >
            <Utensils size={17} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            {/* 2. CETAK NAMA RESTORAN SECARA DINAMIS */}
            <h1 className="font-display font-bold text-base text-white leading-none tracking-tight group-hover:text-stone-300 transition-colors">
              {restaurantName}
            </h1>
            <p className="text-stone-500 text-[9px] mt-0.5 tracking-[0.18em] uppercase font-medium">
              Powered by OrderEase
            </p>
          </div>
        </Link>

        {/* Cart Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onCartClick}
          className="relative flex items-center gap-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 px-3.5 py-2.5 rounded-xl transition-colors duration-150"
        >
          <ShoppingBag size={17} className="text-white" strokeWidth={2} />
          <span className="text-white text-sm font-semibold">Pesanan</span>

          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 1.6, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-extrabold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center"
            >
              {totalItems > 9 ? '9+' : totalItems}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}