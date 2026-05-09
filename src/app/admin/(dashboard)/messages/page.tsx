'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import {
  MessageSquare,
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Briefcase,
  Reply,
} from 'lucide-react';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

const serviceLabels: Record<string, string> = {
  starter: 'Starter Site',
  'business-pro': 'Business Pro',
  'custom-app': 'Custom Application',
  other: 'Other / General Inquiry',
};

export default function AdminMessagesPage() {
  const messages = useAdminQuery(api.contacts.list, {}) ?? [];
  const markRead = useAdminMutation(api.contacts.markRead);
  const markUnread = useAdminMutation(api.contacts.markUnread);
  const removeMessage = useAdminMutation(api.contacts.remove);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const readCount = messages.filter((m) => m.is_read).length;

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'read') return m.is_read;
    return true;
  });

  const handleExpand = async (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        await markRead({ id: id as Id<'contact_messages'> });
      }
    }
  };

  const handleDelete = async (id: Id<'contact_messages'>) => {
    if (!confirm('Delete this message permanently?')) return;
    await removeMessage({ id });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-surface-400 mt-1">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'All', count: messages.length },
          { key: 'unread' as const, label: 'Unread', count: unreadCount },
          { key: 'read' as const, label: 'Read', count: readCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === tab.key
                ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                : 'bg-surface-800/50 text-surface-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === tab.key ? 'bg-brand-600/30 text-brand-300' : 'bg-surface-700 text-surface-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">
            {filter === 'unread'
              ? 'No unread messages. You\'re all caught up!'
              : filter === 'read'
                ? 'No read messages yet.'
                : 'No messages yet. They\'ll appear here when someone fills out your contact form.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <div
              key={msg._id}
              className={`card overflow-hidden transition-all ${
                !msg.is_read ? 'border-l-2 border-l-brand-500' : ''
              }`}
            >
              {/* Message header row */}
              <button
                onClick={() => handleExpand(msg._id, msg.is_read)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-800/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {msg.is_read ? (
                      <MailOpen className="w-5 h-5 text-surface-500" />
                    ) : (
                      <Mail className="w-5 h-5 text-brand-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        msg.is_read ? 'text-surface-300' : 'text-white'
                      }`}>
                        {msg.name}
                      </span>
                      {!msg.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <div className={`text-sm truncate ${
                      msg.is_read ? 'text-surface-500' : 'text-surface-300'
                    }`}>
                      {msg.subject}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {msg.service_interest && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-400">
                      {serviceLabels[msg.service_interest] || msg.service_interest}
                    </span>
                  )}
                  <span className="text-xs text-surface-500 whitespace-nowrap">
                    {new Date(msg._creationTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {expandedId === msg._id ? (
                    <ChevronUp className="w-4 h-4 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-400" />
                  )}
                </div>
              </button>

              {/* Expanded message details */}
              {expandedId === msg._id && (
                <div className="px-5 pb-5 border-t border-surface-800 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">From:</span>
                      <span className="text-white font-medium">{msg.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">Email:</span>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        {msg.email}
                      </a>
                    </div>
                    {msg.service_interest && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-surface-500" />
                        <span className="text-surface-400">Service:</span>
                        <span className="text-white">
                          {serviceLabels[msg.service_interest] || msg.service_interest}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">Received:</span>
                      <span className="text-white">
                        {new Date(msg._creationTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="bg-surface-800/50 rounded-lg p-4">
                    <div className="text-xs text-surface-500 uppercase tracking-wider mb-2 font-semibold">
                      Message
                    </div>
                    <div className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="btn-primary text-sm"
                    >
                      <Reply className="w-4 h-4 mr-1.5" />
                      Reply
                    </a>
                    <button
                      onClick={() =>
                        msg.is_read
                          ? markUnread({ id: msg._id as Id<'contact_messages'> })
                          : markRead({ id: msg._id as Id<'contact_messages'> })
                      }
                      className="btn-secondary text-sm"
                    >
                      {msg.is_read ? (
                        <>
                          <Mail className="w-4 h-4 mr-1.5" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <MailOpen className="w-4 h-4 mr-1.5" />
                          Mark Read
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id as Id<'contact_messages'>)}
                      className="ml-auto p-2 rounded-lg text-surface-400 hover:text-red-400
                                 hover:bg-red-900/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
