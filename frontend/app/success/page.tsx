// app/success/page.tsx
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fmt } from '@/lib/format';

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();

  const orderId = params.get('orderId') ?? '–';
  const table = params.get('table') ?? '–';
  const method = params.get('method') ?? 'CASH';
  const total = Number(params.get('total') ?? 0);

  return (
    <main className="max-w-[390px] mx-auto min-h-screen bg-orange-50 flex flex-col items-center justify-center px-5 py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-sm">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1.5">Pesanan Diterima!</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Pesananmu sedang diproses dapur 👨‍🍳
      </p>

      {/* Order Summary Card */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">No. Order</span>
          <span className="font-semibold text-gray-800">#{orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Nomor Meja</span>
          <span className="font-semibold text-gray-800">#{table}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Metode Bayar</span>
          <span className="font-semibold text-gray-800">
            {method === 'QRIS' ? 'QRIS' : 'Cash'}
          </span>
        </div>
        <hr className="border-dashed border-gray-200" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800 text-[15px]">Total Tagihan</span>
          <span className="font-bold text-[#e8420a] text-[17px]">{fmt(total)}</span>
        </div>
      </div>

      {/* Payment instruction */}
      {method === 'CASH' ? (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5">
          <p className="text-xs text-amber-700 text-center leading-relaxed">
            💵 Silakan bayar ke kasir setelah makanan tiba di mejamu
          </p>
        </div>
      ) : (
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5">
          <p className="text-xs text-blue-700 text-center leading-relaxed">
            📲 Staff akan membawa QRIS ke meja kamu untuk pembayaran
          </p>
        </div>
      )}

      <button
        onClick={() => router.replace('/menu')}
        className="w-full py-3.5 rounded-xl bg-[#e8420a] text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
      >
        Pesan Lagi
      </button>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}