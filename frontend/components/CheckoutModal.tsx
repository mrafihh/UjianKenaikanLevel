'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  ChevronRight,
  Receipt,
  Loader2,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/Utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Tetap dipertahankan sebagai fallback/untuk opsi bayar Tunai (CASH)
   */
  onPayment: (
    orderId: string,
    customerName: string,
    tableNumber: string,
    grandTotal: number
  ) => void;
}

// 1. DISESUAIKAN: Mengubah 'QRIS' menjadi 'ONLINE' sesuai response backend Anda
type PaymentMethod = 'ONLINE' | 'CASH';

interface FormErrors {
  customerName?: string;
  tableNumber?: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onPayment,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE'); // Default ke ONLINE
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    items,
    setTableNumber: saveTable,
    setCustomerName: saveName,
    getTotalPrice,
  } = useCartStore();

  const subtotal = getTotalPrice();
  const taxAmount = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + taxAmount;

  // ── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Nama pelanggan wajib diisi';
    }

    const tableNum = Number(tableNumber.trim());
    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Nomor meja wajib diisi';
    } else if (isNaN(tableNum) || tableNum <= 0 || tableNum > 99) {
      newErrors.tableNumber = 'Masukkan nomor meja yang valid (1 – 99)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── POST ke backend ───────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return;

    setApiError('');
    setIsProcessing(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        tableNumber: tableNumber.trim(),
        paymentMethod, // Mengirim 'ONLINE' atau 'CASH'
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody?.message ??
          errBody?.error ??
          `Gagal membuat pesanan (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();

      // Mengambil orderId & paymentUrl dari response tunggal maupun nested data object
      const orderId = String(data?.id ?? data?.data?.id ?? 'N/A');
      const paymentUrl = data?.paymentUrl ?? data?.data?.paymentUrl;

      // Simpan data meja & nama ke local store
      saveTable(tableNumber.trim());
      saveName(customerName.trim());

      // 2. LOGIKA UTAMA INTEGRASI XENDIT INVOICE
      if (paymentMethod === 'ONLINE' && paymentUrl) {
        // Alihkan halaman ke gerbang pembayaran aman Xendit Invoice
        window.location.href = paymentUrl;
      } else {
        // Jika memilih bayar di kasir (CASH), gunakan alur modal lokal bawaan Anda
        onPayment(orderId, customerName.trim(), tableNumber.trim(), grandTotal);
      }
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setErrors({});
    setApiError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-[4px] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ y: 56, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 56, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="bg-white w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-[3px] bg-stone-200 rounded-full mx-auto mt-3 flex-shrink-0 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-stone-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-brand-light rounded-xl flex items-center justify-center">
                  <Receipt size={16} className="text-brand" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-stone-900 text-lg leading-tight">
                    Ringkasan Pesanan
                  </h2>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    {items.length} jenis menu
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                disabled={isProcessing}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <X size={15} className="text-stone-500" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Info Pelanggan */}
              <div className="px-5 pt-4 pb-3">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-3">
                  Info Pelanggan
                </p>

                {/* Customer Name */}
                <div className="mb-3">
                  <div
                    className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                      errors.customerName
                        ? 'border-red-400 bg-red-50'
                        : customerName
                        ? 'border-brand bg-brand-light'
                        : 'border-stone-200 bg-stone-50 focus-within:border-stone-400'
                    }`}
                  >
                    <User
                      size={17}
                      strokeWidth={2}
                      className={
                        errors.customerName
                          ? 'text-red-400 flex-shrink-0'
                          : customerName
                          ? 'text-brand flex-shrink-0'
                          : 'text-stone-400 flex-shrink-0'
                      }
                    />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.customerName)
                          setErrors((p) => ({ ...p, customerName: undefined }));
                      }}
                      placeholder="Nama kamu (contoh: Rafi)"
                      className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-[13px] font-semibold outline-none"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.customerName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-red-500 text-[11px] mt-1.5 px-1 font-medium"
                      >
                        ⚠️ {errors.customerName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Table Number */}
                <div>
                  <div
                    className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                      errors.tableNumber
                        ? 'border-red-400 bg-red-50'
                        : tableNumber
                        ? 'border-brand bg-brand-light'
                        : 'border-stone-200 bg-stone-50 focus-within:border-stone-400'
                    }`}
                  >
                    <MapPin
                      size={17}
                      strokeWidth={2}
                      className={
                        errors.tableNumber
                          ? 'text-red-400 flex-shrink-0'
                          : tableNumber
                          ? 'text-brand flex-shrink-0'
                          : 'text-stone-400 flex-shrink-0'
                      }
                    />
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        if (errors.tableNumber)
                          setErrors((p) => ({ ...p, tableNumber: undefined }));
                      }}
                      placeholder="Nomor meja (1 – 99)"
                      className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-[13px] font-semibold outline-none"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.tableNumber && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-red-500 text-[11px] mt-1.5 px-1 font-medium"
                      >
                        ⚠️ {errors.tableNumber}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="px-5 pb-4">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-3">
                  Metode Pembayaran
                </p>
                <div className="flex rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
                  {([
                    { id: 'ONLINE', label: 'Transfer / QRIS', icon: '💳' },
                    { id: 'CASH', label: 'Bayar di Kasir', icon: '💵' }
                  ] as const).map((method) => (
                    <motion.button
                      key={method.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex-1 py-3 text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        paymentMethod === method.id
                          ? 'bg-stone-900 text-white shadow-inner'
                          : 'bg-transparent text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Item Pesanan */}
              <div className="px-5 pb-3">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-3">
                  Detail Pesanan
                </p>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                        {item.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">🍽️</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 text-[13px] font-semibold leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-stone-400 text-[11px] mt-0.5 tabular-nums">
                          {item.quantity}x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-stone-900 text-[13px] font-bold tabular-nums flex-shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rincian Harga */}
              <div className="mx-5 border-t border-dashed border-stone-200 pt-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-[13px]">Subtotal</span>
                  <span className="text-stone-600 text-[13px] font-medium tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-[13px]">PPN 11%</span>
                  <span className="text-stone-600 text-[13px] font-medium tabular-nums">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              </div>

              <div className="mx-5 mt-3 border-t border-stone-200 pt-3 pb-3 flex justify-between items-center">
                <span className="text-stone-900 font-bold text-[15px]">Total</span>
                <span className="text-stone-900 font-extrabold text-xl tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Catatan (Opsional) */}
              <div className="px-5 pb-5">
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-3">
                  Catatan <span className="normal-case tracking-normal">(opsional)</span>
                </p>
                <div
                  className={`flex items-start gap-3 border-2 rounded-2xl px-4 py-3 transition-all duration-200 ${
                    notes
                      ? 'border-stone-300 bg-stone-50'
                      : 'border-stone-200 bg-stone-50 focus-within:border-stone-400'
                  }`}
                >
                  <FileText
                    size={16}
                    strokeWidth={2}
                    className="text-stone-400 mt-0.5 flex-shrink-0"
                  />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Misal: tidak pedas, alergi kacang, dll."
                    rows={2}
                    maxLength={200}
                    className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 text-[13px] outline-none resize-none leading-relaxed"
                  />
                </div>
                {notes.length > 150 && (
                  <p className="text-stone-400 text-[10px] mt-1 text-right">
                    {notes.length}/200
                  </p>
                )}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-5 pt-3 pb-4 border-t border-stone-100 bg-white flex-shrink-0">
              {/* API Error Banner */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                      <AlertCircle
                        size={15}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <p className="text-red-600 text-[12px] leading-snug font-medium">
                        {apiError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2.5 bg-brand disabled:bg-stone-300 hover:bg-brand-hover text-white font-bold py-4 rounded-2xl transition-colors shadow-brand text-[15px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                    <span>Menghubungkan ke Xendit...</span>
                  </>
                ) : paymentMethod === 'ONLINE' ? (
                  <>
                    <span>Lanjut ke Pembayaran</span>
                    <ChevronRight size={17} strokeWidth={2.5} />
                  </>
                ) : (
                  <>
                    <span>Pesan & Bayar di Kasir</span>
                    <ChevronRight size={17} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}