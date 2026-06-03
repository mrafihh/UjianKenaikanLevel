'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  LogOut,
  RefreshCw,
  WifiOff,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────
type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  menuItem: { id: number; name: string; emoji: string | null };
};

type Order = {
  id: number;
  customerName: string;
  tableNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  createdAt: string;
  items: OrderItem[];
};

// ─── Helpers ──────────────────────────────────────────────────
const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: n >= 1_000_000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(n);

const getToken = () =>
  typeof window !== 'undefined'
    ? (localStorage.getItem('admin_token') ??
        document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ??
        '')
    : '';

// Statuses yang dianggap sebagai pendapatan masuk (exclude PENDING & CANCELLED)
const REVENUE_STATUSES: OrderStatus[] = [
  'PAID',
  'PREPARING',
  'READY',
  'COMPLETED',
];

// ─── Skeleton Card ────────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="bg-white p-6 rounded-[20px] border border-stone-200/60 shadow-sm flex items-start gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-stone-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-2.5 bg-stone-200 rounded-full w-3/4" />
        <div className="h-6 bg-stone-200 rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900 text-white text-xs rounded-xl px-3.5 py-2.5 shadow-lg">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-stone-300">
        Pesanan:{' '}
        <span className="text-brand font-extrabold">
          {payload[0]?.value ?? 0}
        </span>
      </p>
      <p className="text-stone-300">
        Pendapatan:{' '}
        <span className="text-emerald-400 font-extrabold">
          {formatRupiah(payload[1]?.value ?? 0)}
        </span>
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // ── Fetch orders ─────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setStatus('loading');
    else setIsRefreshing(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      const list: Order[] = Array.isArray(data)
        ? data
        : (data.data ?? data.orders ?? []);
      setOrders(list);
      setStatus('success');
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data';
      if (!silent) { setError(msg); setStatus('error'); }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  // Auto-refresh setiap 60 detik
  useEffect(() => {
    const t = setInterval(() => fetchOrders(true), 60_000);
    return () => clearInterval(t);
  }, [fetchOrders]);

  // ── Derived stats ─────────────────────────────────────────────
  const { todayOrders, allTimeOrders } = useMemo(() => ({
    todayOrders: orders.filter((o) => isToday(o.createdAt)),
    allTimeOrders: orders,
  }), [orders]);

  const stats = useMemo(() => {
    const revenue = todayOrders
      .filter((o) => REVENUE_STATUSES.includes(o.status))
      .reduce((s, o) => s + o.total, 0);

    const totalItems = todayOrders.reduce(
      (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
      0
    );

    const uniqueCustomers = new Set(todayOrders.map((o) => o.customerName)).size;

    return { revenue, totalOrders: todayOrders.length, totalItems, uniqueCustomers };
  }, [todayOrders]);

  // ── Top selling items ─────────────────────────────────────────
  const topItems = useMemo(() => {
    const map: Record<number, { name: string; emoji: string; qty: number }> = {};
    for (const order of todayOrders) {
      for (const item of order.items) {
        const k = item.menuItem.id;
        if (!map[k]) map[k] = { name: item.menuItem.name, emoji: item.menuItem.emoji ?? '🍽️', qty: 0 };
        map[k].qty += item.quantity;
      }
    }
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [todayOrders]);

  // ── Hourly chart data (06:00 – current hour) ─────────────────
  const chartData = useMemo(() => {
    const currentHour = new Date().getHours();
    const endHour = Math.max(currentHour + 1, 12); // minimal sampai jam 12

    return Array.from({ length: endHour - 6 }, (_, i) => {
      const hour = i + 6;
      const label = `${String(hour).padStart(2, '0')}:00`;
      const ordersAtHour = todayOrders.filter(
        (o) => new Date(o.createdAt).getHours() === hour
      );
      return {
        label,
        hour,
        pesanan: ordersAtHour.length,
        pendapatan: ordersAtHour
          .filter((o) => REVENUE_STATUSES.includes(o.status))
          .reduce((s, o) => s + o.total, 0),
      };
    });
  }, [todayOrders]);

  const peakHour = useMemo(
    () => chartData.reduce((max, d) => (d.pesanan > max.pesanan ? d : max), chartData[0]),
    [chartData]
  );

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  // ── Stat cards config ─────────────────────────────────────────
  const statCards = [
    {
      title: 'Pendapatan Hari Ini',
      value: status === 'success' ? formatRupiah(stats.revenue) : '—',
      sub: `dari ${stats.totalOrders} pesanan`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Pesanan',
      value: status === 'success' ? String(stats.totalOrders) : '—',
      sub: `${allTimeOrders.length} sepanjang waktu`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Porsi Terjual',
      value: status === 'success' ? String(stats.totalItems) : '—',
      sub: 'item hari ini',
      icon: UtensilsCrossed,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
  title: 'Rata-rata Pesanan',
  value:
    status === 'success'
      ? stats.totalOrders > 0
        ? formatRupiah(Math.round(stats.revenue / stats.totalOrders))
        : 'Rp 0'
      : '—',
  sub: 'per transaksi hari ini',
  icon: TrendingUp,
  color: 'text-rose-600',
  bg: 'bg-rose-50',
},
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto min-h-screen flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 mb-1">
            Ringkasan Hari Ini
          </h1>
          <p className="text-stone-500 text-sm">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          {lastUpdated && (
            <p className="text-stone-400 text-xs mt-0.5">
              Diperbarui:{' '}
              {lastUpdated.toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </p>
          )}
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing || status === 'loading'}
          className="self-start flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
          {isRefreshing ? 'Memuat...' : 'Perbarui'}
        </button>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {status === 'error' && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
          <WifiOff size={16} strokeWidth={2} className="flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => fetchOrders()}
            className="ml-auto underline font-bold whitespace-nowrap"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {status === 'loading'
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : statCards.map((card, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-[20px] border border-stone-200/60 shadow-sm flex items-start gap-3.5"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                  <card.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-tight mb-1">
                    {card.title}
                  </p>
                  <p className="font-display font-extrabold text-stone-900 text-xl leading-tight truncate">
                    {card.value}
                  </p>
                  <p className="text-stone-400 text-[11px] mt-0.5">{card.sub}</p>
                </div>
              </div>
            ))}
      </div>

      {/* ── Chart: Pesanan per Jam ──────────────────────────── */}
      <div className="bg-white rounded-[20px] border border-stone-200/60 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-brand" strokeWidth={2.5} />
              Volume Pesanan per Jam
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">
              Menampilkan pesanan masuk sejak pukul 06:00
            </p>
          </div>

          {/* Peak hour badge */}
          {status === 'success' && peakHour?.pesanan > 0 && (
            <div className="flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-xl self-start">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              Puncak: {peakHour.label} ({peakHour.pesanan} pesanan)
            </div>
          )}
        </div>

        {status === 'loading' ? (
          <div className="h-52 bg-stone-100 rounded-xl animate-pulse" />
        ) : status === 'success' && chartData.every((d) => d.pesanan === 0) ? (
          <div className="h-52 flex flex-col items-center justify-center text-stone-300">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-sm font-medium">Belum ada pesanan hari ini</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={22}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f0ee"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }}
              />
              {/* Hidden bar untuk pendapatan (dipakai di tooltip saja) */}
              <Bar dataKey="pendapatan" hide />
              <Bar
                dataKey="pesanan"
                radius={[6, 6, 0, 0]}
                onMouseEnter={(_, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.hour === peakHour?.hour
                        ? '#E8652A'         // brand — jam puncak
                        : hoveredBar === index
                        ? '#C4481A'         // hovered
                        : '#e7e2db'         // default warm gray
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Top Selling Items ───────────────────────────────── */}
      <div className="bg-white rounded-[20px] border border-stone-200/60 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-stone-900 text-base flex items-center gap-2 mb-5">
          <span className="text-lg">🏆</span> Menu Paling Laku Hari Ini
        </h2>

        {status === 'loading' ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : topItems.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">
            Belum ada data penjualan hari ini
          </p>
        ) : (
          <div className="space-y-2.5">
            {topItems.map((item, i) => {
              const maxQty = topItems[0].qty;
              const pct = Math.round((item.qty / maxQty) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-stone-400 font-extrabold text-xs w-4 shrink-0 text-right">
                    {i + 1}
                  </span>
                  <span className="text-lg shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-800 text-sm truncate pr-2">
                        {item.name}
                      </span>
                      <span className="text-xs font-extrabold text-brand shrink-0 bg-brand/10 px-2 py-0.5 rounded-full">
                        {item.qty} porsi
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Spacer + Logout ─────────────────────────────────── */}
      <div className="flex-grow" />
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-400 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
        >
          <LogOut size={16} strokeWidth={2.5} />
          Keluar dari Dasbor
        </button>
      </div>
    </div>
  );
}