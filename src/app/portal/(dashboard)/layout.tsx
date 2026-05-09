'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  LifeBuoy,
  LogOut,
  Loader2,
} from 'lucide-react';
import { usePortalAuth } from '../PortalAuthContext';
import { cn } from '@/lib/utils';

const portalNav = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
  { href: '/portal/documents', label: 'Documents', icon: FileText },
  { href: '/portal/tickets', label: 'Support', icon: LifeBuoy },
];

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const { client, isLoading, logout } = usePortalAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !client) {
      router.replace('/portal/login');
    }
  }, [isLoading, client, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/et-monogram.webp" alt="Eric Tomchik logo" className="w-8 h-8 rounded-lg" />
            </Link>
            <span className="text-sm font-semibold text-white">Client Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-white font-medium">{client.name}</div>
              {client.company && (
                <div className="text-xs text-surface-400">{client.company}</div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={async () => { await logout(); router.replace('/portal/login'); }}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="border-b border-surface-800/50 bg-surface-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {portalNav.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/portal' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-surface-400 hover:text-white hover:border-surface-600'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
