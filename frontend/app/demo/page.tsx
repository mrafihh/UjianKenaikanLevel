'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, WifiOff } from 'lucide-react';
// 👇 Import dari next/navigation untuk mendeteksi redirect url xendit
import { useSearchParams, useRouter } from 'next/navigation'; 

import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuCard from '@/components/MenuCard';
import FloatingCartBar from '@/components/FloatingCartBar';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import QRPaymentModal from '@/components/QRPaymentModal';
// 👇 Import komponen modal sukses yang kita buat sebelumnya
import SuccessModal from '@/components/successModal'; 

// 👇 MENGAMBIL TYPE & HELPER FUNCTION (buildCategories)
import { MenuItem, Category, buildCategories } from '@/lib/MenuData';

// ─── Tipe status fetch ────────────────────────────────────────
type FetchStatus = 'loading' | 'success' | 'error';

// ─── Skeleton Card (Bentuk List / Baris Mendatar) ─────────────
function SkeletonCard() {
  return (
    <div className="bg-white p-3 rounded-[20px] border border-stone-100 flex gap-4 animate-pulse shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      {/* Kotak Gambar */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-200 shrink-0" />
      
      {/* Area Teks */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <div className="h-4 bg-stone-200 rounded-full w-3/4" />
          <div className="h-3 bg-stone-100 rounded-full w-full" />
          <div className="h-3 bg-stone-100 rounded-full w-2/3" />
        </div>
        <div className="flex justify-between items-center mt-3 gap-4">
          <div className="h-4 bg-stone-200 rounded-full w-1/3" />
          <div className="h-8 w-20 bg-stone-200 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────
function ErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <WifiOff size={28} className="text-red-400" strokeWidth={1.5} />
      </div>
      <h3 className="font-display font-bold text-stone-900 text-lg mb-2">
        Gagal Memuat Menu
      </h3>
      <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-xs">
        {message}
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 bg-brand hover:bg-brand-hover disabled:bg-stone-200 text-white disabled:text-stone-400 font-bold px-6 py-3 rounded-xl transition-colors"
      >
        <RefreshCw
          size={15}
          className={isRetrying ? 'animate-spin' : ''}
          strokeWidth={2.5}
        />
        {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
      </motion.button>
    </motion.div>
  );
}

// ─── Konten Utama Komponen ─────────────────────────────────────
function HomeContent() {
  // ── Hooks Navigation NextJS ────────────────────────────────
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Menu data dari API ─────────────────────────────────────
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('loading');
  const [fetchError, setFetchError] = useState('');

  // ── UI state ───────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Modal / Drawer stack ───────────────────────────────────
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  // 👇 State Baru untuk Mengontrol Pop-up SuccessModal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');

  // ── Data diteruskan ke QR modal ────────────────────────────
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentTable, setCurrentTable] = useState('');
  const [currentCustomerName, setCurrentCustomerName] = useState('');
  const [currentGrandTotal, setCurrentGrandTotal] = useState(0);

  // ── Fetch menu dari backend ────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setFetchStatus('loading');
    setFetchError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`);
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${res.statusText}`);
      }
      const data: MenuItem[] = await res.json();
      setMenuItems(data);
      setFetchStatus('success');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.';
      setFetchError(msg);
      setFetchStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // 👇 Effect ini untuk menangkap kembalinya user dari Xendit
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderId = searchParams.get('order_id');

    if (paymentStatus === 'success') {
      setSuccessOrderId(orderId || 'ORD-UNKNOWN');
      setIsSuccessOpen(true);
      
      // Bersihkan URL secara bersih (agar saat di-refresh pop-up tidak muncul lagi)
      if (typeof window !== 'undefined') {
        router.replace(window.location.pathname, { scroll: false });
      }
    }
  }, [searchParams, router]);

  // ── Derived state ──────────────────────────────────────────
  const categories: Category[] = useMemo(() => {
    // 👇 Memanggil helper function buildCategories dari MenuData.ts
    return buildCategories(menuItems);
  }, [menuItems]);

  const filteredItems = useMemo(
    () =>
      activeCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory),
    [activeCategory, menuItems]
  );

  const activeCategoryLabel =
    activeCategory === 'all'
      ? 'Semua Menu'
      : (categories.find((c) => c.id === activeCategory)?.name ?? 'Menu');

  // ── Handlers ───────────────────────────────────────────────
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id);
  }, []);

  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setTimeout(() => setIsCheckoutOpen(true), 120);
  }, []);

  const handlePayment = useCallback(
    (
      orderId: string,
      customerName: string,
      tableNumber: string,
      grandTotal: number
    ) => {
      setCurrentOrderId(orderId);
      setCurrentCustomerName(customerName);
      setCurrentTable(tableNumber);
      setCurrentGrandTotal(grandTotal);
      setIsCheckoutOpen(false);
      setTimeout(() => setIsPaymentOpen(true), 120);
    },
    []
  );

  const handlePaymentSuccess = useCallback(() => {
    setIsPaymentOpen(false);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    // Jika bayar via QRIS lokal selesai, bisa juga langsung pemicu modal sukses ini:
    setSuccessOrderId(currentOrderId);
    setIsSuccessOpen(true);
  }, [currentOrderId]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-cream">
      {/* Sticky Header */}
      <Header onCartClick={handleOpenCart} restaurantName='Warung Saffron' />

      {/* Sticky Category Filter */}
      {fetchStatus === 'success' && categories.length > 1 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="px-4 pt-4 pb-1 max-w-lg mx-auto"
      >
        <div className="relative bg-stone-900 rounded-3xl overflow-hidden px-5 py-5">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/35 via-transparent to-gold/20 pointer-events-none" />
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

      {/* Menu Section */}
      <div className="px-4 pt-4 pb-36 max-w-lg mx-auto">

        {/* ── LOADING STATE: Skeleton berbentuk List ── */}
        {fetchStatus === 'loading' && (
          <div className="flex flex-col gap-4 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {fetchStatus === 'error' && (
          <ErrorState
            message={fetchError}
            onRetry={fetchMenu}
            isRetrying={false}
          />
        )}

        {/* ── SUCCESS STATE: Menu List ── */}
        {fetchStatus === 'success' && (
          <>
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display font-bold text-stone-900 text-[17px]">
                {activeCategoryLabel}
              </h2>
              <span className="bg-stone-100 text-stone-500 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                {filteredItems.length} item
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                {filteredItems.map((item, i) => (
                  <MenuCard key={item.id} item={item} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="text-stone-400 text-sm font-medium">
                  Tidak ada menu di kategori ini
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart Bar */}
      <FloatingCartBar onOpenCart={handleOpenCart} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPayment={handlePayment}
        // 👇 IMPLEMENTASI DI SINI: Memicu SuccessModal saat memilih bayar di kasir
        onCashSuccess={(orderId) => {
          setIsCheckoutOpen(false);      // Tutup modal checkout
          setSuccessOrderId(orderId);    // Set ID pesanan untuk ditampilkan di pop-up
          setIsSuccessOpen(true);        // Langsung tampilkan SuccessModal!
        }}
      />

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={isPaymentOpen}
        orderId={currentOrderId}
        tableNumber={currentTable}
        customerName={currentCustomerName}
        grandTotal={currentGrandTotal}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* 👇 KOMPONEN POP-UP NOTIFIKASI SUKSES */}
      <SuccessModal 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        orderId={successOrderId}
      />
    </main>
  );
}

// 👇 INI ADALAH IMPLEMENTASI HALAMAN UTAMA (Membungkus HomeContent dengan Suspense)
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center text-stone-600 font-bold">
        Memuat halaman...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}