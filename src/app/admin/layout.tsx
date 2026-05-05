import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, Briefcase, ShoppingCart, MessageSquare, LayoutDashboard, Settings } from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/books', label: 'Books', icon: BookOpen },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth check — redirect to login if not authenticated
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-surface-800/50 flex flex-col">
        <div className="p-6 border-b border-surface-800/50">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-surface-400 mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                         text-surface-300 hover:text-white hover:bg-surface-800/60 transition-all"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-800/50">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400
                       hover:text-white hover:bg-surface-800/60 transition-all"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
