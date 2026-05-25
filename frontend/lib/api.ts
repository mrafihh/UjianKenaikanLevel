// lib/api.ts
import type { MenuItem, CreateOrderPayload } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function getMenuItems(): Promise<MenuItem[]> {
  const res = await fetch(`${API_URL}/menu`, {
    next: { revalidate: 60 }, // ISR — cache 60 detik, cocok untuk menu yang jarang berubah
  });

  if (!res.ok) throw new Error('Gagal mengambil data menu');
  return res.json();
}

export async function createOrder(payload: CreateOrderPayload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Gagal membuat pesanan');
  }
  return res.json();
}