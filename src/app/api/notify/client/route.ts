import { NextResponse } from 'next/server';

// ── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | 'invoice_sent'
  | 'document_signature_requested'
  | 'milestone_completed'
  | 'project_status_update';

interface NotifyPayload {
  type: NotificationType;
  adminKey: string;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, unknown>;
}

// ── POST /api/notify/client ──────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body: NotifyPayload = await req.json();
    const { type, adminKey, recipientEmail, recipientName, data } = body;

    // Validate admin key
    const secret = process.env.CONVEX_AUTH_SECRET;
    if (!secret || adminKey !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!recipientEmail || !type) {
      return NextResponse.json(
        { error: 'recipientEmail and type are required' },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build email content based on type
    const email = buildNotificationEmail(type, recipientName, data);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Eric Tomchik <noreply@erictomchik.com>',
        to: [recipientEmail],
        subject: email.subject,
        html: email.html,
      }),
    });

    const resendData = await res.json();

    if (!res.ok) {
      console.error('Client notification email error:', res.status, resendData);
      return NextResponse.json(
        { error: 'Failed to send email', details: resendData },
        { status: 502 }
      );
    }

    // Client notification sent successfully

    // Log to audit trail (non-blocking)
    try {
      const { getConvexClient } = await import('@/lib/convex');
      const { api } = await import('../../../../../convex/_generated/api');
      const convex = getConvexClient();
      await convex.mutation(api.auditLog.create, {
        adminKey: secret,
        action: `client_notification_${type}`,
        actor: 'admin',
        entity_type: 'notification',
        details: `${type} email sent to ${recipientName} <${recipientEmail}>`,
      });
    } catch {
      // Audit logging is non-critical
    }

    return NextResponse.json({
      success: true,
      emailId: resendData.id,
      type,
    });
  } catch (err) {
    console.error('Client notification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── Email Builder ────────────────────────────────────────────────────────────

function buildNotificationEmail(
  type: NotificationType,
  recipientName: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const firstName = recipientName.split(' ')[0] || recipientName;

  switch (type) {
    case 'invoice_sent':
      return buildInvoiceEmail(firstName, data);
    case 'document_signature_requested':
      return buildSignatureEmail(firstName, data);
    case 'milestone_completed':
      return buildMilestoneEmail(firstName, data);
    case 'project_status_update':
      return buildProjectUpdateEmail(firstName, data);
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

// ── Invoice Email ────────────────────────────────────────────────────────────

function buildInvoiceEmail(
  firstName: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const invoiceNumber = data.invoiceNumber as string;
  const totalFormatted = data.totalFormatted as string;
  const dueDate = data.dueDate as string | undefined;
  const items = data.items as
    | { description: string; quantity: number; unit_price_cents: number }[]
    | undefined;
  const portalUrl = data.portalUrl as string | undefined;

  const subject = `Invoice ${invoiceNumber} — $${totalFormatted}`;

  const itemsHtml = items
    ? items
        .map(
          (item) => `
        <tr>
          <td style="padding: 10px 12px; color: #e2e8f0; font-size: 14px; border-bottom: 1px solid #1e293b;">${item.description}</td>
          <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; text-align: center; border-bottom: 1px solid #1e293b;">${item.quantity}</td>
          <td style="padding: 10px 12px; color: #e2e8f0; font-size: 14px; text-align: right; border-bottom: 1px solid #1e293b;">$${(item.unit_price_cents / 100).toFixed(2)}</td>
        </tr>`
        )
        .join('')
    : '';

  const html = wrapEmail(`
    <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      New Invoice
    </h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
      Invoice ${invoiceNumber}${dueDate ? ` · Due ${dueDate}` : ''}
    </p>

    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Hey ${firstName} 👋
    </p>
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      A new invoice has been created for your project. Here's the summary:
    </p>

    ${
      items && items.length > 0
        ? `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="border-bottom: 2px solid #1e293b;">
          <th style="padding: 8px 12px; color: #94a3b8; font-size: 12px; text-align: left; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
          <th style="padding: 8px 12px; color: #94a3b8; font-size: 12px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
          <th style="padding: 8px 12px; color: #94a3b8; font-size: 12px; text-align: right; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>`
        : ''
    }

    <div style="background: #1e293b; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #94a3b8; font-size: 14px;">Total Due</span>
        <span style="color: #60a5fa; font-size: 24px; font-weight: 700;">$${totalFormatted}</span>
      </div>
    </div>

    ${
      portalUrl
        ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
        View in Client Portal
      </a>
    </div>`
        : ''
    }

    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
      If you have any questions about this invoice, just reply to this email or reach out through your client portal.
    </p>
  `);

  return { subject, html };
}

// ── Signature Request Email ──────────────────────────────────────────────────

function buildSignatureEmail(
  firstName: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const documentName = data.documentName as string;
  const category = data.category as string | undefined;
  const signUrl = data.signUrl as string;

  const categoryLabels: Record<string, string> = {
    contract: 'Contract',
    invoice: 'Invoice',
    proposal: 'Proposal',
    deliverable: 'Deliverable',
    brief: 'Project Brief',
    other: 'Document',
  };

  const categoryLabel = categoryLabels[category || ''] || 'Document';
  const subject = `Action Required: Please sign "${documentName}"`;

  const html = wrapEmail(`
    <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      Signature Requested
    </h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
      ${categoryLabel}: ${documentName}
    </p>

    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Hey ${firstName} 👋
    </p>
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      A document is ready for your review and signature. Please take a moment to review it and sign when you're ready.
    </p>

    <div style="background: #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 8px; background: #2563eb20; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 20px;">📄</span>
        </div>
        <div>
          <div style="color: #f1f5f9; font-size: 15px; font-weight: 600;">${documentName}</div>
          <div style="color: #94a3b8; font-size: 13px;">${categoryLabel} · Awaiting your signature</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${signUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
        Review & Sign Document
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
      This link is unique to you. If you have any questions before signing, just reply to this email.
    </p>
  `);

  return { subject, html };
}

// ── Milestone Completed Email ────────────────────────────────────────────────

function buildMilestoneEmail(
  firstName: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const milestoneTitle = data.milestoneTitle as string;
  const projectTitle = data.projectTitle as string;
  const completedDate = data.completedDate as string | undefined;
  const nextMilestone = data.nextMilestone as string | undefined;
  const progressPercent = data.progressPercent as number | undefined;
  const portalUrl = data.portalUrl as string | undefined;

  const subject = `✅ Milestone Complete: ${milestoneTitle}`;

  const progressBarHtml =
    progressPercent !== undefined
      ? `
    <div style="margin: 20px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #94a3b8; font-size: 12px;">Project Progress</span>
        <span style="color: #60a5fa; font-size: 12px; font-weight: 600;">${progressPercent}%</span>
      </div>
      <div style="background: #1e293b; border-radius: 999px; height: 8px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #2563eb, #60a5fa); height: 100%; border-radius: 999px; width: ${progressPercent}%;"></div>
      </div>
    </div>`
      : '';

  const html = wrapEmail(`
    <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      Milestone Completed! 🎉
    </h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
      ${projectTitle}
    </p>

    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Hey ${firstName} 👋
    </p>
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      Great news — we've completed a milestone on your project:
    </p>

    <div style="background: #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #059669; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 16px;">✓</span>
        </div>
        <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${milestoneTitle}</div>
      </div>
      ${completedDate ? `<div style="color: #94a3b8; font-size: 13px; margin-left: 44px;">Completed ${completedDate}</div>` : ''}
    </div>

    ${progressBarHtml}

    ${
      nextMilestone
        ? `
    <div style="background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
      <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Up Next</div>
      <div style="color: #e2e8f0; font-size: 15px; font-weight: 500;">${nextMilestone}</div>
    </div>`
        : ''
    }

    ${
      portalUrl
        ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
        View Full Project Status
      </a>
    </div>`
        : ''
    }

    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
      We're making great progress! If you have any feedback or questions, just reply to this email.
    </p>
  `);

  return { subject, html };
}

// ── Project Status Update Email ──────────────────────────────────────────────

function buildProjectUpdateEmail(
  firstName: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const projectTitle = data.projectTitle as string;
  const newStatus = data.newStatus as string;
  const progressPercent = data.progressPercent as number | undefined;
  const portalUrl = data.portalUrl as string | undefined;

  const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
    discovery: { label: 'Discovery', color: '#94a3b8', emoji: '🔍' },
    proposal: { label: 'Proposal', color: '#f59e0b', emoji: '📋' },
    in_progress: { label: 'In Progress', color: '#3b82f6', emoji: '🚀' },
    review: { label: 'In Review', color: '#a855f7', emoji: '👀' },
    completed: { label: 'Completed', color: '#10b981', emoji: '🎉' },
    on_hold: { label: 'On Hold', color: '#f59e0b', emoji: '⏸️' },
  };

  const status = statusLabels[newStatus] || {
    label: newStatus,
    color: '#94a3b8',
    emoji: '📌',
  };

  const subject = `${status.emoji} Project Update: ${projectTitle} — ${status.label}`;

  const progressBarHtml =
    progressPercent !== undefined
      ? `
    <div style="margin: 20px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #94a3b8; font-size: 12px;">Overall Progress</span>
        <span style="color: #60a5fa; font-size: 12px; font-weight: 600;">${progressPercent}%</span>
      </div>
      <div style="background: #1e293b; border-radius: 999px; height: 8px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #2563eb, #60a5fa); height: 100%; border-radius: 999px; width: ${progressPercent}%;"></div>
      </div>
    </div>`
      : '';

  const html = wrapEmail(`
    <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      Project Update
    </h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
      ${projectTitle}
    </p>

    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      Hey ${firstName} — your project status has been updated:
    </p>

    <div style="background: #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 28px; margin-bottom: 8px;">${status.emoji}</div>
      <div style="color: ${status.color}; font-size: 18px; font-weight: 700;">${status.label}</div>
    </div>

    ${progressBarHtml}

    ${
      portalUrl
        ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
        View in Client Portal
      </a>
    </div>`
        : ''
    }

    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
      You can always check the latest on your project by logging into your client portal. Questions? Just reply to this email.
    </p>
  `);

  return { subject, html };
}

// ── Email Wrapper ────────────────────────────────────────────────────────────

function wrapEmail(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://erictomchik.com" style="color: #60a5fa; text-decoration: none; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
        Eric Tomchik
      </a>
    </div>

    <!-- Main Card -->
    <div style="background: #111827; border-radius: 16px; padding: 40px 32px; border: 1px solid #1f2937;">
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        &copy; ${new Date().getFullYear()} Eric Tomchik
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        <a href="https://erictomchik.com/portal" style="color: #64748b; text-decoration: underline;">Client Portal</a>
        &nbsp;&middot;&nbsp;
        <a href="https://erictomchik.com/contact" style="color: #64748b; text-decoration: underline;">Contact</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
