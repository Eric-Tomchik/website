import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session?.value) {
    redirect('/admin/login');
  }

  try {
    const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString());
    if (!decoded.admin) {
      redirect('/admin/login');
    }
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
