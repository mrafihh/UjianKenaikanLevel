'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, UtensilsCrossed, ScrollText, 
  Settings, LogOut, X, Store
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Warung Saffron',
    phone: '081234567890',
    address: 'Jl. Mawar No. 12, Surabaya'
  });

  const menuItems = [
    { name: 'Analitik', icon: LayoutDashboard, path: '/admin' },
    { name: 'Pesanan', icon: ScrollText, path: '/admin/orders' },
    { name: 'Menu', icon: UtensilsCrossed, path: '/admin/menu' },
  ];

  // --- Fungsi Logout (Ditambahkan di sini) ---
  const handleLogout = () => {
    // 1. Hapus token dari localStorage
    localStorage.removeItem('admin_token');

    // 2. Hapus token dan role dari Cookies
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'role=; path=/; max-age=0; SameSite=Lax';

    // 3. Paksa reload dan arahkan ke halaman login
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-brand text-white">
            <Store size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display font-bold text-stone-900 leading-tight">Dasbor Admin</h2>
            <p className="text-[11px] text-stone-500 font-medium">{restaurantInfo.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-1.5">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all font-bold text-sm"
          >
            <Settings size={18} /> Pengaturan
          </button>
          
          {/* === UBAHAN: Mengganti Link menjadi button dengan onClick={handleLogout} === */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Modal Pengaturan (Tetap Sama) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[28px] p-8 w-full max-w-md relative z-10 shadow-2xl">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900"><X size={20} /></button>
              <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">Pengaturan Toko</h2>
              <form onSubmit={(e) => { e.preventDefault(); setIsSettingsOpen(false); }} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 mb-1">Nama Toko</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({...restaurantInfo, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 mb-1">Telepon</label>
                  <input type="text" value={restaurantInfo.phone} onChange={(e) => setRestaurantInfo({...restaurantInfo, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                </div>
                <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl mt-2">Simpan</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}