'use client';

import { api } from '../../../../../convex/_generated/api';
import { useState } from 'react';
import {
  Handshake,
  Search,
  Phone,
  Mail,
  Building2,
  User,
  Briefcase,
  DollarSign,
  ChevronDown,
  Trash2,
  StickyNote,
  Calendar,
  Filter,
  Loader2,
  X,
  PhoneCall,
  History,
  Send,
  FileText,
  Download,
  Paperclip,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

type AppStatus = 'new' | 'contacted' | 'qualified' | 'signed' | 'not_qualified' | 'declined';
type ActivityType = 'note' | 'call' | 'email';
type ActivityOutcome =
  | 'reached'
  | 'no_answer'
  | 'voicemail'
  | 'email_sent'
  | 'scheduled'
  | 'signed'
  | 'not_interested'
  | 'other';

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  qualified: { label: 'Qualified', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  signed: { label: 'Signed Up', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  not_qualified: { label: 'Not Qualified', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const ALL_STATUSES: AppStatus[] = ['new', 'contacted', 'qualified', 'signed', 'not_qualified', 'declined'];

const OUTCOME_LABELS: Record<ActivityOutcome, string> = {
  reached: 'Reached — spoke with them',
  no_answer: 'No answer',
  voicemail: 'Left voicemail',
  email_sent: 'Sent an email',
  scheduled: 'Scheduled a call/consultation',
  signed: 'Signed up!',
  not_interested: 'Not interested',
  other: 'Other',
};

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ActivityIcon({ type }: { type: ActivityType | 'status_change' }) {
  if (type === 'call') return <PhoneCall className="w-3.5 h-3.5 text-brand-400" />;
  if (type === 'email') return <Mail className="w-3.5 h-3.5 text-brand-400" />;
  if (type === 'status_change') return <History className="w-3.5 h-3.5 text-surface-500" />;
  return <StickyNote className="w-3.5 h-3.5 text-surface-500" />;
}

function ApplicationCard({
  application,
  onSelect,
}: {
  application: any;
  onSelect: (id: Id<'merchant_applications'>) => void;
}) {
  const date = new Date(application._creationTime);
  return (
    <button
      onClick={() => onSelect(application._id)}
      className="w-full text-left card p-5 hover:border-brand-500/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span className="text-white font-semibold truncate">{application.business_name}</span>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="space-y-1.5 text-sm text-surface-400">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{application.owner_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{application.phone}</span>
        </div>
        {application.monthly_volume && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{application.monthly_volume}</span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-800/50 mt-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-surface-500" />
          <span className="text-xs text-surface-500">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {application.statement_storage_id && (
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             text-[11px] font-medium bg-green-500/10 border border-green-500/30 text-green-400">
              <Paperclip className="w-3 h-3" />
              Statement
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ApplicationDetail({
  applicationId,
  onBack,
}: {
  applicationId: Id<'merchant_applications'>;
  onBack: () => void;
}) {
  const application = useAdminQuery(api.merchantApplications.get, { id: applicationId });
  const activities = useAdminQuery(api.merchantApplications.listActivities, { applicationId }) ?? [];
  const updateStatus = useAdminMutation(api.merchantApplications.updateStatus);
  const updateNotes = useAdminMutation(api.merchantApplications.updateNotes);
  const removeApplication = useAdminMutation(api.merchantApplications.remove);
  const logActivity = useAdminMutation(api.merchantApplications.logActivity);
  const removeStatement = useAdminMutation(api.merchantApplications.removeStatement);
  // Signed storage URLs are short-lived, so this is fetched live rather than
  // stored on the record.
  const statement = useAdminQuery(
    api.merchantApplications.getStatementUrl,
    { id: applicationId }
  );

  const [notes, setNotes] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activityType, setActivityType] = useState<ActivityType>('call');
  const [activityOutcome, setActivityOutcome] = useState<ActivityOutcome | ''>('');
  const [activityNote, setActivityNote] = useState('');
  const [logging, setLogging] = useState(false);
  const [deletingStatement, setDeletingStatement] = useState(false);

  if (!application) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  // Initialize notes from application data once loaded
  if (!notesLoaded && application) {
    setNotes(application.admin_notes || '');
    setNotesLoaded(true);
  }

  const date = new Date(application._creationTime);

  const handleStatusChange = async (newStatus: AppStatus) => {
    setStatusOpen(false);
    await updateStatus({ id: applicationId, status: newStatus });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateNotes({ id: applicationId, admin_notes: notes });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this application permanently?')) return;
    setDeleting(true);
    await removeApplication({ id: applicationId });
    onBack();
  };

  const handleDeleteStatement = async () => {
    if (!confirm('Delete this statement file permanently? The lead record stays.')) return;
    setDeletingStatement(true);
    await removeStatement({ id: applicationId });
    setDeletingStatement(false);
  };

  const handleLogActivity = async () => {
    setLogging(true);
    await logActivity({
      applicationId,
      type: activityType,
      outcome: activityOutcome || undefined,
      note: activityNote || undefined,
    });
    // Signed / not-interested outcomes nudge the pipeline stage forward automatically
    if (activityOutcome === 'signed' && application.status !== 'signed') {
      await updateStatus({ id: applicationId, status: 'signed' });
    } else if (activityOutcome === 'not_interested' && application.status !== 'declined') {
      await updateStatus({ id: applicationId, status: 'declined' });
    } else if (application.status === 'new') {
      await updateStatus({ id: applicationId, status: 'contacted' });
    }
    setActivityOutcome('');
    setActivityNote('');
    setLogging(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-surface-400 hover:text-white transition-colors">
          ← Back to Merchant Applications
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400
                     hover:bg-red-900/20 border border-red-500/20 transition-all disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>

      {/* Business info card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{application.business_name}</h2>
            <p className="text-sm text-surface-400 mt-1">
              Applied {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <button onClick={() => setStatusOpen(!statusOpen)} className="flex items-center gap-2">
              <StatusBadge status={application.status} />
              <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 z-20 rounded-lg glass border border-surface-700/50 shadow-xl py-1">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-800/60 transition-colors flex items-center gap-2 ${
                        application.status === s ? 'text-white font-medium' : 'text-surface-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].color.replace('text-', 'bg-')}`} />
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Owner / Decision Maker</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-surface-300">
                <User className="w-4 h-4 text-brand-400" />
                <span>{application.owner_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <a href={`tel:${application.phone}`} className="text-surface-300 hover:text-white transition-colors">
                  {application.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <a href={`mailto:${application.email}`} className="text-surface-300 hover:text-white transition-colors">
                  {application.email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Business Details</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-surface-300">
                <Briefcase className="w-4 h-4 text-green-400" />
                <span>{application.industry || 'Industry not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-300">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>{application.monthly_volume || 'Volume not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {application.notes && (
          <div className="pt-4 border-t border-surface-800/50">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Applicant Notes</p>
            <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{application.notes}</p>
          </div>
        )}
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3">
        <a href={`tel:${application.phone}`} className="btn-primary py-2.5 px-5">
          <Phone className="w-4 h-4 mr-2" />
          Call {application.owner_name}
        </a>
        <a
          href={`mailto:${application.email}?subject=Charity Swipes Merchant Application — ${encodeURIComponent(application.business_name)}`}
          className="btn-secondary py-2.5 px-5"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </a>
      </div>

      {/* Processing statement — the whole point of the lead magnet */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white">Processing Statement</h3>
        </div>

        {application.statement_storage_id ? (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-800/40 border border-green-500/20">
              <div className="w-10 h-10 rounded-lg bg-green-600/10 border border-green-600/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">
                  {application.statement_filename || 'statement'}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {application.statement_size_bytes
                    ? `${(application.statement_size_bytes / 1024 / 1024).toFixed(2)} MB`
                    : 'Size unknown'}
                  {application.statement_uploaded_at
                    ? ` · uploaded ${new Date(application.statement_uploaded_at).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {statement?.url ? (
                <>
                  <a
                    href={statement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Open Statement
                  </a>
                  <a
                    href={statement.url}
                    download={statement.filename}
                    className="btn-secondary py-2.5 px-5 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </>
              ) : (
                <span className="flex items-center gap-2 text-sm text-surface-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing secure link...
                </span>
              )}
              <button
                onClick={handleDeleteStatement}
                disabled={deletingStatement}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-red-400
                           hover:bg-red-900/20 border border-red-500/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingStatement ? 'Deleting...' : 'Delete file'}
              </button>
            </div>
            <p className="text-xs text-surface-500">
              This is the merchant&apos;s financial document. The link above is generated per
              request and expires — it is never publicly reachable. Delete the file once the
              analysis is done.
            </p>
          </>
        ) : (
          <div className="p-4 rounded-lg bg-surface-800/40 border border-surface-700/50">
            <p className="text-sm text-surface-300">No statement uploaded.</p>
            <p className="text-xs text-surface-500 mt-1.5">
              Ask for their most recent statement on the first call — without it the analysis is
              guesswork. They can upload it at{' '}
              <span className="text-surface-400">erictomchik.com/become-a-merchant</span>, or just
              email it over.
            </p>
            <a
              href={`mailto:${application.email}?subject=${encodeURIComponent(
                `Your free processing analysis — ${application.business_name}`
              )}&body=${encodeURIComponent(
                `Hi ${application.owner_name},\n\nThanks for requesting your free processing analysis. To run the numbers I just need your most recent credit card processing statement — you can reply to this email with it attached, or upload it here:\n\nhttps://erictomchik.com/become-a-merchant\n\nOnce I have it I'll break down exactly what you're paying today and what it could look like instead.\n\nEric Tomchik\nCharity Swipes\n(228) 344-5724`
              )}`}
              className="btn-secondary py-2 px-4 text-sm mt-4 inline-flex"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request statement by email
            </a>
          </div>
        )}
      </div>

      {/* Sales activity log — the follow-up pipeline */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white">Follow-Up Log</h3>
        </div>
        <p className="text-sm text-surface-400 -mt-2">
          Track every outreach attempt and its result so you always know where this lead stands.
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="px-3 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50 text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="note">Note</option>
          </select>
          <select
            value={activityOutcome}
            onChange={(e) => setActivityOutcome(e.target.value as ActivityOutcome | '')}
            className="px-3 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50 text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500/50 sm:col-span-2"
          >
            <option value="">Outcome (optional)</option>
            {(Object.keys(OUTCOME_LABELS) as ActivityOutcome[]).map((o) => (
              <option key={o} value={o}>
                {OUTCOME_LABELS[o]}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={activityNote}
          onChange={(e) => setActivityNote(e.target.value)}
          rows={2}
          placeholder="What happened? Any details for next time..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                     text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                     focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none text-sm"
        />

        <button
          onClick={handleLogActivity}
          disabled={logging || (!activityOutcome && !activityNote)}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {logging ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Logging...</>
          ) : (
            <><Send className="w-4 h-4 mr-1.5" /> Log Follow-Up</>
          )}
        </button>

        {/* Timeline */}
        {activities.length > 0 && (
          <div className="pt-4 border-t border-surface-800/50 space-y-3">
            {activities.map((a: any) => (
              <div key={a._id} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <ActivityIcon type={a.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.outcome && (
                      <span className="text-sm text-surface-200 font-medium">{OUTCOME_LABELS[a.outcome as ActivityOutcome]}</span>
                    )}
                    <span className="text-xs text-surface-500">
                      {new Date(a._creationTime).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {a.note && <p className="text-sm text-surface-400 mt-0.5 whitespace-pre-wrap">{a.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin notes */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white">Admin Notes</h3>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add internal notes about this merchant application..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                     text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                     focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none text-sm"
        />
        <button onClick={handleSaveNotes} disabled={saving} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...</>
          ) : (
            'Save Notes'
          )}
        </button>
      </div>
    </div>
  );
}

export default function MerchantApplicationsPage() {
  const applications = useAdminQuery(api.merchantApplications.list, {}) ?? [];
  const counts = useAdminQuery(api.merchantApplications.counts, {}) ?? {
    total: 0, new: 0, contacted: 0, qualified: 0, signed: 0, not_qualified: 0, declined: 0,
  };
  const [selectedId, setSelectedId] = useState<Id<'merchant_applications'> | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'all'>('all');
  const [statementOnly, setStatementOnly] = useState(false);

  if (selectedId) {
    return <ApplicationDetail applicationId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const statementCount = applications.filter((a: any) => a.statement_storage_id).length;

  const filtered = applications.filter((a: any) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (statementOnly && !a.statement_storage_id) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.business_name.toLowerCase().includes(q) ||
        a.owner_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake className="w-6 h-6 text-brand-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Merchant Applications</h1>
            <p className="text-sm text-surface-400">Sign-ups from the Become a Merchant page — your Clover sales pipeline</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { key: 'new' as const, label: 'New' },
          { key: 'contacted' as const, label: 'Contacted' },
          { key: 'qualified' as const, label: 'Qualified' },
          { key: 'signed' as const, label: 'Signed' },
          { key: 'not_qualified' as const, label: 'Not Qualified' },
          { key: 'declined' as const, label: 'Declined' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={`card p-3 text-center transition-all ${
              filterStatus === key ? 'border-brand-500/40 ring-1 ring-brand-500/20' : ''
            }`}
          >
            <div className={`text-xl font-bold ${STATUS_CONFIG[key].color}`}>{counts[key]}</div>
            <div className="text-xs text-surface-400 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business, owner, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setStatementOnly((v) => !v)}
          title="Leads who already sent a statement — these are ready to analyze"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap
                      border transition-all ${
                        statementOnly
                          ? 'text-green-400 border-green-500/40 bg-green-500/10'
                          : 'text-surface-300 hover:text-white border-surface-700/50 hover:border-surface-600'
                      }`}
        >
          <Paperclip className="w-3.5 h-3.5" />
          Statement ({statementCount})
        </button>
        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-surface-300
                       hover:text-white border border-surface-700/50 hover:border-surface-600 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear filter
          </button>
        )}
      </div>

      <p className="text-sm text-surface-500">
        {filtered.length} application{filtered.length !== 1 ? 's' : ''}{' '}
        {filterStatus !== 'all' ? `(${STATUS_CONFIG[filterStatus].label})` : ''}
        {statementOnly ? ' with a statement attached' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Handshake className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400">
            {applications.length === 0
              ? "No merchant applications yet. They'll appear here when someone applies on /become-a-merchant."
              : 'No applications match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((application: any) => (
            <ApplicationCard key={application._id} application={application} onSelect={setSelectedId} />
          ))}
        </div>
      )}
    </div>
  );
}
