'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
  Receipt,
  Plus,
  Pencil,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Save,
  DollarSign,
  Search,
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

const statusStyles: Record<InvoiceStatus, { color: string; icon: typeof Clock }> = {
  draft: { color: 'text-surface-400 bg-surface-800', icon: Clock },
  sent: { color: 'text-blue-400 bg-blue-500/20', icon: Send },
  viewed: { color: 'text-violet-400 bg-violet-500/20', icon: CheckCircle2 },
  paid: { color: 'text-green-400 bg-green-500/20', icon: CheckCircle2 },
  overdue: { color: 'text-red-400 bg-red-500/20', icon: AlertTriangle },
  cancelled: { color: 'text-surface-500 bg-surface-800', icon: X },
};

export default function InvoicesPage() {
  const invoices = useAdminQuery(api.invoices.list) ?? [];
  const stats = useAdminQuery(api.invoices.stats);
  const nextNum = useAdminQuery(api.invoices.nextInvoiceNumber) ?? 'INV-0001';
  const clients = useAdminQuery(api.clients.list, {}) ?? [];
  const create = useAdminMutation(api.invoices.create);
  const update = useAdminMutation(api.invoices.update);
  const remove = useAdminMutation(api.invoices.remove);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<'invoices'> | null>(null);

  const [form, setForm] = useState({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    client_id: '' as string,
    items: [{ description: '', quantity: 1, unit_price_cents: 0 }] as InvoiceItem[],
    due_date: '',
    notes: '',
    status: 'draft' as InvoiceStatus,
  });

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0);

  const fmtMoney = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const openCreate = () => {
    setForm({
      invoice_number: nextNum,
      customer_name: '',
      customer_email: '',
      client_id: '',
      items: [{ description: '', quantity: 1, unit_price_cents: 0 }],
      due_date: '',
      notes: '',
      status: 'draft',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (inv: (typeof invoices)[0]) => {
    setForm({
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      customer_email: inv.customer_email,
      client_id: inv.client_id || '',
      items: inv.items,
      due_date: inv.due_date || '',
      notes: inv.notes || '',
      status: inv.status,
    });
    setEditingId(inv._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await update({
        id: editingId,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        items: form.items,
        subtotal_cents: subtotal,
        total_cents: subtotal,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
    } else {
      await create({
        invoice_number: form.invoice_number,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        client_id: form.client_id ? (form.client_id as Id<'clients'>) : undefined,
        items: form.items,
        subtotal_cents: subtotal,
        total_cents: subtotal,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
    }
    setShowForm(false);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price_cents: 0 }] });
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const removeItem = (idx: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const selectClient = (clientId: string) => {
    const client = clients.find((c) => c._id === clientId);
    if (client) {
      setForm({ ...form, client_id: clientId, customer_name: client.name, customer_email: client.email });
    }
  };

  const filtered = invoices.filter(
    (i) =>
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Receipt className="w-7 h-7 text-brand-400" />
            Invoices
          </h1>
          <p className="text-surface-400 mt-1">Create and manage client invoices</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Paid', value: stats.paid, color: 'text-green-400' },
            { label: 'Pending', value: stats.pending, color: 'text-blue-400' },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
            { label: 'Revenue', value: fmtMoney(stats.totalRevenue), color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 space-y-5 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editingId ? `Edit ${form.invoice_number}` : 'New Invoice'}
            </h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-surface-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Invoice #</label>
              <input
                value={form.invoice_number}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            {clients.length > 0 && (
              <div>
                <label className="block text-sm text-surface-400 mb-1">Link to Client</label>
                <select
                  value={form.client_id}
                  onChange={(e) => selectClient(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">— Manual entry —</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-surface-400 mb-1">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Customer Name</label>
              <input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Customer Email</label>
              <input
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <label className="block text-sm text-surface-400 mb-2">Line Items</label>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm text-center focus:outline-none focus:border-brand-500"
                    min="1"
                  />
                  <div className="relative w-32">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-surface-500" />
                    <input
                      type="number"
                      value={item.unit_price_cents / 100 || ''}
                      onChange={(e) => updateItem(idx, 'unit_price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                      className="w-full pl-6 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                      step="0.01"
                    />
                  </div>
                  <span className="text-sm text-surface-300 w-20 text-right font-mono">
                    {fmtMoney(item.quantity * item.unit_price_cents)}
                  </span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-surface-400 hover:text-red-400"
                    disabled={form.items.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-2 text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Line Item
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-surface-700 pt-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm text-surface-400">Total</p>
              <p className="text-2xl font-bold text-white">{fmtMoney(subtotal)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-surface-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
              rows={2}
              placeholder="Payment terms, notes, etc."
            />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingId ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Invoice Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700 bg-surface-900/40">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Invoice #</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Status</th>
              <th className="text-right py-3 px-4 text-surface-400 font-semibold">Total</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Due</th>
              <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {filtered.map((inv) => {
              const style = statusStyles[inv.status];
              return (
                <tr key={inv._id} className="hover:bg-surface-800/40">
                  <td className="py-3 px-4 text-white font-mono font-medium">{inv.invoice_number}</td>
                  <td className="py-3 px-4">
                    <p className="text-white">{inv.customer_name}</p>
                    <p className="text-xs text-surface-500">{inv.customer_email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style.color}`}>
                      <style.icon className="w-3 h-3" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">{fmtMoney(inv.total_cents)}</td>
                  <td className="py-3 px-4 text-surface-300 text-xs">{inv.due_date || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => update({ id: inv._id, status: 'sent' })}
                          className="p-1.5 text-surface-400 hover:text-blue-400"
                          title="Mark Sent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'overdue') && (
                        <button
                          onClick={() => update({ id: inv._id, status: 'paid' })}
                          className="p-1.5 text-surface-400 hover:text-green-400"
                          title="Mark Paid"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(inv)} className="p-1.5 text-surface-400 hover:text-brand-400" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this invoice?')) remove({ id: inv._id }); }}
                        className="p-1.5 text-surface-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-surface-500">No invoices yet</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
