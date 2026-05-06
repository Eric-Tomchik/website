'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { usePortalAuth } from '../../PortalAuthContext';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  Bug,
  Lightbulb,
  HeadphonesIcon,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';

const categoryIcons: Record<string, typeof Bug> = {
  bug: Bug,
  feature_request: Lightbulb,
  support: HeadphonesIcon,
  billing: CreditCard,
  general: MessageSquare,
};

const categoryLabels: Record<string, string> = {
  bug: 'Bug Report',
  feature_request: 'Feature Request',
  support: 'Support',
  billing: 'Billing',
  general: 'General',
};

const priorityColors: Record<string, string> = {
  low: 'text-surface-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

const statusBadge: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  waiting_on_client: 'bg-orange-500/10 text-orange-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-surface-500/10 text-surface-400',
};

function TicketThread({ ticketId, clientName }: { ticketId: Id<'tickets'>; clientName: string }) {
  const messages = useQuery(api.tickets.getMessages, { ticketId }) ?? [];
  const addMessage = useMutation(api.tickets.addMessage);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await addMessage({
        ticket_id: ticketId,
        sender_type: 'client',
        sender_name: clientName,
        message: newMsg.trim(),
      });
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.sender_type === 'client'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'bg-surface-800 text-surface-200 rounded-bl-md'
              }`}
            >
              <div className="text-xs opacity-60 mb-1">{msg.sender_name}</div>
              <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
              <div className="text-[10px] opacity-40 mt-1 text-right">
                {new Date(msg._creationTime).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-800 p-3">
        <div className="flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="btn-primary px-3 py-2.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortalTicketsPage() {
  const { client } = usePortalAuth();
  const tickets = useQuery(
    api.tickets.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const selectedTicket = tickets.find((t) => t._id === selectedId);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filtered = statusFilter === 'all'
    ? tickets
    : statusFilter === 'open'
    ? tickets.filter((t) => !['resolved', 'closed'].includes(t.status))
    : tickets.filter((t) => ['resolved', 'closed'].includes(t.status));

  if (selectedTicket && client) {
    const CatIcon = categoryIcons[selectedTicket.category] || MessageSquare;
    return (
      <div className="space-y-4">
        <Link
          href="/portal/tickets"
          className="inline-flex items-center text-sm text-surface-400 hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to tickets
        </Link>

        <div className="card overflow-hidden">
          {/* Ticket header */}
          <div className="p-5 border-b border-surface-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CatIcon className="w-5 h-5 text-brand-400 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                    <span>{categoryLabels[selectedTicket.category]}</span>
                    <span>·</span>
                    <span className={priorityColors[selectedTicket.priority]}>{selectedTicket.priority} priority</span>
                    <span>·</span>
                    <span>
                      {new Date(selectedTicket._creationTime).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[selectedTicket.status] || ''}`}>
                {selectedTicket.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Messages */}
          <TicketThread ticketId={selectedTicket._id} clientName={client.name} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-surface-400 mt-1">Submit and track support requests.</p>
        </div>
        <Link href="/portal/tickets/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'resolved', label: 'Resolved' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="card p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tickets yet</h3>
          <p className="text-surface-400 text-sm mb-4">Need help with your project? Submit a support ticket.</p>
          <Link href="/portal/tickets/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Submit a Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => {
            const CatIcon = categoryIcons[ticket.category] || MessageSquare;
            return (
              <Link
                key={ticket._id}
                href={`/portal/tickets?id=${ticket._id}`}
                className="card flex items-center gap-4 p-4 group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ticket.status === 'resolved' || ticket.status === 'closed'
                    ? 'bg-green-500/10' : 'bg-surface-800'
                }`}>
                  {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : ticket.priority === 'urgent' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CatIcon className="w-5 h-5 text-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">
                    {ticket.subject}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-500">
                    <span>{categoryLabels[ticket.category]}</span>
                    <span>·</span>
                    <span className={priorityColors[ticket.priority]}>{ticket.priority}</span>
                    <span>·</span>
                    <span>
                      {new Date(ticket._creationTime).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[ticket.status] || ''}`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
