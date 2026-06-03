'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Utensils, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier,
          password: password,
        }),
      });

      const data = await response.json();

      // Log response asli untuk debugging — hapus setelah konfirmasi berhasil
      console.log('📦 Response dari backend:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login gagal. Periksa kembali data Anda.');
      }

      // Coba semua kemungkinan nama field token dari berbagai backend
      const token =
        data.token ??
        data.accessToken ??
        data.access_token ??
        data.data?.token ??
        data.data?.accessToken ??
        null;

      // === UBAHAN: Coba tangkap data ROLE dari backend ===
      // Jika backend belum mengirimkan role, kita anggap default-nya 'ADMIN' untuk testing
      const userRole = 
        data.role ?? 
        data.userRole ?? 
        data.data?.role ?? 
        data.data?.userRole ?? 
        'ADMIN'; 

      if (token) {
        // Simpan Token
        localStorage.setItem('admin_token', token);
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        
        // Simpan Role ke Cookie agar bisa dibaca oleh Middleware
        document.cookie = `role=${userRole.toUpperCase()}; path=/; max-age=86400; SameSite=Lax`;
        
        window.location.href = '/admin';
      } else {
        throw new Error(
          `Token tidak ditemukan. Response: ${JSON.stringify(data)}`
        );
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center mb-4 shadow-brand">
            <Utensils size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900 tracking-tight">
            Masuk ke Dasbor
          </h1>
          <p className="text-stone-500 text-sm mt-1 text-center">
            Kelola menu dan pantau pesanan Anda
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-[13px] font-bold text-stone-700 mb-1.5 ml-1">
              Username atau No. Telepon
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: warungsaffron atau 0812..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-stone-700 mb-1.5 ml-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold py-4 rounded-xl mt-2 transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <p className="text-center text-stone-500 text-[13px] mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-brand font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </motion.div>
    </main>
  );
}