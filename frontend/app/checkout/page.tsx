// app/checkout/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { createOrder } from '@/lib/api';
import { fmt } from '@/lib/format';
import OrderList from '@/components/OrderList';
import PaymentSelector from '@/components/PaymentSelector';
import type { PaymentMethod } from '@/lib/types';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableFromQR = searchParams.get('table') ?? '';

  const { items, addItem, removeItem, clearCart } = useCartStore();
  const { subtotal, tax, total } = useCartTotals();

  const [tableNumber, setTableNumber] = useState(tableFromQR);
  const [notes, setNotes] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) router.replace('/menu');
  }, [items, router]);

  const handleOrder = async () => {
    if (!tableNumber.trim() || items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const order = await createOrder({
        tableNumber: tableNumber.trim(),
        paymentMethod: payMethod,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      });
      clearCart();
      router.push(
        `/success?orderId=${order.id}&table=${tableNumber}&method=${payMethod}&total=${total}`
      );
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan, coba lagi');
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const isValid = tableNumber.trim().length > 0;

  return (
    <main className="max-w-[390px] mx-auto min-h-screen bg-orange-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[16px] font-semibold text-gray-900">Detail Pesanan</h1>
      </header>

      <div className="px-3.5 py-3 pb-28 space-y-3">
        {/* Order Items */}
        <section className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-3">Pesananmu</h2>
          <OrderList
            items={items}
            onAdd={(id) => {
              const item = items.find((i) => i.id === id);
              if (item) addItem({ id: item.id, name: item.name, price: item.price, emoji: item.emoji });
            }}
            onRemove={removeItem}
          />
        </section>

        {/* Bill Detail */}
        <section className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-3">Rincian Tagihan</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">PPN 10%</span>
              <span>{fmt(tax)}</span>
            </div>
            <hr className="border-dashed border-gray-200 !my-3" />
            <div className="flex justify-between text-[15px] font-semibold">
              <span className="text-gray-800">Total</span>
              <span className="text-[#e8420a]">{fmt(total)}</span>
            </div>
          </div>
        </section>

        {/* Table Number */}
        <section className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-2.5">
            Nomor Meja <span className="text-red-500">*</span>
          </h2>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Masukkan nomor meja kamu"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-[15px] bg-gray-50 outline-none transition-colors
              ${tableNumber ? 'border-[#e8420a]' : 'border-gray-200 focus:border-[#e8420a]'}`}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Lihat nomor di sudut meja kamu
          </p>
        </section>

        {/* Notes */}
        <section className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-2.5">
            Catatan{' '}
            <span className="font-normal text-gray-400">(opsional)</span>
          </h2>
          <textarea
            placeholder="Contoh: tidak pakai pedas, ekstra saus..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px] bg-gray-50 outline-none
              resize-none focus:border-[#e8420a] transition-colors leading-relaxed"
          />
        </section>

        {/* Payment Method */}
        <section className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-semibold text-gray-800 mb-3">Metode Pembayaran</h2>
          <PaymentSelector selected={payMethod} onChange={setPayMethod} />
        </section>

        {error && (
          <p className="text-center text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-3.5 py-3 bg-white border-t border-gray-100 pb-safe">
        <button
          onClick={handleOrder}
          disabled={!isValid || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.98]
            ${isValid && !loading
              ? 'bg-[#e8420a] text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {loading
            ? 'Memproses pesanan...'
            : isValid
            ? `Pesan Sekarang • ${fmt(total)}`
            : 'Masukkan nomor meja dulu'}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    // useSearchParams() wajib dibungkus Suspense di Next.js 14
    <Suspense fallback={<div className="max-w-[390px] mx-auto min-h-screen bg-orange-50 animate-pulse" />}>
      <CheckoutContent />
    </Suspense>
  );
}