'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import { BACKFILL_POSTS } from '@/data/backfillPosts';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  X,
  Save,
  Clock,
  Download,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'business-credit', label: 'Business Credit' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'technology', label: 'Technology' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'ai', label: 'AI' },
  { value: 'general', label: 'General' },
] as const;

type Category = typeof CATEGORIES[number]['value'];

interface BlogPost {
  _id: Id<'blog_posts'>;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  category: Category;
  tags: string[];
  is_published: boolean;
  published_at?: number;
  reading_time_minutes?: number;
}

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  category: 'general' as Category,
  tags: [] as string[],
  is_published: false,
  reading_time_minutes: 0,
  publish_date: '', // YYYY-MM-DD; blank = use the moment the post is first published
};

// Date input (YYYY-MM-DD) <-> timestamp. Noon local time avoids off-by-one-day timezone shifts.
const dateToTimestamp = (d: string) => (d ? new Date(`${d}T12:00:00`).getTime() : undefined);
const timestampToDate = (ts?: number) => {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function BlogAdminPage() {
  const posts = (useAdminQuery(api.blogPosts.listAll, {}) ?? []) as BlogPost[];
  const create = useAdminMutation(api.blogPosts.create);
  const update = useAdminMutation(api.blogPosts.update);
  const remove = useAdminMutation(api.blogPosts.remove);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [tagsInput, setTagsInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.includes(search.toLowerCase())
  );

  const published = posts.filter((p) => p.is_published).length;
  const drafts = posts.length - published;

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const estimateReadingTime = (content: string) =>
    Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  const openCreate = () => {
    setForm(emptyPost);
    setTagsInput('');
    setCreating(true);
    setEditing(null);
    setPreview(false);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url || '',
      category: post.category,
      tags: post.tags,
      is_published: post.is_published,
      reading_time_minutes: post.reading_time_minutes || 0,
      publish_date: timestampToDate(post.published_at),
    });
    setTagsInput(post.tags.join(', '));
    setEditing(post);
    setCreating(false);
    setPreview(false);
  };

  const handleSave = async () => {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const readTime = estimateReadingTime(form.content);

    if (editing) {
      await update({
        id: editing._id,
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url || undefined,
        category: form.category,
        tags,
        is_published: form.is_published,
        reading_time_minutes: readTime,
        published_at: dateToTimestamp(form.publish_date),
      });
      setEditing(null);
    } else {
      await create({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url || undefined,
        category: form.category,
        tags,
        is_published: form.is_published,
        reading_time_minutes: readTime,
        published_at: dateToTimestamp(form.publish_date),
      });
      setCreating(false);
    }
    setForm(emptyPost);
    setTagsInput('');
  };

  // One-time import of bundled back-dated articles; skips any slug that already exists.
  const existingSlugs = new Set(posts.map((p) => p.slug));
  const pendingImports = BACKFILL_POSTS.filter((p) => !existingSlugs.has(p.slug));

  const handleImport = async () => {
    if (!confirm(`Publish ${pendingImports.length} back-dated article(s)?`)) return;
    setImporting(true);
    setImportMsg('');
    let done = 0;
    try {
      for (const p of pendingImports) {
        await create({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category,
          tags: p.tags,
          is_published: true,
          reading_time_minutes: estimateReadingTime(p.content),
          published_at: dateToTimestamp(p.publish_date),
        });
        done++;
      }
      setImportMsg(`Imported ${done} article(s).`);
    } catch (err) {
      setImportMsg(`Imported ${done}, then failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyPost);
    setTagsInput('');
    setPreview(false);
  };

  const isEditorOpen = editing || creating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-brand-400" />
            Blog Posts
          </h1>
          <p className="text-surface-400 mt-1">
            {published} published · {drafts} drafts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingImports.length > 0 && posts.length > 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {importing ? 'Importing…' : `Import ${pendingImports.length} back-dated articles`}
            </button>
          )}
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>
      {importMsg && <p className="text-sm text-brand-400">{importMsg}</p>}

      {/* Editor */}
      {isEditorOpen && (
        <div className="card p-6 space-y-5 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Edit Post' : 'New Post'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(!preview)}
                className="btn-secondary text-xs"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button onClick={closeEditor} className="p-1.5 text-surface-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {preview ? (
            <div className="prose prose-invert max-w-none">
              <h1>{form.title || 'Untitled'}</h1>
              <p className="text-surface-400 italic">{form.excerpt}</p>
              <div className="whitespace-pre-wrap">{form.content}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) });
                    }}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                    placeholder="Post title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                    placeholder="post-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-surface-400 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  rows={2}
                  placeholder="Brief summary for cards and SEO..."
                />
              </div>

              <div>
                <label className="block text-sm text-surface-400 mb-1">
                  Content (Markdown)
                  <span className="text-surface-500 ml-2">
                    ~{estimateReadingTime(form.content)} min read
                  </span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  rows={16}
                  placeholder="Write your post content in Markdown..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Tags (comma-separated)</label>
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                    placeholder="credit, business, tips"
                  />
                </div>
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Cover Image URL</label>
                  <input
                    value={form.cover_image_url}
                    onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded border-surface-600"
                  />
                  Publish
                </label>
                <label className="flex items-center gap-2 text-sm text-surface-300">
                  Publish date
                  <input
                    type="date"
                    value={form.publish_date}
                    onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
                    className="px-2 py-1 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                    title="Optional. Leave blank to use today. Set a past date to back-date the post."
                  />
                </label>
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editing ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Posts Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700 bg-surface-900/40">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Title</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Category</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Date</th>
              <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {filtered.map((post) => (
              <tr key={post._id} className="hover:bg-surface-800/40">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-white font-medium">{post.title}</p>
                    <p className="text-xs text-surface-500 font-mono">/{post.slug}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 border border-surface-700">
                    {CATEGORIES.find((c) => c.value === post.category)?.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    post.is_published ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {post.is_published ? <Eye className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 px-4 text-surface-300 text-xs">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : new Date(post._creationTime).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    {post.is_published && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-surface-400 hover:text-brand-400"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() =>
                        update({ id: post._id, is_published: !post.is_published })
                      }
                      className="p-1.5 text-surface-400 hover:text-white"
                      title={post.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(post)}
                      className="p-1.5 text-surface-400 hover:text-brand-400"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this post?')) remove({ id: post._id });
                      }}
                      className="p-1.5 text-surface-400 hover:text-red-400"
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
                <td colSpan={5} className="py-12 text-center text-surface-500">
                  {search ? 'No posts match your search' : 'No blog posts yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
