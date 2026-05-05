'use client';

import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { ShoppingCart, Package, Download, ChevronDown, ChevronUp } from 'lucide-react';
import type { Id } from '../../../../../convex/_generated/dataModel';

const statusColors: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-400',
  shipped: 'bg-blue-500/10 text-blue-400',
  fulfilled: 'bg-brand-500/10 text-brand-400',
  refunded: 'bg-red-500/10 text-red-400',
};

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.list) ?? [];
  const updateStatus = useMutation(api.orders.updateStatus);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalRevenue = orders
    .filter((o) => o.status !== 'refunded')
    .reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-surface-400 mt-1">
            {orders.length} total orders · ${(totalRevenue / 100).toFixed(2)} revenue
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Paid', count: orders.filter((o) => o.status === 'paid').length, color: 'text-green-400' },
          { label: 'Shipped', count: orders.filter((o) => o.status === 'shipped').length, color: 'text-blue-400' },
          { label: 'Fulfilled', count: orders.filter((o) => o.status === 'fulfilled').length, color: 'text-brand-400' },
          { label: 'Refunded', count: orders.filter((o) => o.status === 'refunded').length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-surface-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No orders yet. They&apos;ll show up here once customers start buying.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{order.customer_name || order.customer_email}</div>
                    <div className="text-xs text-surface-400">
                      {new Date(order._creationTime).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-white">
                    ${(order.total_cents / 100).toFixed(2)}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    statusColors[order.status] || 'bg-surface-700 text-surface-400'
                  }`}>
                    {order.status}
                  </span>
                  {expandedId === order._id ? (
                    <ChevronUp className="w-4 h-4 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-400" />
                  )}
                </div>
              </button>

              {expandedId === order._id && (
                <div className="px-5 pb-5 space-y-4 border-t border-surface-800">
                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2">Items</h4>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-surface-300 mb-1">
                          {item.format === 'digital' ? (
                            <Download className="w-3.5 h-3.5 text-brand-400" />
                          ) : (
                            <Package className="w-3.5 h-3.5 text-brand-400" />
                          )}
                          {item.book_title || item.book_id} × {item.quantity}
                          <span className="text-xs text-surface-500 capitalize">({item.format})</span>
                        </div>
                      ))}
                    </div>

                    {order.shipping_address && (
                      <div>
                        <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2">Shipping</h4>
                        <div className="text-sm text-surface-300 space-y-0.5">
                          <div>{order.shipping_address.line1}</div>
                          {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                          <div>
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-400">Update status:</span>
                    {(['paid', 'shipped', 'fulfilled'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus({ id: order._id as Id<"orders">, status: s })}
                        disabled={order.status === s}
                        className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                          order.status === s
                            ? 'bg-brand-600 text-white'
                            : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
