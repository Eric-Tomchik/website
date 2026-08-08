import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { verifyAdminToken } from '@/lib/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session?.value || !verifyAdminToken(session.value)) {
    redirect('/admin/login');
  }

  return (
    <ConvexClientProvider>
      <div className="min-h-screen flex">
        <AdminSidebar />
        {/* pt-14 on mobile for the fixed top bar, lg:pt-0 on desktop where sidebar is inline */}
        <main className="flex-1 pt-14 lg:pt-0 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ConvexClientProvider>
  );
}
