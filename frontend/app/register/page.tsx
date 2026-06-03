'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [namaRestoran, setnamaRestoran] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaRestoran: namaRestoran,
          username: username,
          phone: phone,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
      }

      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 font-sans antialiased py-12">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
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
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Store size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900 tracking-tight text-center">
            Mulai Bisnismu
          </h1>
          <p className="text-stone-500 text-sm mt-1 text-center">
            Buat akun untuk menerima pesanan digital
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl text-center font-medium">
            {successMessage}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-[13px] font-bold text-stone-700 mb-1.5 ml-1">
              Nama Restoran / Warung
            </label>
            <input 
              type="text" 
              required
              value={namaRestoran}
              onChange={(e) => setnamaRestoran(e.target.value)}
              placeholder="Contoh: Warung Saffron"
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-stone-700 mb-1.5 ml-1">
              Username
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: warungsaffron"
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-stone-700 mb-1.5 ml-1">
              Nomor Telepon
            </label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand hover:bg-brand-hover disabled:bg-stone-400 text-white font-bold py-4 rounded-xl mt-3 transition-colors shadow-brand text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <p className="text-center text-stone-500 text-[13px] mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-stone-900 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </main>
  );
}