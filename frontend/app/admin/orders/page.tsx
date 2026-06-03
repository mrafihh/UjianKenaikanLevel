'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  XCircle,
  CreditCard,
  RefreshCw,
  AlertCircle,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

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
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  notes: string | null;
  menuItem: {
    id: number;
    name: string;
    emoji: string | null;
  };
};

type Order = {
  id: number;
  customerName: string;
  tableNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  notes: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

type FilterId = 'ALL' | OrderStatus;

// ─── Config ───────────────────────────────────────────────────
const FILTER_TABS: { id: FilterId; label: string }[] = [
  { id: 'ALL',       label: 'Semua'    },
  { id: 'PENDING',   label: 'Pending'  },
  { id: 'PAID',      label: 'Dibayar'  },
  { id: 'PREPARING', label: 'Dimasak'  },
  { id: 'READY',     label: 'Siap'     },
  { id: 'COMPLETED', label: 'Selesai'  },
  { id: 'CANCELLED', label: 'Batal'    },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; pill: string; dot: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Menunggu',
    pill: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
    icon: <Clock size={12} strokeWidth={2.5} />,
  },
  PAID: {
    label: 'Dibayar',
    pill: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
    icon: <CreditCard size={12} strokeWidth={2.5} />,
  },
  PREPARING: {
    label: 'Dimasak',
    pill: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-400',
    icon: <ChefHat size={12} strokeWidth={2.5} />,
  },
  READY: {
    label: 'Siap Antar',
    pill: 'bg-teal-100 text-teal-700',
    dot: 'bg-teal-400',
    icon: <PackageCheck size={12} strokeWidth={2.5} />,
  },
  COMPLETED: {
    label: 'Selesai',
    pill: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    pill: 'bg-red-100 text-red-700',
    dot: 'bg-red-400',
    icon: <XCircle size={12} strokeWidth={2.5} />,
  },
};

