'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, QrCode, Store, Zap, CheckCircle2, UtensilsCrossed, Mail, Phone } from 'lucide-react';

export default function AgencyLandingPage() {
  return (
    <main className="min-h-screen bg-cream font-sans overflow-hidden">
      {/* ── Navigation Bar ────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center shadow-brand">
              <UtensilsCrossed size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-stone-900 text-lg tracking-tight">
              OrderEase.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="hidden sm:block px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-sm transition-colors"
            >
              Masuk
            </Link>
            {/* Terhubung ke /register */}
            <Link href="/register">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
              >
                Daftarkan Resto
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-stone-600 text-[11px] font-bold uppercase tracking-wider">Sistem Pemesanan Restoran #1</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="font-display font-extrabold text-4xl sm:text-6xl text-stone-900 leading-tight tracking-tight max-w-3xl"
        >
          Ubah Cara Pelanggan <span className="text-brand">Pesan & Bayar</span> di Restoran Anda.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="mt-6 text-stone-500 text-base sm:text-lg max-w-xl leading-relaxed font-medium"
        >
          Tingkatkan efisiensi, hapus antrean kasir, dan terima pembayaran QRIS instan. Semua langsung dari meja pelanggan tanpa download aplikasi.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Diubah menjadi Link ke /register */}
          <Link href="/register" className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-bold shadow-brand flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
            <span>Buat Sistem Sekarang</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          
          <Link href="/demo" className="w-full sm:w-auto bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-transform hover:-translate-y-1">
            Lihat Demo Warung
          </Link>
        </motion.div>
      </section>

      {/* ── Features Section ──────────────────────────── */}
      <section className="py-20 px-6 bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl text-stone-900 mb-4">Fitur Andalan Restoran Modern</h2>
            <p className="text-stone-500 font-medium max-w-lg mx-auto">Tinggalkan buku menu cetak. Beralih ke sistem digital yang mempercepat alur kerja kasir dan dapur Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-stone-50 p-8 rounded-[28px] border border-stone-100 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center mb-6 text-brand">
                <QrCode size={28} strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900 mb-3">Scan, Pesan, Bayar</h3>
              <p className="text-stone-500 leading-relaxed">Pelanggan hanya perlu scan QR di meja, pilih menu dari HP, dan bayar dengan QRIS tanpa harus ke kasir.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-stone-50 p-8 rounded-[28px] border border-stone-100 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center mb-6 text-blue-500">
                <Zap size={28} strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900 mb-3">Real-time Dashboard</h3>
              <p className="text-stone-500 leading-relaxed">Pesanan masuk ke dapur secara instan. Atur stok menu yang habis dengan satu klik langsung dari HP Anda.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-stone-50 p-8 rounded-[28px] border border-stone-100 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center mb-6 text-green-500">
                <Store size={28} strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900 mb-3">Manajemen Multi-Meja</h3>
              <p className="text-stone-500 leading-relaxed">Pantau status pesanan meja 1 hingga 100 dengan mudah. Kurangi risiko salah antar makanan secara drastis.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Mini CTA ───────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-stone-900 rounded-[32px] p-10 sm:p-16 relative overflow-hidden shadow-2xl shadow-stone-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-6 relative z-10">
            Siap Mendigitalkan Restoran Anda?
          </h2>
          <p className="text-stone-400 mb-10 text-lg relative z-10">
            Bergabung dengan puluhan warung dan restoran lain yang telah meningkatkan omset mereka.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            {/* Diubah menjadi Link ke /register */}
            <Link href="/register" className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
              Daftar Gratis 14 Hari
            </Link>
            <button className="bg-stone-800 hover:bg-stone-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-colors">
              Hubungi Sales
            </button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 relative z-10">
            <div className="flex items-center gap-2 text-stone-300 text-sm font-medium">
              <CheckCircle2 size={16} className="text-brand" /> Tanpa biaya setup
            </div>
            <div className="flex items-center gap-2 text-stone-300 text-sm font-medium">
              <CheckCircle2 size={16} className="text-brand" /> Batal kapan saja
            </div>
            <div className="flex items-center gap-2 text-stone-300 text-sm font-medium">
              <CheckCircle2 size={16} className="text-brand" /> Support 24/7
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer & Informasi Kontak ─────────────────── */}
      <footer className="bg-white border-t border-stone-200 pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-left">
          
          {/* Kolom 1: Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-stone-900" strokeWidth={2.5} />
              <span className="font-display font-bold text-stone-900 tracking-tight text-base">OrderEase.</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs font-medium">
              Penyedia ekosistem software kasir digital dan self-ordering berbasis web terbaik untuk bisnis kuliner Anda.
            </p>
          </div>

          {/* Kolom 2: Kontak yang bisa dihubungi */}
          <div>
            <h4 className="font-display font-bold text-stone-900 text-xs uppercase tracking-wider mb-4">
              Informasi Kontak
            </h4>
            <ul className="space-y-3 text-sm text-stone-500 font-medium">
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-stone-400" />
                <a href="mailto:support@orderease.id" className="hover:text-stone-900 transition-colors">
                  support@orderease.id
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-stone-400" />
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors">
                  +62 812-3456-7890 (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Alamat Kantor */}
          <div>
            <h4 className="font-display font-bold text-stone-900 text-xs uppercase tracking-wider mb-4">
              Lokasi Kantor
            </h4>
            <p className="text-stone-500 text-sm leading-relaxed font-medium max-w-xs">
              Pakuwon Tower Lantai 12, Jl. Embong Malang No.1-5, Tegalsari, Kota Surabaya, Jawa Timur 60261
            </p>
          </div>

        </div>

        {/* Hak Cipta */}
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-stone-100 text-center">
          <p className="text-stone-400 text-xs font-medium">
            © {new Date().getFullYear()} OrderEase System. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}