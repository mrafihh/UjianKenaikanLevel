// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Warung Nikmat — Order Online',
  description: 'Pesan makanan & minuman langsung dari meja Anda',
};

// Viewport terpisah dari metadata (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // disable zoom agar feel native app
  themeColor: '#e8420a', // warna status bar di Android
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-orange-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}