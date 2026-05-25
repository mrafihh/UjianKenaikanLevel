// lib/types.ts
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  emoji?: string | null;
  isAvailable: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'QRIS';

export interface CreateOrderPayload {
  tableNumber: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: { menuItemId: number; quantity: number }[];
}