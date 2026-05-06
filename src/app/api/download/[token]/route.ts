import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';

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

/**
 * Watermark an EPUB by injecting customer info into OPF metadata
 * and adding a colophon page at the end of the book.
 */
async function watermarkEpub(
  epubBytes: ArrayBuffer,
  customerEmail: string,
  orderId: string
): Promise<Uint8Array> {
  const files = unzipSync(new Uint8Array(epubBytes));
  const now = new Date().toISOString();

  // 1. Find and patch content.opf — inject metadata
  for (const [path, data] of Object.entries(files)) {
    if (path.endsWith('.opf')) {
      let opf = strFromU8(data);

      // Inject <dc:rights> with license info before </metadata>
      const licenseTag =
        `<dc:rights>Licensed to ${escapeXml(customerEmail)} — Order ${escapeXml(orderId)} — ${now}</dc:rights>`;
      if (opf.includes('</metadata>')) {
        opf = opf.replace('</metadata>', `  ${licenseTag}\n  </metadata>`);
      }

      // Add colophon page to manifest + spine
      const colophonId = 'watermark-colophon';
      const colophonHref = 'colophon-license.xhtml';
      const opfDir = path.includes('/') ? path.substring(0, path.lastIndexOf('/') + 1) : '';

      // Add to manifest before </manifest>
      if (opf.includes('</manifest>')) {
        opf = opf.replace(
          '</manifest>',
          `  <item id="${colophonId}" href="${colophonHref}" media-type="application/xhtml+xml"/>\n  </manifest>`
        );
      }

      // Add to spine before </spine>
      if (opf.includes('</spine>')) {
        opf = opf.replace(
          '</spine>',
          `  <itemref idref="${colophonId}" linear="yes"/>\n  </spine>`
        );
      }

      files[path] = strToU8(opf);

      // 2. Create the colophon XHTML page
      const colophonXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>License</title>
<style>
  body { font-family: serif; text-align: center; padding: 2em; color: #666; }
  .license { margin-top: 3em; font-size: 0.85em; line-height: 1.6; }
  .divider { margin: 2em auto; width: 40%; border-top: 1px solid #ccc; }
</style>
</head>
<body>
  <div class="license">
    <div class="divider"></div>
    <p>This copy is licensed exclusively to</p>
    <p><strong>${escapeXml(customerEmail)}</strong></p>
    <p>Order ${escapeXml(orderId)}</p>
    <p>Generated ${now}</p>
    <div class="divider"></div>
    <p><em>Unauthorized distribution is prohibited.</em></p>
  </div>
</body>
</html>`;

      files[opfDir + colophonHref] = strToU8(colophonXhtml);
      break;
    }
  }

  return zipSync(files);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  // For EPUBs, apply watermark (metadata + colophon page)
  if (format === 'epub') {
    try {
      const originalBytes = await fileResponse.arrayBuffer();
      const watermarkedBytes = await watermarkEpub(
        originalBytes,
        result.customer_email || 'customer',
        result.order_id || token.slice(0, 8)
      );

      return new NextResponse(watermarkedBytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    } catch (err) {
      console.error('EPUB watermark failed, serving original:', err);
      const fallbackResponse = await fetch(fileUrl);
      return new NextResponse(fallbackResponse.body, {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // Fallback for unknown formats
  return new NextResponse(fileResponse.body, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
