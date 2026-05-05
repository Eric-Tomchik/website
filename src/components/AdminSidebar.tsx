'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  BookOpen,
  Briefcase,
  ShoppingCart,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null },
  { href: '/admin/books', label: 'Books', icon: BookOpen, badgeKey: null },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Briefcase, badgeKey: null },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badgeKey: 'orders' as const },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' as const },
];

function useSafeQuery<T>(queryFn: any, fallback: T): T {
  try {
    const result = useQuery(queryFn);
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const unreadMessages = useSafeQuery(api.contacts.unreadCount, 0);
  const newOrders = useSafeQuery(api.orders.newCount, 0);

  const badges: Record<string, number> = {
    orders: newOrders,
    messages: unreadMessages,
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 glass border-r border-surface-800/50 flex flex-col">
      <div className="p-6 border-b border-surface-800/50">
        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        <p className="text-xs text-surface-400 mt-1">Eric Tomchik</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map((item) => {
          const active = isActive(item.href);
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                         transition-all relative ${
                           active
                             ? 'text-white bg-brand-600/20 border border-brand-600/30'
                             : 'text-surface-300 hover:text-white hover:bg-surface-800/60'
                         }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-brand-400' : ''}`} />
              {item.label}
              {badgeCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5
                                 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-800/50 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400
                     hover:text-white hover:bg-surface-800/60 transition-all"
        >
          ← Back to Site
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400
                       hover:text-red-400 hover:bg-red-900/10 transition-all text-left"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
