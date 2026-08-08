'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import CalBooking from './CalBooking';

/**
 * Loads the Cal.com embed (and its third-party script) only after the visitor
 * asks for it. Keeps the landing page fast on mobile, where most merchant
 * traffic lands, instead of paying for the calendar on every page view.
 */
export default function DeferredCalBooking({
  calLink,
  label = 'Open the calendar',
}: {
  calLink: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) return <CalBooking calLink={calLink} />;

  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gtag = typeof window !== 'undefined' ? (window as any).gtag : undefined;
        if (gtag) gtag('event', 'booking_calendar_opened', { cal_link: calLink });
      }}
      className="btn-secondary w-full py-4"
    >
      <CalendarClock className="w-5 h-5 mr-2" />
      {label}
    </button>
  );
}
