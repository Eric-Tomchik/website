import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const format = request.nextUrl.searchParams.get('format') || 'pdf';

  // Validate token and increment download count
  const result = await fetchMutation(api.downloadTokens.recordDownload, {
    token,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid or expired download link.' },
      { status: 403 }
    );
  }

  // Get the file URL from Convex storage
  const storageId =
    format === 'epub'
      ? result.digital_epub_storage_id
      : result.digital_pdf_storage_id;

  if (!storageId) {
    return NextResponse.json(
      { error: `No ${format.toUpperCase()} file available for this book.` },
      { status: 404 }
    );
  }

  const fileUrl = await fetchQuery(api.downloadTokens.getFileUrl, {
    storageId,
  });

  if (!fileUrl) {
    return NextResponse.json(
      { error: 'File not found.' },
      { status: 404 }
    );
  }

  // Redirect to the Convex storage URL for download
  const filename = `${(result.title || 'book').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.${format}`;

  // Fetch the file and serve it with proper headers
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch file.' }, { status: 500 });
  }

  const contentType =
    format === 'epub'
      ? 'application/epub+zip'
      : 'application/pdf';

  return new NextResponse(fileResponse.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
