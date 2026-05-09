'use client';

import { api } from '../../../../../convex/_generated/api';
import { useState, useRef, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Bug,
  Lightbulb,
  HeadphonesIcon,
  CreditCard,
  MessageSquare,
  User,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

const categoryLabels: Record<string, string> = {
  bug: 'Bug', feature_request: 'Feature', support: 'Support', billing: 'Billing', general: 'General',
};
const priorityColors: Record<string, string> = {
  low: 'text-surface-400', medium: 'text-yellow-400', high: 'text-orange-400', urgent: 'text-red-400',
};
const statusBadge: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400', in_progress: 'bg-yellow-500/10 text-yellow-400',
  waiting_on_client: 'bg-orange-500/10 text-orange-400', resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-surface-500/10 text-surface-400',
};

function TicketDetail({ ticketId, onBack }: { ticketId: Id<'tickets'>; onBack: () => void }) {
  const ticket = useAdminQuery(api.tickets.get, { id: ticketId });
  const messages = useAdminQuery(api.tickets.getMessages, { ticketId }) ?? [];
  const client = useAdminQuery(api.clients.get, ticket ? { id: ticket.client_id } : 'skip');
  const addMessage = useAdminMutation(api.tickets.addMessage);
  const updateStatus = useAdminMutation(api.tickets.updateStatus);
  const updatePriority = useAdminMutation(api.tickets.updatePriority);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  if (!ticket) return null;

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    await addMessage({ ticket_id: ticketId, sender_type: 'admin', sender_name: 'Eric', message: newMsg.trim() });
    setNewMsg('');
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-surface-400 hover:text-brand-400">← Back to Tickets</button>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Messages */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col" style={{ height: '70vh' }}>
          <div className="p-4 border-b border-surface-800">
            <h2 className="text-lg font-semibold text-white">{ticket.subject}</h2>
            <div className="text-xs text-surface-500 mt-1">
              {client?.name} · {categoryLabels[ticket.category]} · {new Date(ticket._creationTime).toLocaleDateString()}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg._id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.sender_type === 'admin' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-surface-800 text-surface-200 rounded-bl-md'
                }`}>
                  <div className="text-xs opacity-60 mb-1">{msg.sender_name}</div>
                  <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                  <div className="text-[10px] opacity-40 mt-1 text-right">
                    {new Date(msg._creationTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-surface-800 p-3 flex gap-2">
            <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Reply as admin..." className="flex-1 px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <button onClick={handleSend} disabled={!newMsg.trim() || sending} className="btn-primary px-3 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Details</h3>
            <div>
              <label className="text-xs text-surface-500">Status</label>
              <select value={ticket.status} onChange={(e) => updateStatus({ id: ticketId, status: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_on_client">Waiting on Client</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-surface-500">Priority</label>
              <select value={ticket.priority} onChange={(e) => updatePriority({ id: ticketId, priority: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-surface-500">Category</label>
              <div className="text-sm text-white mt-1 capitalize">{ticket.category.replace('_', ' ')}</div>
            </div>
          </div>
          {client && (
            <div className="card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{client.name.charAt(0)}</div>
                <div>
                  <div className="text-sm text-white font-medium">{client.name}</div>
                  <div className="text-xs text-surface-500">{client.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  const tickets = useAdminQuery(api.tickets.list, {}) ?? [];
  const clients = useAdminQuery(api.clients.list, {}) ?? [];
  const counts = useAdminQuery(api.tickets.counts, {});
  const [selectedId, setSelectedId] = useState<Id<'tickets'> | null>(null);
  const [statusFilter, setStatusFilter] = useState('open');

  const getClientName = (id: string) => clients.find((c) => c._id === id)?.name || 'Unknown';

  const filtered = statusFilter === 'all' ? tickets :
    statusFilter === 'open' ? tickets.filter((t) => !['resolved', 'closed'].includes(t.status)) :
    tickets.filter((t) => ['resolved', 'closed'].includes(t.status));

  if (selectedId) {
    return <TicketDetail ticketId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-surface-400 mt-1">Manage and respond to client support requests.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-2xl font-bold text-blue-400">{counts?.open ?? 0}</div><div className="text-xs text-surface-400">Open</div></div>
        <div className="card p-4"><div className="text-2xl font-bold text-yellow-400">{counts?.in_progress ?? 0}</div><div className="text-xs text-surface-400">In Progress</div></div>
        <div className="card p-4"><div className="text-2xl font-bold text-orange-400">{counts?.waiting ?? 0}</div><div className="text-xs text-surface-400">Waiting</div></div>
        <div className="card p-4"><div className="text-2xl font-bold text-green-400">{counts?.resolved ?? 0}</div><div className="text-xs text-surface-400">Resolved</div></div>
      </div>

      <div className="flex gap-2">
        {[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }].map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === f.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tickets</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <button key={ticket._id} onClick={() => setSelectedId(ticket._id)}
              className="card w-full flex items-center gap-4 p-4 text-left group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                ticket.priority === 'urgent' ? 'bg-red-500/10' : ticket.priority === 'high' ? 'bg-orange-500/10' : 'bg-surface-800'
              }`}>
                {ticket.priority === 'urgent' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                 ticket.status === 'resolved' || ticket.status === 'closed' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                 <Clock className="w-5 h-5 text-surface-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">{ticket.subject}</div>
                <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {getClientName(ticket.client_id)}</span>
                  <span>·</span>
                  <span>{categoryLabels[ticket.category]}</span>
                  <span>·</span>
                  <span className={priorityColors[ticket.priority]}>{ticket.priority}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[ticket.status] || ''}`}>{ticket.status.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
