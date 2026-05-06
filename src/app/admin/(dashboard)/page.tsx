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

function getDateKey(timestamp: number, period: 'day' | 'week' | 'month') {
  const d = new Date(timestamp);
  if (period === 'day') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (period === 'week') {
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

    // Time-based filtering
    const last30Days = validOrders.filter((o) => o._creationTime > getDaysAgo(30));
    const prev30Days = validOrders.filter(
      (o) => o._creationTime > getDaysAgo(60) && o._creationTime <= getDaysAgo(30)
    );
    const last7Days = validOrders.filter((o) => o._creationTime > getDaysAgo(7));

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
    const bookRevenue: Record<string, { title: string; revenue: number; count: number; digital: number; physical: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        const key = item.book_title || item.book_id;
        if (!bookRevenue[key]) {
          bookRevenue[key] = { title: key, revenue: 0, count: 0, digital: 0, physical: 0 };
        }
        bookRevenue[key].revenue += (item.price_cents || 0) * item.quantity;
        bookRevenue[key].count += item.quantity;
        if (item.format === 'digital') bookRevenue[key].digital += item.quantity;
        else bookRevenue[key].physical += item.quantity;
      }
    }
    const topBooks = Object.values(bookRevenue).sort((a, b) => b.revenue - a.revenue);

    // Format breakdown
    const totalDigital = validOrders.reduce(
      (s, o) => s + o.items.filter((i) => i.format === 'digital').reduce((ss, i) => ss + i.quantity, 0),
      0
    );
    const totalPhysical = validOrders.reduce(
      (s, o) => s + o.items.filter((i) => i.format === 'physical').reduce((ss, i) => ss + i.quantity, 0),
      0
    );

    // Unique customers
    const uniqueCustomers = new Set(validOrders.map((o) => o.customer_email)).size;

    // Average order value
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return {
      totalRevenue,
      revenue30,
      revenueChange,
      orders30,
      ordersChange,
      last7Days,
      revenueByDay,
      topBooks,
      totalDigital,
      totalPhysical,
      uniqueCustomers,
      avgOrderValue,
    };
  }, [orders]);

  const recentOrders = orders?.slice(0, 5) ?? [];
  const maxBarValue = analytics
    ? Math.max(...analytics.revenueByDay.map((d) => d.value), 1)
    : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-400 mt-1">Welcome back, Eric.</p>
      </div>

      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-400">Revenue (30d)</span>
            <DollarSign className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics ? formatCurrency(analytics.revenue30) : '—'}
          </div>
          {analytics && analytics.revenueChange !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              analytics.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.revenueChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(analytics.revenueChange).toFixed(0)}% vs prev 30d
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-400">Orders (30d)</span>
            <ShoppingCart className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics ? analytics.orders30 : '—'}
          </div>
          {analytics && analytics.ordersChange !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              analytics.ordersChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.ordersChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(analytics.ordersChange).toFixed(0)}% vs prev 30d
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-400">Avg Order Value</span>
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics ? formatCurrency(analytics.avgOrderValue) : '—'}
          </div>
          <div className="text-xs text-surface-500 mt-2">
            {analytics?.uniqueCustomers || 0} unique customers
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-400">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics ? formatCurrency(analytics.totalRevenue) : '—'}
          </div>
          <div className="text-xs text-surface-500 mt-2">
            {orders?.length || 0} total orders
          </div>
        </div>
      </div>

      {/* Revenue Chart + Format Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Revenue (Last 14 Days)</h2>
          <p className="text-xs text-surface-500 mb-6">Daily revenue trend</p>
          {analytics && (
            <div className="flex items-end gap-1 h-48">
              {analytics.revenueByDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                      <div className="text-white font-medium">{formatCurrency(day.value)}</div>
                      <div className="text-surface-400">{day.label}</div>
                    </div>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full rounded-t bg-brand-500/80 hover:bg-brand-400 transition-colors min-h-[2px]"
                    style={{
                      height: `${Math.max((day.value / maxBarValue) * 100, 1)}%`,
                    }}
                  />
                  {/* Label - show every other on small screens */}
                  <span className={`text-[9px] text-surface-500 ${i % 2 !== 0 ? 'hidden sm:block' : ''}`}>
                    {day.label.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!analytics && (
            <div className="h-48 flex items-center justify-center text-surface-500">
              Loading...
            </div>
          )}
        </div>

        {/* Format Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Sales by Format</h2>
          <p className="text-xs text-surface-500 mb-6">Digital vs Physical</p>
          {analytics && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <Download className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.totalDigital}</div>
                  <div className="text-xs text-surface-400">Digital</div>
                </div>
                <div className="text-center">
                  <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.totalPhysical}</div>
                  <div className="text-xs text-surface-400">Physical</div>
                </div>
              </div>
              {/* Progress bar */}
              {(analytics.totalDigital + analytics.totalPhysical) > 0 && (
                <div>
                  <div className="w-full h-3 rounded-full bg-surface-800 overflow-hidden flex">
                    <div
                      className="h-full bg-brand-500 rounded-l-full transition-all"
                      style={{
                        width: `${(analytics.totalDigital / (analytics.totalDigital + analytics.totalPhysical)) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-blue-500 rounded-r-full transition-all"
                      style={{
                        width: `${(analytics.totalPhysical / (analytics.totalDigital + analytics.totalPhysical)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-surface-500 mt-1">
                    <span>{((analytics.totalDigital / (analytics.totalDigital + analytics.totalPhysical)) * 100).toFixed(0)}% Digital</span>
                    <span>{((analytics.totalPhysical / (analytics.totalDigital + analytics.totalPhysical)) * 100).toFixed(0)}% Physical</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Books + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Books */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Top Books</h2>
          <p className="text-xs text-surface-500 mb-4">By revenue (all time)</p>
          {analytics && analytics.topBooks.length > 0 ? (
            <div className="space-y-3">
              {analytics.topBooks.map((book, i) => {
                const maxRev = analytics.topBooks[0]?.revenue || 1;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium truncate mr-3">{book.title}</span>
                      <span className="text-sm font-semibold text-brand-400 whitespace-nowrap">
                        {formatCurrency(book.revenue)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                        style={{ width: `${(book.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-3 text-[10px] text-surface-500">
                      <span>{book.count} sold</span>
                      <span>{book.digital} digital</span>
                      <span>{book.physical} physical</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sales data will appear here.</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-brand-400 hover:text-brand-300">
              View all →
            </a>
          </div>
          <p className="text-xs text-surface-500 mb-4">Latest 5 orders</p>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-surface-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Orders will appear here once your store is live.</p>
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
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(order.total_cents)}
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

      {/* Quick Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{books?.length ?? '—'}</div>
            <div className="text-xs text-surface-400">Active Books</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{analytics?.uniqueCustomers ?? '—'}</div>
            <div className="text-xs text-surface-400">Unique Customers</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{unreadMessages ?? '—'}</div>
            <div className="text-xs text-surface-400">Unread Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}
