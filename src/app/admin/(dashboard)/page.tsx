'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  BookOpen,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Download,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useMemo } from 'react';

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getDaysAgo(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function AdminDashboard() {
  const books = useQuery(api.books.list, {});
  const orders = useQuery(api.orders.list);
  const unreadMessages = useQuery(api.contacts.unreadCount);

  const analytics = useMemo(() => {
    if (!orders) return null;

    const validOrders = orders.filter((o) => o.status !== 'refunded');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_cents, 0);

    const last30Days = validOrders.filter((o) => o._creationTime > getDaysAgo(30));
    const prev30Days = validOrders.filter(
      (o) => o._creationTime > getDaysAgo(60) && o._creationTime <= getDaysAgo(30)
    );

    const revenue30 = last30Days.reduce((s, o) => s + o.total_cents, 0);
    const revenuePrev30 = prev30Days.reduce((s, o) => s + o.total_cents, 0);
    const revenueChange = revenuePrev30 > 0
      ? ((revenue30 - revenuePrev30) / revenuePrev30 * 100)
      : revenue30 > 0 ? 100 : 0;

    const orders30 = last30Days.length;
    const ordersPrev30 = prev30Days.length;
    const ordersChange = ordersPrev30 > 0
      ? ((orders30 - ordersPrev30) / ordersPrev30 * 100)
      : orders30 > 0 ? 100 : 0;

    // Revenue by day (last 14 days)
    const revenueByDay: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = validOrders.filter(
        (o) => o._creationTime >= dayStart.getTime() && o._creationTime < dayEnd.getTime()
      );
      revenueByDay.push({
        label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayOrders.reduce((s, o) => s + o.total_cents, 0),
      });
    }

    // Top books by revenue
    const bookRevenue: Record<string, { title: string; revenue: number; count: number; digital: number; paperback: number; hardback: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        const key = item.book_title || item.book_id;
        if (!bookRevenue[key]) {
          bookRevenue[key] = { title: key, revenue: 0, count: 0, digital: 0, paperback: 0, hardback: 0 };
        }
        bookRevenue[key].revenue += (item.price_cents || 0) * item.quantity;
        bookRevenue[key].count += item.quantity;
        if (item.format === 'digital') bookRevenue[key].digital += item.quantity;
        else if (item.format === 'paperback') bookRevenue[key].paperback += item.quantity;
        else bookRevenue[key].hardback += item.quantity;
      }
    }
    const topBooks = Object.values(bookRevenue).sort((a, b) => b.revenue - a.revenue);

    // Format breakdown
    const totalDigital = validOrders.reduce(
      (s, o) => s + o.items.filter((i) => i.format === 'digital').reduce((ss, i) => ss + i.quantity, 0),
      0
    );
    const totalPaperback = validOrders.reduce(
      (s, o) => s + o.items.filter((i) => i.format === 'paperback').reduce((ss, i) => ss + i.quantity, 0),
      0
    );
    const totalHardback = validOrders.reduce(
      (s, o) => s + o.items.filter((i) => i.format === 'physical' || i.format === 'hardback').reduce((ss, i) => ss + i.quantity, 0),
      0
    );

    const uniqueCustomers = new Set(validOrders.map((o) => o.customer_email)).size;
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return {
      totalRevenue,
      revenue30,
      revenueChange,
      orders30,
      ordersChange,
      revenueByDay,
      topBooks,
      totalDigital,
      totalPaperback,
      totalHardback,
      uniqueCustomers,
      avgOrderValue,
    };
  }, [orders]);

  const recentOrders = orders?.slice(0, 5) ?? [];
  const maxBarValue = analytics
    ? Math.max(...analytics.revenueByDay.map((d) => d.value), 1)
    : 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-surface-400 text-sm">Welcome back, Eric.</p>
        </div>
      </div>

      {/* Top Stats Row — 7 metrics in one row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Revenue (30d)</span>
            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {analytics ? formatCurrency(analytics.revenue30) : '—'}
          </div>
          {analytics && analytics.revenueChange !== 0 && (
            <div className={`flex items-center gap-0.5 mt-0.5 text-[10px] font-medium ${
              analytics.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.revenueChange >= 0 ? (
                <ArrowUpRight className="w-2.5 h-2.5" />
              ) : (
                <ArrowDownRight className="w-2.5 h-2.5" />
              )}
              {Math.abs(analytics.revenueChange).toFixed(0)}%
            </div>
          )}
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Orders (30d)</span>
            <ShoppingCart className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {analytics ? analytics.orders30 : '—'}
          </div>
          {analytics && analytics.ordersChange !== 0 && (
            <div className={`flex items-center gap-0.5 mt-0.5 text-[10px] font-medium ${
              analytics.ordersChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.ordersChange >= 0 ? (
                <ArrowUpRight className="w-2.5 h-2.5" />
              ) : (
                <ArrowDownRight className="w-2.5 h-2.5" />
              )}
              {Math.abs(analytics.ordersChange).toFixed(0)}%
            </div>
          )}
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Avg Order</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {analytics ? formatCurrency(analytics.avgOrderValue) : '—'}
          </div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Total Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {analytics ? formatCurrency(analytics.totalRevenue) : '—'}
          </div>
          <div className="text-[10px] text-surface-500 mt-0.5">
            {orders?.length || 0} orders
          </div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Books</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{books?.length ?? '—'}</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Customers</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{analytics?.uniqueCustomers ?? '—'}</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-surface-400">Messages</span>
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{unreadMessages ?? '—'}</div>
          <div className="text-[10px] text-surface-500 mt-0.5">unread</div>
        </div>
      </div>

      {/* Revenue Chart + Format Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Revenue (Last 14 Days)</h2>
            <span className="text-[10px] text-surface-500">Daily trend</span>
          </div>
          {analytics && (
            <div className="flex items-end gap-1 h-28">
              {analytics.revenueByDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                    <div className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg">
                      <div className="text-white font-medium">{formatCurrency(day.value)}</div>
                      <div className="text-surface-400">{day.label}</div>
                    </div>
                  </div>
                  <div
                    className="w-full rounded-t bg-brand-500/80 hover:bg-brand-400 transition-colors min-h-[2px]"
                    style={{
                      height: `${Math.max((day.value / maxBarValue) * 100, 1)}%`,
                    }}
                  />
                  <span className={`text-[8px] text-surface-500 ${i % 2 !== 0 ? 'hidden sm:block' : ''}`}>
                    {day.label.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!analytics && (
            <div className="h-28 flex items-center justify-center text-surface-500 text-sm">
              Loading...
            </div>
          )}
        </div>

        {/* Format Breakdown */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Sales by Format</h2>
          {analytics && (
            <div className="space-y-4">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <Download className="w-6 h-6 text-brand-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{analytics.totalDigital}</div>
                  <div className="text-[10px] text-surface-400">Digital</div>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{analytics.totalPaperback}</div>
                  <div className="text-[10px] text-surface-400">Paperback</div>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{analytics.totalHardback}</div>
                  <div className="text-[10px] text-surface-400">Hardback</div>
                </div>
              </div>
              {(() => {
                const total = analytics.totalDigital + analytics.totalPaperback + analytics.totalHardback;
                if (total === 0) return null;
                return (
                  <div>
                    <div className="w-full h-2.5 rounded-full bg-surface-800 overflow-hidden flex">
                      <div
                        className="h-full bg-brand-500 transition-all"
                        style={{ width: `${(analytics.totalDigital / total) * 100}%` }}
                      />
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(analytics.totalPaperback / total) * 100}%` }}
                      />
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(analytics.totalHardback / total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-surface-500 mt-0.5">
                      <span>{((analytics.totalDigital / total) * 100).toFixed(0)}% Digital</span>
                      <span>{((analytics.totalPaperback / total) * 100).toFixed(0)}% PB</span>
                      <span>{((analytics.totalHardback / total) * 100).toFixed(0)}% HB</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Top Books + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Books */}
        <div className="card p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Top Books</h2>
            <span className="text-[10px] text-surface-500">by revenue, all time</span>
          </div>
          {analytics && analytics.topBooks.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topBooks.map((book, i) => {
                const maxRev = analytics.topBooks[0]?.revenue || 1;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white font-medium truncate mr-2">{book.title}</span>
                      <span className="text-xs font-semibold text-brand-400 whitespace-nowrap">
                        {formatCurrency(book.revenue)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                        style={{ width: `${(book.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-2 text-[9px] text-surface-500">
                      <span>{book.count} sold</span>
                      <span>{book.digital} digital</span>
                      <span>{book.paperback} pb</span>
                      <span>{book.hardback} hb</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-surface-400">
              <BookOpen className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs">Sales data will appear here.</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <a href="/admin/orders" className="text-[10px] text-brand-400 hover:text-brand-300">
              View all →
            </a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 text-surface-400">
              <ShoppingCart className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-xs">Orders will appear here once your store is live.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0"
                >
                  <div>
                    <div className="text-xs font-medium text-white">
                      {order.customer_name || order.customer_email}
                    </div>
                    <div className="text-[10px] text-surface-400">
                      {new Date(order._creationTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {formatCurrency(order.total_cents)}
                    </span>
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
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
    </div>
  );
}
