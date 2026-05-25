// app/menu/page.tsx
import { Suspense } from 'react';
import { getMenuItems } from '@/lib/api';
import MenuClient from './MenuClient';

export const revalidate = 60; // ISR — rebuild halaman tiap 60 detik

// Skeleton ditampilkan selama Server Component fetch
function MenuSkeleton() {
  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-orange-50">
      <div className="bg-[#e8420a] h-[76px]" />
      <div className="bg-white h-12" />
      <div className="grid grid-cols-2 gap-2.5 p-3 mt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

async function MenuContent({ tableFromQR }: { tableFromQR: string }) {
  const menuItems = await getMenuItems();
  return <MenuClient initialItems={menuItems} defaultTable={tableFromQR} />;
}

export default function MenuPage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  // QR Code encode URL: https://domain.com/menu?table=5
  const tableFromQR = searchParams.table ?? '';

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent tableFromQR={tableFromQR} />
    </Suspense>
  );
}