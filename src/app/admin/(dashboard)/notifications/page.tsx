'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  ShoppingCart,
  Ticket,
  Mail,
  UserPlus,
  Receipt,
  Users,
  AlertCircle,
  Filter,
  X,
} from 'lucide-react';

type NotificationType = 'order' | 'ticket' | 'contact' | 'subscriber' | 'invoice' | 'client' | 'system';
type FilterType = 'all' | 'unread' | NotificationType;

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  order: { icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/20' },
  ticket: { icon: Ticket, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  contact: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  subscriber: { icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  invoice: { icon: Receipt, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  client: { icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/20' },
  system: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function NotificationsPage() {
  const notifications = useAdminQuery(api.notifications.list, {}) ?? [];
  const unreadCount = useAdminQuery(api.notifications.unreadCount, {}) ?? 0;
  const markRead = useAdminMutation(api.notifications.markRead);
  const markAllRead = useAdminMutation(api.notifications.markAllRead);
  const remove = useAdminMutation(api.notifications.remove);
  const clearAll = useAdminMutation(api.notifications.clearAll);

  const [filter, setFilter] = useState<FilterType>('all');
  const hasAutoMarked = useRef(false);

  // Auto-mark all notifications as read after 2 seconds on the page
  useEffect(() => {
    if (unreadCount > 0 && !hasAutoMarked.current) {
      const timer = setTimeout(() => {
        markAllRead();
        hasAutoMarked.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, markAllRead]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-brand-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-red-500 text-white font-medium">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-surface-400 mt-1">{notifications.length} total · {unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => markAllRead()} className="btn-secondary text-sm flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all notifications?')) clearAll(); }}
              className="btn-secondary text-sm flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-surface-400" />
        {[
          { value: 'all' as FilterType, label: 'All' },
          { value: 'unread' as FilterType, label: 'Unread' },
          ...Object.keys(typeConfig).map((t) => ({ value: t as FilterType, label: t.charAt(0).toUpperCase() + t.slice(1) })),
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/50'
                : 'text-surface-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <div
              key={notif._id}
              className={`card p-4 flex items-start gap-4 transition-all cursor-pointer hover:border-brand-500/20 ${
                !notif.is_read ? 'border-l-2 border-l-brand-500 bg-brand-500/5' : ''
              }`}
              onClick={() => !notif.is_read && markRead({ id: notif._id })}
            >
              <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${notif.is_read ? 'text-surface-300' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-surface-400 mt-0.5">{notif.message}</p>
                <p className="text-xs text-surface-500 mt-1">{timeAgo(notif._creationTime)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead({ id: notif._id }); }}
                    className="p-1.5 text-surface-400 hover:text-green-400"
                    title="Mark read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); remove({ id: notif._id }); }}
                  className="p-1.5 text-surface-400 hover:text-red-400"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-surface-700 mx-auto mb-3" />
            <p className="text-surface-500">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
