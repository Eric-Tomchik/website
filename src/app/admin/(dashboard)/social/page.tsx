'use client';

import { useState } from 'react';

import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  PlusCircle,
  Send,
  Calendar,
  BarChart3,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileText,
  Megaphone,
  Filter,
  X,
  Hash,
  Image as ImageIcon,
  Target,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MousePointer,
} from 'lucide-react';

// Platform icons & colors
const PLATFORMS = {
  facebook: { label: 'Facebook', color: '#1877F2', icon: '📘' },
  instagram: { label: 'Instagram', color: '#E4405F', icon: '📸' },
  x: { label: 'X', color: '#000000', icon: '𝕏' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  tiktok: { label: 'TikTok', color: '#000000', icon: '🎵' },
} as const;

type Platform = keyof typeof PLATFORMS;
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
type PostType = 'post' | 'ad' | 'story' | 'reel';
type Tab = 'posts' | 'composer' | 'calendar' | 'campaigns';

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-surface-700 text-surface-300',
  scheduled: 'bg-blue-900/40 text-blue-400',
  published: 'bg-green-900/40 text-green-400',
  failed: 'bg-red-900/40 text-red-400',
};

const POST_TYPE_LABELS: Record<PostType, string> = {
  post: '📝 Post',
  ad: '📢 Ad',
  story: '📖 Story',
  reel: '🎬 Reel',
};

