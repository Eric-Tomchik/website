import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function watermarkPdf(
  pdfBytes: ArrayBuffer,
  customerEmail: string,
  orderId: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const watermarkText = `Licensed to ${customerEmail} — Order ${orderId}`;
  const fontSize = 7;
  const textColor = rgb(0.65, 0.65, 0.65);

  for (const page of pages) {
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const x = (width - textWidth) / 2;

    // Bottom center watermark on every page
    page.drawText(watermarkText, {
      x,
      y: 12,
      size: fontSize,
      font,
      color: textColor,
      opacity: 0.6,
    });
  }

  return pdfDoc.save();
}

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

  const filename = `${(result.title || 'book').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.${format}`;

  // Fetch the file
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch file.' }, { status: 500 });
  }

  // For PDFs, apply watermark with customer info
  if (format === 'pdf') {
    try {
      const originalBytes = await fileResponse.arrayBuffer();
      const watermarkedBytes = await watermarkPdf(
        originalBytes,
        result.customer_email || 'customer',
        result.order_id || token.slice(0, 8)
      );

      return new NextResponse(watermarkedBytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    } catch (err) {
      console.error('Watermark failed, serving original:', err);
      // Fall through to serve original if watermarking fails
      const fallbackResponse = await fetch(fileUrl);
      return new NextResponse(fallbackResponse.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // For EPUB, serve as-is (watermarking EPUB is much more complex)
  const contentType = 'application/epub+zip';
  return new NextResponse(fileResponse.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
