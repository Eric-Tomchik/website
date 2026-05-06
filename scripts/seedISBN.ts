import { mutation } from "./_generated/server";

/**
 * Updates existing books with hardcover ISBN-13 and page count data.
 * Matches by slug prefix. Run once from the Convex dashboard.
 */

const bookData: Record<string, { isbn: string; page_count: number }> = {
  "complete-ai-platform-guide": {
    isbn: "979-8195325312",
    page_count: 422,
  },
  "complete-pos-systems-guide": {
    isbn: "979-8259437760",
    page_count: 125,
  },
  "ai-powered-business": {
    isbn: "979-8259339163",
    page_count: 260,
  },
  "business-solution-provider": {
    isbn: "979-8259425088",
    page_count: 289,
  },
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const updates: string[] = [];

    for (const book of books) {
      // Match by slug containing one of the keys
      const match = Object.entries(bookData).find(([key]) =>
        book.slug.includes(key)
      );

      if (match) {
        const [key, data] = match;
        await ctx.db.patch(book._id, {
          isbn: data.isbn,
          page_count: data.page_count,
        });
        updates.push(`${book.title}: ISBN ${data.isbn}, ${data.page_count} pages`);
      }
    }

    return {
      status: updates.length > 0 ? "updated" : "no_matches",
      updated: updates,
      total_books: books.length,
    };
  },
});
