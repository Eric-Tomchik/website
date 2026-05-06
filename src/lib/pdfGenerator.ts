import jsPDF from 'jspdf';

// ─── Brand Colors ────────────────────────────────────────────
const BRAND = {
  primary: [30, 64, 175] as [number, number, number],     // blue-700
  dark: [15, 23, 42] as [number, number, number],          // slate-900
  text: [30, 41, 59] as [number, number, number],          // slate-800
  muted: [100, 116, 139] as [number, number, number],      // slate-500
  light: [241, 245, 249] as [number, number, number],      // slate-100
  accent: [59, 130, 246] as [number, number, number],      // blue-500
  white: [255, 255, 255] as [number, number, number],
  line: [226, 232, 240] as [number, number, number],       // slate-200
  success: [22, 163, 74] as [number, number, number],      // green-600
};

interface ClientInfo {
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

interface ProjectInfo {
  title: string;
  description?: string;
  service_tier?: string;
  start_date?: string;
  target_date?: string;
}

interface GeneratorOptions {
  client: ClientInfo;
  project?: ProjectInfo;
  serviceTier?: string;
  customScope?: string;
  requireSignature?: boolean;
}

const SERVICE_TIERS: Record<string, { label: string; price: number; features: string[] }> = {
  starter: {
    label: 'Starter',
    price: 1500,
    features: [
      'Single-page responsive website',
      'Mobile-first design',
      'Contact form integration',
      'Basic SEO optimization',
      '1 round of revisions',
    ],
  },
  business_pro: {
    label: 'Business Pro',
    price: 3500,
    features: [
      'Multi-page website (up to 5 pages)',
      'Mobile-first responsive design',
      'Contact form + Google Maps integration',
      'Full SEO optimization',
      'Social media integration',
      '3 rounds of revisions',
      '30-day post-launch support',
    ],
  },
  custom: {
    label: 'Custom Application',
    price: 7500,
    features: [
      'Full custom web application',
      'Database integration',
      'User authentication system',
      'Payment processing (Stripe/PayPal)',
      'Custom API development',
      'Unlimited revisions',
      '90-day post-launch support',
    ],
  },
};

// ─── Helper: Draw page header ────────────────────────────────
function drawHeader(doc: jsPDF, title: string, subtitle: string, docNumber: string) {
  // Header bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 38, 'F');

  // Brand name
  doc.setTextColor(...BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ERIC TOMCHIK', 20, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 210);
  doc.text('Web Development & Digital Solutions', 20, 23);
  doc.text('ArcLight Press  ·  Mississippi Gulf Coast', 20, 28);

  // Document type badge
  doc.setFillColor(...BRAND.accent);
  const badgeWidth = doc.getTextWidth(title) + 16;
  doc.roundedRect(190 - badgeWidth, 10, badgeWidth, 10, 2, 2, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, 190 - badgeWidth + 8, 17);

  // Doc number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text(docNumber, 190 - badgeWidth, 28, { align: 'left' });

  return 48; // y position after header
}

// ─── Helper: Draw section title ──────────────────────────────
function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.primary);
  doc.text(title, 20, y);
  y += 2;
  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  return y + 7;
}

// ─── Helper: Draw text paragraph ─────────────────────────────
function drawText(doc: jsPDF, y: number, text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number }): number {
  if (y > 270) { doc.addPage(); y = 20; }
  const size = opts?.size ?? 9;
  const indent = opts?.indent ?? 20;
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(opts?.color ?? BRAND.text));
  const lines = doc.splitTextToSize(text, 170 - (indent - 20));
  doc.text(lines, indent, y);
  return y + lines.length * (size * 0.45) + 2;
}

// ─── Helper: Draw bullet point ───────────────────────────────
function drawBullet(doc: jsPDF, y: number, text: string, indent: number = 25): number {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFillColor(...BRAND.accent);
  doc.circle(indent - 2, y - 1.2, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  const lines = doc.splitTextToSize(text, 190 - indent - 3);
  doc.text(lines, indent + 2, y);
  return y + lines.length * 4.2 + 1.5;
}

// ─── Helper: Draw key-value pair ─────────────────────────────
function drawKeyValue(doc: jsPDF, y: number, key: string, value: string, indent: number = 20): number {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(key, indent, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.text);
  doc.text(value, indent + 40, y);
  return y + 5.5;
}

// ─── Helper: Draw footer ─────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const h = doc.internal.pageSize.height;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(20, h - 18, 190, h - 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text('info@erictomchik.com  ·  erictomchik.com', 20, h - 12);
  doc.text(`Page ${pageNum} of ${totalPages}`, 190, h - 12, { align: 'right' });
}

