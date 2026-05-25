// components/MenuCard.tsx
import { fmt } from '@/lib/format';
import type { MenuItem } from '@/lib/types';

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MenuCard({ item, quantity, onAdd, onRemove }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Image / Emoji area */}
      <div className="h-[90px] bg-orange-50 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[44px] leading-none">{item.emoji ?? '🍽️'}</span>
        )}
      </div>

      <div className="p-2.5 pt-2">
        <p className="text-[12px] font-semibold text-gray-800 leading-tight mb-0.5 line-clamp-1">
          {item.name}
        </p>
        <p className="text-[11px] text-gray-400 leading-snug mb-2 line-clamp-2 min-h-[30px]">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#e8420a]">{fmt(item.price)}</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="w-7 h-7 rounded-[8px] bg-[#e8420a] text-white flex items-center justify-center active:scale-90 transition-transform"
              aria-label={`Tambah ${item.name}`}
            >
              <PlusIcon size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onRemove}
                className="w-6 h-6 rounded-[7px] border border-[#e8420a] text-[#e8420a] flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Kurangi"
              >
                <MinusIcon size={12} />
              </button>
              <span className="text-[13px] font-bold text-gray-800 w-5 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="w-6 h-6 rounded-[7px] bg-[#e8420a] text-white flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Tambah"
              >
                <PlusIcon size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}