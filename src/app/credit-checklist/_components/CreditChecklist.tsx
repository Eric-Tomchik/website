'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Trophy,
  BookOpen,
  Mail,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  question: string;
  tip: string;
  category: string;
}

const categories = [
  {
    name: 'Business Foundation',
    color: 'emerald',
    icon: '🏢',
  },
  {
    name: 'Financial Setup',
    color: 'brand',
    icon: '💳',
  },
  {
    name: 'Credit Readiness',
    color: 'violet',
    icon: '📊',
  },
];

const checklistItems: ChecklistItem[] = [
  // Business Foundation
  {
    id: 'ein',
    question: 'Do you have an EIN (Employer Identification Number)?',
    tip: 'An EIN is your business\'s Social Security number. You can get one for free at IRS.gov in minutes.',
    category: 'Business Foundation',
  },
  {
    id: 'entity',
    question: 'Is your business registered as an LLC, Corporation, or other formal entity?',
    tip: 'Sole proprietorships are harder to separate from personal credit. An LLC or Corp creates a clear legal separation.',
    category: 'Business Foundation',
  },
  {
    id: 'address',
    question: 'Does your business have a dedicated address (not a P.O. Box)?',
    tip: 'Credit bureaus and lenders prefer a physical business address. A virtual office or registered agent address works too.',
    category: 'Business Foundation',
  },
  {
    id: 'phone',
    question: 'Do you have a dedicated business phone number listed under your business name?',
    tip: 'A business phone number listed in directories (411) helps verify your business identity with credit bureaus.',
    category: 'Business Foundation',
  },
  {
    id: 'website',
    question: 'Does your business have a professional website and email domain?',
    tip: 'A business website and matching email (you@yourbusiness.com) signals legitimacy to lenders and credit agencies.',
    category: 'Business Foundation',
  },
  // Financial Setup
  {
    id: 'bank_account',
    question: 'Do you have a business bank account separate from personal accounts?',
    tip: 'Separating business and personal finances is critical. Open a business checking account in your business\'s legal name.',
    category: 'Financial Setup',
  },
  {
    id: 'duns',
    question: 'Have you obtained a D-U-N-S Number from Dun & Bradstreet?',
    tip: 'A D-U-N-S Number is free and required by many lenders. It\'s the foundation of your business credit profile.',
    category: 'Financial Setup',
  },
  {
    id: 'bookkeeping',
    question: 'Do you maintain organized business financial records (bookkeeping)?',
    tip: 'Clean books show lenders you\'re serious. QuickBooks, Wave, or even a simple spreadsheet — consistency is key.',
    category: 'Financial Setup',
  },
  {
    id: 'licenses',
    question: 'Are all required business licenses and permits current?',
    tip: 'Active licenses prove your business is legitimate and operating legally — a key factor in credit applications.',
    category: 'Financial Setup',
  },
  // Credit Readiness
  {
    id: 'vendor_credit',
    question: 'Do you have at least one vendor or supplier that reports to business credit bureaus?',
    tip: 'Start with "starter vendors" like Grainger, Uline, or Quill that report to Dun & Bradstreet — even small purchases count.',
    category: 'Credit Readiness',
  },
  {
    id: 'credit_monitoring',
    question: 'Are you monitoring your business credit reports (D&B, Experian Business, Equifax Business)?',
    tip: 'Check your business credit reports regularly. Nav.com offers free basic monitoring to track your progress.',
    category: 'Credit Readiness',
  },
  {
    id: 'payment_history',
    question: 'Do you consistently pay all business bills on time or early?',
    tip: 'Payment history is the #1 factor in business credit scores. Paying early can boost your Paydex score above 80.',
    category: 'Credit Readiness',
  },
  {
    id: 'trade_references',
    question: 'Can you provide at least 3 trade references from vendors or suppliers?',
    tip: 'Trade references verify your payment history. Even informal supplier relationships can serve as references.',
    category: 'Credit Readiness',
  },
  {
    id: 'personal_separation',
    question: 'Have you taken steps to minimize personal guarantees on business debt?',
    tip: 'The goal of business credit is to separate personal liability. Start building so you can eventually qualify without personal guarantees.',
    category: 'Credit Readiness',
  },
];