export default function SocialMediaPage() {
  const [tab, setTab] = useState<Tab>('posts');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  const posts = useAdminQuery(api.socialPosts.list, statusFilter === 'all' ? {} : { status: statusFilter as PostStatus });
  const postCounts = useAdminQuery(api.socialPosts.counts, {});
  const campaigns = useAdminQuery(api.socialCampaigns.list, {});

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'posts', label: 'All Posts', icon: FileText },
    { id: 'composer', label: 'Compose', icon: Edit3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media Hub</h1>
          <p className="text-surface-400 text-sm mt-1">
            Create, schedule, and manage posts across all platforms
          </p>
        </div>
        {postCounts && (
          <div className="flex gap-3">
            <div className="card px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{postCounts.draft}</div>
              <div className="text-xs text-surface-400">Drafts</div>
            </div>
            <div className="card px-4 py-2 text-center">
              <div className="text-xl font-bold text-blue-400">{postCounts.scheduled}</div>
              <div className="text-xs text-surface-400">Scheduled</div>
            </div>
            <div className="card px-4 py-2 text-center">
              <div className="text-xl font-bold text-green-400">{postCounts.published}</div>
              <div className="text-xs text-surface-400">Published</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-800/50 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setEditingPost(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-brand-600 text-white'
                : 'text-surface-400 hover:text-white hover:bg-surface-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'posts' && (
        <PostsList
          posts={posts ?? []}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          campaigns={campaigns ?? []}
          onEdit={(post: any) => {
            setEditingPost(post);
            setTab('composer');
          }}
        />
      )}
      {tab === 'composer' && (
        <PostComposer
          campaigns={campaigns ?? []}
          editingPost={editingPost}
          onDone={() => {
            setEditingPost(null);
            setTab('posts');
          }}
        />
      )}
      {tab === 'calendar' && <ContentCalendar posts={posts ?? []} />}
      {tab === 'campaigns' && (
        <CampaignsView
          campaigns={campaigns ?? []}
          showForm={showCampaignForm}
          setShowForm={setShowCampaignForm}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Posts List
// ─────────────────────────────────────────────

function PostsList({
  posts,
  statusFilter,
  setStatusFilter,
  campaigns,
  onEdit,
}: {
  posts: any[];
  statusFilter: string;
  setStatusFilter: (s: any) => void;
  campaigns: any[];
  onEdit: (p: any) => void;
}) {
  const removePost = useAdminMutation(api.socialPosts.remove);
  const updatePost = useAdminMutation(api.socialPosts.update);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCampaignName = (id: string) => {
    const c = campaigns.find((c: any) => c._id === id);
    return c?.name ?? '';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-surface-400" />
        {(['all', 'draft', 'scheduled', 'published', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Post Cards */}
      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
          <p className="text-surface-400">Create your first social media post in the Compose tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div key={post._id} className="card p-4 hover:border-surface-600 transition-colors">
              <div className="flex gap-4">
                {/* Image preview */}
                {post.image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-800">
                    <img
                      src={post.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.title && (
                        <span className="font-semibold text-white text-sm">{post.title}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[post.status as PostStatus]}`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-surface-500">
                        {POST_TYPE_LABELS[post.post_type as PostType]}
                      </span>
                      {post.campaign_id && (
                        <span className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-400 text-xs">
                          {getCampaignName(post.campaign_id)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(
                          post.content + (post.hashtags.length ? '\n\n' + post.hashtags.map((h: string) => `#${h}`).join(' ') : '')
                        )}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(post)}
                        className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {post.status !== 'published' && (
                        <button
                          onClick={() => updatePost({ id: post._id, status: 'published' })}
                          className="p-1.5 rounded hover:bg-green-900/40 text-surface-400 hover:text-green-400 transition-colors"
                          title="Mark as published"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this post?')) removePost({ id: post._id });
                        }}
                        className="p-1.5 rounded hover:bg-red-900/40 text-surface-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content preview */}
                  <p className="text-surface-300 text-sm line-clamp-2 mb-2">{post.content}</p>

                  {/* Bottom row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Platforms */}
                    <div className="flex gap-1">
                      {post.platforms.map((p: Platform) => (
                        <span
                          key={p}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs"
                          style={{ backgroundColor: PLATFORMS[p].color + '20' }}
                          title={PLATFORMS[p].label}
                        >
                          {PLATFORMS[p].icon}
                        </span>
                      ))}
                    </div>

                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {post.hashtags.slice(0, 3).map((h: string) => (
                          <span key={h} className="text-xs text-brand-400">#{h}</span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs text-surface-500">+{post.hashtags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Scheduled time */}
                    {post.scheduled_at && (
                      <span className="flex items-center gap-1 text-xs text-surface-500">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduled_at).toLocaleString()}
                      </span>
                    )}

                    {/* Metrics if published */}
                    {post.metrics && (
                      <div className="flex items-center gap-2 text-xs text-surface-500">
                        {post.metrics.likes != null && (
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" /> {post.metrics.likes}
                          </span>
                        )}
                        {post.metrics.comments != null && (
                          <span className="flex items-center gap-0.5">
                            <MessageCircle className="w-3 h-3" /> {post.metrics.comments}
                          </span>
                        )}
                        {post.metrics.shares != null && (
                          <span className="flex items-center gap-0.5">
                            <Share2 className="w-3 h-3" /> {post.metrics.shares}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Post Composer
// ─────────────────────────────────────────────

function PostComposer({
  campaigns,
  editingPost,
  onDone,
}: {
  campaigns: any[];
  editingPost: any;
  onDone: () => void;
}) {
  const createPost = useAdminMutation(api.socialPosts.create);
  const updatePost = useAdminMutation(api.socialPosts.update);

  const [title, setTitle] = useState(editingPost?.title ?? '');
  const [content, setContent] = useState(editingPost?.content ?? '');
  const [imageUrl, setImageUrl] = useState(editingPost?.image_url ?? '');
  const [platforms, setPlatforms] = useState<Platform[]>(editingPost?.platforms ?? []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(editingPost?.hashtags ?? []);
  const [postType, setPostType] = useState<PostType>(editingPost?.post_type ?? 'post');
  const [campaignId, setCampaignId] = useState(editingPost?.campaign_id ?? '');
  const [scheduledDate, setScheduledDate] = useState(
    editingPost?.scheduled_at ? new Date(editingPost.scheduled_at).toISOString().slice(0, 16) : ''
  );
  const [notes, setNotes] = useState(editingPost?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, '').trim();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const save = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!content.trim() || platforms.length === 0) return;
    setSaving(true);

    const data: any = {
      title: title || undefined,
      content,
      image_url: imageUrl || undefined,
      platforms,
      hashtags,
      status,
      post_type: postType,
      campaign_id: campaignId || undefined,
      scheduled_at: scheduledDate ? new Date(scheduledDate).getTime() : undefined,
      notes: notes || undefined,
    };

    try {
      if (editingPost) {
        await updatePost({ id: editingPost._id, ...data });
      } else {
        await createPost(data);
      }
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Character counts for different platforms
  const charCount = content.length;
  const limits: Record<string, number> = { x: 280, facebook: 63206, instagram: 2200, linkedin: 3000, tiktok: 4000 };
  const overLimit = platforms.some((p) => charCount > limits[p]);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Composer Form */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>

          {/* Title (optional) */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 block">
              Title (optional, for internal reference)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Book launch promo"
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-2 block">
              Platforms *
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    platforms.includes(p)
                      ? 'border-brand-500 bg-brand-600/20 text-white'
                      : 'border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-600'
                  }`}
                >
                  <span>{PLATFORMS[p].icon}</span>
                  {PLATFORMS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-surface-400">Content *</label>
              <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-surface-500'}`}>
                {charCount} chars
                {platforms.includes('x') && ` / 280`}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write your post content here..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Image URL
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> Hashtags
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((h) => (
                <span
                  key={h}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-900/30 text-brand-400 text-xs"
                >
                  #{h}
                  <button onClick={() => removeHashtag(h)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="Add hashtag..."
                className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={addHashtag}
                className="px-3 py-2 rounded-lg bg-surface-700 text-surface-300 hover:bg-surface-600 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Post Type + Campaign */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="post">📝 Post</option>
                <option value="ad">📢 Ad</option>
                <option value="story">📖 Story</option>
                <option value="reel">🎬 Reel</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Campaign</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">No campaign</option>
                {campaigns.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Schedule For
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 block">Internal Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for yourself..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => save('draft')}
              disabled={saving || !content.trim() || platforms.length === 0}
              className="px-4 py-2 rounded-lg bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 disabled:opacity-50 transition-colors"
            >
              💾 Save Draft
            </button>
            <button
              onClick={() => save('scheduled')}
              disabled={saving || !content.trim() || platforms.length === 0 || !scheduledDate}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => save('published')}
              disabled={saving || !content.trim() || platforms.length === 0}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Mark Published
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6 space-y-4 sticky top-24">
          <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
            Live Preview
          </h3>

          {platforms.length === 0 ? (
            <p className="text-surface-500 text-sm">Select a platform to preview</p>
          ) : (
            platforms.map((p) => (
              <div key={p} className="rounded-xl border border-surface-700 overflow-hidden">
                <div
                  className="px-3 py-2 text-xs font-medium text-white flex items-center gap-2"
                  style={{ backgroundColor: PLATFORMS[p].color + '30' }}
                >
                  <span>{PLATFORMS[p].icon}</span>
                  {PLATFORMS[p].label} Preview
                  {content.length > limits[p] && (
                    <span className="ml-auto text-red-400">
                      {content.length - limits[p]} over limit
                    </span>
                  )}
                </div>
                <div className="p-3 bg-surface-800/50">
                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden mb-3 bg-surface-900">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-surface-200 whitespace-pre-wrap break-words">
                    {content || 'Your post content will appear here...'}
                  </p>
                  {hashtags.length > 0 && (
                    <p className="text-sm text-brand-400 mt-2">
                      {hashtags.map((h) => `#${h}`).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Quick copy */}
          {content && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  content + (hashtags.length ? '\n\n' + hashtags.map((h) => `#${h}`).join(' ') : '')
                )
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-surface-700 text-surface-300 hover:text-white hover:border-surface-600 text-sm transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Post Text
            </button>
          )}

          {/* Quick links to post on each platform */}
          {content && platforms.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-surface-500 font-medium">Quick Post To:</p>
              {platforms.includes('x') && (
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(content + (hashtags.length ? '\n\n' + hashtags.map((h) => `#${h}`).join(' ') : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                >
                  <span>𝕏</span> Post to X <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
              {platforms.includes('linkedin') && (
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://erictomchik.com')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                >
                  <span>💼</span> Share on LinkedIn <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
              {platforms.includes('facebook') && (
                <a
                  href="https://www.facebook.com/profile.php?id=61589407526718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                >
                  <span>📘</span> Open Facebook Page <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Content Calendar
// ─────────────────────────────────────────────

function ContentCalendar({ posts }: { posts: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      const ts = p.scheduled_at ?? p.published_at ?? p._creationTime;
      const d = new Date(ts);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="card p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="px-3 py-1 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 text-sm">
          ← Prev
        </button>
        <h3 className="text-lg font-semibold text-white">{monthName}</h3>
        <button onClick={nextMonth} className="px-3 py-1 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 text-sm">
          Next →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-surface-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] rounded-lg bg-surface-900/30" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = getPostsForDay(day);
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <div
              key={day}
              className={`min-h-[80px] rounded-lg p-1.5 border transition-colors ${
                isToday
                  ? 'border-brand-500 bg-brand-900/10'
                  : 'border-surface-800 bg-surface-900/30 hover:border-surface-700'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-brand-400' : 'text-surface-500'}`}>
                {day}
              </div>
              {dayPosts.map((p: any) => (
                <div
                  key={p._id}
                  className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${STATUS_STYLES[p.status as PostStatus]}`}
                  title={p.title || p.content.slice(0, 50)}
                >
                  {p.platforms.map((pl: Platform) => PLATFORMS[pl].icon).join('')}{' '}
                  {p.title || p.content.slice(0, 20)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Campaigns View
// ─────────────────────────────────────────────

function CampaignsView({
  campaigns,
  showForm,
  setShowForm,
}: {
  campaigns: any[];
  showForm: boolean;
  setShowForm: (s: boolean) => void;
}) {
  const createCampaign = useAdminMutation(api.socialCampaigns.create);
  const updateCampaign = useAdminMutation(api.socialCampaigns.update);
  const removeCampaign = useAdminMutation(api.socialCampaigns.remove);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState('#8b5cf6');

  const saveCampaign = async () => {
    if (!name.trim()) return;
    await createCampaign({
      name,
      description: description || undefined,
      status: 'planning',
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      budget_cents: budget ? Math.round(parseFloat(budget) * 100) : undefined,
      goal: goal || undefined,
      color,
    });
    setName('');
    setDescription('');
    setGoal('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setShowForm(false);
  };

  const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
    planning: 'bg-surface-700 text-surface-300',
    active: 'bg-green-900/40 text-green-400',
    paused: 'bg-yellow-900/40 text-yellow-400',
    completed: 'bg-blue-900/40 text-blue-400',
  };

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Campaigns</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* New Campaign Form */}
      {showForm && (
        <div className="card p-6 space-y-4 border-brand-600">
          <h3 className="font-semibold text-white">Create Campaign</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Campaign Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Book Launch"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Goal</label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. 500 book sales"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Campaign details..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Budget ($)</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-400 mb-1 block">Color Tag</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveCampaign}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-surface-700 text-surface-300 text-sm hover:bg-surface-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign Cards */}
      {campaigns.length === 0 && !showForm ? (
        <div className="card p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
          <p className="text-surface-400">
            Create campaigns to organize your posts around promotions, launches, or themes.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((c: any) => (
            <div key={c._id} className="card p-5 space-y-3 hover:border-surface-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color ?? '#8b5cf6' }} />
                  <h3 className="font-semibold text-white">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAMPAIGN_STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => {
                      const next: Record<string, string> = {
                        planning: 'active',
                        active: 'paused',
                        paused: 'active',
                        completed: 'planning',
                      };
                      updateCampaign({ id: c._id, status: next[c.status] as any });
                    }}
                    className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-white text-xs"
                    title="Toggle status"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this campaign?')) removeCampaign({ id: c._id });
                    }}
                    className="p-1 rounded hover:bg-red-900/40 text-surface-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {c.description && <p className="text-sm text-surface-400">{c.description}</p>}

              {c.goal && (
                <div className="flex items-center gap-1.5 text-xs text-surface-500">
                  <Target className="w-3 h-3" /> {c.goal}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-surface-500">
                {c.start_date && (
                  <span>
                    {c.start_date} → {c.end_date ?? '...'}
                  </span>
                )}
                {c.budget_cents != null && (
                  <span>Budget: ${(c.budget_cents / 100).toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
