'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Users,
  Mail,
  Send,
  RefreshCw,
  AlertCircle,
  X,
  Save,
  GripVertical,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface DripSequence {
  _id: string;
  name: string;
  description?: string;
  trigger: 'on_subscribe' | 'manual';
  is_active: boolean;
  enrolled_count: number;
  completed_count: number;
  total_sent: number;
}

interface DripStep {
  _id: string;
  sequence_id: string;
  step_order: number;
  subject: string;
  preview_text?: string;
  content: string;
  delay_hours: number;
}

interface DripEnrollment {
  _id: string;
  sequence_id: string;
  email: string;
  current_step: number;
  status: 'active' | 'completed' | 'paused' | 'unsubscribed';
  enrolled_at: number;
  next_send_at: number;
  last_sent_at?: number;
  emails_sent: number;
}

interface DripStats {
  sequences: number;
  activeSequences: number;
  totalEnrolled: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalEmailsSent: number;
}

/* ─── API helpers ────────────────────────────────────────────────────── */

function getAdminKey(): string {
  const match = document.cookie.match(/admin_ck=([^;]+)/);
  return match?.[1] ?? '';
}

const CONVEX = process.env.NEXT_PUBLIC_CONVEX_URL!;

async function convexQuery(path: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args: { ...args, adminKey: getAdminKey() } }),
  });
  const data = await res.json();
  return data.value;
}

