// ─────────────────────────────────────────────────────────────
// lib/menuData.ts
// Tidak ada hardcoded data di sini — semua data di-fetch dari API.
// File ini hanya berisi tipe data & helper function.
// ─────────────────────────────────────────────────────────────

/** Shape data MenuItem sesuai schema Prisma di backend */
export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  jumlahStock: number;
}

export interface Category {
  id: string;
  name: string;
}

// Mapping emoji per nama kategori (lowercase) yang mungkin datang dari backend
const CATEGORY_EMOJI: Record<string, string> = {
  all: '🍽️',
  main: '🍛',
  'makanan utama': '🍛',
  makanan: '🍛',
  snack: '🍟',
  cemilan: '🍟',
  appetizer: '🥗',
  drink: '🥤',
  drinks: '🥤',
  minuman: '🥤',
  dessert: '🍮',
  desserts: '🍮',
  penutup: '🍮',
};

export const getCategoryEmoji = (cat: string): string =>
  CATEGORY_EMOJI[cat.toLowerCase()] ?? '🍽️';

/**
 * Dari array MenuItem hasil fetch, build daftar Category unik
 * dengan "Semua" selalu di posisi pertama.
 */
export const buildCategories = (items: MenuItem[]): Category[] => {
  const seen = new Set<string>();
  const result: Category[] = [{ id: 'all', name: 'Semua'}];

  for (const item of items) {
    if (!seen.has(item.category)) {
      seen.add(item.category);
      result.push({
        id: item.category,
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      });
    }
  }

  return result;
};
