// components/CartBar.tsx
import { fmt } from '@/lib/format';

interface Props {
  totalItems: number;
  total: number;
  onCheckout: () => void;
}

export default function CartBar({ totalItems, total, onCheckout }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-3.5 py-3 bg-white border-t border-gray-100 pb-safe">
      <button
        onClick={onCheckout}
        className="w-full py-3.5 px-4 rounded-xl bg-[#e8420a] text-white flex items-center justify-between active:scale-[0.98] transition-transform"
      >
        {/* Badge item count */}
        <span className="bg-white/25 rounded-lg px-2.5 py-0.5 text-[12px] font-semibold tabular-nums">
          {totalItems} item
        </span>

        <span className="text-[14px] font-semibold">Lihat Tagihan</span>

        <span className="text-[14px] font-bold tabular-nums">{fmt(total)}</span>
      </button>
    </div>
  );
}