'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import {
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
  ScrollText,
  Search,
  Trash2,
  Filter,
  User,
  Monitor,
  Bot,
  Clock,
} from 'lucide-react';

type ActorFilter = 'all' | 'admin' | 'client' | 'system';

const actorConfig: Record<string, { icon: typeof User; color: string }> = {
  admin: { icon: User, color: 'text-brand-400' },
  client: { icon: Monitor, color: 'text-green-400' },
  system: { icon: Bot, color: 'text-violet-400' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function AuditLogPage() {
  const logs = useAdminQuery(api.auditLog.list, {}) ?? [];
  const stats = useAdminQuery(api.auditLog.stats);
  const clearOld = useAdminMutation(api.auditLog.clearOld);

  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState<ActorFilter>('all');

  const filtered = logs.filter((log) => {
    if (actorFilter !== 'all' && log.actor !== actorFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.actor_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ScrollText className="w-7 h-7 text-brand-400" />
            Audit Log
          </h1>
          <p className="text-surface-400 mt-1">Track all system and admin activity</p>
        </div>
        <button
          onClick={() => { if (confirm('Clear logs older than 90 days?')) clearOld({ olderThanDays: 90 }); }}
          className="btn-secondary text-sm flex items-center gap-2 text-surface-400"
        >
          <Trash2 className="w-4 h-4" /> Clear Old Logs
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-surface-400">Total Events</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-400">{stats.last24h}</p>
            <p className="text-xs text-surface-400">Last 24h</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-violet-400">{stats.last7d}</p>
            <p className="text-xs text-surface-400">Last 7 Days</p>
          </div>
          <div className="card p-4">
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(stats.byActor).map(([actor, count]) => {
                const config = actorConfig[actor] || actorConfig.system;
                return (
                  <span key={actor} className={`text-xs px-2 py-0.5 rounded-full bg-surface-800 ${config.color}`}>
                    {actor}: {count as number}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-surface-400 text-center mt-1">By Actor</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search actions, entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['all', 'admin', 'client', 'system'] as ActorFilter[]).map((a) => (
            <button
              key={a}
              onClick={() => setActorFilter(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                actorFilter === a
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/50'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Log Timeline */}
      <div className="space-y-1">
        {filtered.map((log) => {
          const config = actorConfig[log.actor] || actorConfig.system;
          const Icon = config.icon;
          return (
            <div key={log._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-900/50 transition-colors">
              <div className="mt-0.5">
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className={`font-medium ${config.color}`}>
                    {log.actor_name || log.actor}
                  </span>
                  {' '}{log.action}{' '}
                  <span className="text-surface-300">{log.entity_type}</span>
                  {log.entity_id && (
                    <span className="text-surface-500 font-mono text-xs ml-1">#{log.entity_id.slice(-6)}</span>
                  )}
                </p>
                {log.details && (
                  <p className="text-xs text-surface-500 mt-0.5 truncate">{log.details}</p>
                )}
              </div>
              <span className="text-xs text-surface-500 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {timeAgo(log._creationTime)}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-surface-500">
            {search ? 'No matching log entries' : 'No audit log entries yet'}
          </div>
        )}
      </div>
    </div>
  );
}
