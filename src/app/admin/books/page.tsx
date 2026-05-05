'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Book } from '@/types';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const supabase = createClient();

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    setBooks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const toggleActive = async (book: Book) => {
    await supabase
      .from('books')
      .update({ is_active: !book.is_active })
      .eq('id', book.id);
    fetchBooks();
  };

  const deleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    await supabase.from('books').delete().eq('id', id);
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Books</h1>
          <p className="text-surface-400 mt-1">Manage your book catalog</p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </button>
      </div>

      {showForm && (
        <BookForm
          book={editingBook}
          onSave={() => { setShowForm(false); fetchBooks(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-surface-400">Loading...</div>
      ) : books.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No books yet. Add your first book!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Format</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {book.cover_image_url && (
                        <img src={book.cover_image_url} alt="" className="w-10 h-14 rounded object-cover" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{book.title}</div>
                        {book.is_featured && (
                          <span className="text-xs text-brand-400">★ Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-300 capitalize">{book.book_format}</td>
                  <td className="px-4 py-3 text-sm text-surface-300">
                    ${(book.price_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      book.is_active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-surface-700 text-surface-400'
                    }`}>
                      {book.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(book)}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title={book.is_active ? 'Hide' : 'Show'}
                      >
                        {book.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingBook(book); setShowForm(true); }}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-surface-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BookForm({
  book,
  onSave,
  onCancel,
}: {
  book: Book | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: book?.title || '',
    slug: book?.slug || '',
    description: book?.description || '',
    price_cents: book?.price_cents || 0,
    book_format: book?.book_format || 'both',
    cover_image_url: book?.cover_image_url || '',
    amazon_url: book?.amazon_url || '',
    is_featured: book?.is_featured || false,
    is_active: book?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (book) {
      await supabase.from('books').update({ ...form, slug }).eq('id', book.id);
    } else {
      await supabase.from('books').insert({ ...form, slug });
    }

    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">
        {book ? 'Edit Book' : 'Add New Book'}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated from title"
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-300 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={(form.price_cents / 100).toFixed(2)}
            onChange={(e) => setForm({ ...form, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Format</label>
          <select
            value={form.book_format}
            onChange={(e) => setForm({ ...form, book_format: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          >
            <option value="digital">Digital Only</option>
            <option value="physical">Physical Only</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Cover Image URL</label>
          <input
            value={form.cover_image_url}
            onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-300 mb-1">Amazon URL</label>
        <input
          value={form.amazon_url}
          onChange={(e) => setForm({ ...form, amazon_url: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-surface-300">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="rounded"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded"
          />
          Active (visible on site)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
