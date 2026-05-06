import jsPDF from 'jspdf';

// ─── Brand Colors ────────────────────────────────────────────
const BRAND = {
  primary: [30, 64, 175] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  line: [226, 232, 240] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
};

// Footer takes ~20mm from bottom. Page height is 297mm. Content must stop above footer.
const PAGE_HEIGHT = 297;
const FOOTER_HEIGHT = 22;
const MAX_Y = PAGE_HEIGHT - FOOTER_HEIGHT; // 275mm - safe content area
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 190;
const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT; // 170mm

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

// ─── Page break helper ───────────────────────────────────────
function checkPageBreak(doc: jsPDF, y: number, needed: number = 10): number {
  if (y + needed > MAX_Y) {
    doc.addPage();
    return 25;
  }
  return y;
}

// ─── Helper: Draw page header ────────────────────────────────
function drawHeader(doc: jsPDF, title: string, _subtitle: string, docNumber: string) {
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(...BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ERIC TOMCHIK', 20, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 210);
  doc.text('Web Development & Digital Solutions', 20, 23);
  doc.text('ArcLight Press  ·  Mississippi Gulf Coast', 20, 28);

  doc.setFillColor(...BRAND.accent);
  const badgeWidth = doc.getTextWidth(title) + 16;
  doc.roundedRect(190 - badgeWidth, 10, badgeWidth, 10, 2, 2, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, 190 - badgeWidth + 8, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text(docNumber, 190 - badgeWidth, 28, { align: 'left' });

  return 48;
}

// ─── Helper: Draw section title ──────────────────────────────
function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  y = checkPageBreak(doc, y, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.primary);
  doc.text(title, MARGIN_LEFT, y);
  y += 2;
  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
  return y + 7;
}

// ─── Helper: Draw text paragraph ─────────────────────────────
function drawText(doc: jsPDF, y: number, text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number }): number {
  const size = opts?.size ?? 9;
  const indent = opts?.indent ?? MARGIN_LEFT;
  const maxWidth = MARGIN_RIGHT - indent;
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(opts?.color ?? BRAND.text));
  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeight = size * 0.45;

  for (const line of lines) {
    y = checkPageBreak(doc, y, lineHeight + 1);
    doc.text(line, indent, y);
    y += lineHeight;
  }
  return y + 2;
}

// ─── Helper: Draw bullet point ───────────────────────────────
function drawBullet(doc: jsPDF, y: number, text: string, indent: number = 25): number {
  const maxWidth = MARGIN_RIGHT - indent - 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(text, maxWidth);
  const totalHeight = lines.length * 4.2 + 1.5;

  y = checkPageBreak(doc, y, totalHeight);
  doc.setFillColor(...BRAND.accent);
  doc.circle(indent - 2, y - 1.2, 1, 'F');
  doc.setTextColor(...BRAND.text);
  doc.text(lines, indent + 2, y);
  return y + totalHeight;
}

// ─── Helper: Draw key-value pair ─────────────────────────────
function drawKeyValue(doc: jsPDF, y: number, key: string, value: string, indent: number = MARGIN_LEFT): number {
  y = checkPageBreak(doc, y, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(key, indent, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.text);
  const valueLines = doc.splitTextToSize(value, MARGIN_RIGHT - indent - 42);
  doc.text(valueLines, indent + 40, y);
  return y + Math.max(5.5, valueLines.length * 4.2 + 1);
}

// ─── Helper: Draw footer ─────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const h = PAGE_HEIGHT;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, h - 18, MARGIN_RIGHT, h - 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text('info@erictomchik.com  ·  erictomchik.com', MARGIN_LEFT, h - 12);
  doc.text(`Page ${pageNum} of ${totalPages}`, MARGIN_RIGHT, h - 12, { align: 'right' });
}

