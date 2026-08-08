import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import {
  MAX_STATEMENT_BYTES,
  sanitizeStatementFilename,
  validateStatementFile,
} from '@/lib/statementUpload';

/**
 * Receives a merchant's processing statement and stores it in Convex storage.
 *
 * The browser never talks to Convex storage directly: uploads go through this
 * route so type and size are enforced server-side and the request is rate
 * limited. The route returns only a storage id, which the application form then
 * submits alongside the rest of the lead. The file itself is never publicly
 * readable — /admin/merchant-applications mints a short-lived signed URL for it
 * behind admin auth.
 */

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const convex = getConvexClient();

    // Uploads are more expensive than form posts, so they get a tighter limit.
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `merchant-statement:${ip}`,
      maxAttempts: 5,
      windowMs: 10 * 60_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again in a few minutes.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file was received.' }, { status: 400 });
    }

    const validation = validateStatementFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    // Re-check after reading: file.size is client-reported metadata.
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_STATEMENT_BYTES) {
      return NextResponse.json({ error: 'That file could not be accepted.' }, { status: 400 });
    }

    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl, {});
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: bytes,
    });

    if (!uploadRes.ok) {
      console.error('Statement upload to Convex storage failed:', uploadRes.status);
      return NextResponse.json(
        { error: 'Upload failed. Please try again, or email the statement instead.' },
        { status: 502 }
      );
    }

    const { storageId } = (await uploadRes.json()) as { storageId: string };
    if (!storageId) {
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({
      storageId,
      filename: sanitizeStatementFilename(file.name),
      sizeBytes: bytes.byteLength,
    });
  } catch (err) {
    console.error('Merchant statement upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
