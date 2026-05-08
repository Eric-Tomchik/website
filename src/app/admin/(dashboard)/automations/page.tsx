'use client';

import { useState } from 'react';
import {
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  RefreshCw,
  Mail,
  Bell,
  FileText,
  Calendar,
  Shield,
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  schedule?: string;
  icon: typeof Zap;
  color: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  runCount: number;
}

const AUTOMATIONS: Automation[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    description: 'Send welcome email to new newsletter subscribers',
    trigger: 'On new subscriber',
    icon: Mail,
    color: 'text-green-400',
    status: 'active',
    lastRun: 'Not run yet',
    runCount: 0,
  },
  {
    id: 'order-notification',
    name: 'Order Notification',
    description: 'Notify admin when a new order is placed',
    trigger: 'On new order',
    icon: Bell,
    color: 'text-brand-400',
    status: 'active',
    lastRun: 'Not run yet',
    runCount: 0,
  },
  {
    id: 'invoice-reminder',
    name: 'Invoice Reminder',
    description: 'Auto-remind clients about overdue invoices',
    trigger: 'Daily check',
    schedule: 'Every day at 9:00 AM',
    icon: FileText,
    color: 'text-yellow-400',
    status: 'paused',
    lastRun: 'Not run yet',
    runCount: 0,
  },
  {
    id: 'social-scheduler',
    name: 'Social Post Scheduler',
    description: 'Publish scheduled social media posts',
    trigger: 'Cron schedule',
    schedule: 'Every 30 minutes',
    icon: Calendar,
    color: 'text-violet-400',
    status: 'paused',
    lastRun: 'Not run yet',
    runCount: 0,
  },
  {
    id: 'backup-reminder',
    name: 'Backup Reminder',
    description: 'Weekly reminder to check backups and system health',
    trigger: 'Weekly',
    schedule: 'Every Monday at 8:00 AM',
    icon: Shield,
    color: 'text-red-400',
    status: 'active',
    lastRun: 'Not run yet',
    runCount: 0,
  },
  {
    id: 'audit-cleanup',
    name: 'Audit Log Cleanup',
    description: 'Automatically clean up audit logs older than 90 days',
    trigger: 'Monthly',
    schedule: '1st of every month',
    icon: RefreshCw,
    color: 'text-surface-400',
    status: 'active',
    lastRun: 'Not run yet',
    runCount: 0,
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'text-green-400 bg-green-500/20', icon: CheckCircle2 },
  paused: { label: 'Paused', color: 'text-yellow-400 bg-yellow-500/20', icon: Pause },
  error: { label: 'Error', color: 'text-red-400 bg-red-500/20', icon: AlertTriangle },
};

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(AUTOMATIONS);

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' }
          : a
      )
    );
  };

  const activeCount = automations.filter((a) => a.status === 'active').length;
  const pausedCount = automations.filter((a) => a.status === 'paused').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-400" />
            Scheduled Tasks & Automations
          </h1>
          <p className="text-surface-400 mt-1">
            {activeCount} active · {pausedCount} paused
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xl font-bold text-white">{activeCount}</p>
            <p className="text-xs text-surface-400">Active</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Pause className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xl font-bold text-white">{pausedCount}</p>
            <p className="text-xs text-surface-400">Paused</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-brand-400" />
          <div>
            <p className="text-xl font-bold text-white">{automations.reduce((s, a) => s + a.runCount, 0)}</p>
            <p className="text-xs text-surface-400">Total Runs</p>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {automations.map((auto) => {
          const status = statusConfig[auto.status];
          const StatusIcon = status.icon;
          return (
            <div key={auto.id} className="card p-5 flex items-center gap-4 hover:border-brand-500/20 transition-colors">
              <div className={`p-3 rounded-xl bg-surface-800`}>
                <auto.icon className={`w-6 h-6 ${auto.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium">{auto.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                    <StatusIcon className="w-3 h-3" /> {status.label}
                  </span>
                </div>
                <p className="text-sm text-surface-400 mt-0.5">{auto.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {auto.trigger}
                  </span>
                  {auto.schedule && (
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {auto.schedule}
                    </span>
                  )}
                  {auto.lastRun && (
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> {auto.lastRun}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(auto.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    auto.status === 'active'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-surface-800 text-surface-400 hover:text-white'
                  }`}
                  title={auto.status === 'active' ? 'Pause' : 'Activate'}
                >
                  {auto.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-white transition-colors" title="Configure">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-4 bg-surface-900/50 border-dashed border-surface-700">
        <p className="text-sm text-surface-400 text-center">
          💡 <span className="text-surface-300">Pro tip:</span> Automations run server-side via Convex scheduled functions.
          Configure email providers and webhook integrations in <a href="/admin/settings" className="text-brand-400 hover:underline">Settings</a> to enable email-based automations.
        </p>
      </div>
    </div>
  );
}
