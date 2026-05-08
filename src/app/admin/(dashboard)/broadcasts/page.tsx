'use client';

import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
  Send,
  Plus,
  Trash2,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Mail,
  Users,
  FileText,
  BarChart3,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

type View = 'list' | 'compose' | 'preview';

export default function BroadcastsPage() {
  const broadcasts = useQuery(api.emailBroadcasts.list) ?? [];
  const stats = useQuery(api.emailBroadcasts.stats) ?? { total: 0, drafts: 0, sent: 0, totalEmailsSent: 0 };
  const subscriberStats = useQuery(api.newsletter.stats) ?? { total: 0, active: 0, inactive: 0, last30d: 0 };
  const createBroadcast = useMutation(api.emailBroadcasts.create);
  const updateBroadcast = useMutation(api.emailBroadcasts.update);
  const removeBroadcast = useMutation(api.emailBroadcasts.remove);

  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<Id<'email_broadcasts'> | null>(null);
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setSubject('');
    setPreviewText('');
    setContent('');
    setEditingId(null);
    setView('list');
    setSendResult(null);
  };

  const handleNewBroadcast = () => {
    resetForm();
    setView('compose');
  };

  const handleEditDraft = (broadcast: (typeof broadcasts)[0]) => {
    setEditingId(broadcast._id);
    setSubject(broadcast.subject);
    setPreviewText(broadcast.preview_text || '');
    setContent(broadcast.content);
    setView('compose');
    setSendResult(null);
  };

  const handleSaveDraft = async () => {
    if (!subject.trim() || !content.trim()) return;

    if (editingId) {
      await updateBroadcast({
        id: editingId,
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        content: content.trim(),
      });
    } else {
      const id = await createBroadcast({
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        content: content.trim(),
      });
      setEditingId(id);
    }
    setSendResult({ success: true, message: 'Draft saved!' });
    setTimeout(() => setSendResult(null), 2000);
  };

  const handleSend = async () => {
    if (!editingId) {
      // Save draft first
      const id = await createBroadcast({
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        content: content.trim(),
      });
      setEditingId(id);
      await doSend(id);
    } else {
      // Update draft before sending
      await updateBroadcast({
        id: editingId,
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        content: content.trim(),
      });
      await doSend(editingId);
    }
  };

  const doSend = async (id: Id<'email_broadcasts'>) => {
    setSending(true);
    setShowConfirm(false);
    setSendResult(null);

    try {
      const res = await fetch('/api/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId: id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSendResult({
          success: true,
          message: `Sent to ${data.sent_count}/${data.total_recipients} subscribers!${data.failed_count > 0 ? ` (${data.failed_count} failed)` : ''}`,
        });
        // Go back to list after a delay
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send broadcast',
        });
      }
    } catch (err) {
      setSendResult({
        success: false,
        message: `Error: ${String(err)}`,
      });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: Id<'email_broadcasts'>) => {
    if (confirm('Delete this broadcast?')) {
      await removeBroadcast({ id });
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
      draft: { bg: 'bg-surface-700/50', text: 'text-surface-300', icon: Edit3 },
      sending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Loader2 },
      sent: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    };
    const s = styles[status] || styles.draft;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        <Icon className={`w-3 h-3 ${status === 'sending' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ─── Preview View ───
  if (view === 'preview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('compose')} className="btn-secondary text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </button>
          <h1 className="text-xl font-bold text-white">Email Preview</h1>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-surface-400 border-b border-surface-700 pb-4">
            <span><strong className="text-surface-200">From:</strong> Eric Tomchik &lt;noreply@erictomchik.com&gt;</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-surface-400 border-b border-surface-700 pb-4">
            <span><strong className="text-surface-200">To:</strong> {subscriberStats.active} active subscribers</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-surface-400 border-b border-surface-700 pb-4">
            <span><strong className="text-surface-200">Subject:</strong> <span className="text-white">{subject || '(no subject)'}</span></span>
          </div>
          {previewText && (
            <div className="text-sm text-surface-400 border-b border-surface-700 pb-4">
              <strong className="text-surface-200">Preview text:</strong> {previewText}
            </div>
          )}

          {/* Rendered preview */}
          <div className="bg-[#0a0e1a] rounded-xl p-8 border border-surface-700">
            <div className="max-w-[600px] mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-brand-400 text-xl font-bold">Eric Tomchik</span>
              </div>

              {/* Card */}
              <div className="bg-[#111827] rounded-2xl p-8 border border-surface-700">
                <h1 className="text-white text-2xl font-bold mb-6">{subject || '(no subject)'}</h1>
                <div
                  className="text-surface-300 text-[15px] leading-relaxed prose prose-invert max-w-none
                    [&_a]:text-brand-400 [&_a]:no-underline [&_a:hover]:underline
                    [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_li]:mb-1 [&_p]:mb-4 [&_strong]:text-white [&_em]:text-surface-200
                    [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-surface-400"
                  dangerouslySetInnerHTML={{ __html: content || '<p style="color: #94a3b8;">(no content)</p>' }}
                />
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t border-surface-700">
                <div className="flex items-center justify-center gap-5 text-brand-400 text-sm mb-4">
                  <span>Books</span>
                  <span>Blog</span>
                  <span>Services</span>
                </div>
                <p className="text-surface-500 text-xs">
                  © {new Date().getFullYear()} Eric Tomchik · ArcLight Press
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Compose View ───
  if (view === 'compose') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={resetForm} className="btn-secondary text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {editingId ? 'Edit Broadcast' : 'New Broadcast'}
              </h1>
              <p className="text-surface-400 text-sm mt-0.5">
                Will be sent to <strong className="text-brand-400">{subscriberStats.active}</strong> active subscribers
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Subject Line *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New Book Release: Credit Without a Credit Score"
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Preview Text <span className="text-surface-500">(optional — shown in inbox before opening)</span>
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="A short teaser shown in email clients..."
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Email Body * <span className="text-surface-500">(HTML supported)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={'<p>Hey there! 👋</p>\n<p>Exciting news — ...</p>\n<p><a href="https://erictomchik.com/books">Check it out →</a></p>'}
                  rows={16}
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500 font-mono text-sm leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Actions</h3>

              <button
                onClick={handleSaveDraft}
                disabled={!subject.trim() || !content.trim()}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> Save Draft
              </button>

              <button
                onClick={() => setView('preview')}
                disabled={!subject.trim() || !content.trim()}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" /> Preview Email
              </button>

              <div className="border-t border-surface-700 pt-3">
                {!showConfirm ? (
                  <button
                    onClick={() => {
                      if (!subject.trim() || !content.trim()) return;
                      setShowConfirm(true);
                    }}
                    disabled={!subject.trim() || !content.trim() || sending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium
                              flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send to All Subscribers
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-300">
                        This will send to <strong>{subscriberStats.active}</strong> subscriber{subscriberStats.active !== 1 ? 's' : ''}. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium
                                  flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sending ? 'Sending...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {sendResult && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                  sendResult.success
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {sendResult.success ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <span>{sendResult.message}</span>
                </div>
              )}
            </div>

            {/* HTML Tips */}
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">HTML Tips</h3>
              <div className="text-xs text-surface-400 space-y-2 font-mono">
                <p>&lt;p&gt;Paragraph text&lt;/p&gt;</p>
                <p>&lt;strong&gt;Bold text&lt;/strong&gt;</p>
                <p>&lt;em&gt;Italic text&lt;/em&gt;</p>
                <p>&lt;a href=&quot;url&quot;&gt;Link&lt;/a&gt;</p>
                <p>&lt;h2&gt;Heading&lt;/h2&gt;</p>
                <p>&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</p>
                <p>&lt;br/&gt; — Line break</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Send className="w-7 h-7 text-brand-400" />
            Email Broadcasts
          </h1>
          <p className="text-surface-400 mt-1">Send updates to your newsletter subscribers</p>
        </div>
        <button onClick={handleNewBroadcast} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Subscribers', value: subscriberStats.active, icon: Users, color: 'text-brand-400' },
          { label: 'Broadcasts Sent', value: stats.sent, icon: Send, color: 'text-green-400' },
          { label: 'Total Emails Sent', value: stats.totalEmailsSent, icon: Mail, color: 'text-violet-400' },
          { label: 'Drafts', value: stats.drafts, icon: FileText, color: 'text-yellow-400' },
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

      {/* Broadcasts Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700 bg-surface-900/40">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Subject</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Recipients</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold">Date</th>
              <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {broadcasts.map((b) => (
              <tr key={b._id} className="hover:bg-surface-800/40">
                <td className="py-3 px-4">
                  <p className="text-white font-medium truncate max-w-[300px]">{b.subject}</p>
                  {b.preview_text && (
                    <p className="text-surface-500 text-xs truncate max-w-[300px] mt-0.5">{b.preview_text}</p>
                  )}
                </td>
                <td className="py-3 px-4">{statusBadge(b.status)}</td>
                <td className="py-3 px-4 text-surface-300">
                  {b.status === 'sent' ? (
                    <span>
                      {b.sent_count}/{b.recipient_count}
                      {b.failed_count > 0 && (
                        <span className="text-red-400 ml-1">({b.failed_count} failed)</span>
                      )}
                    </span>
                  ) : b.status === 'sending' ? (
                    <span className="text-yellow-400">{b.recipient_count} queued</span>
                  ) : (
                    <span className="text-surface-500">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-surface-300">
                  {b.sent_at
                    ? new Date(b.sent_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(b._creationTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {b.status === 'draft' && (
                      <button
                        onClick={() => handleEditDraft(b)}
                        className="p-1.5 text-surface-400 hover:text-brand-400 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {(b.status === 'draft' || b.status === 'failed') && (
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 text-surface-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {broadcasts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Send className="w-8 h-8 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400">No broadcasts yet</p>
                  <p className="text-surface-500 text-xs mt-1">Create your first broadcast to send updates to subscribers</p>
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
