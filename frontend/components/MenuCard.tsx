'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X, StickyNote } from 'lucide-react'; // Tambah ikon StickyNote jika ingin dipakai
import { useCartStore } from '@/store/useCartStore';
import { MenuItem } from '@/lib/MenuData';

// ─── Fungsi format harga ──────────────────────────────────────
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // State untuk mengontrol Modal Detail Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State baru untuk menampung teks Catatan (Notes)
  const [noteText, setNoteText] = useState('');

  // Menambahkan updateNotes dari Zustand Store
  const { items, addItem, updateQuantity, updateNotes } = useCartStore();

  const cartId = String(item.id);
  const itemInCart = items.find((i) => i.id === cartId);
  const quantity = itemInCart?.quantity ?? 0;
  const isOutOfStock = item.jumlahStock === 0;

  const resolvedImageUrl = item.imageUrl
    ? item.imageUrl.startsWith('http')
      ? item.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`
    : null;

  // Sinkronisasi teks catatan saat modal dibuka atau item di keranjang berubah
  useEffect(() => {
    if (isModalOpen) {
      setNoteText(itemInCart?.notes ?? '');
    }
  }, [isModalOpen, itemInCart?.notes]);

  const handleAdd = useCallback(() => {
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    addItem({
      menuItemId: item.id,
      id: cartId,
      name: item.name,
      price: item.price,
      image: resolvedImageUrl ?? '',
      category: item.category,
      jumlahStock: item.jumlahStock,
      notes: noteText || null, // Menyertakan catatan saat pertama kali ditambah
    });
    setTimeout(() => setIsAdding(false), 500);
  }, [isAdding, isOutOfStock, item, cartId, resolvedImageUrl, addItem, noteText]);

  const handleIncrease = useCallback(() => {
    if (isOutOfStock) return;
    addItem({
      menuItemId: item.id,
      id: cartId,
      name: item.name,
      price: item.price,
      image: resolvedImageUrl ?? '',
      category: item.category,
      jumlahStock: item.jumlahStock,
    });
  }, [isOutOfStock, item, cartId, resolvedImageUrl, addItem]);

  const handleDecrease = useCallback(() => {
    updateQuantity(cartId, quantity - 1);
  }, [cartId, quantity, updateQuantity]);

  return (
    <>
      {/* ─── KARTU MENU (LIST VIEW / 1 BARIS) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: Math.min(index * 0.055, 0.32), ease: [0.32, 0.72, 0, 1] }}
        onClick={() => setIsModalOpen(true)}
        className={`group bg-white p-3 rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-stone-100 flex gap-4 cursor-pointer hover:border-brand/30 transition-all active:scale-[0.98] ${
          isOutOfStock ? 'opacity-70' : ''
        }`}
      >
        {/* Kiri: Gambar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden shrink-0 bg-stone-100">
          {resolvedImageUrl && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={resolvedImageUrl}
              alt={item.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
              <span className="text-3xl select-none">{item.emoji ?? '🍽️'}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Badge Stok / Habis */}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {item.jumlahStock > 0 && item.jumlahStock <= 5 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Sisa {item.jumlahStock}
              </span>
            )}
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
              <span className="text-stone-200 text-[10px] bg-stone-900/80 px-2 py-1 rounded-full font-bold">Habis</span>
            </div>
          )}
        </div>

        {/* Kanan: Teks dan Tombol */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight mb-1 group-hover:text-brand transition-colors duration-150">
                {item.name}
              </h3>
              {/* Indikator jika item ini memiliki catatan di keranjang */}
              {itemInCart?.notes && (
                <span className="text-amber-600 bg-amber-50 p-1 rounded-md shrink-0" title="Ada catatan">
                  <StickyNote size={12} />
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              {formatCurrency(item.price)}
            </span>

            {/* Area Tombol */}
            <div onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait" initial={false}>
                {isOutOfStock ? (
                  <motion.span
                    key="out-of-stock"
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                    className="flex-shrink-0 text-[11px] font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl"
                  >
                    Habis
                  </motion.span>
                ) : quantity === 0 ? (
                  <motion.button
                    key="add-btn"
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: isAdding ? [1, 1.3, 0.88, 1.08, 1] : 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 380 }}
                    onClick={handleAdd}
                    className="flex-shrink-0 flex items-center gap-1 bg-brand hover:bg-brand-hover active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Plus size={11} strokeWidth={3} />
                    <span>Tambah</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="qty-controls"
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    className="flex-shrink-0 flex items-center bg-stone-900 rounded-xl overflow-hidden"
                  >
                    <motion.button whileTap={{ scale: 0.8 }} onClick={handleDecrease} className="text-white px-2.5 py-1.5 hover:bg-stone-700 transition-colors">
                      <Minus size={11} strokeWidth={3} />
                    </motion.button>
                    <motion.span key={quantity} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-white text-[11px] font-extrabold w-5 text-center select-none">
                      {quantity}
                    </motion.span>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={handleIncrease} className="text-white px-2.5 py-1.5 hover:bg-brand/80 transition-colors">
                      <Plus size={11} strokeWidth={3} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── MODAL DETAIL MENU ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            {/* Latar Belakang Gelap */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" 
            />
            
            {/* Kotak Modal */}
            <motion.div 
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} 
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="bg-white w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[95vh]"
            >
              {/* Tombol Tutup */}
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Gambar Besar di Modal */}
              <div className="w-full aspect-[4/3] relative bg-stone-100">
                {resolvedImageUrl && !imgError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={resolvedImageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                    <span className="text-6xl select-none">{item.emoji ?? '🍽️'}</span>
                  </div>
                )}
              </div>

              {/* Konten & Informasi */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="font-display text-2xl font-bold text-stone-900">{item.name}</h2>
                  <span className="font-bold text-brand text-lg whitespace-nowrap">{formatCurrency(item.price)}</span>
                </div>
                
                {item.description && (
                  <div className="mb-4">
                    <h3 className="text-[13px] font-bold text-stone-900 mb-1">Deskripsi</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* ─── FITUR BARU: INPUT CATATAN (NOTES) ─── */}
                {!isOutOfStock && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[13px] font-bold text-stone-900">
                        Catatan Pesanan (Opsional)
                      </label>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {noteText.length}/100 Karakter
                      </span>
                    </div>
                    <textarea
                      value={noteText}
                      maxLength={100}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoteText(val);
                        // Jika item sudah ada di keranjang, perbarui catatan secara real-time ke store
                        if (quantity > 0 && updateNotes) {
                          updateNotes(cartId, val);
                        }
                      }}
                      placeholder="Contoh: tidak pedas, es sedikit, kuah dipisah..."
                      className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl p-3 text-sm text-stone-800 outline-none focus:border-stone-900 focus:bg-white transition-all resize-none h-20 placeholder:text-stone-400"
                    />
                  </div>
                )}

                {/* Status Stok di dalam modal */}
                {item.jumlahStock > 0 && item.jumlahStock <= 5 && (
                  <div className="bg-amber-50 text-amber-600 font-bold text-xs px-3 py-2 rounded-xl mb-4 flex items-center gap-2">
                    🔥 Stok sisa sedikit ({item.jumlahStock} porsi)
                  </div>
                )}
              </div>

              {/* Area Aksi Bawah Modal */}
              <div className="p-6 pt-0 border-t border-stone-100 mt-auto bg-white">
                <div className="pt-4">
                  {isOutOfStock ? (
                    <button disabled className="w-full bg-stone-200 text-stone-500 font-bold py-4 rounded-xl">
                      Menu Sedang Habis
                    </button>
                  ) : quantity === 0 ? (
                    <button 
                      onClick={() => {
                        handleAdd();
                        setIsModalOpen(false); // Tutup modal otomatis setelah ditambah
                      }}
                      className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Tambah ke Pesanan
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-stone-100 p-2 rounded-2xl">
                      <button 
                        onClick={handleDecrease}
                        className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-900 hover:bg-stone-50"
                      >
                        <Minus size={20} strokeWidth={2.5} />
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Jumlah</span>
                        <span className="font-display text-xl font-bold text-stone-900">{quantity}</span>
                      </div>
                      <button 
                        onClick={handleIncrease}
                        className="w-12 h-12 bg-brand rounded-xl shadow-sm flex items-center justify-center text-white hover:bg-brand-hover"
                      >
                        <Plus size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}