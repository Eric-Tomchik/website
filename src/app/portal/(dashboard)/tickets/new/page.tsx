'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { usePortalAuth } from '../../../PortalAuthContext';
import Link from 'next/link';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function NewTicketPage() {
  const { client } = usePortalAuth();
  const router = useRouter();
  const createTicket = useMutation(api.tickets.create);
  const projects = useQuery(
    api.projects.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature_request' | 'support' | 'billing' | 'general'>('support');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [projectId, setProjectId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setSubmitting(true);
    setError('');

    try {
      const ticketId = await createTicket({
        client_id: client._id,
        project_id: projectId ? (projectId as Id<'projects'>) : undefined,
        subject,
        category,
        priority,
        message,
        sender_name: client.name,
      });
      router.push(`/portal/tickets?id=${ticketId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/portal/tickets"
        className="inline-flex items-center text-sm text-surface-400 hover:text-brand-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to tickets
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">New Support Ticket</h1>
        <p className="text-surface-400 mt-1">Describe your issue and we&apos;ll get back to you ASAP.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Brief description of your issue"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500 placeholder:text-surface-500"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500"
            >
              <option value="bug">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="support">Support</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500"
            >
              <option value="">None / General</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">Description *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="Describe your issue in detail. Include steps to reproduce for bugs, screenshots if possible, etc."
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500 placeholder:text-surface-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !subject.trim() || !message.trim()}
            className="btn-primary py-2.5 px-6 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
