// components/PaymentSelector.tsx
import type { PaymentMethod } from '@/lib/types';

interface Props {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const OPTIONS: { value: PaymentMethod; emoji: string; label: string; desc: string }[] = [
  { value: 'CASH', emoji: '💵', label: 'Cash', desc: 'Bayar ke kasir' },
  { value: 'QRIS', emoji: '📲', label: 'QRIS', desc: 'Scan & bayar' },
];

export default function PaymentSelector({ selected, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`py-3.5 rounded-xl border text-center transition-all active:scale-95
                ${isSelected
                  ? 'border-[#e8420a] bg-orange-50 border-2'
                  : 'border-gray-200 bg-gray-50'
                }`}
            >
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <p className={`text-[13px] font-semibold ${isSelected ? 'text-[#e8420a]' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* QRIS placeholder — tampil jika QRIS dipilih */}
      {selected === 'QRIS' && (
        <div className="mt-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
          <p className="text-[11px] text-gray-500 mb-2">Scan QR berikut untuk membayar</p>
          {/* 
            Ganti dengan komponen QR Code aktual.
            Rekomendasi: npm install qrcode.react
            <QRCodeSVG value={`ORDER:${orderId}`} size={120} />
          */}
          <div className="w-[120px] h-[120px] mx-auto bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M16 16h.01"/>
            </svg>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            QR Code aktif akan tampil setelah dikonfirmasi kasir
          </p>
        </div>
      )}
    </div>
  );
}