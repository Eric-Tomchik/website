'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { api } from '../../convex/_generated/api';
import { useAdminQuery } from '@/hooks/useAdminAuth';
import {
  BookOpen,
  Briefcase,
  ShoppingCart,
  LayoutDashboard,
  MessageSquare,
  Tag,
  BarChart3,
  Users,
  LifeBuoy,
  Share2,
  Sparkles,
  Handshake,
  Mail,
  Send,
  FileText,
  DollarSign,
  Receipt,
  Bell,
  Columns3,
  FolderOpen,
  MessageSquareQuote,
  Settings,
  Zap,
  ScrollText,
  Target,
  Menu,
  X,
  Wrench,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKey: string | null;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/admin/books', label: 'Books', icon: BookOpen, badgeKey: null },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badgeKey: 'orders' },
      { href: '/admin/revenue', label: 'Revenue', icon: DollarSign, badgeKey: null },
      { href: '/admin/invoices', label: 'Invoices', icon: Receipt, badgeKey: null },
      { href: '/admin/discounts', label: 'Discounts', icon: Tag, badgeKey: null },
    ],
  },
  {
    label: 'Clover',
    items: [
      { href: '/admin/referrals', label: 'Referrals', icon: Handshake, badgeKey: 'referrals' },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/blog', label: 'Blog Posts', icon: FileText, badgeKey: null },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, badgeKey: null },
      { href: '/admin/broadcasts', label: 'Broadcasts', icon: Send, badgeKey: null },
      { href: '/admin/social', label: 'Social Media', icon: Share2, badgeKey: 'scheduled' },
      { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote, badgeKey: null },
      { href: '/admin/media', label: 'Media Library', icon: FolderOpen, badgeKey: null },
      { href: '/admin/seo', label: 'SEO Planner', icon: Target, badgeKey: null },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, badgeKey: null },
      { href: '/admin/automations', label: 'Automations', icon: Zap, badgeKey: null },
      { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, badgeKey: null },
      { href: '/admin/settings', label: 'Settings', icon: Settings, badgeKey: null },
    ],
  },
];

function useSafeQuery<T>(queryFn: any, fallback: T): T {
  try {
    const result = useAdminQuery(queryFn, {});
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadMessages = useSafeQuery(api.contacts.unreadCount, 0);
  const newOrders = useSafeQuery(api.orders.newCount, 0);
  const socialCounts = useSafeQuery(api.socialPosts.counts, { draft: 0, scheduled: 0, published: 0, total: 0 });
  const unreadNotifications = useSafeQuery(api.notifications.unreadCount, 0);
  const newReferrals = useSafeQuery(api.referrals.newCount, 0);

  const badges: Record<string, number> = {
    orders: newOrders,
    messages: unreadMessages,
    referrals: newReferrals,
    scheduled: socialCounts.scheduled,
    notifications: unreadNotifications,
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const totalBadges = Object.values(badges).reduce((a, b) => a + b, 0);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-surface-800/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-surface-400 mt-0.5">Eric Tomchik</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 -mr-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const badgeCount = item.badgeKey ? badges[item.badgeKey] || 0 : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                               transition-all relative ${
                                 active
                                   ? 'text-white bg-brand-600/20 border border-brand-600/30'
                                   : 'text-surface-300 hover:text-white hover:bg-surface-800/60'
                               }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-brand-400' : ''}`} />
                    <span className="truncate">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5
                                       rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-800/50 space-y-0.5 flex-shrink-0">
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 glass border-b border-surface-800/50
                      flex items-center justify-between px-4 backdrop-blur-xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-800/60 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
          {totalBadges > 0 && (
            <span className="absolute top-1.5 left-5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
        <h1 className="text-sm font-bold text-white">Admin Panel</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] glass border-r border-surface-800/50
                       flex flex-col shadow-2xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-64 glass border-r border-surface-800/50 flex-col overflow-y-auto flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
