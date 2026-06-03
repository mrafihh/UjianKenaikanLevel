import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dan role dari cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // 2. Tentukan rute yang ingin dilindungi
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin');

  // --- PROTEKSI RUTE ADMIN ---
  if (isProtectedRoute) {
    // Jika TIDAK ada token, tendang ke halaman /login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika ADA token tapi rolenya BUKAN ADMIN, tendang ke beranda
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- PROTEKSI HALAMAN LOGIN ---
  // Jika user SUDAH login dan memaksa buka halaman /login, langsung arahkan ke /admin
  if (request.nextUrl.pathname === '/login' && token && role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Jika lolos semua pengecekan, izinkan lewat
  return NextResponse.next();
}

// Konfigurasi matcher: Kita cek /admin dan /login
export const config = {
  matcher: ['/admin/:path*', '/login'],
};