export function CreditChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const score = Object.values(checked).filter(Boolean).length;
  const total = checklistItems.length;
  const percentage = Math.round((score / total) * 100);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreLevel = () => {
    if (percentage >= 85) return { label: 'Excellent', color: 'emerald', emoji: '🏆', message: 'Your business is in great shape to build credit! You have the foundation in place — now it\'s time to leverage it.' };
    if (percentage >= 60) return { label: 'Good', color: 'brand', emoji: '👍', message: 'You\'re on the right track! Fill in the gaps below and you\'ll be credit-ready in no time.' };
    if (percentage >= 35) return { label: 'Getting Started', color: 'amber', emoji: '🔧', message: 'You have some basics down, but there are key steps remaining. Focus on the unchecked items to build a solid foundation.' };
    return { label: 'Just Beginning', color: 'red', emoji: '🚀', message: 'Every business starts somewhere! Follow the tips below for each item to get your business credit-ready step by step.' };
  };

  const handleSubscribe = async () => {
    if (!email) return;
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setEmailStatus('sent');
    } catch {
      setEmailStatus('error');
    }
  };

  const grouped = categories.map((cat) => ({
    ...cat,
    items: checklistItems.filter((item) => item.category === cat.name),
  }));

  if (showResults) {
    const level = getScoreLevel();
    const unchecked = checklistItems.filter((item) => !checked[item.id]);

    return (
      <div className="space-y-8">
        {/* Score card */}
        <div className="card p-8 text-center space-y-6">
          <div className="text-6xl">{level.emoji}</div>
          <div>
            <div className="text-5xl font-extrabold text-white mb-2">
              {score}<span className="text-surface-500 text-3xl">/{total}</span>
            </div>
            <div className={`text-lg font-bold ${
              level.color === 'emerald' ? 'text-emerald-400' :
              level.color === 'brand' ? 'text-brand-400' :
              level.color === 'amber' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {level.label}
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-sm mx-auto">
            <div className="h-3 rounded-full bg-surface-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  level.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                  level.color === 'brand' ? 'bg-gradient-to-r from-brand-600 to-brand-400' :
                  level.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-sm text-surface-400 mt-2">{percentage}% complete</div>
          </div>

          <p className="text-surface-300 max-w-lg mx-auto leading-relaxed">{level.message}</p>
        </div>

        {/* Action items */}
        {unchecked.length > 0 && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Your Action Items</h3>
            </div>
            <div className="space-y-3">
              {unchecked.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-surface-800/50 border border-surface-700/50">
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-surface-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white">{item.question}</div>
                      <div className="text-xs text-surface-400 mt-1">{item.tip}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email capture */}
        {emailStatus !== 'sent' && (
          <div className="card p-8 text-center space-y-4 bg-gradient-to-br from-brand-600/5 to-emerald-600/5 border-brand-600/20">
            <Mail className="w-10 h-10 text-brand-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Get the Full Credit-Building Guide</h3>
            <p className="text-surface-400 text-sm max-w-md mx-auto">
              Subscribe to receive Eric&apos;s best tips on building business credit,
              plus updates on new books and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                           text-white placeholder-surface-500 focus:border-brand-500
                           focus:ring-1 focus:ring-brand-500 outline-none transition-colors text-sm"
              />
              <button
                onClick={handleSubscribe}
                disabled={emailStatus === 'sending' || !email}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {emailStatus === 'sending' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {emailStatus === 'error' && (
              <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
            )}
          </div>
        )}

        {emailStatus === 'sent' && (
          <div className="card p-6 text-center space-y-2 border-emerald-600/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-white font-medium">You&apos;re subscribed!</p>
            <p className="text-surface-400 text-sm">Check your inbox for a welcome email.</p>
          </div>
        )}

        {/* CTA to book */}
        <div className="card p-8 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-brand-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">
            Ready for the Complete Playbook?
          </h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            <em>Credit Without a Credit Score</em> is the exhaustive, step-by-step guide
            to building business credit with just an EIN.
          </p>
          <Link href="/books/credit-without-a-credit-score" className="btn-primary inline-flex">
            <BookOpen className="w-4 h-4 mr-2" />
            Get the Book
          </Link>
        </div>

        {/* Retake */}
        <div className="text-center">
          <button
            onClick={() => { setShowResults(false); setChecked({}); }}
            className="text-surface-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retake Checklist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.name} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-800/50 flex items-center gap-3">
            <span className="text-xl">{group.icon}</span>
            <h2 className="text-lg font-bold text-white">{group.name}</h2>
            <span className="ml-auto text-xs text-surface-500 font-medium">
              {group.items.filter((i) => checked[i.id]).length}/{group.items.length}
            </span>
          </div>
          <div className="divide-y divide-surface-800/50">
            {group.items.map((item) => (
              <div key={item.id} className="group">
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 py-4 flex items-start gap-4 text-left
                             hover:bg-surface-800/30 transition-colors"
                >
                  {checked[item.id] ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 transition-all" />
                  ) : (
                    <Circle className="w-5 h-5 text-surface-600 mt-0.5 flex-shrink-0 group-hover:text-surface-400 transition-colors" />
                  )}
                  <span className={`text-sm font-medium transition-colors ${
                    checked[item.id] ? 'text-surface-400 line-through' : 'text-white'
                  }`}>
                    {item.question}
                  </span>
                </button>
                <button
                  onClick={() => setExpandedTip(expandedTip === item.id ? null : item.id)}
                  className="w-full px-6 pb-1 -mt-2 flex items-center gap-1 text-left"
                >
                  <span className="text-xs text-brand-400/70 hover:text-brand-400 transition-colors cursor-pointer flex items-center gap-1 ml-9">
                    {expandedTip === item.id ? 'Hide' : 'Show'} tip
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedTip === item.id ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {expandedTip === item.id && (
                  <div className="px-6 pb-4 ml-9">
                    <div className="text-xs text-surface-400 bg-surface-800/50 rounded-lg p-3 border border-surface-700/50">
                      💡 {item.tip}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Progress indicator */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-sm font-bold text-brand-400">{score}/{total}</span>
        </div>
        <div className="h-2.5 rounded-full bg-surface-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={() => setShowResults(true)}
        className="btn-primary w-full py-4 text-lg"
      >
        See My Results
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
}
