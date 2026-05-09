'use client';

import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useState } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  StarOff,
  Eye,
  EyeOff,
  GripVertical,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

type PriceType = 'fixed' | 'starting_at' | 'hourly' | 'monthly';

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  features: string[];
  price_cents: number;
  price_type: PriceType;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: PlanFormData = {
  name: '',
  slug: '',
  description: '',
  features: [''],
  price_cents: 0,
  price_type: 'starting_at',
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

export default function ServicesAdminPage() {
  const plans = useAdminQuery(api.servicePlans.listAll, {});
  const createPlan = useAdminMutation(api.servicePlans.create);
  const updatePlan = useAdminMutation(api.servicePlans.update);
  const removePlan = useAdminMutation(api.servicePlans.remove);

  const [editing, setEditing] = useState<Id<'service_plans'> | 'new' | null>(null);
  const [form, setForm] = useState<PlanFormData>(emptyForm);
  const [deleting, setDeleting] = useState<Id<'service_plans'> | null>(null);

  const openNew = () => {
    setForm({
      ...emptyForm,
      sort_order: (plans?.length || 0),
    });
    setEditing('new');
  };

  const openEdit = (plan: NonNullable<typeof plans>[number]) => {
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      features: plan.features.length > 0 ? plan.features : [''],
      price_cents: plan.price_cents,
      price_type: plan.price_type,
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setEditing(plan._id);
  };

  const handleSave = async () => {
    const cleanFeatures = form.features.filter((f) => f.trim() !== '');
    if (editing === 'new') {
      await createPlan({ ...form, features: cleanFeatures });
    } else if (editing) {
      await updatePlan({ id: editing, ...form, features: cleanFeatures });
    }
    setEditing(null);
  };

  const handleDelete = async (id: Id<'service_plans'>) => {
    await removePlan({ id });
    setDeleting(null);
  };

  const togglePopular = async (plan: NonNullable<typeof plans>[number]) => {
    await updatePlan({ id: plan._id, is_popular: !plan.is_popular });
  };

  const toggleActive = async (plan: NonNullable<typeof plans>[number]) => {
    await updatePlan({ id: plan._id, is_active: !plan.is_active });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: updated.length > 0 ? updated : [''] });
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Service Plans</h1>
            <p className="text-sm text-surface-400">
              Manage pricing tiers shown on /services
            </p>
          </div>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Plans list */}
      {plans === undefined ? (
        <div className="card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-surface-400 mt-4">Loading plans…</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center">
          <Settings className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No service plans yet</h3>
          <p className="text-surface-400 mb-6">Create your first pricing tier to display on the services page.</p>
          <button onClick={openNew} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                !plan.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="hidden sm:block text-surface-600">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.is_popular && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-brand-600 text-white rounded-full">
                      Popular
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-surface-700 text-surface-400 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-400 mb-2">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-brand-400">
                    {formatPrice(plan.price_cents)}
                  </span>
                  <span className="text-xs text-surface-500">
                    {plan.price_type === 'starting_at' && 'starting'}
                    {plan.price_type === 'hourly' && '/hr'}
                    {plan.price_type === 'monthly' && '/mo'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs px-2 py-1 bg-surface-800 text-surface-300 rounded-md">
                      {f}
                    </span>
                  ))}
                  {plan.features.length > 3 && (
                    <span className="text-xs px-2 py-1 text-surface-500">
                      +{plan.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePopular(plan)}
                  className="p-2 rounded-lg text-surface-400 hover:text-yellow-400 hover:bg-surface-700/50 transition-colors"
                  title={plan.is_popular ? 'Remove popular' : 'Mark popular'}
                >
                  {plan.is_popular ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleActive(plan)}
                  className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700/50 transition-colors"
                  title={plan.is_active ? 'Hide plan' : 'Show plan'}
                >
                  {plan.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(plan)}
                  className="p-2 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-700/50 transition-colors"
                  title="Edit plan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleting(plan._id)}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-surface-700/50 transition-colors"
                  title="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editing === 'new' ? 'New Service Plan' : 'Edit Plan'}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Plan Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm({
                        ...form,
                        name,
                        slug: editing === 'new' ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : form.slug,
                      });
                    }}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                    placeholder="e.g. Business Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                    placeholder="business-pro"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none resize-none"
                  placeholder="For growing businesses that need..."
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="number"
                      value={(form.price_cents / 100).toFixed(0)}
                      onChange={(e) => setForm({ ...form, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                      placeholder="1500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Price Type</label>
                  <select
                    value={form.price_type}
                    onChange={(e) => setForm({ ...form, price_type: e.target.value as PriceType })}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="starting_at">Starting at</option>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Per hour</option>
                    <option value="monthly">Per month</option>
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Features</label>
                <div className="space-y-2">
                  {form.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <input
                        value={feature}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:border-brand-500 focus:outline-none"
                        placeholder="Feature description..."
                      />
                      <button
                        onClick={() => removeFeature(idx)}
                        className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-700/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addFeature}
                  className="mt-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  + Add feature
                </button>
              </div>

              {/* Toggles row */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_popular}
                    onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded border-surface-600 text-brand-600 focus:ring-brand-500 bg-surface-800"
                  />
                  <span className="text-sm text-surface-300">Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-surface-600 text-brand-600 focus:ring-brand-500 bg-surface-800"
                  />
                  <span className="text-sm text-surface-300">Active (visible on site)</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-surface-300">Order:</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || '0') })}
                    className="w-16 px-2 py-1.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.slug}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editing === 'new' ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Plan?</h3>
            <p className="text-surface-400 text-sm mb-6">
              This will permanently remove the service plan. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
