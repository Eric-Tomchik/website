import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, RGB, degrees } from 'pdf-lib';

// ─── Brand Colors (0–1 range for pdf-lib) ────────────────────
const BRAND = {
  primary:  rgb(30/255, 64/255, 175/255),
  dark:     rgb(15/255, 23/255, 42/255),
  text:     rgb(30/255, 41/255, 59/255),
  muted:    rgb(100/255, 116/255, 139/255),
  light:    rgb(241/255, 245/255, 249/255),
  accent:   rgb(59/255, 130/255, 246/255),
  white:    rgb(1, 1, 1),
  line:     rgb(226/255, 232/255, 240/255),
  success:  rgb(22/255, 163/255, 74/255),
  headerSub: rgb(180/255, 190/255, 210/255),
  legalBg:  rgb(254/255, 249/255, 195/255),
  legalText: rgb(113/255, 63/255, 18/255),
  thankBg:  rgb(240/255, 249/255, 255/255),
  signedBg: rgb(220/255, 252/255, 231/255),
};

// ─── Layout constants (in points — 1mm ≈ 2.835pt) ────────────
const MM = 2.835;
const PW = 210 * MM;   // page width  ~595pt
const PH = 297 * MM;   // page height ~841pt
const ML = 20 * MM;    // margin left
const MR = 190 * MM;   // margin right
const CW = MR - ML;    // content width
const FOOTER_H = 22 * MM;
const MAX_Y = PH - FOOTER_H; // safe bottom

// ─── Fonts cache ─────────────────────────────────────────────
interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

// ─── Context passed to every helper ──────────────────────────
interface Ctx {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  pageCount: number;
}

// ─── Re-export types ─────────────────────────────────────────
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
    label: 'Starter', price: 1500,
    features: [
      'Single-page responsive website', 'Mobile-first design',
      'Contact form integration', 'Basic SEO optimization', '1 round of revisions',
    ],
  },
  business_pro: {
    label: 'Business Pro', price: 3500,
    features: [
      'Multi-page website (up to 5 pages)', 'Mobile-first responsive design',
      'Contact form + Google Maps integration', 'Full SEO optimization',
      'Social media integration', '3 rounds of revisions', '30-day post-launch support',
    ],
  },
  custom: {
    label: 'Custom Application', price: 7500,
    features: [
      'Full custom web application', 'Database integration',
      'User authentication system', 'Payment processing (Stripe/PayPal)',
      'Custom API development', 'Unlimited revisions', '90-day post-launch support',
    ],
  },
};

// ─── Coordinate helper: top-left mm → bottom-left pt ─────────
function ptY(yMm: number): number { return PH - yMm * MM; }
function ptX(xMm: number): number { return xMm * MM; }

