'use client';

import { useQuery, useMutation } from 'convex/react';
import { useState, useMemo } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Pencil,
  Trash2,
  Target,
  Eye,
  BarChart3,
  Calendar,
  FileText,
  X,
  Save,
  ArrowUpRight,
} from 'lucide-react';

type KWStatus = 'tracking' | 'targeting' | 'ranking' | 'archived';
type ContentStatus = 'idea' | 'writing' | 'review' | 'scheduled' | 'published';
type ContentType = 'blog' | 'social' | 'email' | 'video';
type ActiveTab = 'keywords' | 'calendar';

const kwStatusColors: Record<KWStatus, string> = {
  tracking: 'text-surface-400 bg-surface-800',
  targeting: 'text-blue-400 bg-blue-500/20',
  ranking: 'text-green-400 bg-green-500/20',
  archived: 'text-surface-500 bg-surface-800',
};

const contentStatusColors: Record<ContentStatus, string> = {
  idea: 'text-surface-400 bg-surface-800',
  writing: 'text-yellow-400 bg-yellow-500/20',
  review: 'text-violet-400 bg-violet-500/20',
  scheduled: 'text-blue-400 bg-blue-500/20',
  published: 'text-green-400 bg-green-500/20',
};

const contentTypeLabels: Record<ContentType, string> = {
  blog: '📝 Blog',
  social: '📱 Social',
  email: '📧 Email',
  video: '🎥 Video',
};

