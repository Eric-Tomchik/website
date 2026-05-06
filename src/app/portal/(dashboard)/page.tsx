'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { usePortalAuth } from '../PortalAuthContext';
import Link from 'next/link';
import {
  FolderKanban,
  LifeBuoy,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  discovery: 'bg-blue-500/10 text-blue-400',
  proposal: 'bg-purple-500/10 text-purple-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  review: 'bg-orange-500/10 text-orange-400',
  completed: 'bg-green-500/10 text-green-400',
  on_hold: 'bg-surface-500/10 text-surface-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  discovery: 'Discovery',
  proposal: 'Proposal',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export default function PortalDashboardPage() {
  const { client } = usePortalAuth();
  const projects = useQuery(
    api.projects.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const tickets = useQuery(
    api.tickets.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const documents = useQuery(
    api.clientDocuments.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];

  const activeProjects = projects.filter(
    (p) => !['completed', 'cancelled'].includes(p.status)
  );
  const openTickets = tickets.filter(
    (t) => !['resolved', 'closed'].includes(t.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {client?.name?.split(' ')[0]}
        </h1>
        <p className="text-surface-400 mt-1">
          Here&apos;s an overview of your projects and support requests.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <FolderKanban className="w-5 h-5 text-brand-400" />
            <span className="text-xs text-surface-500">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">{activeProjects.length}</div>
          <div className="text-xs text-surface-400 mt-1">Projects</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-surface-500">All time</span>
          </div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-surface-400 mt-1">Total Projects</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <LifeBuoy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-surface-500">Open</span>
          </div>
          <div className="text-2xl font-bold text-white">{openTickets.length}</div>
          <div className="text-xs text-surface-400 mt-1">Support Tickets</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-surface-500">Files</span>
          </div>
          <div className="text-2xl font-bold text-white">{documents.length}</div>
          <div className="text-xs text-surface-400 mt-1">Documents</div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
          <Link href="/portal/projects" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <p className="text-surface-500 text-sm py-4">No active projects right now.</p>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <Link
                key={project._id}
                href="/portal/projects"
                className="block p-4 rounded-xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-white font-medium">{project.title}</h3>
                    {project.description && (
                      <p className="text-xs text-surface-400 mt-1 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] || ''}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-surface-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${project.progress_percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-surface-400 font-medium">{project.progress_percent}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Support Tickets</h2>
          <Link href="/portal/tickets/new" className="btn-primary text-sm py-1.5 px-3">
            New Ticket
          </Link>
        </div>
        {tickets.length === 0 ? (
          <p className="text-surface-500 text-sm py-4">No support tickets yet.</p>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket._id}
                href={`/portal/tickets?id=${ticket._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-900/50 border border-surface-800 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-sm text-white font-medium">{ticket.subject}</div>
                    <div className="text-xs text-surface-500">{ticket.category.replace('_', ' ')}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                  ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' :
                  ticket.status === 'waiting_on_client' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-green-500/10 text-green-400'
                }`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
