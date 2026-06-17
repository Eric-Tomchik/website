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
  ChevronDown,
  Trash2,
  StickyNote,
  Calendar,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

type ReferralStatus = 'new' | 'contacted' | 'qualified' | 'signed' | 'not_qualified' | 'declined';

const STATUS_CONFIG: Record<ReferralStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  qualified: { label: 'Qualified', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  signed: { label: 'Signed Up', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  not_qualified: { label: 'Not Qualified', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const ALL_STATUSES: ReferralStatus[] = ['new', 'contacted', 'qualified', 'signed', 'not_qualified', 'declined'];

function StatusBadge({ status }: { status: ReferralStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ReferralCard({
  referral,
  onSelect,
}: {
  referral: any;
  onSelect: (id: Id<'referrals'>) => void;
}) {
  const date = new Date(referral._creationTime);
  return (
    <button
      onClick={() => onSelect(referral._id)}
      className="w-full text-left card p-5 hover:border-brand-500/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span className="text-white font-semibold truncate">{referral.business_name}</span>
        </div>
        <StatusBadge status={referral.status} />
      </div>

      <div className="space-y-1.5 text-sm text-surface-400">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{referral.owner_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{referral.business_phone}</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-surface-800/50 mt-1.5">
          <span className="text-xs text-surface-500">Referred by</span>
          <span className="text-xs text-surface-300">{referral.referrer_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-surface-500" />
          <span className="text-xs text-surface-500">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </button>
  );
}

function ReferralDetail({
  referralId,
  onBack,
}: {
  referralId: Id<'referrals'>;
  onBack: () => void;
}) {
  const referral = useAdminQuery(api.referrals.get, { id: referralId });
  const updateStatus = useAdminMutation(api.referrals.updateStatus);
  const updateNotes = useAdminMutation(api.referrals.updateNotes);
  const removeReferral = useAdminMutation(api.referrals.remove);
  const [notes, setNotes] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!referral) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  // Initialize notes from referral data once loaded
  if (!notesLoaded && referral) {
    setNotes(referral.admin_notes || '');
    setNotesLoaded(true);
  }

  const date = new Date(referral._creationTime);

  const handleStatusChange = async (newStatus: ReferralStatus) => {
    setStatusOpen(false);
    await updateStatus({ id: referralId, status: newStatus });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateNotes({ id: referralId, admin_notes: notes });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this referral permanently?')) return;
    setDeleting(true);
    await removeReferral({ id: referralId });
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-surface-400 hover:text-white transition-colors">
          ← Back to Referrals
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
            <h2 className="text-2xl font-bold text-white">{referral.business_name}</h2>
            <p className="text-sm text-surface-400 mt-1">
              Submitted {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex items-center gap-2"
            >
              <StatusBadge status={referral.status} />
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
                        referral.status === s ? 'text-white font-medium' : 'text-surface-300'
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
          {/* Business owner info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Owner / Decision Maker</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-surface-300">
                <User className="w-4 h-4 text-brand-400" />
                <span>{referral.owner_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <a href={`tel:${referral.business_phone}`} className="text-surface-300 hover:text-white transition-colors">
                  {referral.business_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Referrer info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Referred By</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-surface-300">
                <User className="w-4 h-4 text-green-400" />
                <span>{referral.referrer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <a href={`tel:${referral.referrer_phone}`} className="text-surface-300 hover:text-white transition-colors">
                  {referral.referrer_phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400" />
                <a href={`mailto:${referral.referrer_email}`} className="text-surface-300 hover:text-white transition-colors">
                  {referral.referrer_email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Referrer notes */}
        {referral.notes && (
          <div className="pt-4 border-t border-surface-800/50">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Referrer Notes</p>
            <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{referral.notes}</p>
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
          placeholder="Add internal notes about this referral..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                     text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                     focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none text-sm"
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...</>
          ) : (
            'Save Notes'
          )}
        </button>
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`tel:${referral.business_phone}`}
          className="btn-primary py-2.5 px-5"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call {referral.owner_name}
        </a>
        <a
          href={`mailto:${referral.referrer_email}?subject=Referral Update: ${encodeURIComponent(referral.business_name)}`}
          className="btn-secondary py-2.5 px-5"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Referrer
        </a>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  const referrals = useAdminQuery(api.referrals.list, {}) ?? [];
  const counts = useAdminQuery(api.referrals.counts, {}) ?? {
    total: 0, new: 0, contacted: 0, qualified: 0, signed: 0, not_qualified: 0, declined: 0,
  };
  const [selectedId, setSelectedId] = useState<Id<'referrals'> | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReferralStatus | 'all'>('all');

  if (selectedId) {
    return <ReferralDetail referralId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const filtered = referrals.filter((r: any) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.business_name.toLowerCase().includes(q) ||
        r.owner_name.toLowerCase().includes(q) ||
        r.referrer_name.toLowerCase().includes(q) ||
        r.referrer_email.toLowerCase().includes(q)
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
            <h1 className="text-2xl font-bold text-white">Referrals</h1>
            <p className="text-sm text-surface-400">Clover Cash Discount Program referral submissions</p>
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
            <div className={`text-xl font-bold ${STATUS_CONFIG[key].color}`}>
              {counts[key]}
            </div>
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
            placeholder="Search by business, owner, or referrer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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

      {/* Results count */}
      <p className="text-sm text-surface-500">
        {filtered.length} referral{filtered.length !== 1 ? 's' : ''}{' '}
        {filterStatus !== 'all' ? `(${STATUS_CONFIG[filterStatus].label})` : ''}
      </p>

      {/* Referral grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Handshake className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400">
            {referrals.length === 0
              ? 'No referrals yet. They\'ll appear here when submitted through the Clover page.'
              : 'No referrals match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((referral: any) => (
            <ReferralCard
              key={referral._id}
              referral={referral}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