// ─── Helper: Info box ────────────────────────────────────────
function drawInfoBox(doc: jsPDF, y: number, label: string, lines: string[]): number {
  if (y > 250) { doc.addPage(); y = 20; }
  const boxHeight = 8 + lines.length * 4.5;
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(20, y, 75, boxHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text(label.toUpperCase(), 25, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  lines.forEach((line, i) => {
    doc.text(line, 25, y + 10 + i * 4.5);
  });
  return boxHeight;
}

function drawSignatureBlock(doc: jsPDF, y: number, requireSignature: boolean): number {
  if (y > 230) { doc.addPage(); y = 20; }
  y = drawSectionTitle(doc, y, 'SIGNATURES');

  if (requireSignature) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    y = drawText(doc, y, 'This document will be signed electronically via secure digital signature.', { size: 8, color: BRAND.muted });
    y += 3;
  }

  // Developer signature line
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(20, y + 12, 90, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('Eric Tomchik — Developer', 20, y + 17);
  doc.text('Date: _______________', 20, y + 22);

  // Client signature line
  doc.line(115, y + 12, 190, y + 12);
  doc.text('Client Signature', 115, y + 17);
  doc.text('Date: _______________', 115, y + 22);

  return y + 30;
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT GENERATOR
// ═══════════════════════════════════════════════════════════════
export function generateContractPDF(opts: GeneratorOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docNum = `CT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(doc, 'CONTRACT', 'Web Development Service Agreement', docNum);

  // Date & parties
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Date: ${today}`, 20, y);
  y += 8;

  // From / To boxes side by side
  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];

  const fromH = drawInfoBox(doc, y, 'Developer', fromLines);

  // To box
  const toBoxH = 8 + toLines.length * 4.5;
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(105, y, 85, toBoxH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text('CLIENT', 110, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  toLines.forEach((line, i) => {
    doc.text(line, 110, y + 10 + i * 4.5);
  });

  y += Math.max(fromH, toBoxH) + 8;

  // Project Details
  y = drawSectionTitle(doc, y, 'PROJECT DETAILS');
  if (opts.project?.title) {
    y = drawKeyValue(doc, y, 'Project:', opts.project.title);
  }
  if (opts.project?.description) {
    y = drawKeyValue(doc, y, 'Description:', opts.project.description);
  }
  if (tier) {
    y = drawKeyValue(doc, y, 'Package:', `${tier.label} — $${tier.price.toLocaleString()}`);
  }
  if (opts.project?.start_date) {
    y = drawKeyValue(doc, y, 'Start Date:', opts.project.start_date);
  }
  if (opts.project?.target_date) {
    y = drawKeyValue(doc, y, 'Target Date:', opts.project.target_date);
  }
  y += 3;

  // Scope of Work
  y = drawSectionTitle(doc, y, 'SCOPE OF WORK');
  if (opts.customScope) {
    const scopeLines = opts.customScope.split('\n').filter(Boolean);
    for (const line of scopeLines) {
      const clean = line.replace(/^[\s•\-*]+/, '').trim();
      if (clean) y = drawBullet(doc, y, clean);
    }
  } else if (tier) {
    for (const feat of tier.features) {
      y = drawBullet(doc, y, feat);
    }
  }
  y += 3;

  // Payment Terms
  y = drawSectionTitle(doc, y, 'PAYMENT TERMS');
  const price = tier?.price ?? 0;
  const half = price / 2;
  y = drawBullet(doc, y, `50% deposit due upon signing${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(doc, y, `50% balance due upon project completion${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(doc, y, 'Accepted payment methods: PayPal, Stripe');
  y = drawBullet(doc, y, 'Late payments are subject to a 1.5% monthly fee');
  y += 3;

  // Revision Policy
  y = drawSectionTitle(doc, y, 'REVISION POLICY');
  const revisions = opts.serviceTier === 'starter' ? '1 round' : opts.serviceTier === 'business_pro' ? '3 rounds' : 'Unlimited rounds';
  y = drawBullet(doc, y, `${revisions} of revisions included in project scope`);
  y = drawBullet(doc, y, 'Additional revisions billed at $75/hour');
  y = drawBullet(doc, y, 'Revision requests must be submitted in writing via email or client portal');
  y += 3;

  // Intellectual Property
  y = drawSectionTitle(doc, y, 'INTELLECTUAL PROPERTY');
  y = drawText(doc, y, 'Upon receipt of full payment, all custom code, designs, and content created specifically for this project shall become the sole property of the Client. The Developer retains the right to showcase the completed project in their professional portfolio.');
  y += 3;

  // Termination
  y = drawSectionTitle(doc, y, 'TERMINATION');
  y = drawText(doc, y, 'Either party may terminate this agreement with seven (7) days written notice. In the event of termination, the Client shall be responsible for payment of all work completed up to the date of termination, at the Developer\'s standard hourly rate of $75/hour.');
  y += 5;

  // Signatures
  y = drawSignatureBlock(doc, y, opts.requireSignature ?? false);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  return doc;
}

// ═══════════════════════════════════════════════════════════════
// INVOICE GENERATOR
// ═══════════════════════════════════════════════════════════════
export function generateInvoicePDF(opts: GeneratorOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const invNum = `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(doc, 'INVOICE', 'Payment Invoice', invNum);

  // Date row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Invoice Date: ${today}`, 20, y);
  doc.text(`Due Date: ${dueDate}`, 120, y);
  y += 8;

  // From / Bill To
  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];

  drawInfoBox(doc, y, 'From', fromLines);

  const toBoxH = 8 + toLines.length * 4.5;
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(105, y, 85, toBoxH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text('BILL TO', 110, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  toLines.forEach((line, i) => doc.text(line, 110, y + 10 + i * 4.5));

  y += Math.max(8 + fromLines.length * 4.5, toBoxH) + 10;

  // Items table
  y = drawSectionTitle(doc, y, 'ITEMS');

  // Table header
  doc.setFillColor(...BRAND.dark);
  doc.roundedRect(20, y, 170, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.white);
  doc.text('Description', 25, y + 5.5);
  doc.text('Amount', 175, y + 5.5, { align: 'right' });
  y += 12;

  if (opts.customScope) {
    // Parse custom line items
    const items = opts.customScope.split('\n').filter(Boolean);
    for (const item of items) {
      const match = item.match(/^(.+?)[\s\-–—]+\$?([\d,]+(?:\.\d{2})?)\s*$/);
      if (match) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...BRAND.text);
        doc.text(match[1].trim(), 25, y);
        doc.text(`$${match[2]}`, 175, y, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...BRAND.text);
        doc.text(item.replace(/^[\s•\-*]+/, '').trim(), 25, y);
      }
      y += 6;
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.line(20, y - 2, 190, y - 2);
    }
  } else {
    // Default line item based on tier
    const itemName = `${opts.project?.title || 'Web Development Services'} — ${tier?.label || 'Custom'} Package`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);

    const nameLines = doc.splitTextToSize(itemName, 120);
    doc.text(nameLines, 25, y);
    doc.text(tier ? `$${tier.price.toLocaleString()}.00` : '$—', 175, y, { align: 'right' });
    y += nameLines.length * 4 + 3;

    // Features as sub-items
    if (tier) {
      for (const feat of tier.features) {
        doc.setFontSize(7.5);
        doc.setTextColor(...BRAND.muted);
        doc.text(`  •  ${feat}`, 28, y);
        y += 3.5;
      }
    }
    y += 3;
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);
    y += 5;
  }

  // Total box
  const totalPrice = tier ? `$${tier.price.toLocaleString()}.00` : '$—';
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(120, y, 70, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('Subtotal:', 125, y + 6);
  doc.text(totalPrice, 185, y + 6, { align: 'right' });
  doc.setDrawColor(...BRAND.line);
  doc.line(125, y + 9, 185, y + 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.dark);
  doc.text('TOTAL DUE:', 125, y + 15);
  doc.text(totalPrice, 185, y + 15, { align: 'right' });
  y += 28;

  // Payment methods
  y = drawSectionTitle(doc, y, 'PAYMENT METHODS');
  y = drawBullet(doc, y, 'PayPal: info@erictomchik.com');
  y = drawBullet(doc, y, 'Stripe: Available at erictomchik.com');
  y += 2;
  y = drawText(doc, y, 'Payment is due within 30 days of invoice date. Late payments are subject to a 1.5% monthly fee.', { size: 8, color: BRAND.muted });
  y += 5;

  // Thank you
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(20, y, 170, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.primary);
  doc.text('Thank you for your business!', 105, y + 7.5, { align: 'center' });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  return doc;
}

// ═══════════════════════════════════════════════════════════════
// PROPOSAL GENERATOR
// ═══════════════════════════════════════════════════════════════
export function generateProposalPDF(opts: GeneratorOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const propNum = `PROP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(doc, 'PROPOSAL', 'Project Proposal', propNum);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Date: ${today}`, 20, y);
  doc.text(`Prepared for: ${opts.client.name}${opts.client.company ? ` — ${opts.client.company}` : ''}`, 80, y);
  y += 10;

  // Executive Summary
  y = drawSectionTitle(doc, y, 'EXECUTIVE SUMMARY');
  y = drawText(doc, y, `Thank you for considering my web development services. This proposal outlines the scope, timeline, and pricing for ${opts.project?.title || 'your upcoming project'}. I bring modern technology, professional design, and reliable Gulf Coast service to every project.`);
  y += 3;

  // Scope of Work
  y = drawSectionTitle(doc, y, 'SCOPE OF WORK');
  if (tier) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.dark);
    doc.text(`${tier.label} Package — $${tier.price.toLocaleString()}`, 20, y);
    y += 6;
  }

  if (opts.customScope) {
    const scopeLines = opts.customScope.split('\n').filter(Boolean);
    for (const line of scopeLines) {
      y = drawBullet(doc, y, line.replace(/^[\s•\-*]+/, '').trim());
    }
  } else if (tier) {
    for (const feat of tier.features) {
      y = drawBullet(doc, y, feat);
    }
  }

  if (opts.project?.description) {
    y += 3;
    y = drawText(doc, y, opts.project.description, { color: BRAND.muted, size: 8 });
  }
  y += 3;

  // Technology Stack
  y = drawSectionTitle(doc, y, 'TECHNOLOGY STACK');
  const techItems = [
    ['Next.js 15 & React 19', 'Modern, high-performance framework for fast page loads'],
    ['TypeScript', 'Type-safe development for fewer bugs and better maintainability'],
    ['Tailwind CSS', 'Custom, responsive design that looks great on every device'],
    ['Cloudflare', 'Enterprise-grade hosting with global CDN for lightning-fast delivery'],
  ];
  if (opts.serviceTier === 'custom') {
    techItems.push(['Convex', 'Real-time database with instant data synchronization']);
    techItems.push(['Stripe & PayPal', 'Secure, trusted payment processing']);
  }
  for (const [name, desc] of techItems) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);
    doc.text(name, 25, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(` — ${desc}`, 25 + doc.getTextWidth(name), y);
    y += 5.5;
  }
  y += 3;

  // Timeline
  y = drawSectionTitle(doc, y, 'TIMELINE');
  const timeline = opts.serviceTier === 'starter'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Week 2'], ['Review & Revisions', 'Week 3'], ['Launch & Handoff', 'Week 3']]
    : opts.serviceTier === 'business_pro'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–4'], ['Review & Revisions', 'Week 5'], ['Launch & Handoff', 'Week 6']]
    : [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–8'], ['Review & Revisions', 'Weeks 9–10'], ['Launch & Handoff', 'Weeks 11–12']];

  if (opts.project?.start_date) {
    y = drawKeyValue(doc, y, 'Start:', opts.project.start_date);
  }
  if (opts.project?.target_date) {
    y = drawKeyValue(doc, y, 'Target:', opts.project.target_date);
  }
  y += 2;

  for (const [phase, time] of timeline) {
    doc.setFillColor(...BRAND.light);
    doc.roundedRect(25, y - 3.5, 160, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.text);
    doc.text(phase, 30, y);
    doc.setTextColor(...BRAND.muted);
    doc.text(time, 180, y, { align: 'right' });
    y += 8;
  }
  y += 3;

  // Pricing
  y = drawSectionTitle(doc, y, 'PRICING');
  if (tier) {
    // Price highlight box
    doc.setFillColor(...BRAND.dark);
    doc.roundedRect(20, y, 170, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.white);
    doc.text(`$${tier.price.toLocaleString()}`, 105, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 190, 210);
    doc.text(`${tier.label} Package`, 105, y + 15, { align: 'center' });
    y += 28;

    const half = tier.price / 2;
    y = drawBullet(doc, y, `50% deposit upon signing — $${half.toLocaleString()}`);
    y = drawBullet(doc, y, `50% upon completion — $${half.toLocaleString()}`);
  }
  y += 5;

  // Why Choose Me
  y = drawSectionTitle(doc, y, 'WHY CHOOSE ME');
  const reasons = [
    '9 successful websites built for local businesses',
    'Published author on AI & business technology (4 books)',
    'Gulf Coast local — in-person meetings available',
    'Modern tech stack used by Fortune 500 companies',
    'Enterprise-grade hosting on Cloudflare\'s global network',
  ];
  for (const reason of reasons) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);
    doc.setFillColor(...BRAND.success);
    doc.circle(23, y - 1.2, 1, 'F');
    doc.text(reason, 27, y);
    y += 5.5;
  }
  y += 5;

  // Validity note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('This proposal is valid for 30 days from the date above.', 20, y);
  y += 8;

  // Signatures
  y = drawSignatureBlock(doc, y, opts.requireSignature ?? false);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  return doc;
}

// ─── Main entry point ────────────────────────────────────────
export function generatePDF(type: 'contract' | 'invoice' | 'proposal', opts: GeneratorOptions): jsPDF {
  switch (type) {
    case 'contract': return generateContractPDF(opts);
    case 'invoice': return generateInvoicePDF(opts);
    case 'proposal': return generateProposalPDF(opts);
  }
}
