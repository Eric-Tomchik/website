'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
  Star,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Award,
  X,
  Save,
  MessageSquareQuote,
} from 'lucide-react';

type Source = 'amazon' | 'google' | 'direct' | 'social' | 'other';

const sourceLabels: Record<Source, string> = {
  amazon: 'Amazon',
  google: 'Google',
  direct: 'Direct',
  social: 'Social Media',
  other: 'Other',
};

const sourceColors: Record<Source, string> = {
  amazon: 'text-orange-400 bg-orange-500/20',
  google: 'text-blue-400 bg-blue-500/20',
  direct: 'text-green-400 bg-green-500/20',
  social: 'text-violet-400 bg-violet-500/20',
  other: 'text-surface-400 bg-surface-800',
};

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-surface-600'} ${onChange ? 'cursor-pointer' : ''}`}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const reviews = useAdminQuery(api.reviews.list) ?? [];
  const stats = useAdminQuery(api.reviews.stats);
  const create = useAdminMutation(api.reviews.create);
  const updateReview = useAdminMutation(api.reviews.update);
  const remove = useAdminMutation(api.reviews.remove);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<'reviews'> | null>(null);
  const [form, setForm] = useState({
    author_name: '',
    author_title: '',
    content: '',
    rating: 5,
    source: 'direct' as Source,
    source_url: '',
    is_featured: false,
    is_active: true,
  });

  const filtered = reviews.filter((r) =>
    r.author_name.toLowerCase().includes(search.toLowerCase()) ||
    r.content.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ author_name: '', author_title: '', content: '', rating: 5, source: 'direct', source_url: '', is_featured: false, is_active: true });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (review: (typeof reviews)[0]) => {
    setForm({
      author_name: review.author_name,
      author_title: review.author_title || '',
      content: review.content,
      rating: review.rating,
      source: review.source,
      source_url: review.source_url || '',
      is_featured: review.is_featured,
      is_active: review.is_active,
    });
    setEditingId(review._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateReview({
        id: editingId,
        author_name: form.author_name,
        author_title: form.author_title || undefined,
        content: form.content,
        rating: form.rating,
        source: form.source,
        source_url: form.source_url || undefined,
        is_featured: form.is_featured,
        is_active: form.is_active,
      });
    } else {
      await create({
        author_name: form.author_name,
        author_title: form.author_title || undefined,
        content: form.content,
        rating: form.rating,
        source: form.source,
        source_url: form.source_url || undefined,
        is_featured: form.is_featured,
        is_active: form.is_active,
      });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquareQuote className="w-7 h-7 text-yellow-400" />
            Reviews & Testimonials
          </h1>
          <p className="text-surface-400 mt-1">Manage and feature customer reviews</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.active}</p>
            <p className="text-xs text-surface-400">Active Reviews</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400" /> {stats.avgRating}
            </p>
            <p className="text-xs text-surface-400">Average Rating</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-violet-400">{stats.featured}</p>
            <p className="text-xs text-surface-400">Featured</p>
          </div>
          <div className="card p-4">
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(stats.bySource).map(([src, count]) => (
                <span key={src} className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[src as Source] || 'text-surface-400'}`}>
                  {sourceLabels[src as Source] || src}: {count as number}
                </span>
              ))}
            </div>
            <p className="text-xs text-surface-400 text-center mt-1">By Source</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Review' : 'Add Review'}</h2>
            <button onClick={() => setShowForm(false)} className="text-surface-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Author Name</label>
              <input
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Author Title (optional)</label>
              <input
                value={form.author_title}
                onChange={(e) => setForm({ ...form, author_title: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                placeholder="CEO of Acme Corp"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">Review Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              rows={4}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Rating</label>
              <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as Source })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              >
                {Object.entries(sourceLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Source URL</label>
              <input
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              Featured
            </label>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Add Review'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((review) => (
          <div key={review._id} className={`card p-5 ${!review.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-white font-medium">{review.author_name}</p>
                  {review.author_title && (
                    <span className="text-xs text-surface-400">{review.author_title}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[review.source]}`}>
                    {sourceLabels[review.source]}
                  </span>
                  {review.is_featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} />
                <p className="text-surface-300 mt-2 text-sm">{review.content}</p>
              </div>
              <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                <button
                  onClick={() => updateReview({ id: review._id, is_active: !review.is_active })}
                  className="p-1.5 text-surface-400 hover:text-white"
                  title={review.is_active ? 'Deactivate' : 'Activate'}
                >
                  {review.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => updateReview({ id: review._id, is_featured: !review.is_featured })}
                  className={`p-1.5 ${review.is_featured ? 'text-yellow-400' : 'text-surface-400 hover:text-yellow-400'}`}
                  title={review.is_featured ? 'Unfeature' : 'Feature'}
                >
                  <Award className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(review)} className="p-1.5 text-surface-400 hover:text-brand-400">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm('Delete this review?')) remove({ id: review._id }); }}
                  className="p-1.5 text-surface-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-surface-500">
            {search ? 'No reviews match your search' : 'No reviews yet — add your first review above'}
          </div>
        )}
      </div>
    </div>
  );
}