// ─── Helpers ──────────────────────────────────────────────────
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('admin_token') ??
    document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ??
    ''
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[40, 28, 32, 24, 24, 20].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-3 bg-stone-200 rounded-full"
            style={{ width: `${w * 0.25}rem` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchStatus, setFetchStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [fetchError, setFetchError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // ── Fetch orders ─────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setFetchStatus('loading');
    else setIsRefreshing(true);

    setFetchError('');

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        }
      );

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();

      const list: Order[] = Array.isArray(data)
        ? data
        : (data.data ?? data.orders ?? data.result ?? []);

      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(list);
      setFetchStatus('success');
      setLastUpdated(new Date());
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal terhubung ke server';
      if (!silent) {
        setFetchError(msg);
        setFetchStatus('error');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Fungsi Update Status Pesanan + Pengembalian Stok Automatis ──
  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const oldStatus = targetOrder.status;
    setUpdatingOrderId(orderId);

    try {
      const token = getAuthToken();

      // 1. Update status pesanan di backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Gagal memperbarui (404). Endpoint tidak ditemukan.');
        }
        throw new Error(`Gagal memperbarui status. (Error ${res.status})`);
      }

      // 2. KONDISI KHUSUS: PENDING -> CANCELLED (Kembalikan stok)
      if (oldStatus === 'PENDING' && newStatus === 'CANCELLED') {
        const menuRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu?availableOnly=false`);
        
        if (menuRes.ok) {
          const allMenus = await menuRes.json();

          for (const orderItem of targetOrder.items) {
            const matchedMenu = allMenus.find((m: any) => m.id === orderItem.menuItemId);
            
            if (matchedMenu) {
              const currentStock = matchedMenu.jumlahStock || 0;
              const restoredStock = currentStock + orderItem.quantity;

              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${orderItem.menuItemId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  name: matchedMenu.name,
                  description: matchedMenu.description,
                  price: matchedMenu.price,
                  category: matchedMenu.category,
                  imageUrl: matchedMenu.imageUrl,
                  jumlahStock: restoredStock,
                }),
              });
            }
          }
        }
      }

      // 3. Optimistic UI Update secara instan di layar kasir
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
        )
      );

      // Beri notifikasi jika stok dikembalikan
      if (oldStatus === 'PENDING' && newStatus === 'CANCELLED') {
        alert(`Pesanan #${String(orderId).padStart(4, '0')} dibatalkan. Stok menu otomatis dikembalikan!`);
      }

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ── Filtered + counted orders ─────────────────────────────────
  const filteredOrders = useMemo(
    () =>
      activeFilter === 'ALL'
        ? orders
        : orders.filter((o) => o.status === activeFilter),
    [orders, activeFilter]
  );

  const countByStatus = useMemo(() => {
    const map: Partial<Record<FilterId, number>> = { ALL: orders.length };
    for (const o of orders) {
      map[o.status] = (map[o.status] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 mb-1">
            Riwayat Pesanan
          </h1>
          <p className="text-stone-500 text-sm">
            Pantau semua pesanan yang masuk secara real-time
          </p>
          {lastUpdated && (
            <p className="text-stone-400 text-xs mt-1">
              Terakhir diperbarui:{' '}
              {lastUpdated.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          )}
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing || fetchStatus === 'loading'}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors self-start"
        >
          <RefreshCw
            size={15}
            strokeWidth={2.5}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          {isRefreshing ? 'Memuat...' : 'Perbarui'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map((tab) => {
          const count = countByStatus[tab.id] ?? 0;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
              }`}
            >
              {tab.id !== 'ALL' && tab.id in STATUS_CONFIG && (
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-white/60' : STATUS_CONFIG[tab.id as OrderStatus].dot
                  }`}
                />
              )}
              {tab.label}
              {fetchStatus === 'success' && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {fetchStatus === 'error' && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-stone-200/60">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <WifiOff size={24} className="text-red-400" strokeWidth={1.5} />
          </div>
          <p className="font-bold text-stone-800 mb-1">Gagal Memuat Pesanan</p>
          <p className="text-stone-400 text-sm mb-5 max-w-xs">{fetchError}</p>
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Table */}
      {fetchStatus !== 'error' && (
        <div className="bg-white rounded-[20px] border border-stone-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200/60">
                <tr>
                  {[
                    'ID',
                    'Pelanggan',
                    'Meja',
                    'Pembayaran',
                    'Total',
                    'Status',
                    'Waktu',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3.5 text-[11px] font-extrabold text-stone-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {fetchStatus === 'loading' &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {fetchStatus === 'success' &&
                  filteredOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-16 text-stone-400"
                      >
                        <p className="text-3xl mb-2">📋</p>
                        <p className="font-medium text-sm">
                          Tidak ada pesanan{' '}
                          {activeFilter !== 'ALL' &&
                            `dengan status "${
                              STATUS_CONFIG[activeFilter as OrderStatus]
                                ?.label ?? activeFilter
                            }"`}
                        </p>
                      </td>
                    </tr>
                  )}

                {fetchStatus === 'success' &&
                  filteredOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status];
                    const isExpanded = expandedId === order.id;
                    const isCurrentlyUpdating = updatingOrderId === order.id;

                    return (
                      <>
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isExpanded
                              ? 'bg-stone-50'
                              : 'hover:bg-stone-50/60'
                          }`}
                        >
                          <td className="px-6 py-4 font-mono font-bold text-stone-700 text-xs whitespace-nowrap">
                            #{String(order.id).padStart(4, '0')}
                          </td>

                          <td className="px-6 py-4 font-semibold text-stone-900 whitespace-nowrap">
                            {order.customerName}
                          </td>

                          <td className="px-6 py-4 text-stone-600 whitespace-nowrap">
                            {order.tableNumber}
                          </td>

                          <td className="px-6 py-4">
                            <span className="bg-stone-100 text-stone-600 text-[11px] font-bold px-2 py-0.5 rounded-md">
                              {order.paymentMethod}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-bold text-brand whitespace-nowrap tabular-nums">
                            {formatRupiah(order.total)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${cfg.pill}`}
                            >
                              {isCurrentlyUpdating ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                cfg.icon
                              )}
                              {isCurrentlyUpdating ? 'Memproses...' : cfg.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-stone-400 text-xs whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="flex items-center gap-1 text-stone-400 hover:text-stone-800 font-bold text-xs transition-colors ml-auto"
                            >
                              {isExpanded ? (
                                <>
                                  Tutup{' '}
                                  <ChevronUp size={14} strokeWidth={2.5} />
                                </>
                              ) : (
                                <>
                                  Detail{' '}
                                  <ChevronDown size={14} strokeWidth={2.5} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* ── Expanded detail row ── */}
                        {isExpanded && (
                          <tr key={`${order.id}-detail`} className="bg-stone-50">
                            <td
                              colSpan={8}
                              className="px-6 pb-5 pt-0"
                            >
                              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-inner">
                                {/* Items list */}
                                <div className="p-4 border-b border-stone-100">
                                  <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider mb-3">
                                    Item Pesanan ({order.items.length} menu)
                                  </p>
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">
                                            {item.menuItem.emoji ?? '🍽️'}
                                          </span>
                                          <div>
                                            <p className="text-sm font-semibold text-stone-800">
                                              {item.menuItem.name}
                                            </p>
                                            {item.notes && (
                                              <p className="text-xs text-stone-400">
                                                Catatan: {item.notes}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-stone-400">
                                            {item.quantity}x{' '}
                                            {formatRupiah(item.unitPrice)}
                                          </p>
                                          <p className="text-sm font-bold text-stone-800 tabular-nums">
                                            {formatRupiah(
                                              item.quantity * item.unitPrice
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order summary + Fitur Aksi Ubah Status */}
                                <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm items-start bg-stone-50/40">
                                  <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                                      Subtotal
                                    </p>
                                    <p className="font-bold text-stone-700 tabular-nums">
                                      {formatRupiah(order.subtotal)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                                      Pajak
                                    </p>
                                    <p className="font-bold text-stone-700 tabular-nums">
                                      {formatRupiah(order.tax)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                                      Total
                                    </p>
                                    <p className="font-bold text-brand tabular-nums">
                                      {formatRupiah(order.total)}
                                    </p>
                                  </div>
                                  {order.notes && (
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                                        Catatan
                                      </p>
                                      <p className="text-stone-600 text-xs">
                                        {order.notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Dropdown Selektor Pengubah Status */}
                                  <div className="col-span-2 sm:col-span-1 sm:ml-auto w-full max-w-[160px]">
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                                      Aksi Status
                                    </label>
                                    <select
                                      value={order.status}
                                      disabled={isCurrentlyUpdating}
                                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                      className="w-full bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-stone-900 transition-all cursor-pointer disabled:bg-stone-100 disabled:cursor-not-allowed shadow-sm"
                                    >
                                      {Object.keys(STATUS_CONFIG).map((statusKey) => (
                                        <option key={statusKey} value={statusKey}>
                                          {STATUS_CONFIG[statusKey as OrderStatus].label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {fetchStatus === 'success' && filteredOrders.length > 0 && (
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <p className="text-stone-400 text-xs">
                Menampilkan{' '}
                <span className="font-bold text-stone-600">
                  {filteredOrders.length}
                </span>{' '}
                dari{' '}
                <span className="font-bold text-stone-600">
                  {orders.length}
                </span>{' '}
                pesanan
              </p>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                <AlertCircle size={11} strokeWidth={2} />
                Auto-refresh setiap 30 detik
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}