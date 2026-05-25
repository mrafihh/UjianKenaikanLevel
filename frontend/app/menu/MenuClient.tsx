// app/menu/MenuClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import MenuCard from '@/components/MenuCard';
import CategoryTabs from '@/components/CategoryTabs';
import CartBar from '@/components/CartBar';
import type { MenuItem } from '@/lib/types';

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Dessert'];

interface Props {
  initialItems: MenuItem[];
  defaultTable: string; // pre-filled dari QR Code
}

export default function MenuClient({ initialItems, defaultTable }: Props) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const router = useRouter();

  const { addItem, removeItem, items: cartItems } = useCartStore();
  const { totalItems, total } = useCartTotals();

  const filteredItems = useMemo(
    () =>
      activeCategory === 'Semua'
        ? initialItems
        : initialItems.filter((item) => item.category === activeCategory),
    [activeCategory, initialItems]
  );

  const getQty = (id: number) =>
    cartItems.find((i) => i.id === id)?.quantity ?? 0;

  const handleCheckout = () => {
    const query = defaultTable ? `?table=${defaultTable}` : '';
    router.push(`/checkout${query}`);
  };

  return (
    <main className="max-w-[390px] mx-auto min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-[#e8420a] px-4 pt-5 pb-4 text-white">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-base">
            🍽️
          </div>
          <h1 className="text-[17px] font-semibold tracking-tight">Warung Nikmat</h1>
        </div>
        <p className="text-[12px] opacity-75 ml-[42px]">
          Pilih makanan favoritmu
          {defaultTable && <span className="ml-1 font-medium">• Meja #{defaultTable}</span>}
        </p>
      </header>

      <CategoryTabs
        categories={CATEGORIES}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-2.5 p-3 pb-28">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-sm text-gray-400">
            Menu tidak tersedia saat ini
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              quantity={getQty(item.id)}
              onAdd={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  emoji: item.emoji ?? '🍽️',
                })
              }
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>

      {totalItems > 0 && (
        <CartBar
          totalItems={totalItems}
          total={total}
          onCheckout={handleCheckout}
        />
      )}
    </main>
  );
}