'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  Mail,
  Search,
  Download,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'inactive';

export default function NewsletterPage() {
  const subscribers = useAdminQuery(api.newsletter.listAll, {}) ?? [];
  const stats = useAdminQuery(api.newsletter.stats, {}) ?? { total: 0, active: 0, inactive: 0, last30d: 0 };
  const unsubscribe = useMutation(api.newsletter.unsubscribe);
  const subscribe = useMutation(api.newsletter.subscribe);
  const remove = useAdminMutation(api.newsletter.remove);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const filtered = subscribers.filter((s) => {
    if (filter === 'active' && !s.is_active) return false;
    if (filter === 'inactive' && s.is_active) return false;
    if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportCSV = () => {
    const active = subscribers.filter((s) => s.is_active);
    const csv = ['email,subscribed_at', ...active.map((s) => `${s.email},${new Date(s.subscribed_at).toISOString()}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    await subscribe({ email: newEmail.trim() });
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="w-7 h-7 text-brand-400" />
            Newsletter Subscribers
          </h1>
          <p className="text-surface-400 mt-1">Manage your email subscriber list</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Subscribers', value: stats.total, icon: Users, color: 'text-brand-400' },
          { label: 'Active', value: stats.active, icon: UserPlus, color: 'text-green-400' },
          { label: 'Unsubscribed', value: stats.inactive, icon: UserMinus, color: 'text-red-400' },
          { label: 'Last 30 Days', value: stats.last30d, icon: TrendingUp, color: 'text-violet-400' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['all', 'active', 'inactive'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/50'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700 bg-surface-900/40">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Email</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Subscribed</th>
              <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {filtered.map((sub) => (
              <tr key={sub._id} className="hover:bg-surface-800/40">
                <td className="py-3 px-4 text-white font-medium">{sub.email}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    sub.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-surface-300">
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {sub.is_active ? (
                      <button
                        onClick={() => unsubscribe({ email: sub.email })}
                        className="p-1.5 text-surface-400 hover:text-yellow-400 transition-colors"
                        title="Unsubscribe"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => subscribe({ email: sub.email })}
                        className="p-1.5 text-surface-400 hover:text-green-400 transition-colors"
                        title="Resubscribe"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Permanently delete this subscriber?')) {
                          remove({ id: sub._id as Id<'newsletter_subscribers'> });
                        }
                      }}
                      className="p-1.5 text-surface-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-surface-500">
                  {search ? 'No subscribers match your search' : 'No subscribers yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)} role="presentation">
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add subscriber">
            <h2 className="text-lg font-bold text-white">Add Subscriber</h2>
            <input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
              autoFocus
              aria-label="Subscriber email address"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleAdd} className="btn-primary text-sm">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
