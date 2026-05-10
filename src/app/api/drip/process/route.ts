import { NextRequest, NextResponse } from 'next/server';
import { convexQuery, convexMutation } from '@/lib/convexRaw';

/**
 * POST /api/drip/process
 *
 * Cron-triggered: processes all due drip enrollments.
 * Auth: x-cron-secret must match CONVEX_AUTH_SECRET.
 *
 * For each due enrollment:
 *   1. Fetch the step content
 *   2. Send via Resend
 *   3. Advance or complete the enrollment
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!cronSecret || !authSecret || cronSecret !== authSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const now = Date.now();

  try {
    // 1. Get all due enrollments
    const due: any[] = await convexQuery('dripSequences:getDueEnrollments', {
      adminKey: authSecret,
      now,
    });

    if (!due || due.length === 0) {
      return NextResponse.json({ processed: 0, sent: 0, errors: 0 });
    }

    // 2. Pre-fetch all needed sequences + steps
    const seqIds = [...new Set(due.map((e) => e.sequence_id))];
    const stepsMap = new Map<string, any[]>();

    await Promise.all(
      seqIds.map(async (sid) => {
        const steps = await convexQuery('dripSequences:getSteps', {
          adminKey: authSecret,
          sequenceId: sid,
        });
        stepsMap.set(sid, steps ?? []);
      }),
    );

    let sent = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // 3. Process each enrollment
    for (const enrollment of due) {
      const steps = stepsMap.get(enrollment.sequence_id);

      if (!steps || steps.length === 0) {
        errors++;
        errorDetails.push(`${enrollment.email}: sequence has no steps`);
        continue;
      }

      const currentStep = steps.find((s: any) => s.step_order === enrollment.current_step);
      if (!currentStep) {
        // No more steps — mark complete
        await convexMutation('dripSequences:advanceEnrollment', {
          adminKey: authSecret,
          enrollmentId: enrollment._id,
        });
        continue;
      }

      // Send the email
      try {
        const html = wrapDripEmail(currentStep.subject, currentStep.content, currentStep.preview_text);

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Eric Tomchik <eric@erictomchik.com>',
            to: [enrollment.email],
            subject: currentStep.subject,
            html,
          }),
        });

        if (!res.ok) {
          const errData = await res.text();
          errors++;
          errorDetails.push(`${enrollment.email}: Resend ${res.status} ${errData}`);
          continue;
        }

        sent++;

        // Advance to next step or complete
        const nextStep = steps.find((s: any) => s.step_order === enrollment.current_step + 1);
        await convexMutation('dripSequences:advanceEnrollment', {
          adminKey: authSecret,
          enrollmentId: enrollment._id,
          nextStepDelayHours: nextStep ? nextStep.delay_hours : undefined,
        });
      } catch (err) {
        errors++;
        errorDetails.push(`${enrollment.email}: ${String(err)}`);
      }
    }

    // Audit log
    try {
      await convexMutation('auditLog:create', {
        adminKey: authSecret,
        action: 'drip_process',
        actor: 'system',
        entity_type: 'drip_sequence',
        details: `Processed ${due.length} due, sent ${sent}, errors ${errors}`,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      processed: due.length,
      sent,
      errors,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    });
  } catch (err) {
    console.error('Drip process error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/* ─── Email template ────────────────────────────────────────────────── */

function wrapDripEmail(subject: string, content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<meta name="description" content="${previewText.replace(/"/g, '&quot;')}">` : ''}
  <!--[if !mso]><!--><style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style><!--<![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://erictomchik.com" style="color: #60a5fa; text-decoration: none; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
        Eric Tomchik
      </a>
    </div>

    <!-- Main Card -->
    <div style="background: #111827; border-radius: 16px; padding: 40px 32px; border: 1px solid #1f2937;">
      <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
        ${subject}
      </h1>

      <div style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">
        ${content}
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937;">
      <div style="margin-bottom: 16px;">
        <a href="https://erictomchik.com/books" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Books</a>
        <a href="https://erictomchik.com/blog" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Blog</a>
        <a href="https://erictomchik.com/services" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Services</a>
      </div>
      <div style="margin-bottom: 16px;">
        <a href="https://www.facebook.com/profile.php?id=61589407526718" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Facebook</a>
        <a href="https://www.linkedin.com/in/eric-tomchik-jr/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">LinkedIn</a>
        <a href="https://www.instagram.com/cyb3ron3/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Instagram</a>
        <a href="https://x.com/EricTomchikJr" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">X</a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        &copy; ${new Date().getFullYear()} Eric Tomchik &middot; ArcLight Press
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        You're receiving this because you subscribed at erictomchik.com.<br/>
        <a href="https://erictomchik.com/api/newsletter/unsubscribe?email=RECIPIENT" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
