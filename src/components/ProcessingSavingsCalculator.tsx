'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Info } from 'lucide-react';

/**
 * Interactive "what are you paying to accept cards?" estimator.
 *
 * Lead magnet mechanic for /become-a-merchant: the visitor enters their own
 * monthly card volume and effective rate, and immediately sees an ESTIMATE of
 * their annual processing expense. Every figure is explicitly labeled as an
 * estimate — no savings are promised before a real statement review.
 *
 * On CTA click it scrolls to the analysis request form and broadcasts the
 * selected volume band so the form can pre-fill it.
 */

const VOLUME_BANDS: { max: number; label: string }[] = [
  { max: 5_000, label: 'Under $5,000/mo' },
  { max: 15_000, label: '$5,000 – $15,000/mo' },
  { max: 50_000, label: '$15,000 – $50,000/mo' },
  { max: Infinity, label: 'Over $50,000/mo' },
];

export const VOLUME_EVENT = 'cs:volume-band';

function bandFor(volume: number): string {
  return VOLUME_BANDS.find((b) => volume <= b.max)!.label;
}

function money(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export default function ProcessingSavingsCalculator() {
  const [volume, setVolume] = useState(25_000);
  const [rate, setRate] = useState(3.0);
  const [touched, setTouched] = useState(false);

  const { monthly, annual } = useMemo(() => {
    const monthly = (volume * rate) / 100;
    return { monthly, annual: monthly * 12 };
  }, [volume, rate]);

  const handleCta = () => {
    const band = bandFor(volume);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(VOLUME_EVENT, { detail: band }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gtag = (window as any).gtag;
      if (gtag) {
        gtag('event', 'calculator_cta_click', {
          monthly_volume: volume,
          effective_rate: rate,
          estimated_annual_cost: Math.round(annual),
        });
      }

      document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trackUse = () => {
    if (touched) return;
    setTouched(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = typeof window !== 'undefined' ? (window as any).gtag : undefined;
    if (gtag) gtag('event', 'calculator_used');
  };

  return (
    <div className="card p-6 sm:p-8 text-left">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">Processing Cost Estimator</div>
          <div className="text-xs text-surface-500">Two sliders. No email required.</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="cs-volume" className="text-sm font-medium text-surface-300">
              Monthly card volume
            </label>
            <span className="text-white font-bold tabular-nums">
              {volume >= 100_000 ? '$100,000+' : money(volume)}
            </span>
          </div>
          <input
            id="cs-volume"
            type="range"
            min={2_000}
            max={100_000}
            step={1_000}
            value={volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              trackUse();
            }}
            className="w-full accent-brand-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="cs-rate" className="text-sm font-medium text-surface-300">
              Your effective rate
            </label>
            <span className="text-white font-bold tabular-nums">{rate.toFixed(2)}%</span>
          </div>
          <input
            id="cs-rate"
            type="range"
            min={1.5}
            max={4.5}
            step={0.05}
            value={rate}
            onChange={(e) => {
              setRate(Number(e.target.value));
              trackUse();
            }}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <p className="text-xs text-surface-500 mt-2">
            Not sure? Most small businesses land between 2.5% and 4% once fees, assessments, and
            monthly charges are counted. Your statement has the real number — that&apos;s what the
            free analysis finds.
          </p>
        </div>

        <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-surface-400">Estimated monthly cost</span>
            <span className="text-lg font-bold text-white tabular-nums">{money(monthly)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-surface-700/50 pt-3">
            <span className="text-sm text-surface-400">Estimated annual cost</span>
            <span className="text-2xl sm:text-3xl font-extrabold gradient-text tabular-nums">
              {money(annual)}
            </span>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed flex gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-surface-500" />
            <span>
              Estimate only, based on the numbers you entered. Actual cost depends on your pricing,
              card mix, and monthly fees. A statement review gives you the exact figure — and
              whether the Cash Discount Program is a fit for your business.
            </span>
          </p>
        </div>

        <button type="button" onClick={handleCta} className="btn-primary w-full py-3.5 text-base">
          Get My Free Processing Analysis
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
