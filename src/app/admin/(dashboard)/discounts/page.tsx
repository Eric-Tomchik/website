'use client';

import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { Tag, Plus, Trash2, Edit2, X, Check, Copy } from 'lucide-react';
import type { Id } from '../../../../../convex/_generated/dataModel';

type DiscountCode = {
  _id: Id<"discount_codes">;
  _creationTime: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_cents?: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: number;
  is_active: boolean;
  applicable_book_ids?: string[];
  applicable_formats?: 'all' | 'digital' | 'physical' | 'paperback' | 'hardback';
};

function DiscountForm({
  discount,
  onSave,
  onCancel,
}: {
  discount?: DiscountCode;
  onSave: () => void;
  onCancel: () => void;
}) {
  const createCode = useMutation(api.discountCodes.create);
  const updateCode = useMutation(api.discountCodes.update);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: discount?.code || '',
    description: discount?.description || '',
    discount_type: discount?.discount_type || 'percentage' as 'percentage' | 'fixed',
    discount_value: discount
      ? discount.discount_type === 'fixed'
        ? (discount.discount_value / 100).toFixed(2)
        : discount.discount_value.toString()
      : '',
    min_order_display: discount?.min_order_cents
      ? (discount.min_order_cents / 100).toFixed(2)
      : '',
    max_uses: discount?.max_uses?.toString() || '',
    expires_at: discount?.expires_at
      ? new Date(discount.expires_at).toISOString().slice(0, 16)
      : '',
    is_active: discount?.is_active ?? true,
    applicable_formats: discount?.applicable_formats || 'all' as 'all' | 'digital' | 'physical' | 'paperback' | 'hardback',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const discountValue =
      form.discount_type === 'fixed'
        ? Math.round(parseFloat(form.discount_value || '0') * 100)
        : parseFloat(form.discount_value || '0');

    const data = {
      code: form.code,
      description: form.description || undefined,
      discount_type: form.discount_type,
      discount_value: discountValue,
      min_order_cents: form.min_order_display
        ? Math.round(parseFloat(form.min_order_display) * 100)
        : undefined,
      max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
      expires_at: form.expires_at ? new Date(form.expires_at).getTime() : undefined,
      is_active: form.is_active,
      applicable_formats: form.applicable_formats,
    };

    try {
      if (discount) {
        await updateCode({ id: discount._id, ...data });
      } else {
        await createCode(data);
      }
      onSave();
    } catch (err) {
      console.error('Error saving discount:', err);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {discount ? 'Edit Discount Code' : 'New Discount Code'}
        </h3>
        <button type="button" onClick={onCancel} className="text-surface-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 uppercase tracking-wider font-mono"
            placeholder="LAUNCH20" aria-label="Discount code"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Description (internal)</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            placeholder="Launch promo — 20% off all books" aria-label="Discount description"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Discount Type</label>
          <select
            value={form.discount_type}
            onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">
            {form.discount_type === 'percentage' ? 'Percentage Off' : 'Amount Off ($)'}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            placeholder={form.discount_type === 'percentage' ? '20' : '5.00'}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Min Order ($)</label>
          <input
            type="text"
            inputMode="decimal"
            value={form.min_order_display}
            onChange={(e) => setForm({ ...form, min_order_display: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Max Uses</label>
          <input
            type="text"
            inputMode="numeric"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            placeholder="Unlimited"
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Expires</label>
          <input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Applies To</label>
          <select
            value={form.applicable_formats}
            onChange={(e) => setForm({ ...form, applicable_formats: e.target.value as 'all' | 'digital' | 'physical' | 'paperback' | 'hardback' })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          >
            <option value="all">All Formats</option>
            <option value="digital">Digital Only</option>
            <option value="paperback">Paperback Only</option>
            <option value="hardback">Hardback Only</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-300">Active</span>
        </label>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm py-2 px-6"
        >
          {saving ? 'Saving...' : discount ? 'Update Code' : 'Create Code'}
        </button>
      </div>
    </form>
  );
}

export default function AdminDiscountsPage() {
  const discounts = useQuery(api.discountCodes.list) ?? [];
  const deleteCode = useMutation(api.discountCodes.remove);
  const updateCode = useMutation(api.discountCodes.update);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCount = discounts.filter((d) => d.is_active).length;
  const totalUses = discounts.reduce((s, d) => s + d.current_uses, 0);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discount Codes</h1>
          <p className="text-surface-400 mt-1">
            {discounts.length} codes · {activeCount} active · {totalUses} total uses
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="btn-primary text-sm py-2 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Code
        </button>
      </div>

      {showForm && (
        <DiscountForm
          discount={editingId ? discounts.find((d) => d._id === editingId) : undefined}
          onSave={() => { setShowForm(false); setEditingId(null); }}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {discounts.length === 0 && !showForm ? (
        <div className="card p-12 text-center">
          <Tag className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No discount codes yet. Create one to start offering promos!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((code) => {
            const isExpired = code.expires_at && Date.now() > code.expires_at;
            const isMaxed = code.max_uses && code.current_uses >= code.max_uses;

            return (
              <div key={code._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="font-mono text-lg font-bold text-white tracking-wider hover:text-brand-400 transition-colors flex items-center gap-2"
                        title="Copy code"
                      >
                        {code.code}
                        {copiedCode === code.code ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-surface-500" />
                        )}
                      </button>
                      {/* Status badges */}
                      {!code.is_active && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-700 text-surface-400">
                          Inactive
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                          Expired
                        </span>
                      )}
                      {isMaxed && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">
                          Maxed Out
                        </span>
                      )}
                      {code.is_active && !isExpired && !isMaxed && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                          Active
                        </span>
                      )}
                    </div>

                    {code.description && (
                      <p className="text-sm text-surface-400 mb-2">{code.description}</p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
                      <span>
                        {code.discount_type === 'percentage'
                          ? `${code.discount_value}% off`
                          : `$${(code.discount_value / 100).toFixed(2)} off`}
                      </span>
                      <span>
                        {code.current_uses}{code.max_uses ? `/${code.max_uses}` : ''} uses
                      </span>
                      {code.min_order_cents && (
                        <span>Min ${(code.min_order_cents / 100).toFixed(2)}</span>
                      )}
                      {code.expires_at && (
                        <span>
                          Expires {new Date(code.expires_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      )}
                      {code.applicable_formats && code.applicable_formats !== 'all' && (
                        <span className="capitalize">{code.applicable_formats} only</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCode({ id: code._id, is_active: !code.is_active })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        code.is_active
                          ? 'bg-surface-800 text-surface-400 hover:text-white'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {code.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => { setEditingId(code._id); setShowForm(true); }}
                      className="p-1.5 rounded-lg bg-surface-800 text-surface-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete code "${code.code}"?`)) {
                          deleteCode({ id: code._id });
                        }
                      }}
                      className="p-1.5 rounded-lg bg-surface-800 text-surface-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
