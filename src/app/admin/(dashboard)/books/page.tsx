'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  hasHardback,
  hasPaperback,
  hasDigital,
  toBookFormat,
  formatLabel,
  formatPrice,
} from '@/lib/utils';
import type { Id } from '../../../../../convex/_generated/dataModel';
import type { BookFormat } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

type Book = {
  _id: Id<"books">;
  _creationTime: number;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  price_cents: number;
  paperback_price_cents?: number;
  digital_price_cents?: number;
  book_format: BookFormat;
  cover_image_url?: string;
  amazon_url?: string;
  barnes_noble_url?: string;
  companion_url?: string;
  digital_file_url?: string;
  digital_pdf_storage_id?: string;
  digital_epub_storage_id?: string;
  page_count?: number;
  isbn?: string;
  published_date?: string;
  is_featured: boolean;
  is_active: boolean;
};

export default function AdminBooksPage() {
  const books = useQuery(api.books.list, {}) ?? [];
  const updateBook = useAdminMutation(api.books.update);
  const deleteBook = useAdminMutation(api.books.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleToggleActive = async (book: Book) => {
    await updateBook({ id: book._id, is_active: !book.is_active });
  };

  const handleDelete = async (id: Id<"books">) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    await deleteBook({ id });
  };

  /** Human-readable format summary for the table */
  function formatSummary(book: Book): string {
    const parts: string[] = [];
    if (hasPaperback(book.book_format)) parts.push('Paperback');
    if (hasHardback(book.book_format)) parts.push('Hardback');
    if (hasDigital(book.book_format)) parts.push('Digital');
    return parts.join(', ') || 'None';
  }

  /** Primary display price for the table */
  function primaryPrice(book: Book): string {
    if (hasHardback(book.book_format)) return formatPrice(book.price_cents);
    if (hasPaperback(book.book_format) && book.paperback_price_cents)
      return formatPrice(book.paperback_price_cents);
    if (hasDigital(book.book_format) && book.digital_price_cents)
      return formatPrice(book.digital_price_cents);
    return formatPrice(book.price_cents);
  }

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
          onSave={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {books.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No books yet. Add your first book!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-surface-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Availability</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {book.cover_image_url && (
                        <img src={book.cover_image_url} alt={`${book.title} cover`} className="w-10 h-14 rounded object-cover" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{book.title}</div>
                        {book.is_featured && (
                          <span className="text-xs text-brand-400">★ Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {hasPaperback((book as Book).book_format) && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-surface-700 text-surface-300">
                          PB
                        </span>
                      )}
                      {hasHardback((book as Book).book_format) && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-surface-700 text-surface-300">
                          HB
                        </span>
                      )}
                      {hasDigital((book as Book).book_format) && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-surface-700 text-surface-300">
                          Dig
                        </span>
                      )}
                      {book.amazon_url && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#FF9900]/10 text-[#FF9900]">
                          Amazon
                        </span>
                      )}
                      {book.barnes_noble_url && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#2D5F2E]/20 text-[#5cb85c]">
                          B&N
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-300">
                    {primaryPrice(book as Book)}
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
                        onClick={() => handleToggleActive(book as Book)}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title={book.is_active ? 'Hide' : 'Show'}
                      >
                        {book.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingBook(book as Book); setShowForm(true); }}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
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
          </table></div>
        </div>
      )}
    </div>
  );
}

/* ─── Book Form ─────────────────────────────────────────────────────── */

