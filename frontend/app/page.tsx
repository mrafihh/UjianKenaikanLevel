'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuCard from '@/components/MenuCard';
import FloatingCartBar from '@/components/FloatingCartBar';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import QRPaymentModal from '@/components/QRPaymentModal';
import { menuItems, categories } from '@/lib/menuData';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal / Drawer state stack
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Order context passed down to QR modal
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentTable, setCurrentTable] = useState('');

  // ── Filtered menu items ──────────────────────────────────
  const filteredItems = useMemo(
    () =>
      activeCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  // ── Category change ──────────────────────────────────────
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id);
  }, []);

  // ── Cart drawer ──────────────────────────────────────────
  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);

  // ── Cart → Checkout (brief delay so drawer exit plays first) ──
  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setTimeout(() => setIsCheckoutOpen(true), 120);
  }, []);

  // ── Checkout → Payment ───────────────────────────────────
  const handlePayment = useCallback(
    (tableNumber: string, orderId: string) => {
      setCurrentTable(tableNumber);
      setCurrentOrderId(orderId);
      setIsCheckoutOpen(false);
      setTimeout(() => setIsPaymentOpen(true), 120);
    },
    []
  );

  // ── Payment success → reset all ─────────────────────────
  const handlePaymentSuccess = useCallback(() => {
    setIsPaymentOpen(false);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  }, []);

  const activeCategoryLabel =
    activeCategory === 'all'
      ? 'Semua Menu'
      : categories.find((c) => c.id === activeCategory)?.name ?? 'Menu';

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Sticky Header ─────────────────────────────── */}
      <Header onCartClick={handleOpenCart} />

      {/* ── Sticky Category Filter ────────────────────── */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* ── Hero Welcome Banner ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="px-4 pt-4 pb-1 max-w-lg mx-auto"
      >
        <div className="relative bg-stone-900 rounded-3xl overflow-hidden px-5 py-5">
          {/* Ambient gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand/35 via-transparent to-gold/20 pointer-events-none" />
          {/* Decorative circle */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand/10 rounded-full pointer-events-none" />

          <div className="relative">
            <p className="text-stone-500 text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
              Selamat datang di
            </p>
            <h2 className="font-display font-bold text-white text-2xl leading-tight">
              Warung Saffron 🍽️
            </h2>
            <p className="text-stone-400 text-[12px] mt-1.5 leading-relaxed">
              Pilih menu favoritmu, lalu bayar langsung dari meja — tanpa antri.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Menu Section ──────────────────────────────── */}
      <div className="px-4 pt-4 pb-36 max-w-lg mx-auto">
        {/* Section heading */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-bold text-stone-900 text-[17px]">
            {activeCategoryLabel}
          </h2>
          <span className="bg-stone-100 text-stone-500 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            {filteredItems.length} item
          </span>
        </div>

        {/* Grid with AnimatePresence for category switch transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {filteredItems.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-stone-400 text-sm font-medium">
              Tidak ada menu di kategori ini
            </p>
          </div>
        )}
      </div>

      {/* ── Floating Cart Bar ─────────────────────────── */}
      <FloatingCartBar onOpenCart={handleOpenCart} />

      {/* ── Cart Drawer ───────────────────────────────── */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onCheckout={handleCheckout}
      />

      {/* ── Checkout Modal ────────────────────────────── */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPayment={handlePayment}
      />

      {/* ── QR Payment Modal ──────────────────────────── */}
      <QRPaymentModal
        isOpen={isPaymentOpen}
        orderId={currentOrderId}
        tableNumber={currentTable}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}