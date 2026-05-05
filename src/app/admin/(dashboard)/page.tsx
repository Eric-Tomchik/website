'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, ShoppingCart, DollarSign, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const books = useQuery(api.books.list, {});
  const orders = useQuery(api.orders.list);
  const unreadMessages = useQuery(api.contacts.unreadCount);

  const totalRevenue = orders
    ? orders.filter((o) => o.status !== 'refunded').reduce((sum, o) => sum + o.total_cents, 0)
    : 0;

  const stats = [
    { label: 'Total Books', value: books?.length ?? '—', icon: BookOpen, color: 'text-blue-400' },
    { label: 'Total Orders', value: orders?.length ?? '—', icon: ShoppingCart, color: 'text-green-400' },
    {
      label: 'Revenue',
      value: orders ? `$${(totalRevenue / 100).toFixed(2)}` : '—',
      icon: DollarSign,
      color: 'text-yellow-400',
    },
    { label: 'Unread Messages', value: unreadMessages ?? '—', icon: MessageSquare, color: 'text-purple-400' },
  ];

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-400 mt-1">Welcome back, Eric.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-surface-400">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Orders will appear here once your store is live.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-white">
                    {order.customer_name || order.customer_email}
                  </div>
                  <div className="text-xs text-surface-400">
                    {new Date(order._creationTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    ${(order.total_cents / 100).toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      order.status === 'paid'
                        ? 'bg-green-500/10 text-green-400'
                        : order.status === 'shipped'
                          ? 'bg-blue-500/10 text-blue-400'
                          : order.status === 'fulfilled'
                            ? 'bg-brand-500/10 text-brand-400'
                            : 'bg-surface-700 text-surface-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
