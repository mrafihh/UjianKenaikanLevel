// components/CategoryTabs.tsx
interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 py-0">
      <div className="flex gap-1.5 px-3.5 py-2.5 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95
              ${cat === active
                ? 'bg-[#e8420a] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}