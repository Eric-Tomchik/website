import { describe, it, expect } from 'vitest';
import {
  MAX_STATEMENT_BYTES,
  STATEMENT_ACCEPT_ATTR,
  formatBytes,
  sanitizeStatementFilename,
  validateStatementFile,
} from '../src/lib/statementUpload';

describe('validateStatementFile', () => {
  it('accepts a normal PDF statement', () => {
    expect(
      validateStatementFile({ name: 'March-Statement.pdf', size: 240_000, type: 'application/pdf' })
    ).toEqual({ ok: true });
  });

  it('accepts photos of a statement', () => {
    for (const [name, type] of [
      ['statement.png', 'image/png'],
      ['statement.jpg', 'image/jpeg'],
      ['statement.jpeg', 'image/jpeg'],
      ['statement.webp', 'image/webp'],
    ] as const) {
      expect(validateStatementFile({ name, size: 100_000, type }).ok).toBe(true);
    }
  });

  it('accepts an iPhone HEIC photo even when the browser reports no MIME type', () => {
    expect(validateStatementFile({ name: 'IMG_0421.HEIC', size: 2_000_000, type: '' }).ok).toBe(
      true
    );
  });

  it('rejects an empty file', () => {
    const result = validateStatementFile({ name: 'empty.pdf', size: 0, type: 'application/pdf' });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects a file over the size limit and reports its size', () => {
    const result = validateStatementFile({
      name: 'huge.pdf',
      size: MAX_STATEMENT_BYTES + 1,
      type: 'application/pdf',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('10.0 MB');
  });

  it('accepts a file exactly at the size limit', () => {
    expect(
      validateStatementFile({ name: 'edge.pdf', size: MAX_STATEMENT_BYTES, type: 'application/pdf' })
        .ok
    ).toBe(true);
  });

  it('rejects executables and other disallowed types', () => {
    for (const [name, type] of [
      ['payload.exe', 'application/x-msdownload'],
      ['macro.docm', 'application/vnd.ms-word.document.macroEnabled.12'],
      ['sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      ['script.js', 'text/javascript'],
      ['archive.zip', 'application/zip'],
    ] as const) {
      expect(validateStatementFile({ name, size: 1_000, type }).ok).toBe(false);
    }
  });

  it('rejects a disallowed type even when the extension looks allowed', () => {
    expect(
      validateStatementFile({ name: 'statement.pdf', size: 1_000, type: 'application/zip' }).ok
    ).toBe(false);
  });

  it('rejects a disallowed extension even when the type looks allowed', () => {
    expect(
      validateStatementFile({ name: 'statement.exe', size: 1_000, type: 'application/pdf' }).ok
    ).toBe(false);
  });
});

describe('sanitizeStatementFilename', () => {
  it('strips directory traversal components', () => {
    expect(sanitizeStatementFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeStatementFilename('C:\\Users\\eric\\statement.pdf')).toBe('statement.pdf');
  });

  it('removes characters that could break an email or HTML context', () => {
    // The slash in the closing tag also acts as a path separator, so the basename
    // is taken first and the remaining angle bracket is neutralized.
    expect(sanitizeStatementFilename('<script>alert(1)</script>.pdf')).toBe('script_.pdf');
    expect(sanitizeStatementFilename('state<img src=x>ment.pdf')).toBe('state_img src_x_ment.pdf');
    expect(sanitizeStatementFilename('bill"; DROP TABLE.pdf')).toBe('bill_ DROP TABLE.pdf');
  });

  it('keeps ordinary names intact', () => {
    expect(sanitizeStatementFilename('March 2026 Statement.pdf')).toBe('March 2026 Statement.pdf');
  });

  it('falls back to a default when nothing usable is left', () => {
    expect(sanitizeStatementFilename('')).toBe('statement');
    expect(sanitizeStatementFilename('///')).toBe('statement');
  });

  it('truncates absurdly long names', () => {
    const long = `${'a'.repeat(500)}.pdf`;
    expect(sanitizeStatementFilename(long).length).toBe(120);
  });
});

describe('formatBytes', () => {
  it('formats across unit boundaries', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('STATEMENT_ACCEPT_ATTR', () => {
  it('lists the extensions the file picker should offer', () => {
    expect(STATEMENT_ACCEPT_ATTR).toContain('.pdf');
    expect(STATEMENT_ACCEPT_ATTR).toContain('.heic');
    expect(STATEMENT_ACCEPT_ATTR).not.toContain('.exe');
  });
});