function BookForm({
  book,
  onSave,
  onCancel,
}: {
  book: Book | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const createBook = useAdminMutation(api.books.create);
  const updateBook = useAdminMutation(api.books.update);
  const generateUploadUrl = useAdminMutation(api.downloadTokens.generateUploadUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // ── Price display states (text inputs, no spinners) ──
  const [hardbackPriceDisplay, setHardbackPriceDisplay] = useState(
    book?.price_cents ? (book.price_cents / 100).toFixed(2) : ''
  );
  const [paperbackPriceDisplay, setPaperbackPriceDisplay] = useState(
    book?.paperback_price_cents ? (book.paperback_price_cents / 100).toFixed(2) : ''
  );
  const [digitalPriceDisplay, setDigitalPriceDisplay] = useState(
    book?.digital_price_cents ? (book.digital_price_cents / 100).toFixed(2) : ''
  );

  // ── Format checkboxes ──
  const [fmtPaperback, setFmtPaperback] = useState(book ? hasPaperback(book.book_format) : false);
  const [fmtHardback, setFmtHardback] = useState(book ? hasHardback(book.book_format) : true);
  const [fmtDigital, setFmtDigital] = useState(book ? hasDigital(book.book_format) : false);

  // ── Retailer availability checkboxes ──
  const [onAmazon, setOnAmazon] = useState(!!book?.amazon_url);
  const [onBarnesNoble, setOnBarnesNoble] = useState(!!book?.barnes_noble_url);

  const [form, setForm] = useState({
    title: book?.title || '',
    slug: book?.slug || '',
    description: book?.description || '',
    long_description: book?.long_description || '',
    price_cents: book?.price_cents || 0,
    paperback_price_cents: book?.paperback_price_cents || 0,
    digital_price_cents: book?.digital_price_cents || 0,
    cover_image_url: book?.cover_image_url || '',
    amazon_url: book?.amazon_url || '',
    barnes_noble_url: book?.barnes_noble_url || '',
    companion_url: book?.companion_url || '',
    digital_pdf_storage_id: book?.digital_pdf_storage_id || '',
    digital_epub_storage_id: book?.digital_epub_storage_id || '',
    is_featured: book?.is_featured || false,
    is_active: book?.is_active ?? true,
  });

  const showDigitalFields = fmtDigital;
  const showHardbackPrice = fmtHardback;
  const showPaperbackPrice = fmtPaperback;

  const handleFileUpload = async (
    file: File,
    field: 'digital_pdf_storage_id' | 'digital_epub_storage_id'
  ) => {
    setUploading(field);
    try {
      const uploadUrl = await generateUploadUrl({});
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setForm((f) => ({ ...f, [field]: storageId }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed. Please try again.');
    }
    setUploading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const book_format = toBookFormat(fmtPaperback, fmtHardback, fmtDigital);

    try {
      const bookData = {
        title: form.title,
        slug,
        description: form.description,
        long_description: form.long_description || undefined,
        price_cents: form.price_cents,
        paperback_price_cents: fmtPaperback ? form.paperback_price_cents || undefined : undefined,
        digital_price_cents: fmtDigital ? form.digital_price_cents || undefined : undefined,
        book_format,
        cover_image_url: form.cover_image_url || undefined,
        amazon_url: onAmazon ? form.amazon_url || undefined : undefined,
        barnes_noble_url: onBarnesNoble ? form.barnes_noble_url || undefined : undefined,
        companion_url: form.companion_url || undefined,
        digital_pdf_storage_id: form.digital_pdf_storage_id || undefined,
        digital_epub_storage_id: form.digital_epub_storage_id || undefined,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };

      if (book) {
        await updateBook({ id: book._id, ...bookData });
      } else {
        await createBook(bookData);
      }
      onSave();
    } catch (err) {
      console.error('Error saving book:', err);
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">
        {book ? 'Edit Book' : 'Add New Book'}
      </h2>

      {/* Title & Slug */}
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

      {/* Descriptions */}
      <div>
        <label className="block text-sm text-surface-300 mb-1">Short Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 resize-none"
          placeholder="Brief description for book cards"
        />
      </div>

      <div>
        <label className="block text-sm text-surface-300 mb-1">Full Description</label>
        <textarea
          rows={10}
          value={form.long_description}
          onChange={(e) => setForm({ ...form, long_description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 resize-y"
          placeholder="Detailed description shown on book detail page (supports line breaks)"
        />
      </div>

      {/* ── Available Formats & Retailers ── */}
      <div>
        <label className="block text-sm text-surface-300 mb-2">Available Formats</label>
        <div className="flex flex-wrap gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={fmtPaperback}
              onChange={(e) => setFmtPaperback(e.target.checked)}
              className="rounded"
            />
            Paperback
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={fmtHardback}
              onChange={(e) => setFmtHardback(e.target.checked)}
              className="rounded"
            />
            Hardback
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={fmtDigital}
              onChange={(e) => setFmtDigital(e.target.checked)}
              className="rounded"
            />
            Digital
          </label>
          <span className="border-l border-surface-700 mx-1" />
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onAmazon}
              onChange={(e) => setOnAmazon(e.target.checked)}
              className="rounded"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF9900]" />
              Amazon
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onBarnesNoble}
              onChange={(e) => setOnBarnesNoble(e.target.checked)}
              className="rounded"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D5F2E]" />
              Barnes &amp; Noble
            </span>
          </label>
        </div>

        {/* Retailer URL fields — shown when the corresponding checkbox is checked */}
        {(onAmazon || onBarnesNoble) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {onAmazon && (
              <div>
                <label className="block text-sm text-surface-300 mb-1">Amazon URL</label>
                <input
                  value={form.amazon_url}
                  onChange={(e) => setForm({ ...form, amazon_url: e.target.value })}
                  placeholder="https://amazon.com/dp/..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
                />
                <p className="text-xs text-surface-500 mt-1">Affiliate tag will be appended automatically if configured</p>
              </div>
            )}
            {onBarnesNoble && (
              <div>
                <label className="block text-sm text-surface-300 mb-1">Barnes &amp; Noble URL</label>
                <input
                  value={form.barnes_noble_url}
                  onChange={(e) => setForm({ ...form, barnes_noble_url: e.target.value })}
                  placeholder="https://barnesandnoble.com/w/..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pricing (text inputs — no up/down spinners) ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {showHardbackPrice && (
          <div>
            <label className="block text-sm text-surface-300 mb-1">Hardback Price ($)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="29.99"
              value={hardbackPriceDisplay}
              onChange={(e) => setHardbackPriceDisplay(e.target.value)}
              onBlur={() => {
                const val = parseFloat(hardbackPriceDisplay || '0');
                if (!isNaN(val)) {
                  setForm((f) => ({ ...f, price_cents: Math.round(val * 100) }));
                  setHardbackPriceDisplay(val.toFixed(2));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            />
          </div>
        )}
        {showPaperbackPrice && (
          <div>
            <label className="block text-sm text-surface-300 mb-1">Paperback Price ($)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="19.99"
              value={paperbackPriceDisplay}
              onChange={(e) => setPaperbackPriceDisplay(e.target.value)}
              onBlur={() => {
                const val = parseFloat(paperbackPriceDisplay || '0');
                if (!isNaN(val)) {
                  setForm((f) => ({ ...f, paperback_price_cents: Math.round(val * 100) }));
                  setPaperbackPriceDisplay(val.toFixed(2));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            />
          </div>
        )}
        {showDigitalFields && (
          <div>
            <label className="block text-sm text-surface-300 mb-1">Digital Price ($)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="14.99"
              value={digitalPriceDisplay}
              onChange={(e) => setDigitalPriceDisplay(e.target.value)}
              onBlur={() => {
                const val = parseFloat(digitalPriceDisplay || '0');
                if (!isNaN(val)) {
                  setForm((f) => ({ ...f, digital_price_cents: Math.round(val * 100) }));
                  setDigitalPriceDisplay(val.toFixed(2));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
            />
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm text-surface-300 mb-1">Cover Image URL</label>
        <input
          value={form.cover_image_url}
          onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
        />
      </div>

      {/* Digital file uploads */}
      {showDigitalFields && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-300 mb-1">
              PDF File {form.digital_pdf_storage_id && '✅'}
            </label>
            <input
              type="file"
              accept=".pdf"
              disabled={uploading === 'digital_pdf_storage_id'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'digital_pdf_storage_id');
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-brand-600 file:text-white file:text-sm file:cursor-pointer"
            />
            {uploading === 'digital_pdf_storage_id' && (
              <p className="text-xs text-brand-400 mt-1">Uploading PDF...</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-surface-300 mb-1">
              EPUB File {form.digital_epub_storage_id && '✅'}
            </label>
            <input
              type="file"
              accept=".epub"
              disabled={uploading === 'digital_epub_storage_id'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'digital_epub_storage_id');
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-brand-600 file:text-white file:text-sm file:cursor-pointer"
            />
            {uploading === 'digital_epub_storage_id' && (
              <p className="text-xs text-brand-400 mt-1">Uploading EPUB...</p>
            )}
          </div>
        </div>
      )}

      {/* Companion URL */}
      <div>
        <label className="block text-sm text-surface-300 mb-1">Online Companion URL</label>
        <input
          value={form.companion_url}
          onChange={(e) => setForm({ ...form, companion_url: e.target.value })}
          placeholder="https://eric-tomchik.github.io/comptia-a-plus-cyber-companion/"
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
        />
        <p className="text-xs text-surface-500 mt-1">Shows an &quot;Online Companion&quot; card on the book detail page when set</p>
      </div>

      {/* Flags */}
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

      {/* Submit */}
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
