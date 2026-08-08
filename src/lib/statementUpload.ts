/**
 * Shared validation rules for merchant processing-statement uploads.
 *
 * These live here (rather than inline in the API route) so the browser can
 * reject an obviously bad file before spending the user's upload bandwidth,
 * and the server can enforce exactly the same rules afterwards. The server is
 * the authority — never trust the client-side check alone.
 */

export const MAX_STATEMENT_BYTES = 10 * 1024 * 1024; // 10 MB

/** Content types we accept. A processing statement is a PDF or a photo of one. */
export const ALLOWED_STATEMENT_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export const ALLOWED_STATEMENT_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.heic',
  '.heif',
] as const;

/** Human-readable accept attribute for the file input. */
export const STATEMENT_ACCEPT_ATTR = ALLOWED_STATEMENT_EXTENSIONS.join(',');

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Strip any directory components and unsafe characters from a client-supplied
 * filename. We only ever display this string — never use it as a path — but
 * sanitizing keeps it from carrying surprises into emails or the admin UI.
 */
export function sanitizeStatementFilename(rawName: string): string {
  const base = rawName.split(/[/\\]/).pop() ?? 'statement';
  const cleaned = base.replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, ' ').trim();
  const safe = cleaned.length > 0 ? cleaned : 'statement';
  return safe.length > 120 ? safe.slice(0, 120) : safe;
}

export interface StatementValidationResult {
  ok: boolean;
  error?: string;
}

export function validateStatementFile(file: {
  name: string;
  size: number;
  type: string;
}): StatementValidationResult {
  if (file.size === 0) {
    return { ok: false, error: 'That file appears to be empty.' };
  }
  if (file.size > MAX_STATEMENT_BYTES) {
    return {
      ok: false,
      error: `That file is ${formatBytes(file.size)}. Please keep it under ${formatBytes(
        MAX_STATEMENT_BYTES
      )}.`,
    };
  }

  const lowerName = file.name.toLowerCase();
  const extensionOk = ALLOWED_STATEMENT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const typeOk = (ALLOWED_STATEMENT_TYPES as readonly string[]).includes(file.type);

  // Browsers occasionally report an empty or generic type (notably for HEIC
  // photos from iPhones), so an allowed extension is enough on its own. But a
  // type we explicitly don't allow is always rejected.
  if (file.type && !typeOk) {
    return { ok: false, error: 'Please upload a PDF or an image (PNG, JPG, HEIC).' };
  }
  if (!extensionOk) {
    return { ok: false, error: 'Please upload a PDF or an image (PNG, JPG, HEIC).' };
  }

  return { ok: true };
}