// ─── Helper: Info box ────────────────────────────────────────
function drawInfoBox(doc: jsPDF, y: number, label: string, lines: string[], x: number = MARGIN_LEFT, width: number = 75): number {
  const boxHeight = 8 + lines.length * 4.5;
  y = checkPageBreak(doc, y, boxHeight);
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(x, y, width, boxHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.muted);
  doc.text(label.toUpperCase(), x + 5, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  lines.forEach((line, i) => {
    doc.text(line, x + 5, y + 10 + i * 4.5);
  });
  return boxHeight;
}

function drawSignatureBlock(doc: jsPDF, y: number, requireSignature: boolean): number {
  y = checkPageBreak(doc, y, 40);
  y = drawSectionTitle(doc, y, 'SIGNATURES');

  if (requireSignature) {
    y = drawText(doc, y, 'This document will be signed electronically via secure digital signature.', { size: 8, color: BRAND.muted });
    y += 3;
  }

  y = checkPageBreak(doc, y, 28);

  // Developer signature line
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y + 12, 90, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('Eric Tomchik — Developer', MARGIN_LEFT, y + 17);
  doc.text('Date: _______________', MARGIN_LEFT, y + 22);

  // Client signature line
  doc.line(115, y + 12, MARGIN_RIGHT, y + 12);
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Date: ${today}`, MARGIN_LEFT, y);
  y += 8;

  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];

  const fromH = drawInfoBox(doc, y, 'Developer', fromLines, MARGIN_LEFT, 75);
  const toBoxH = drawInfoBox(doc, y, 'Client', toLines, 105, 85);
  y += Math.max(fromH, toBoxH) + 8;

  y = drawSectionTitle(doc, y, 'PROJECT DETAILS');
  if (opts.project?.title) y = drawKeyValue(doc, y, 'Project:', opts.project.title);
  if (opts.project?.description) y = drawKeyValue(doc, y, 'Description:', opts.project.description);
  if (tier) y = drawKeyValue(doc, y, 'Package:', `${tier.label} — $${tier.price.toLocaleString()}`);
  if (opts.project?.start_date) y = drawKeyValue(doc, y, 'Start Date:', opts.project.start_date);
  if (opts.project?.target_date) y = drawKeyValue(doc, y, 'Target Date:', opts.project.target_date);
  y += 3;

  y = drawSectionTitle(doc, y, 'SCOPE OF WORK');
  if (opts.customScope) {
    for (const line of opts.customScope.split('\n').filter(Boolean)) {
      const clean = line.replace(/^[\s•\-*]+/, '').trim();
      if (clean) y = drawBullet(doc, y, clean);
    }
  } else if (tier) {
    for (const feat of tier.features) y = drawBullet(doc, y, feat);
  }
  y += 3;

  y = drawSectionTitle(doc, y, 'PAYMENT TERMS');
  const price = tier?.price ?? 0;
  const half = price / 2;
  y = drawBullet(doc, y, `50% deposit due upon signing${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(doc, y, `50% balance due upon project completion${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(doc, y, 'Accepted payment methods: PayPal, Stripe');
  y = drawBullet(doc, y, 'Late payments are subject to a 1.5% monthly fee');
  y += 3;

  y = drawSectionTitle(doc, y, 'REVISION POLICY');
  const revisions = opts.serviceTier === 'starter' ? '1 round' : opts.serviceTier === 'business_pro' ? '3 rounds' : 'Unlimited rounds';
  y = drawBullet(doc, y, `${revisions} of revisions included in project scope`);
  y = drawBullet(doc, y, 'Additional revisions billed at $75/hour');
  y = drawBullet(doc, y, 'Revision requests must be submitted in writing via email or client portal');
  y += 3;

  y = drawSectionTitle(doc, y, 'INTELLECTUAL PROPERTY');
  y = drawText(doc, y, 'Upon receipt of full payment, all custom code, designs, and content created specifically for this project shall become the sole property of the Client. The Developer retains the right to showcase the completed project in their professional portfolio.');
  y += 3;

  y = drawSectionTitle(doc, y, 'TERMINATION');
  y = drawText(doc, y, 'Either party may terminate this agreement with seven (7) days written notice. In the event of termination, the Client shall be responsible for payment of all work completed up to the date of termination, at the Developer\'s standard hourly rate of $75/hour.');
  y += 5;

  y = drawSignatureBlock(doc, y, opts.requireSignature ?? false);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { doc.setPage(i); drawFooter(doc, i, totalPages); }

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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Invoice Date: ${today}`, MARGIN_LEFT, y);
  doc.text(`Due Date: ${dueDate}`, 120, y);
  y += 8;

  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];

  const fromH = drawInfoBox(doc, y, 'From', fromLines, MARGIN_LEFT, 75);
  const toH = drawInfoBox(doc, y, 'Bill To', toLines, 105, 85);
  y += Math.max(fromH, toH) + 10;

  y = drawSectionTitle(doc, y, 'ITEMS');

  y = checkPageBreak(doc, y, 12);
  doc.setFillColor(...BRAND.dark);
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.white);
  doc.text('Description', 25, y + 5.5);
  doc.text('Amount', 175, y + 5.5, { align: 'right' });
  y += 12;

  if (opts.customScope) {
    for (const item of opts.customScope.split('\n').filter(Boolean)) {
      y = checkPageBreak(doc, y, 8);
      const match = item.match(/^(.+?)[\s\-–—]+\$?([\d,]+(?:\.\d{2})?)\s*$/);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.text);
      if (match) {
        doc.text(match[1].trim(), 25, y);
        doc.text(`$${match[2]}`, 175, y, { align: 'right' });
      } else {
        doc.text(item.replace(/^[\s•\-*]+/, '').trim(), 25, y);
      }
      y += 6;
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, y - 2, MARGIN_RIGHT, y - 2);
    }
  } else {
    const itemName = `${opts.project?.title || 'Web Development Services'} — ${tier?.label || 'Custom'} Package`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);
    const nameLines = doc.splitTextToSize(itemName, 120);
    doc.text(nameLines, 25, y);
    doc.text(tier ? `$${tier.price.toLocaleString()}.00` : '$—', 175, y, { align: 'right' });
    y += nameLines.length * 4 + 3;

    if (tier) {
      for (const feat of tier.features) {
        y = checkPageBreak(doc, y, 5);
        doc.setFontSize(7.5);
        doc.setTextColor(...BRAND.muted);
        doc.text(`  •  ${feat}`, 28, y);
        y += 3.5;
      }
    }
    y += 3;
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
    y += 5;
  }

  y = checkPageBreak(doc, y, 25);
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

  y = drawSectionTitle(doc, y, 'PAYMENT METHODS');
  y = drawBullet(doc, y, 'PayPal: info@erictomchik.com');
  y = drawBullet(doc, y, 'Stripe: Available at erictomchik.com');
  y += 2;
  y = drawText(doc, y, 'Payment is due within 30 days of invoice date. Late payments are subject to a 1.5% monthly fee.', { size: 8, color: BRAND.muted });
  y += 5;

  y = checkPageBreak(doc, y, 16);
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.primary);
  doc.text('Thank you for your business!', 105, y + 7.5, { align: 'center' });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { doc.setPage(i); drawFooter(doc, i, totalPages); }

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
  doc.text(`Date: ${today}`, MARGIN_LEFT, y);
  doc.text(`Prepared for: ${opts.client.name}${opts.client.company ? ` — ${opts.client.company}` : ''}`, 80, y);
  y += 10;

  y = drawSectionTitle(doc, y, 'EXECUTIVE SUMMARY');
  y = drawText(doc, y, `Thank you for considering my web development services. This proposal outlines the scope, timeline, and pricing for ${opts.project?.title || 'your upcoming project'}. I bring modern technology, professional design, and reliable Gulf Coast service to every project.`);
  y += 3;

  y = drawSectionTitle(doc, y, 'SCOPE OF WORK');
  if (tier) {
    y = checkPageBreak(doc, y, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.dark);
    doc.text(`${tier.label} Package — $${tier.price.toLocaleString()}`, MARGIN_LEFT, y);
    y += 6;
  }

  if (opts.customScope) {
    for (const line of opts.customScope.split('\n').filter(Boolean)) {
      y = drawBullet(doc, y, line.replace(/^[\s•\-*]+/, '').trim());
    }
  } else if (tier) {
    for (const feat of tier.features) y = drawBullet(doc, y, feat);
  }

  if (opts.project?.description) {
    y += 3;
    y = drawText(doc, y, opts.project.description, { color: BRAND.muted, size: 8 });
  }
  y += 3;

  y = drawSectionTitle(doc, y, 'TECHNOLOGY STACK');
  const techItems: [string, string][] = [
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
    y = checkPageBreak(doc, y, 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);
    doc.text(name, 25, y);
    const nameWidth = doc.getTextWidth(name);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(` — ${desc}`, 25 + nameWidth, y);
    y += 5.5;
  }
  y += 3;

  y = drawSectionTitle(doc, y, 'TIMELINE');
  const timeline = opts.serviceTier === 'starter'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Week 2'], ['Review & Revisions', 'Week 3'], ['Launch & Handoff', 'Week 3']]
    : opts.serviceTier === 'business_pro'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–4'], ['Review & Revisions', 'Week 5'], ['Launch & Handoff', 'Week 6']]
    : [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–8'], ['Review & Revisions', 'Weeks 9–10'], ['Launch & Handoff', 'Weeks 11–12']];

  if (opts.project?.start_date) y = drawKeyValue(doc, y, 'Start:', opts.project.start_date);
  if (opts.project?.target_date) y = drawKeyValue(doc, y, 'Target:', opts.project.target_date);
  y += 2;

  for (const [phase, time] of timeline) {
    y = checkPageBreak(doc, y, 10);
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

  y = drawSectionTitle(doc, y, 'PRICING');
  if (tier) {
    y = checkPageBreak(doc, y, 35);
    doc.setFillColor(...BRAND.dark);
    doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.white);
    doc.text(`$${tier.price.toLocaleString()}`, 105, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 190, 210);
    doc.text(`${tier.label} Package`, 105, y + 15, { align: 'center' });
    y += 28;

    const thalf = tier.price / 2;
    y = drawBullet(doc, y, `50% deposit upon signing — $${thalf.toLocaleString()}`);
    y = drawBullet(doc, y, `50% upon completion — $${thalf.toLocaleString()}`);
  }
  y += 5;

  y = drawSectionTitle(doc, y, 'WHY CHOOSE ME');
  const reasons = [
    '9 successful websites built for local businesses',
    'Published author on AI & business technology (4 books)',
    'Gulf Coast local — in-person meetings available',
    'Modern tech stack used by Fortune 500 companies',
    'Enterprise-grade hosting on Cloudflare\'s global network',
  ];
  for (const reason of reasons) {
    y = checkPageBreak(doc, y, 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.text);
    doc.setFillColor(...BRAND.success);
    doc.circle(23, y - 1.2, 1, 'F');
    doc.text(reason, 27, y);
    y += 5.5;
  }
  y += 5;

  y = checkPageBreak(doc, y, 5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('This proposal is valid for 30 days from the date above.', MARGIN_LEFT, y);
  y += 8;

  y = drawSignatureBlock(doc, y, opts.requireSignature ?? false);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { doc.setPage(i); drawFooter(doc, i, totalPages); }

  return doc;
}

// ═══════════════════════════════════════════════════════════════
// SIGNED PDF GENERATOR — embeds signatures into a copy of the PDF
// ═══════════════════════════════════════════════════════════════
export function generateSignedPDF(
  originalPdfBytes: ArrayBuffer,
  signerName: string,
  signatureDataUrl: string,
  signedAt: number,
  adminSignatureDataUrl?: string,
): jsPDF {
  // We can't easily modify existing PDF bytes with jsPDF, so we create a
  // new single-page "Signature Addendum" that references the original.
  const doc = new jsPDF('p', 'mm', 'a4');
  const signedDate = new Date(signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const signedTime = new Date(signedAt).toLocaleTimeString('en-US');

  // Header
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(...BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SIGNATURE CONFIRMATION', 105, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 210);
  doc.text('Eric Tomchik  ·  ArcLight Press  ·  Web Development', 105, 22, { align: 'center' });

  let y = 45;

  // Signed badge
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(60, y, 90, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.success);
  doc.text('✓  DOCUMENT SIGNED', 105, y + 9, { align: 'center' });
  y += 25;

  // Details
  y = drawSectionTitle(doc, y, 'SIGNATURE DETAILS');
  y = drawKeyValue(doc, y, 'Signed by:', signerName);
  y = drawKeyValue(doc, y, 'Date:', signedDate);
  y = drawKeyValue(doc, y, 'Time:', signedTime);
  y += 5;

  // Client signature image
  y = drawSectionTitle(doc, y, 'CLIENT SIGNATURE');
  if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
    try {
      doc.setFillColor(...BRAND.light);
      doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 40, 3, 3, 'F');
      doc.addImage(signatureDataUrl, 'PNG', MARGIN_LEFT + 10, y + 2, 100, 36);
      y += 44;
    } catch {
      y = drawText(doc, y, `[Signature on file for ${signerName}]`, { color: BRAND.muted });
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(signerName, MARGIN_LEFT, y + 2);
  doc.setDrawColor(...BRAND.line);
  doc.line(MARGIN_LEFT, y, 90, y);
  doc.text('Date: ' + signedDate, MARGIN_LEFT, y + 7);
  y += 15;

  // Admin/Developer signature
  y = drawSectionTitle(doc, y, 'DEVELOPER SIGNATURE');
  if (adminSignatureDataUrl && adminSignatureDataUrl.startsWith('data:image')) {
    try {
      doc.setFillColor(...BRAND.light);
      doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 40, 3, 3, 'F');
      doc.addImage(adminSignatureDataUrl, 'PNG', MARGIN_LEFT + 10, y + 2, 100, 36);
      y += 44;
    } catch {
      y = drawText(doc, y, '[Developer signature on file]', { color: BRAND.muted });
    }
  } else {
    doc.setDrawColor(...BRAND.line);
    doc.line(MARGIN_LEFT, y + 12, 90, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text('Eric Tomchik — Developer', MARGIN_LEFT, y + 17);
    y += 22;
  }

  y += 8;

  // Legal notice
  y = checkPageBreak(doc, y, 20);
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  const legalText = 'This electronic signature is legally binding under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA). Both parties consent that this digital signature carries the same legal weight as a handwritten signature.';
  const legalLines = doc.splitTextToSize(legalText, CONTENT_WIDTH - 10);
  doc.text(legalLines, MARGIN_LEFT + 5, y + 5);

  drawFooter(doc, 1, 1);

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
