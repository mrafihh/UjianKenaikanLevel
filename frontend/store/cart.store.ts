// store/cart.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

const TAX_RATE = 0.1;

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === newItem.id);
          if (idx !== -1) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
            return { items: updated };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx === -1) return state;
          const item = state.items[idx];
          if (item.quantity <= 1) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          const updated = [...state.items];
          updated[idx] = { ...item, quantity: item.quantity - 1 };
          return { items: updated };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fnb-cart',
      storage: createJSONStorage(() => sessionStorage), // otomatis hilang saat tab ditutup
    }
  )
);

// Hook terpisah untuk computed values — hindari re-render berlebihan
export function useCartTotals() {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  return { subtotal, tax, total, totalItems };
}