// ─── Text wrapping (pdf-lib has no splitTextToSize) ──────────
function wrapText(font: PDFFont, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

// ─── Rounded rectangle path ─────────────────────────────────
function drawRoundedRect(
  page: PDFPage, x: number, y: number, w: number, h: number, r: number,
  opts: { color?: RGB; borderColor?: RGB; borderWidth?: number }
) {
  // y is top-left in mm-style already converted to pt bottom-left
  const k = 0.5522847498; // bezier arc magic number
  const path = [
    `${x + r} ${y} m`,
    `${x + w - r} ${y} l`,
    `${x + w - r + r * k} ${y} ${x + w} ${y + r - r * k} ${x + w} ${y + r} c`,
    `${x + w} ${y + h - r} l`,
    `${x + w} ${y + h - r + r * k} ${x + w - r + r * k} ${y + h} ${x + w - r} ${y + h} c`,
    `${x + r} ${y + h} l`,
    `${x + r - r * k} ${y + h} ${x} ${y + h - r + r * k} ${x} ${y + h - r} c`,
    `${x} ${y + r} l`,
    `${x} ${y + r - r * k} ${x + r - r * k} ${y} ${x + r} ${y} c`,
  ].join(' ');
  // We'll use a simpler approach: just draw a filled rect (pdf-lib supports this)
  // For now, use borderRadius-free approach since pdf-lib lacks native rounded rect
  if (opts.color) {
    page.drawRectangle({
      x, y, width: w, height: h,
      color: opts.color,
      borderColor: opts.borderColor,
      borderWidth: opts.borderWidth ?? 0,
    });
  }
}

// ─── Page break check ────────────────────────────────────────
function checkBreak(ctx: Ctx, yMm: number, neededMm: number): number {
  if (yMm + neededMm > (PH - FOOTER_H) / MM) {
    ctx.page = ctx.doc.addPage([PW, PH]);
    ctx.pageCount++;
    return 25;
  }
  return yMm;
}

// ─── Draw page header ────────────────────────────────────────
function drawHeader(ctx: Ctx, title: string, _subtitle: string, docNum: string): number {
  const { page, fonts } = ctx;
  // Dark header bar
  page.drawRectangle({ x: 0, y: ptY(0), width: PW, height: 38 * MM, color: BRAND.dark });

  page.drawText('ERIC TOMCHIK', { x: ML, y: ptY(16), size: 18, font: fonts.bold, color: BRAND.white });
  page.drawText('Web Development & Digital Solutions', { x: ML, y: ptY(23), size: 8, font: fonts.regular, color: BRAND.headerSub });
  page.drawText('ArcLight Press  ·  Mississippi Gulf Coast', { x: ML, y: ptY(28), size: 8, font: fonts.regular, color: BRAND.headerSub });

  // Badge
  const badgeW = fonts.bold.widthOfTextAtSize(title, 9) + 16 * MM;
  const badgeX = MR - badgeW;
  page.drawRectangle({ x: badgeX, y: ptY(10) - 10 * MM, width: badgeW, height: 10 * MM, color: BRAND.accent });
  page.drawText(title, { x: badgeX + 8 * MM, y: ptY(17), size: 9, font: fonts.bold, color: BRAND.white });

  page.drawText(docNum, { x: badgeX, y: ptY(28), size: 7, font: fonts.regular, color: BRAND.headerSub });

  return 48;
}

// ─── Section title ───────────────────────────────────────────
function drawSectionTitle(ctx: Ctx, yMm: number, title: string): number {
  yMm = checkBreak(ctx, yMm, 16);
  ctx.page.drawText(title, { x: ML, y: ptY(yMm), size: 11, font: ctx.fonts.bold, color: BRAND.primary });
  yMm += 2;
  ctx.page.drawLine({ start: { x: ML, y: ptY(yMm) }, end: { x: MR, y: ptY(yMm) }, thickness: 0.5 * MM, color: BRAND.accent });
  return yMm + 7;
}

// ─── Text paragraph ──────────────────────────────────────────
function drawTextBlock(ctx: Ctx, yMm: number, text: string, opts?: {
  bold?: boolean; size?: number; color?: RGB; indent?: number;
}): number {
  const sz = opts?.size ?? 9;
  const indent = opts?.indent != null ? opts.indent * MM : ML;
  const maxW = MR - indent;
  const font = opts?.bold ? ctx.fonts.bold : ctx.fonts.regular;
  const color = opts?.color ?? BRAND.text;
  const lines = wrapText(font, text, maxW, sz);
  const lh = sz * 0.45;
  for (const line of lines) {
    yMm = checkBreak(ctx, yMm, lh + 1);
    ctx.page.drawText(line, { x: indent, y: ptY(yMm), size: sz, font, color });
    yMm += lh;
  }
  return yMm + 2;
}

// ─── Bullet point ────────────────────────────────────────────
function drawBullet(ctx: Ctx, yMm: number, text: string, indent: number = 25): number {
  const maxW = MR - indent * MM - 3 * MM;
  const lines = wrapText(ctx.fonts.regular, text, maxW, 9);
  const totalH = lines.length * 4.2 + 1.5;
  yMm = checkBreak(ctx, yMm, totalH);

  ctx.page.drawCircle({ x: (indent - 2) * MM, y: ptY(yMm - 1.2), size: 1 * MM, color: BRAND.accent });

  for (let i = 0; i < lines.length; i++) {
    ctx.page.drawText(lines[i], { x: (indent + 2) * MM, y: ptY(yMm + i * 4.2), size: 9, font: ctx.fonts.regular, color: BRAND.text });
  }
  return yMm + totalH;
}

// ─── Key-value pair ──────────────────────────────────────────
function drawKeyValue(ctx: Ctx, yMm: number, key: string, value: string, indent: number = 20): number {
  yMm = checkBreak(ctx, yMm, 6);
  ctx.page.drawText(key, { x: indent * MM, y: ptY(yMm), size: 9, font: ctx.fonts.bold, color: BRAND.muted });
  const valLines = wrapText(ctx.fonts.regular, value, MR - (indent + 42) * MM, 9);
  for (let i = 0; i < valLines.length; i++) {
    ctx.page.drawText(valLines[i], { x: (indent + 40) * MM, y: ptY(yMm + i * 4.2), size: 9, font: ctx.fonts.regular, color: BRAND.text });
  }
  return yMm + Math.max(5.5, valLines.length * 4.2 + 1);
}

// ─── Footer ──────────────────────────────────────────────────
function drawFooter(page: PDFPage, fonts: Fonts, pageNum: number, totalPages: number) {
  const h = 297;
  page.drawLine({ start: { x: ML, y: ptY(h - 18) }, end: { x: MR, y: ptY(h - 18) }, thickness: 0.3 * MM, color: BRAND.line });
  page.drawText('info@erictomchik.com  ·  erictomchik.com', { x: ML, y: ptY(h - 12), size: 7, font: fonts.regular, color: BRAND.muted });
  const pageText = `Page ${pageNum} of ${totalPages}`;
  const pw = fonts.regular.widthOfTextAtSize(pageText, 7);
  page.drawText(pageText, { x: MR - pw, y: ptY(h - 12), size: 7, font: fonts.regular, color: BRAND.muted });
}

// ─── Info box ────────────────────────────────────────────────
function drawInfoBox(ctx: Ctx, yMm: number, label: string, lines: string[], xMm: number = 20, widthMm: number = 75): number {
  const boxH = 8 + lines.length * 4.5;
  yMm = checkBreak(ctx, yMm, boxH);
  ctx.page.drawRectangle({ x: xMm * MM, y: ptY(yMm + boxH), width: widthMm * MM, height: boxH * MM, color: BRAND.light });
  ctx.page.drawText(label.toUpperCase(), { x: (xMm + 5) * MM, y: ptY(yMm + 5), size: 7, font: ctx.fonts.bold, color: BRAND.muted });
  for (let i = 0; i < lines.length; i++) {
    ctx.page.drawText(lines[i], { x: (xMm + 5) * MM, y: ptY(yMm + 10 + i * 4.5), size: 9, font: ctx.fonts.regular, color: BRAND.text });
  }
  return boxH;
}

// ─── Signature block ─────────────────────────────────────────
function drawSignatureBlock(ctx: Ctx, yMm: number, requireSignature: boolean): number {
  yMm = checkBreak(ctx, yMm, 40);
  yMm = drawSectionTitle(ctx, yMm, 'SIGNATURES');
  if (requireSignature) {
    yMm = drawTextBlock(ctx, yMm, 'This document will be signed electronically via secure digital signature.', { size: 8, color: BRAND.muted });
    yMm += 3;
  }
  yMm = checkBreak(ctx, yMm, 28);

  // Developer signature line
  ctx.page.drawLine({ start: { x: ML, y: ptY(yMm + 12) }, end: { x: 90 * MM, y: ptY(yMm + 12) }, thickness: 0.3 * MM, color: BRAND.line });
  ctx.page.drawText('Eric Tomchik — Developer', { x: ML, y: ptY(yMm + 17), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  ctx.page.drawText('Date: _______________', { x: ML, y: ptY(yMm + 22), size: 8, font: ctx.fonts.regular, color: BRAND.muted });

  // Client signature line
  ctx.page.drawLine({ start: { x: 115 * MM, y: ptY(yMm + 12) }, end: { x: MR, y: ptY(yMm + 12) }, thickness: 0.3 * MM, color: BRAND.line });
  ctx.page.drawText('Client Signature', { x: 115 * MM, y: ptY(yMm + 17), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  ctx.page.drawText('Date: _______________', { x: 115 * MM, y: ptY(yMm + 22), size: 8, font: ctx.fonts.regular, color: BRAND.muted });

  return yMm + 30;
}

// ─── Initialize doc + fonts ──────────────────────────────────
async function createCtx(): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PW, PH]);
  const [regular, bold, italic, boldItalic] = await Promise.all([
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
    doc.embedFont(StandardFonts.HelveticaOblique),
    doc.embedFont(StandardFonts.HelveticaBoldOblique),
  ]);
  return { doc, fonts: { regular, bold, italic, boldItalic }, page, pageCount: 1 };
}

function finalize(ctx: Ctx) {
  const pages = ctx.doc.getPages();
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    drawFooter(pages[i], ctx.fonts, i + 1, total);
  }
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT
// ═══════════════════════════════════════════════════════════════
export async function generateContractPDF(opts: GeneratorOptions): Promise<Uint8Array> {
  const ctx = await createCtx();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docNum = `CT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(ctx, 'CONTRACT', 'Web Development Service Agreement', docNum);
  ctx.page.drawText(`Date: ${today}`, { x: ML, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  y += 8;

  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];
  const fromH = drawInfoBox(ctx, y, 'Developer', fromLines, 20, 75);
  const toH = drawInfoBox(ctx, y, 'Client', toLines, 105, 85);
  y += Math.max(fromH, toH) + 8;

  y = drawSectionTitle(ctx, y, 'PROJECT DETAILS');
  if (opts.project?.title) y = drawKeyValue(ctx, y, 'Project:', opts.project.title);
  if (opts.project?.description) y = drawKeyValue(ctx, y, 'Description:', opts.project.description);
  if (tier) y = drawKeyValue(ctx, y, 'Package:', `${tier.label} — $${tier.price.toLocaleString()}`);
  if (opts.project?.start_date) y = drawKeyValue(ctx, y, 'Start Date:', opts.project.start_date);
  if (opts.project?.target_date) y = drawKeyValue(ctx, y, 'Target Date:', opts.project.target_date);
  y += 3;

  y = drawSectionTitle(ctx, y, 'SCOPE OF WORK');
  if (opts.customScope) {
    for (const line of opts.customScope.split('\n').filter(Boolean)) {
      const clean = line.replace(/^[\s•\-*]+/, '').trim();
      if (clean) y = drawBullet(ctx, y, clean);
    }
  } else if (tier) {
    for (const feat of tier.features) y = drawBullet(ctx, y, feat);
  }
  y += 3;

  y = drawSectionTitle(ctx, y, 'PAYMENT TERMS');
  const price = tier?.price ?? 0;
  const half = price / 2;
  y = drawBullet(ctx, y, `50% deposit due upon signing${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(ctx, y, `50% balance due upon project completion${price ? ` ($${half.toLocaleString()})` : ''}`);
  y = drawBullet(ctx, y, 'Accepted payment methods: PayPal, Stripe');
  y = drawBullet(ctx, y, 'Late payments are subject to a 1.5% monthly fee');
  y += 3;

  y = drawSectionTitle(ctx, y, 'REVISION POLICY');
  const revisions = opts.serviceTier === 'starter' ? '1 round' : opts.serviceTier === 'business_pro' ? '3 rounds' : 'Unlimited rounds';
  y = drawBullet(ctx, y, `${revisions} of revisions included in project scope`);
  y = drawBullet(ctx, y, 'Additional revisions billed at $75/hour');
  y = drawBullet(ctx, y, 'Revision requests must be submitted in writing via email or client portal');
  y += 3;

  y = drawSectionTitle(ctx, y, 'INTELLECTUAL PROPERTY');
  y = drawTextBlock(ctx, y, 'Upon receipt of full payment, all custom code, designs, and content created specifically for this project shall become the sole property of the Client. The Developer retains the right to showcase the completed project in their professional portfolio.');
  y += 3;

  y = drawSectionTitle(ctx, y, 'TERMINATION');
  y = drawTextBlock(ctx, y, 'Either party may terminate this agreement with seven (7) days written notice. In the event of termination, the Client shall be responsible for payment of all work completed up to the date of termination, at the Developer\'s standard hourly rate of $75/hour.');
  y += 5;

  y = drawSignatureBlock(ctx, y, opts.requireSignature ?? false);
  finalize(ctx);
  return ctx.doc.save();
}

// ═══════════════════════════════════════════════════════════════
// INVOICE
// ═══════════════════════════════════════════════════════════════
export async function generateInvoicePDF(opts: GeneratorOptions): Promise<Uint8Array> {
  const ctx = await createCtx();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const invNum = `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(ctx, 'INVOICE', 'Payment Invoice', invNum);
  ctx.page.drawText(`Invoice Date: ${today}`, { x: ML, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  ctx.page.drawText(`Due Date: ${dueDate}`, { x: 120 * MM, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  y += 8;

  const fromLines = ['Eric Tomchik', 'ArcLight Press', 'Mississippi Gulf Coast', 'info@erictomchik.com'];
  const toLines = [opts.client.name, ...(opts.client.company ? [opts.client.company] : []), opts.client.email, ...(opts.client.phone ? [opts.client.phone] : [])];
  const fromH = drawInfoBox(ctx, y, 'From', fromLines, 20, 75);
  const toH = drawInfoBox(ctx, y, 'Bill To', toLines, 105, 85);
  y += Math.max(fromH, toH) + 10;

  y = drawSectionTitle(ctx, y, 'ITEMS');

  // Table header
  y = checkBreak(ctx, y, 12);
  ctx.page.drawRectangle({ x: ML, y: ptY(y + 8), width: CW, height: 8 * MM, color: BRAND.dark });
  ctx.page.drawText('Description', { x: 25 * MM, y: ptY(y + 5.5), size: 8, font: ctx.fonts.bold, color: BRAND.white });
  const amtW = ctx.fonts.bold.widthOfTextAtSize('Amount', 8);
  ctx.page.drawText('Amount', { x: 175 * MM - amtW, y: ptY(y + 5.5), size: 8, font: ctx.fonts.bold, color: BRAND.white });
  y += 12;

  if (opts.customScope) {
    for (const item of opts.customScope.split('\n').filter(Boolean)) {
      y = checkBreak(ctx, y, 8);
      const match = item.match(/^(.+?)[\s\-–—]+\$?([\d,]+(?:\.\d{2})?)\s*$/);
      if (match) {
        ctx.page.drawText(match[1].trim(), { x: 25 * MM, y: ptY(y), size: 9, font: ctx.fonts.regular, color: BRAND.text });
        const valStr = `$${match[2]}`;
        const vw = ctx.fonts.regular.widthOfTextAtSize(valStr, 9);
        ctx.page.drawText(valStr, { x: 175 * MM - vw, y: ptY(y), size: 9, font: ctx.fonts.regular, color: BRAND.text });
      } else {
        ctx.page.drawText(item.replace(/^[\s•\-*]+/, '').trim(), { x: 25 * MM, y: ptY(y), size: 9, font: ctx.fonts.regular, color: BRAND.text });
      }
      y += 6;
      ctx.page.drawLine({ start: { x: ML, y: ptY(y - 2) }, end: { x: MR, y: ptY(y - 2) }, thickness: 0.2 * MM, color: BRAND.line });
    }
  } else {
    const itemName = `${opts.project?.title || 'Web Development Services'} — ${tier?.label || 'Custom'} Package`;
    const nameLines = wrapText(ctx.fonts.regular, itemName, 120 * MM, 9);
    for (let i = 0; i < nameLines.length; i++) {
      ctx.page.drawText(nameLines[i], { x: 25 * MM, y: ptY(y + i * 4), size: 9, font: ctx.fonts.regular, color: BRAND.text });
    }
    if (tier) {
      const priceStr = `$${tier.price.toLocaleString()}.00`;
      const pw2 = ctx.fonts.regular.widthOfTextAtSize(priceStr, 9);
      ctx.page.drawText(priceStr, { x: 175 * MM - pw2, y: ptY(y), size: 9, font: ctx.fonts.regular, color: BRAND.text });
    }
    y += nameLines.length * 4 + 3;

    if (tier) {
      for (const feat of tier.features) {
        y = checkBreak(ctx, y, 5);
        ctx.page.drawText(`  •  ${feat}`, { x: 28 * MM, y: ptY(y), size: 7.5, font: ctx.fonts.regular, color: BRAND.muted });
        y += 3.5;
      }
    }
    y += 3;
    ctx.page.drawLine({ start: { x: ML, y: ptY(y) }, end: { x: MR, y: ptY(y) }, thickness: 0.2 * MM, color: BRAND.line });
    y += 5;
  }

  // Total box
  y = checkBreak(ctx, y, 25);
  const totalPrice = tier ? `$${tier.price.toLocaleString()}.00` : '$—';
  ctx.page.drawRectangle({ x: 120 * MM, y: ptY(y + 18), width: 70 * MM, height: 18 * MM, color: BRAND.light });
  ctx.page.drawText('Subtotal:', { x: 125 * MM, y: ptY(y + 6), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  const sw = ctx.fonts.regular.widthOfTextAtSize(totalPrice, 8);
  ctx.page.drawText(totalPrice, { x: 185 * MM - sw, y: ptY(y + 6), size: 8, font: ctx.fonts.regular, color: BRAND.muted });

  ctx.page.drawLine({ start: { x: 125 * MM, y: ptY(y + 9) }, end: { x: 185 * MM, y: ptY(y + 9) }, thickness: 0.2 * MM, color: BRAND.line });

  ctx.page.drawText('TOTAL DUE:', { x: 125 * MM, y: ptY(y + 15), size: 11, font: ctx.fonts.bold, color: BRAND.dark });
  const tw = ctx.fonts.bold.widthOfTextAtSize(totalPrice, 11);
  ctx.page.drawText(totalPrice, { x: 185 * MM - tw, y: ptY(y + 15), size: 11, font: ctx.fonts.bold, color: BRAND.dark });
  y += 28;

  y = drawSectionTitle(ctx, y, 'PAYMENT METHODS');
  y = drawBullet(ctx, y, 'PayPal: info@erictomchik.com');
  y = drawBullet(ctx, y, 'Stripe: Available at erictomchik.com');
  y += 2;
  y = drawTextBlock(ctx, y, 'Payment is due within 30 days of invoice date. Late payments are subject to a 1.5% monthly fee.', { size: 8, color: BRAND.muted });
  y += 5;

  // Thank you banner
  y = checkBreak(ctx, y, 16);
  ctx.page.drawRectangle({ x: ML, y: ptY(y + 12), width: CW, height: 12 * MM, color: BRAND.thankBg });
  const tyText = 'Thank you for your business!';
  const tyW = ctx.fonts.italic.widthOfTextAtSize(tyText, 10);
  ctx.page.drawText(tyText, { x: (PW - tyW) / 2, y: ptY(y + 7.5), size: 10, font: ctx.fonts.italic, color: BRAND.primary });

  finalize(ctx);
  return ctx.doc.save();
}

// ═══════════════════════════════════════════════════════════════
// PROPOSAL
// ═══════════════════════════════════════════════════════════════
export async function generateProposalPDF(opts: GeneratorOptions): Promise<Uint8Array> {
  const ctx = await createCtx();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const propNum = `PROP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const tier = opts.serviceTier ? SERVICE_TIERS[opts.serviceTier] : null;

  let y = drawHeader(ctx, 'PROPOSAL', 'Project Proposal', propNum);
  ctx.page.drawText(`Date: ${today}`, { x: ML, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  const prepText = `Prepared for: ${opts.client.name}${opts.client.company ? ` — ${opts.client.company}` : ''}`;
  ctx.page.drawText(prepText, { x: 80 * MM, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  y += 10;

  y = drawSectionTitle(ctx, y, 'EXECUTIVE SUMMARY');
  y = drawTextBlock(ctx, y, `Thank you for considering my web development services. This proposal outlines the scope, timeline, and pricing for ${opts.project?.title || 'your upcoming project'}. I bring modern technology, professional design, and reliable Gulf Coast service to every project.`);
  y += 3;

  y = drawSectionTitle(ctx, y, 'SCOPE OF WORK');
  if (tier) {
    y = checkBreak(ctx, y, 8);
    ctx.page.drawText(`${tier.label} Package — $${tier.price.toLocaleString()}`, { x: ML, y: ptY(y), size: 10, font: ctx.fonts.bold, color: BRAND.dark });
    y += 6;
  }
  if (opts.customScope) {
    for (const line of opts.customScope.split('\n').filter(Boolean)) {
      y = drawBullet(ctx, y, line.replace(/^[\s•\-*]+/, '').trim());
    }
  } else if (tier) {
    for (const feat of tier.features) y = drawBullet(ctx, y, feat);
  }
  if (opts.project?.description) {
    y += 3;
    y = drawTextBlock(ctx, y, opts.project.description, { color: BRAND.muted, size: 8 });
  }
  y += 3;

  y = drawSectionTitle(ctx, y, 'TECHNOLOGY STACK');
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
    y = checkBreak(ctx, y, 7);
    ctx.page.drawText(name, { x: 25 * MM, y: ptY(y), size: 9, font: ctx.fonts.bold, color: BRAND.text });
    const nameW = ctx.fonts.bold.widthOfTextAtSize(name, 9);
    ctx.page.drawText(` — ${desc}`, { x: 25 * MM + nameW, y: ptY(y), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
    y += 5.5;
  }
  y += 3;

  y = drawSectionTitle(ctx, y, 'TIMELINE');
  const timeline = opts.serviceTier === 'starter'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Week 2'], ['Review & Revisions', 'Week 3'], ['Launch & Handoff', 'Week 3']]
    : opts.serviceTier === 'business_pro'
    ? [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–4'], ['Review & Revisions', 'Week 5'], ['Launch & Handoff', 'Week 6']]
    : [['Discovery & Planning', 'Week 1'], ['Design & Development', 'Weeks 2–8'], ['Review & Revisions', 'Weeks 9–10'], ['Launch & Handoff', 'Weeks 11–12']];

  if (opts.project?.start_date) y = drawKeyValue(ctx, y, 'Start:', opts.project.start_date);
  if (opts.project?.target_date) y = drawKeyValue(ctx, y, 'Target:', opts.project.target_date);
  y += 2;
  for (const [phase, time] of timeline) {
    y = checkBreak(ctx, y, 10);
    ctx.page.drawRectangle({ x: 25 * MM, y: ptY(y + 3.5), width: 160 * MM, height: 7 * MM, color: BRAND.light });
    ctx.page.drawText(phase, { x: 30 * MM, y: ptY(y), size: 8.5, font: ctx.fonts.regular, color: BRAND.text });
    const tw2 = ctx.fonts.regular.widthOfTextAtSize(time, 8.5);
    ctx.page.drawText(time, { x: 180 * MM - tw2, y: ptY(y), size: 8.5, font: ctx.fonts.regular, color: BRAND.muted });
    y += 8;
  }
  y += 3;

  y = drawSectionTitle(ctx, y, 'PRICING');
  if (tier) {
    y = checkBreak(ctx, y, 35);
    ctx.page.drawRectangle({ x: ML, y: ptY(y + 20), width: CW, height: 20 * MM, color: BRAND.dark });
    const pText = `$${tier.price.toLocaleString()}`;
    const pW = ctx.fonts.bold.widthOfTextAtSize(pText, 13);
    ctx.page.drawText(pText, { x: (PW - pW) / 2, y: ptY(y + 9), size: 13, font: ctx.fonts.bold, color: BRAND.white });
    const pkgText = `${tier.label} Package`;
    const pkgW = ctx.fonts.regular.widthOfTextAtSize(pkgText, 8);
    ctx.page.drawText(pkgText, { x: (PW - pkgW) / 2, y: ptY(y + 15), size: 8, font: ctx.fonts.regular, color: BRAND.headerSub });
    y += 28;

    const thalf = tier.price / 2;
    y = drawBullet(ctx, y, `50% deposit upon signing — $${thalf.toLocaleString()}`);
    y = drawBullet(ctx, y, `50% upon completion — $${thalf.toLocaleString()}`);
  }
  y += 5;

  y = drawSectionTitle(ctx, y, 'WHY CHOOSE ME');
  const reasons = [
    '9 successful websites built for local businesses',
    'Published author on AI & business technology (4 books)',
    'Gulf Coast local — in-person meetings available',
    'Modern tech stack used by Fortune 500 companies',
    'Enterprise-grade hosting on Cloudflare\'s global network',
  ];
  for (const reason of reasons) {
    y = checkBreak(ctx, y, 7);
    ctx.page.drawCircle({ x: 23 * MM, y: ptY(y - 1.2), size: 1 * MM, color: BRAND.success });
    ctx.page.drawText(reason, { x: 27 * MM, y: ptY(y), size: 9, font: ctx.fonts.regular, color: BRAND.text });
    y += 5.5;
  }
  y += 5;

  y = checkBreak(ctx, y, 5);
  ctx.page.drawText('This proposal is valid for 30 days from the date above.', { x: ML, y: ptY(y), size: 8, font: ctx.fonts.italic, color: BRAND.muted });
  y += 8;

  y = drawSignatureBlock(ctx, y, opts.requireSignature ?? false);
  finalize(ctx);
  return ctx.doc.save();
}

// ═══════════════════════════════════════════════════════════════
// SIGNED PDF
// ═══════════════════════════════════════════════════════════════
export async function generateSignedPDF(
  _originalPdfBytes: ArrayBuffer,
  signerName: string,
  signatureDataUrl: string,
  signedAt: number,
  adminSignatureDataUrl?: string,
): Promise<Uint8Array> {
  const ctx = await createCtx();
  const signedDate = new Date(signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const signedTime = new Date(signedAt).toLocaleTimeString('en-US');

  // Header
  ctx.page.drawRectangle({ x: 0, y: ptY(32), width: PW, height: 32 * MM, color: BRAND.dark });
  const hText = 'SIGNATURE CONFIRMATION';
  const hW = ctx.fonts.bold.widthOfTextAtSize(hText, 16);
  ctx.page.drawText(hText, { x: (PW - hW) / 2, y: ptY(14), size: 16, font: ctx.fonts.bold, color: BRAND.white });
  const subText = 'Eric Tomchik  ·  ArcLight Press  ·  Web Development';
  const subW = ctx.fonts.regular.widthOfTextAtSize(subText, 8);
  ctx.page.drawText(subText, { x: (PW - subW) / 2, y: ptY(22), size: 8, font: ctx.fonts.regular, color: BRAND.headerSub });

  let y = 45;

  // Signed badge
  ctx.page.drawRectangle({ x: 60 * MM, y: ptY(y + 14), width: 90 * MM, height: 14 * MM, color: BRAND.signedBg });
  const badgeText = 'DOCUMENT SIGNED';
  const badgeW = ctx.fonts.bold.widthOfTextAtSize(badgeText, 12);
  ctx.page.drawText(badgeText, { x: (PW - badgeW) / 2, y: ptY(y + 9), size: 12, font: ctx.fonts.bold, color: BRAND.success });
  y += 25;

  y = drawSectionTitle(ctx, y, 'SIGNATURE DETAILS');
  y = drawKeyValue(ctx, y, 'Signed by:', signerName);
  y = drawKeyValue(ctx, y, 'Date:', signedDate);
  y = drawKeyValue(ctx, y, 'Time:', signedTime);
  y += 5;

  // Client signature image
  y = drawSectionTitle(ctx, y, 'CLIENT SIGNATURE');
  if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
    try {
      const base64Data = signatureDataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const sigImg = await ctx.doc.embedPng(imgBytes);
      ctx.page.drawRectangle({ x: ML, y: ptY(y + 40), width: CW, height: 40 * MM, color: BRAND.light });
      ctx.page.drawImage(sigImg, { x: ML + 10 * MM, y: ptY(y + 38), width: 100 * MM, height: 36 * MM });
      y += 44;
    } catch {
      y = drawTextBlock(ctx, y, `[Signature on file for ${signerName}]`, { color: BRAND.muted });
    }
  }

  ctx.page.drawLine({ start: { x: ML, y: ptY(y) }, end: { x: 90 * MM, y: ptY(y) }, thickness: 0.3 * MM, color: BRAND.line });
  ctx.page.drawText(signerName, { x: ML, y: ptY(y + 2), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  ctx.page.drawText(`Date: ${signedDate}`, { x: ML, y: ptY(y + 7), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
  y += 15;

  // Developer signature
  y = drawSectionTitle(ctx, y, 'DEVELOPER SIGNATURE');
  if (adminSignatureDataUrl && adminSignatureDataUrl.startsWith('data:image')) {
    try {
      const base64Data = adminSignatureDataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const sigImg = await ctx.doc.embedPng(imgBytes);
      ctx.page.drawRectangle({ x: ML, y: ptY(y + 40), width: CW, height: 40 * MM, color: BRAND.light });
      ctx.page.drawImage(sigImg, { x: ML + 10 * MM, y: ptY(y + 38), width: 100 * MM, height: 36 * MM });
      y += 44;
    } catch {
      y = drawTextBlock(ctx, y, '[Developer signature on file]', { color: BRAND.muted });
    }
  } else {
    ctx.page.drawLine({ start: { x: ML, y: ptY(y + 12) }, end: { x: 90 * MM, y: ptY(y + 12) }, thickness: 0.3 * MM, color: BRAND.line });
    ctx.page.drawText('Eric Tomchik — Developer', { x: ML, y: ptY(y + 17), size: 8, font: ctx.fonts.regular, color: BRAND.muted });
    y += 22;
  }
  y += 8;

  // Legal notice
  y = checkBreak(ctx, y, 20);
  ctx.page.drawRectangle({ x: ML, y: ptY(y + 16), width: CW, height: 16 * MM, color: BRAND.legalBg });
  const legalText = 'This electronic signature is legally binding under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA). Both parties consent that this digital signature carries the same legal weight as a handwritten signature.';
  const legalLines = wrapText(ctx.fonts.regular, legalText, CW - 10 * MM, 7);
  for (let i = 0; i < legalLines.length; i++) {
    ctx.page.drawText(legalLines[i], { x: ML + 5 * MM, y: ptY(y + 5 + i * 3), size: 7, font: ctx.fonts.regular, color: BRAND.legalText });
  }

  finalize(ctx);
  return ctx.doc.save();
}

// ─── Main entry point ────────────────────────────────────────
export async function generatePDF(type: 'contract' | 'invoice' | 'proposal', opts: GeneratorOptions): Promise<Uint8Array> {
  switch (type) {
    case 'contract': return generateContractPDF(opts);
    case 'invoice': return generateInvoicePDF(opts);
    case 'proposal': return generateProposalPDF(opts);
  }
}
