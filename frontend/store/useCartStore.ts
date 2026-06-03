import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  /** ID integer dari backend — dipakai langsung di POST payload */
  menuItemId: number;
  /** String version (menuItemId.toString()) — dipakai sebagai React key */
  id: string;
  name: string;
  price: number;
  /** Dari imageUrl backend, atau string kosong jika null */
  image: string;
  category: string;
  quantity: number;
  /** Menyimpan batas maksimal stok untuk item ini */
  jumlahStock: number;
  /** Menyimpan catatan khusus pesanan (opsional) */
  notes?: string | null;
}

interface CartStore {
  items: CartItem[];
  tableNumber: string;
  customerName: string;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void; // Fungsi baru untuk catatan
  clearCart: () => void;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '',
      customerName: '',

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          
          if (existing) {
            // Cegah penambahan jika quantity sudah mencapai batas jumlahStock
            if (existing.quantity >= existing.jumlahStock) {
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          
          // Jangan masukkan ke keranjang jika stoknya 0 (sebagai pengaman tambahan)
          if (item.jumlahStock <= 0) return state;
          
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) => {
              if (i.id === id) {
                // Pastikan nilai quantity tidak melebih batas jumlahStock
                const validQuantity = quantity > i.jumlahStock ? i.jumlahStock : quantity;
                return { ...i, quantity: validQuantity };
              }
              return i;
            }),
          };
        }),

      // Implementasi fungsi pembaruan catatan
      updateNotes: (id, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, notes } : i
          ),
        })),

      clearCart: () => set({ items: [], tableNumber: '', customerName: '' }),

      setTableNumber: (table) => set({ tableNumber: table }),
      setCustomerName: (name) => set({ customerName: name }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'warung-saffron-cart',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);