export default function SEOPlannerPage() {
  const keywords = useQuery(api.seoKeywords.list) ?? [];
  const kwStats = useQuery(api.seoKeywords.stats);
  const calendar = useQuery(api.contentCalendar.list) ?? [];
  const createKW = useMutation(api.seoKeywords.create);
  const updateKW = useMutation(api.seoKeywords.update);
  const removeKW = useMutation(api.seoKeywords.remove);
  const createContent = useMutation(api.contentCalendar.create);
  const updateContent = useMutation(api.contentCalendar.update);
  const removeContent = useMutation(api.contentCalendar.remove);

  const [tab, setTab] = useState<ActiveTab>('keywords');
  const [search, setSearch] = useState('');

  // Keyword form
  const [showKWForm, setShowKWForm] = useState(false);
  const [editingKWId, setEditingKWId] = useState<Id<'seo_keywords'> | null>(null);
  const [kwForm, setKWForm] = useState({
    keyword: '',
    target_url: '',
    current_position: '',
    search_volume: '',
    difficulty: '',
    status: 'tracking' as KWStatus,
    notes: '',
  });

  // Content form
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContentId, setEditingContentId] = useState<Id<'content_calendar'> | null>(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    content_type: 'blog' as ContentType,
    target_keyword: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    status: 'idea' as ContentStatus,
    assigned_to: '',
    notes: '',
  });

  // Filter keywords
  const filteredKW = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(search.toLowerCase())
  );

  // Filter content
  const filteredContent = calendar.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const openKWCreate = () => {
    setKWForm({ keyword: '', target_url: '', current_position: '', search_volume: '', difficulty: '', status: 'tracking', notes: '' });
    setEditingKWId(null);
    setShowKWForm(true);
  };

  const openKWEdit = (kw: (typeof keywords)[0]) => {
    setKWForm({
      keyword: kw.keyword,
      target_url: kw.target_url || '',
      current_position: kw.current_position?.toString() || '',
      search_volume: kw.search_volume?.toString() || '',
      difficulty: kw.difficulty?.toString() || '',
      status: kw.status,
      notes: kw.notes || '',
    });
    setEditingKWId(kw._id);
    setShowKWForm(true);
  };

  const saveKW = async () => {
    const data = {
      keyword: kwForm.keyword,
      target_url: kwForm.target_url || undefined,
      current_position: kwForm.current_position ? parseInt(kwForm.current_position) : undefined,
      search_volume: kwForm.search_volume ? parseInt(kwForm.search_volume) : undefined,
      difficulty: kwForm.difficulty ? parseInt(kwForm.difficulty) : undefined,
      status: kwForm.status,
      notes: kwForm.notes || undefined,
    };
    if (editingKWId) {
      await updateKW({ id: editingKWId, ...data });
    } else {
      await createKW(data);
    }
    setShowKWForm(false);
  };

  const openContentCreate = () => {
    setContentForm({ title: '', content_type: 'blog', target_keyword: '', scheduled_date: new Date().toISOString().split('T')[0], status: 'idea', assigned_to: '', notes: '' });
    setEditingContentId(null);
    setShowContentForm(true);
  };

  const openContentEdit = (item: (typeof calendar)[0]) => {
    setContentForm({
      title: item.title,
      content_type: item.content_type,
      target_keyword: item.target_keyword || '',
      scheduled_date: item.scheduled_date,
      status: item.status,
      assigned_to: item.assigned_to || '',
      notes: item.notes || '',
    });
    setEditingContentId(item._id);
    setShowContentForm(true);
  };

  const saveContent = async () => {
    const data = {
      title: contentForm.title,
      content_type: contentForm.content_type,
      target_keyword: contentForm.target_keyword || undefined,
      scheduled_date: contentForm.scheduled_date,
      status: contentForm.status,
      assigned_to: contentForm.assigned_to || undefined,
      notes: contentForm.notes || undefined,
    };
    if (editingContentId) {
      await updateContent({ id: editingContentId, ...data });
    } else {
      await createContent(data);
    }
    setShowContentForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-brand-400" />
            SEO & Content Planner
          </h1>
          <p className="text-surface-400 mt-1">Track keywords and plan content</p>
        </div>
        <button
          onClick={tab === 'keywords' ? openKWCreate : openContentCreate}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {tab === 'keywords' ? 'Add Keyword' : 'Plan Content'}
        </button>
      </div>

      {/* Stats */}
      {kwStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-white">{kwStats.total}</p>
            <p className="text-xs text-surface-400">Total Keywords</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{kwStats.ranking}</p>
            <p className="text-xs text-surface-400">Ranking</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{kwStats.targeting}</p>
            <p className="text-xs text-surface-400">Targeting</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-violet-400">{calendar.length}</p>
            <p className="text-xs text-surface-400">Content Items</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-surface-700">
        {[
          { id: 'keywords' as ActiveTab, label: 'Keywords', icon: BarChart3 },
          { id: 'calendar' as ActiveTab, label: 'Content Calendar', icon: Calendar },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder={tab === 'keywords' ? 'Search keywords...' : 'Search content...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Keyword Form */}
      {showKWForm && tab === 'keywords' && (
        <div className="card p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{editingKWId ? 'Edit Keyword' : 'Add Keyword'}</h2>
            <button onClick={() => setShowKWForm(false)} className="text-surface-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Keyword</label>
              <input value={kwForm.keyword} onChange={(e) => setKWForm({ ...kwForm, keyword: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" placeholder="business credit building" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Target URL</label>
              <input value={kwForm.target_url} onChange={(e) => setKWForm({ ...kwForm, target_url: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" placeholder="/blog/..." />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Position</label>
              <input type="number" value={kwForm.current_position} onChange={(e) => setKWForm({ ...kwForm, current_position: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Search Volume</label>
              <input type="number" value={kwForm.search_volume} onChange={(e) => setKWForm({ ...kwForm, search_volume: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Difficulty (0-100)</label>
              <input type="number" value={kwForm.difficulty} onChange={(e) => setKWForm({ ...kwForm, difficulty: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Status</label>
              <select value={kwForm.status} onChange={(e) => setKWForm({ ...kwForm, status: e.target.value as KWStatus })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500">
                <option value="tracking">Tracking</option>
                <option value="targeting">Targeting</option>
                <option value="ranking">Ranking</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={saveKW} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {editingKWId ? 'Update' : 'Add Keyword'}
            </button>
          </div>
        </div>
      )}

      {/* Content Form */}
      {showContentForm && tab === 'calendar' && (
        <div className="card p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{editingContentId ? 'Edit Content' : 'Plan Content'}</h2>
            <button onClick={() => setShowContentForm(false)} className="text-surface-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Title</label>
              <input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Target Keyword</label>
              <input value={contentForm.target_keyword} onChange={(e) => setContentForm({ ...contentForm, target_keyword: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1">Type</label>
              <select value={contentForm.content_type} onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value as ContentType })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500">
                <option value="blog">Blog</option>
                <option value="social">Social</option>
                <option value="email">Email</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Date</label>
              <input type="date" value={contentForm.scheduled_date} onChange={(e) => setContentForm({ ...contentForm, scheduled_date: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Status</label>
              <select value={contentForm.status} onChange={(e) => setContentForm({ ...contentForm, status: e.target.value as ContentStatus })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500">
                <option value="idea">Idea</option>
                <option value="writing">Writing</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Assigned To</label>
              <input value={contentForm.assigned_to} onChange={(e) => setContentForm({ ...contentForm, assigned_to: e.target.value })} className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500" placeholder="Eric" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={saveContent} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {editingContentId ? 'Update' : 'Add Content'}
            </button>
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {tab === 'keywords' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700 bg-surface-900/40">
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Keyword</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Position</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Volume</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Difficulty</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Status</th>
                <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filteredKW.map((kw) => {
                const trend = kw.previous_position !== undefined && kw.current_position !== undefined
                  ? kw.previous_position - kw.current_position
                  : 0;
                return (
                  <tr key={kw._id} className="hover:bg-surface-800/40">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{kw.keyword}</p>
                      {kw.target_url && (
                        <p className="text-xs text-surface-500 font-mono flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />{kw.target_url}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-mono">{kw.current_position ?? '—'}</span>
                        {trend > 0 && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {trend < 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
                        {trend === 0 && kw.current_position && <Minus className="w-4 h-4 text-surface-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-surface-300">{kw.search_volume?.toLocaleString() ?? '—'}</td>
                    <td className="py-3 px-4">
                      {kw.difficulty !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                kw.difficulty < 30 ? 'bg-green-400' :
                                kw.difficulty < 60 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                          <span className="text-xs text-surface-400">{kw.difficulty}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${kwStatusColors[kw.status]}`}>
                        {kw.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openKWEdit(kw)} className="p-1.5 text-surface-400 hover:text-brand-400"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm('Delete?')) removeKW({ id: kw._id }); }} className="p-1.5 text-surface-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredKW.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-surface-500">No keywords yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Calendar Tab */}
      {tab === 'calendar' && (
        <div className="space-y-3">
          {filteredContent.map((item) => (
            <div key={item._id} className="card p-4 flex items-center gap-4 hover:border-brand-500/20 transition-colors">
              <div className="text-center flex-shrink-0 w-14">
                <p className="text-xs text-surface-500">
                  {new Date(item.scheduled_date).toLocaleDateString('en', { month: 'short' })}
                </p>
                <p className="text-xl font-bold text-white">
                  {new Date(item.scheduled_date).getDate()}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{contentTypeLabels[item.content_type]}</span>
                  <h3 className="text-white font-medium">{item.title}</h3>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {item.target_keyword && (
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Target className="w-3 h-3" /> {item.target_keyword}
                    </span>
                  )}
                  {item.assigned_to && (
                    <span className="text-xs text-surface-400">{item.assigned_to}</span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${contentStatusColors[item.status]}`}>
                {item.status}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openContentEdit(item)} className="p-1.5 text-surface-400 hover:text-brand-400"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete?')) removeContent({ id: item._id }); }} className="p-1.5 text-surface-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {filteredContent.length === 0 && (
            <div className="text-center py-16 text-surface-500">
              No content planned yet — click "Plan Content" to start
            </div>
          )}
        </div>
      )}
    </div>
  );
}
