'use client';

import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-[61px] z-40 bg-cream/96 backdrop-blur-sm border-b border-stone-100 shadow-[0_1px_8px_rgba(28,25,23,0.05)]">
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar max-w-lg mx-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onCategoryChange(cat.id)}
              aria-pressed={isActive}
              className={`
                relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full
                text-sm font-medium transition-colors duration-150 flex-shrink-0 select-none
                ${isActive ? 'text-white' : 'text-stone-500 bg-stone-100 hover:bg-stone-200 hover:text-stone-700'}
              `}
            >
              {/* Sliding active pill via layoutId */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-stone-900 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}