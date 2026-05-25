// components/OrderList.tsx
import { fmt } from '@/lib/format';
import type { CartItem } from '@/lib/types';

interface Props {
  items: CartItem[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function OrderList({ items, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3">
          {/* Left: emoji + info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl leading-none flex-shrink-0">{item.emoji}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-[11px] text-[#e8420a]">
                {fmt(item.price)} × {item.quantity} ={' '}
                <span className="font-semibold">{fmt(item.price * item.quantity)}</span>
              </p>
            </div>
          </div>

          {/* Right: qty controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onRemove(item.id)}
              className="w-6 h-6 rounded-[7px] border border-[#e8420a] text-[#e8420a] flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Kurangi"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>

            <span className="text-[13px] font-bold text-gray-800 w-5 text-center tabular-nums">
              {item.quantity}
            </span>

            <button
              onClick={() => onAdd(item.id)}
              className="w-6 h-6 rounded-[7px] bg-[#e8420a] text-white flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Tambah"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}