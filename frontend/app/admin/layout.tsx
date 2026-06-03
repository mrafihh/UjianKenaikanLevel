import Sidebar from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Ubah min-h-screen menjadi h-screen dan tambahkan overflow-hidden 
    // agar layar utama terkunci dan tidak bisa di-scroll sama sekali
    <div className="h-screen bg-stone-50 flex font-sans overflow-hidden">
      
      {/* Sidebar otomatis akan diam di kiri karena dibungkus flex */}
      <Sidebar />
      
      {/* 2. Tambahkan overflow-y-auto di sini */}
      {/* Ini akan membuat hanya kotak main ini saja yang memiliki scrollbar sendiri jika kontennya panjang */}
      <main className="flex-1 max-w-full overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      
    </div>
  );
}