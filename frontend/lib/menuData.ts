export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isNew?: boolean;
  spiceLevel?: 0 | 1 | 2 | 3;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export const categories: Category[] = [
  { id: 'all',     name: 'Semua',        emoji: '🍽️' },
  { id: 'main',    name: 'Makanan Utama', emoji: '🍛' },
  { id: 'snack',   name: 'Cemilan',       emoji: '🍟' },
  { id: 'drink',   name: 'Minuman',       emoji: '🥤' },
  { id: 'dessert', name: 'Dessert',       emoji: '🍮' },
];

export const menuItems: MenuItem[] = [
  // ── MAKANAN UTAMA ────────────────────────────────────────
  {
    id: 'nasi-goreng-special',
    name: 'Nasi Goreng Special',
    description:
      'Nasi goreng khas kami dengan telur mata sapi, daging sapi cincang, sayuran segar, dan bumbu rempah pilihan',
    price: 45000,
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&q=80',
    category: 'main',
    isPopular: true,
    spiceLevel: 2,
  },
  {
    id: 'mie-goreng-seafood',
    name: 'Mie Goreng Seafood',
    description:
      'Mie kuning goreng dengan udang, cumi, sayuran segar, dan saus tiram khas chef kami',
    price: 52000,
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
    category: 'main',
    isPopular: true,
    spiceLevel: 1,
  },
  {
    id: 'soto-ayam-lamongan',
    name: 'Soto Ayam Lamongan',
    description:
      'Kuah bening segar dengan ayam suwir, tauge, kol, telur rebus, dan perkedel kentang',
    price: 38000,
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80',
    category: 'main',
    spiceLevel: 1,
  },
  {
    id: 'ayam-goreng-krispi',
    name: 'Ayam Goreng Krispi',
    description:
      'Ayam goreng dengan lapisan tepung renyah golden-brown sempurna, disajikan dengan sambal dan lalapan segar',
    price: 42000,
    image:
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop&q=80',
    category: 'main',
    isPopular: true,
    spiceLevel: 0,
  },
  {
    id: 'rendang-daging',
    name: 'Rendang Daging Sapi',
    description:
      'Rendang otentik Padang dengan daging sapi empuk, dimasak slow-cook dalam rempah pilihan selama 4 jam',
    price: 68000,
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
    category: 'main',
    isNew: true,
    spiceLevel: 3,
  },
  {
    id: 'gado-gado',
    name: 'Gado-gado Jakarta',
    description:
      'Sayuran rebus segar dengan bumbu kacang homemade kental, telur rebus, dan kerupuk udang renyah',
    price: 32000,
    image:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&q=80',
    category: 'main',
    spiceLevel: 1,
  },

  // ── CEMILAN ──────────────────────────────────────────────
  {
    id: 'bakwan-sayur',
    name: 'Bakwan Sayur Crispy',
    description:
      'Gorengan sayuran (wortel, kol, daun bawang) dengan tepung gurih, renyah di luar lembut di dalam',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&q=80',
    category: 'snack',
    isPopular: true,
    spiceLevel: 0,
  },
  {
    id: 'pisang-goreng',
    name: 'Pisang Goreng Crispy',
    description:
      'Pisang kepok manis digoreng dengan balutan adonan tipis renyah, disajikan dengan saus coklat leleh',
    price: 18000,
    image:
      'https://images.unsplash.com/photo-1618897996318-5a901fa4f97d?w=400&h=300&fit=crop&q=80',
    category: 'snack',
    spiceLevel: 0,
  },
  {
    id: 'tahu-tempe-goreng',
    name: 'Tahu Tempe Goreng',
    description:
      'Tahu dan tempe goreng bumbu bawang daun jeruk, disajikan hangat dengan sambal kecap spesial',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&q=80',
    category: 'snack',
    spiceLevel: 1,
  },

  // ── MINUMAN ──────────────────────────────────────────────
  {
    id: 'es-teh-manis',
    name: 'Es Teh Manis',
    description:
      'Teh hitam premium diseduh panas lalu didinginkan dengan es batu, manis alami dan menyegarkan',
    price: 8000,
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&q=80',
    category: 'drink',
    isPopular: true,
  },
  {
    id: 'kopi-susu-kekinian',
    name: 'Kopi Susu Kekinian',
    description:
      'Espresso shot dengan susu full cream, gula aren, dan vanilla. Disajikan dingin atas es batu',
    price: 22000,
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80',
    category: 'drink',
    isNew: true,
  },
  {
    id: 'jus-alpukat',
    name: 'Jus Alpukat Susu',
    description:
      'Alpukat segar diblender dengan susu kental manis, topped dengan drizzle coklat sirup',
    price: 28000,
    image:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
    category: 'drink',
    isPopular: true,
  },
  {
    id: 'es-jeruk-peras',
    name: 'Es Jeruk Peras',
    description:
      'Jeruk sunkist segar diperas langsung, tanpa pengawet, dingin dan penuh vitamin C alami',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop&q=80',
    category: 'drink',
  },

  // ── DESSERT ──────────────────────────────────────────────
  {
    id: 'es-krim-homemade',
    name: 'Es Krim Homemade',
    description:
      'Es krim artisan homemade 3 pilihan rasa: vanilla bean, coklat belgia, atau matcha premium',
    price: 22000,
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop&q=80',
    category: 'dessert',
    isNew: true,
  },
  {
    id: 'pudding-coklat',
    name: 'Pudding Coklat Velvety',
    description:
      'Pudding coklat lembut dengan saus karamel salted dan topping almond panggang renyah',
    price: 18000,
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&q=80',
    category: 'dessert',
    isPopular: true,
  },
  {
    id: 'klepon-modern',
    name: 'Klepon Modern',
    description:
      'Klepon tradisional berisi gula aren cair, dilapisi kelapa muda parut segar dalam kotak bambu',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop&q=80',
    category: 'dessert',
  },
];