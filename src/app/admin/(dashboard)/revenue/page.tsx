'use client';

import { useQuery } from 'convex/react';
import { useState, useMemo } from 'react';
import { api } from '../../../../../convex/_generated/api';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';

type Period = '7d' | '30d' | '90d' | 'all';

export default function RevenuePage() {
  const orders = useQuery(api.orders.list) ?? [];
  const invoiceStats = useQuery(api.invoices.stats);
  const [period, setPeriod] = useState<Period>('30d');

  const periodMs: Record<Period, number> = {
    '7d': 7 * 86400000,
    '30d': 30 * 86400000,
    '90d': 90 * 86400000,
    all: Infinity,
  };

  const filteredOrders = useMemo(() => {
    const cutoff = period === 'all' ? 0 : Date.now() - periodMs[period];
    return orders.filter((o) => o._creationTime >= cutoff);
  }, [orders, period, periodMs]);

  const paidOrders = filteredOrders.filter((o) => o.status === 'paid' || o.status === 'fulfilled' || o.status === 'shipped' || o.status === 'delivered');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const refundedOrders = filteredOrders.filter((o) => o.status === 'refunded');
  const refundTotal = refundedOrders.reduce((sum, o) => sum + o.total_cents, 0);

  // Revenue by book
  const revenueByBook = useMemo(() => {
    const map: Record<string, { title: string; revenue: number; count: number }> = {};
    paidOrders.forEach((o) =>
      o.items.forEach((item) => {
        const key = item.book_title;
        if (!map[key]) map[key] = { title: key, revenue: 0, count: 0 };
        map[key].revenue += (item.price_cents || 0) * item.quantity;
        map[key].count += item.quantity;
      })
    );
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  // Revenue by format
  const revenueByFormat = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    paidOrders.forEach((o) =>
      o.items.forEach((item) => {
        const fmt = item.format;
        if (!map[fmt]) map[fmt] = { revenue: 0, count: 0 };
        map[fmt].revenue += (item.price_cents || 0) * item.quantity;
        map[fmt].count += item.quantity;
      })
    );
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [paidOrders]);

  // Daily revenue for mini chart
  const dailyRevenue = useMemo(() => {
    const days: Record<string, number> = {};
    paidOrders.forEach((o) => {
      const day = new Date(o._creationTime).toLocaleDateString();
      days[day] = (days[day] || 0) + o.total_cents;
    });
    return Object.entries(days)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14);
  }, [paidOrders]);

  const maxDaily = Math.max(...dailyRevenue.map((d) => d[1]), 1);

  const fmtMoney = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const formatLabel: Record<string, string> = {
    digital: 'Digital',
    paperback: 'Paperback',
    hardback: 'Hardback',
    physical: 'Physical',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-green-400" />
            Revenue Dashboard
          </h1>
          <p className="text-surface-400 mt-1">Financial overview and book sales analytics</p>
        </div>
        <div className="flex gap-1 bg-surface-800 rounded-lg p-1">
          {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                period === p ? 'bg-brand-500 text-white' : 'text-surface-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmtMoney(totalRevenue), icon: DollarSign, color: 'text-green-400', bgColor: 'bg-green-500/10' },
          { label: 'Orders', value: paidOrders.length, icon: ShoppingCart, color: 'text-brand-400', bgColor: 'bg-brand-500/10' },
          { label: 'Avg Order Value', value: fmtMoney(avgOrderValue), icon: TrendingUp, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
          { label: 'Refunds', value: `${refundedOrders.length} (${fmtMoney(refundTotal)})`, icon: CreditCard, color: 'text-red-400', bgColor: 'bg-red-500/10' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-400">{kpi.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Revenue (from invoices) */}
      {invoiceStats && (invoiceStats.totalRevenue > 0 || invoiceStats.totalOutstanding > 0) && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            Service Revenue (Invoices)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-surface-400">Collected</p>
              <p className="text-xl font-bold text-green-400">{fmtMoney(invoiceStats.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400">Outstanding</p>
              <p className="text-xl font-bold text-yellow-400">{fmtMoney(invoiceStats.totalOutstanding)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400">Paid Invoices</p>
              <p className="text-xl font-bold text-white">{invoiceStats.paid}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400">Overdue</p>
              <p className="text-xl font-bold text-red-400">{invoiceStats.overdue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Revenue Chart */}
      {dailyRevenue.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            Daily Revenue (Last 14 Days)
          </h2>
          <div className="flex items-end gap-1 h-40">
            {dailyRevenue.map(([day, amt]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-surface-500 hidden md:block">{fmtMoney(amt)}</span>
                <div
                  className="w-full bg-brand-500/70 rounded-t-sm hover:bg-brand-400 transition-colors min-h-[2px]"
                  style={{ height: `${(amt / maxDaily) * 100}%` }}
                  title={`${day}: ${fmtMoney(amt)}`}
                />
                <span className="text-xs text-surface-500 -rotate-45 origin-top-left hidden lg:block">
                  {new Date(day).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Book */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Revenue by Book</h2>
          {revenueByBook.length === 0 ? (
            <p className="text-surface-500 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {revenueByBook.map((book) => {
                const pct = totalRevenue > 0 ? (book.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={book.title} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium truncate mr-4">{book.title}</span>
                      <span className="text-surface-300 flex-shrink-0">
                        {fmtMoney(book.revenue)} · {book.count} sold
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Format */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Revenue by Format</h2>
          {revenueByFormat.length === 0 ? (
            <p className="text-surface-500 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {revenueByFormat.map(([fmt, data]) => {
                const pct = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={fmt} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{formatLabel[fmt] || fmt}</span>
                      <span className="text-surface-300">
                        {fmtMoney(data.revenue)} · {data.count} units
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-surface-400" />
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left py-2 text-surface-400 font-semibold">Customer</th>
                <th className="text-left py-2 text-surface-400 font-semibold">Items</th>
                <th className="text-left py-2 text-surface-400 font-semibold">Status</th>
                <th className="text-right py-2 text-surface-400 font-semibold">Total</th>
                <th className="text-right py-2 text-surface-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filteredOrders.slice(0, 20).map((order) => (
                <tr key={order._id} className="hover:bg-surface-800/40">
                  <td className="py-2 text-white">{order.customer_name}</td>
                  <td className="py-2 text-surface-300 text-xs">
                    {order.items.map((i) => i.book_title).join(', ')}
                  </td>
                  <td className="py-2">
                    <span className={`text-xs font-medium ${
                      order.status === 'paid' || order.status === 'fulfilled' ? 'text-green-400' :
                      order.status === 'refunded' ? 'text-red-400' :
                      order.status === 'shipped' || order.status === 'delivered' ? 'text-blue-400' :
                      'text-yellow-400'
                    }`}>
                      {order.status === 'paid' ? <ArrowUpRight className="w-3 h-3 inline" /> :
                       order.status === 'refunded' ? <ArrowDownRight className="w-3 h-3 inline" /> : null}
                      {' '}{order.status}
                    </span>
                  </td>
                  <td className="py-2 text-right text-white font-mono">{fmtMoney(order.total_cents)}</td>
                  <td className="py-2 text-right text-surface-400 text-xs">
                    {new Date(order._creationTime).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-surface-500">No orders in this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
