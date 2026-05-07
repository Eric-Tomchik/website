#!/usr/bin/env npx tsx
/**
 * Migration script: Update legacy book_format values.
 *
 * Converts:
 *   "physical" → "hardback"
 *   "both"     → "hardback_digital"
 *
 * Existing `price_cents` stays as-is (it is the hardback price).
 * Run this AFTER deploying the new Convex schema.
 *
 * Usage:
 *   CONVEX_DEPLOY_KEY=<key> npx tsx scripts/migrate-book-formats.ts
 *
 * Or if deploy key is in .env.local:
 *   npx tsx scripts/migrate-book-formats.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://quirky-hyena-912.convex.cloud';

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log('Fetching all books...');
  const books = await client.query(api.books.list, {});

  let updated = 0;

  for (const book of books) {
    let newFormat: string | null = null;

    if (book.book_format === 'physical') {
      newFormat = 'hardback';
    } else if (book.book_format === 'both') {
      newFormat = 'hardback_digital';
    }

    if (newFormat) {
      console.log(`  Updating "${book.title}": ${book.book_format} → ${newFormat}`);
      await client.mutation(api.books.update, {
        id: book._id,
        book_format: newFormat as any,
      });
      updated++;
    } else {
      console.log(`  Skipping "${book.title}" (already ${book.book_format})`);
    }
  }

  console.log(`\nDone! Updated ${updated} of ${books.length} books.`);
}

main().catch(console.error);