async function convexMutation(path: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args: { ...args, adminKey: getAdminKey() } }),
  });
  const data = await res.json();
  return data.value;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatDelay(hours: number): string {
  if (hours === 0) return 'Immediately';
  if (hours < 24) return `${hours}h after previous`;
  const days = Math.round(hours / 24);
  return `${days}d after previous`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ─── Components ─────────────────────────────────────────────────────── */

function StepEditor({
  step,
  onSave,
  onCancel,
  isNew,
}: {
  step: Partial<DripStep>;
  onSave: (data: { subject: string; preview_text?: string; content: string; delay_hours: number }) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [subject, setSubject] = useState(step.subject ?? '');
  const [previewText, setPreviewText] = useState(step.preview_text ?? '');
  const [content, setContent] = useState(step.content ?? '');
  const [delayHours, setDelayHours] = useState(step.delay_hours ?? 0);
  const [delayUnit, setDelayUnit] = useState<'hours' | 'days'>(
    (step.delay_hours ?? 0) >= 24 ? 'days' : 'hours',
  );
  const [delayValue, setDelayValue] = useState(
    (step.delay_hours ?? 0) >= 24 ? Math.round((step.delay_hours ?? 0) / 24) : (step.delay_hours ?? 0),
  );

  const handleSave = () => {
    const hours = delayUnit === 'days' ? delayValue * 24 : delayValue;
    onSave({
      subject,
      preview_text: previewText || undefined,
      content,
      delay_hours: hours,
    });
  };

  return (
    <div className="card p-4 border-brand-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{isNew ? 'New Step' : 'Edit Step'}</h4>
        <button onClick={onCancel} className="p-1 text-surface-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-surface-400 block mb-1">Delay</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={delayValue}
              onChange={(e) => setDelayValue(parseInt(e.target.value) || 0)}
              className="w-20 bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
            />
            <select
              value={delayUnit}
              onChange={(e) => setDelayUnit(e.target.value as 'hours' | 'days')}
              className="bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[11px] text-surface-400 block mb-1">Preview Text (optional)</label>
          <input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Short preview..."
            className="w-full bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] text-surface-400 block mb-1">Subject Line</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          className="w-full bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[11px] text-surface-400 block mb-1">Content (HTML)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="<p>Hello!</p>..."
          className="w-full bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none font-mono text-xs"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!subject.trim() || !content.trim()}
          className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {isNew ? 'Add Step' : 'Update'}
        </button>
      </div>
    </div>
  );
}

function SequenceCard({
  seq,
  onRefresh,
}: {
  seq: DripSequence;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<DripStep[]>([]);
  const [enrollments, setEnrollments] = useState<DripEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null); // step _id or 'new'
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([
        convexQuery('dripSequences:getSteps', { sequenceId: seq._id }),
        convexQuery('dripSequences:getEnrollments', { sequenceId: seq._id }),
      ]);
      setSteps(s ?? []);
      setEnrollments(e ?? []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [seq._id]);

  useEffect(() => {
    if (expanded) loadDetails();
  }, [expanded, loadDetails]);

  const toggleActive = async () => {
    setBusy(true);
    await convexMutation('dripSequences:update', { id: seq._id, is_active: !seq.is_active });
    onRefresh();
    setBusy(false);
  };

  const deleteSequence = async () => {
    if (!confirm(`Delete "${seq.name}" and all its steps/enrollments?`)) return;
    setBusy(true);
    await convexMutation('dripSequences:remove', { id: seq._id });
    onRefresh();
    setBusy(false);
  };

  const addStep = async (data: { subject: string; preview_text?: string; content: string; delay_hours: number }) => {
    setBusy(true);
    await convexMutation('dripSequences:addStep', { sequenceId: seq._id, ...data });
    setEditingStep(null);
    await loadDetails();
    setBusy(false);
  };

  const updateStep = async (stepId: string, data: { subject: string; preview_text?: string; content: string; delay_hours: number }) => {
    setBusy(true);
    await convexMutation('dripSequences:updateStep', { id: stepId, ...data });
    setEditingStep(null);
    await loadDetails();
    setBusy(false);
  };

  const deleteStep = async (stepId: string) => {
    if (!confirm('Delete this step?')) return;
    setBusy(true);
    await convexMutation('dripSequences:removeStep', { id: stepId });
    await loadDetails();
    setBusy(false);
  };

  const manualEnroll = async () => {
    if (!enrollEmail.trim()) return;
    setBusy(true);
    const result = await convexMutation('dripSequences:enroll', { sequenceId: seq._id, email: enrollEmail.trim() });
    if (result?.alreadyEnrolled) {
      setFeedback('Already enrolled');
    } else if (result?.error) {
      setFeedback(result.error);
    } else {
      setFeedback('Enrolled!');
      setEnrollEmail('');
      await loadDetails();
      onRefresh();
    }
    setBusy(false);
    setTimeout(() => setFeedback(''), 3000);
  };

  const pauseResumeEnrollment = async (id: string, isPaused: boolean) => {
    setBusy(true);
    if (isPaused) {
      await convexMutation('dripSequences:resumeEnrollment', { id });
    } else {
      await convexMutation('dripSequences:pauseEnrollment', { id });
    }
    await loadDetails();
    setBusy(false);
  };

  const removeEnrollment = async (id: string) => {
    setBusy(true);
    await convexMutation('dripSequences:removeEnrollment', { id });
    await loadDetails();
    setBusy(false);
  };

  return (
    <div className={`card overflow-hidden transition-colors ${seq.is_active ? 'border-green-500/20' : 'border-surface-800'}`}>
      {/* Header */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-surface-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
        )}
        <div className="p-2.5 rounded-xl bg-surface-800">
          <Mail className={`w-5 h-5 ${seq.is_active ? 'text-green-400' : 'text-surface-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium text-sm">{seq.name}</h3>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                seq.is_active ? 'bg-green-500/20 text-green-400' : 'bg-surface-800 text-surface-500'
              }`}
            >
              {seq.is_active ? 'Active' : 'Paused'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-800 text-surface-400">
              {seq.trigger === 'on_subscribe' ? '⚡ Auto' : '✋ Manual'}
            </span>
          </div>
          {seq.description && <p className="text-xs text-surface-400 mt-0.5 truncate">{seq.description}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs text-surface-400 flex-shrink-0">
          <span className="flex items-center gap-1" title="Enrolled">
            <Users className="w-3 h-3" /> {seq.enrolled_count}
          </span>
          <span className="flex items-center gap-1" title="Completed">
            <CheckCircle2 className="w-3 h-3" /> {seq.completed_count}
          </span>
          <span className="flex items-center gap-1" title="Emails sent">
            <Send className="w-3 h-3" /> {seq.total_sent}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={toggleActive}
            disabled={busy}
            className={`p-2 rounded-lg transition-colors ${
              seq.is_active
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
            title={seq.is_active ? 'Pause' : 'Activate'}
          >
            {seq.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={deleteSequence}
            disabled={busy}
            className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-surface-800 p-4 space-y-4">
          {loading ? (
            <div className="text-sm text-surface-400 text-center py-4">Loading…</div>
          ) : (
            <>
              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                    Steps ({steps.length})
                  </h4>
                  <button
                    onClick={() => setEditingStep('new')}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>

                {steps.length === 0 && editingStep !== 'new' && (
                  <p className="text-xs text-surface-500 py-2">No steps yet. Add one to get started.</p>
                )}

                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={step._id}>
                      {editingStep === step._id ? (
                        <StepEditor
                          step={step}
                          onSave={(data) => updateStep(step._id, data)}
                          onCancel={() => setEditingStep(null)}
                          isNew={false}
                        />
                      ) : (
                        <div className="flex items-start gap-3 p-3 bg-surface-900/50 rounded-lg border border-surface-800 group">
                          <div className="flex flex-col items-center gap-1 pt-0.5">
                            <div className="w-6 h-6 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                              <div className="w-px h-4 bg-surface-700" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium truncate">{step.subject}</span>
                              <span className="text-[10px] text-surface-500 flex items-center gap-0.5 flex-shrink-0">
                                <Clock className="w-2.5 h-2.5" /> {formatDelay(step.delay_hours)}
                              </span>
                            </div>
                            {step.preview_text && (
                              <p className="text-[11px] text-surface-400 mt-0.5 truncate">{step.preview_text}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => setEditingStep(step._id)}
                              className="p-1.5 rounded text-surface-400 hover:text-white hover:bg-surface-800"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteStep(step._id)}
                              className="p-1.5 rounded text-surface-400 hover:text-red-400 hover:bg-surface-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingStep === 'new' && (
                    <StepEditor
                      step={{ delay_hours: steps.length === 0 ? 0 : 72 }}
                      onSave={addStep}
                      onCancel={() => setEditingStep(null)}
                      isNew
                    />
                  )}
                </div>
              </div>

              {/* Manual enrollment */}
              <div className="border-t border-surface-800 pt-4">
                <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                  Enroll Subscriber
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && manualEnroll()}
                    placeholder="subscriber@example.com"
                    className="flex-1 bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={manualEnroll}
                    disabled={busy || !enrollEmail.trim()}
                    className="px-3 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-500 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Enroll
                  </button>
                </div>
                {feedback && <p className="text-xs text-brand-400 mt-1">{feedback}</p>}
              </div>

              {/* Enrollments */}
              {enrollments.length > 0 && (
                <div className="border-t border-surface-800 pt-4">
                  <button
                    onClick={() => setShowEnrollments(!showEnrollments)}
                    className="text-xs font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-1 hover:text-white"
                  >
                    {showEnrollments ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Enrollments ({enrollments.length})
                  </button>

                  {showEnrollments && (
                    <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                      {enrollments.map((e) => {
                        const statusColors: Record<string, string> = {
                          active: 'text-green-400 bg-green-500/10',
                          completed: 'text-blue-400 bg-blue-500/10',
                          paused: 'text-yellow-400 bg-yellow-500/10',
                          unsubscribed: 'text-red-400 bg-red-500/10',
                        };
                        return (
                          <div key={e._id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-900/50 text-xs">
                            <span className="text-white font-medium flex-1 truncate">{e.email}</span>
                            <span className="text-surface-500">
                              Step {e.current_step + 1}/{steps.length} · {e.emails_sent} sent
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[e.status]}`}>
                              {e.status}
                            </span>
                            {e.status === 'active' && (
                              <span className="text-surface-500 text-[10px]">
                                next: {e.next_send_at > Date.now() ? timeAgo(Date.now() - (e.next_send_at - Date.now())).replace(' ago', '') : 'due'}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              {(e.status === 'active' || e.status === 'paused') && (
                                <button
                                  onClick={() => pauseResumeEnrollment(e._id, e.status === 'paused')}
                                  className="p-1 text-surface-400 hover:text-white"
                                  title={e.status === 'paused' ? 'Resume' : 'Pause'}
                                >
                                  {e.status === 'paused' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                </button>
                              )}
                              <button
                                onClick={() => removeEnrollment(e._id)}
                                className="p-1 text-surface-400 hover:text-red-400"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Create Sequence Modal ──────────────────────────────────────────── */

function CreateSequenceForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<'on_subscribe' | 'manual'>('on_subscribe');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    setBusy(true);
    await convexMutation('dripSequences:create', {
      name,
      description: description || undefined,
      trigger,
    });
    setBusy(false);
    onCreated();
  };

  return (
    <div className="card p-5 border-brand-500/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">New Drip Sequence</h3>
        <button onClick={onCancel} className="p-1 text-surface-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div>
        <label className="text-[11px] text-surface-400 block mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Welcome Series"
          className="w-full bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[11px] text-surface-400 block mb-1">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this sequence do?"
          className="w-full bg-surface-800 text-white text-sm rounded-lg px-3 py-2 border border-surface-700 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[11px] text-surface-400 block mb-1">Trigger</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={trigger === 'on_subscribe'}
              onChange={() => setTrigger('on_subscribe')}
              className="accent-brand-500"
            />
            <span className="text-sm text-surface-300">⚡ On Subscribe</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={trigger === 'manual'}
              onChange={() => setTrigger('manual')}
              className="accent-brand-500"
            />
            <span className="text-sm text-surface-300">✋ Manual</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={busy || !name.trim()}
          className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-40 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Create
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function AutomationsPage() {
  const [sequences, setSequences] = useState<DripSequence[]>([]);
  const [stats, setStats] = useState<DripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [seqs, st] = await Promise.all([
        convexQuery('dripSequences:list', {}),
        convexQuery('dripSequences:stats', {}),
      ]);
      setSequences(seqs ?? []);
      setStats(st ?? null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runDripProcess = async () => {
    setProcessing(true);
    setProcessResult('');
    try {
      const res = await fetch('/api/drip/process', {
        method: 'POST',
        headers: { 'x-cron-secret': getAdminKey() },
      });
      const data = await res.json();
      if (data.error) {
        setProcessResult(`Error: ${data.error}`);
      } else {
        setProcessResult(`Processed ${data.processed}, sent ${data.sent}, errors ${data.errors}`);
        await loadData();
      }
    } catch (err) {
      setProcessResult(`Failed: ${String(err)}`);
    }
    setProcessing(false);
    setTimeout(() => setProcessResult(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-surface-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-400" />
            Email Drip Sequences
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            Automated email sequences triggered by newsletter signups or manual enrollment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runDripProcess}
            disabled={processing}
            className="px-3 py-2 text-sm bg-surface-800 text-surface-300 rounded-lg hover:text-white hover:bg-surface-700 transition-colors flex items-center gap-1.5 border border-surface-700"
            title="Process due emails now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
            Process Now
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Sequence
          </button>
        </div>
      </div>

      {processResult && (
        <div className={`text-xs px-3 py-2 rounded-lg ${processResult.startsWith('Error') || processResult.startsWith('Failed') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {processResult}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-3 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.activeSequences}</p>
              <p className="text-[10px] text-surface-400">Active Sequences</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.activeEnrollments}</p>
              <p className="text-[10px] text-surface-400">Active Enrollments</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.completedEnrollments}</p>
              <p className="text-[10px] text-surface-400">Completed</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <Send className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.totalEmailsSent}</p>
              <p className="text-[10px] text-surface-400">Emails Sent</p>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <CreateSequenceForm
          onCreated={() => {
            setShowCreate(false);
            loadData();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Sequences */}
      {sequences.length === 0 && !showCreate ? (
        <div className="card p-12 text-center">
          <Mail className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No drip sequences yet</h3>
          <p className="text-sm text-surface-400 mb-4">
            Create your first sequence to start automating email outreach.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-500 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Sequence
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => (
            <SequenceCard key={seq._id} seq={seq} onRefresh={loadData} />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="card p-4 bg-surface-900/50 border-dashed border-surface-700">
        <p className="text-sm text-surface-400 text-center">
          💡 <span className="text-surface-300">How it works:</span> &ldquo;On Subscribe&rdquo; sequences auto-enroll new newsletter subscribers.
          The <span className="text-brand-400">Process Now</span> button sends all due emails immediately.
          Set up a cron job to POST <code className="text-xs bg-surface-800 px-1 py-0.5 rounded">/api/drip/process</code> hourly for automation.
        </p>
      </div>
    </div>
  );
}
