/**
 * Lightweight HTML sanitizer for Cloudflare Workers (no DOM dependency).
 * Strips dangerous tags, attributes, and javascript: URIs.
 */

/** Tags that are never allowed in user content */
const DANGEROUS_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form',
  'input', 'textarea', 'select', 'button', 'applet', 'base',
  'link', 'meta', 'noscript', 'template',
]);

/** Attribute prefixes / exact names that are dangerous */
const DANGEROUS_ATTR_PATTERN = /^on[a-z]+$/i;

/**
 * Remove dangerous HTML tags and attributes from an HTML string.
 * Preserves safe formatting tags (p, h1-h6, a, img, ul, ol, li, code, pre, etc.)
 */
export function sanitizeHtml(html: string): string {
  // 1. Remove entire dangerous tag blocks (including content for script/style)
  let result = html;
  for (const tag of ['script', 'style', 'noscript', 'template']) {
    const pattern = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    result = result.replace(pattern, '');
  }

  // 2. Remove self-closing / void dangerous tags
  for (const tag of DANGEROUS_TAGS) {
    const pattern = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    result = result.replace(pattern, '');
    // Also remove closing tags
    const closePattern = new RegExp(`<\\/${tag}\\s*>`, 'gi');
    result = result.replace(closePattern, '');
  }

  // 3. Strip dangerous attributes from remaining tags
  result = result.replace(/<([a-z][a-z0-9]*)((?:\s+[^>]*?)?)>/gi, (match, tagName, attrs: string) => {
    if (!attrs.trim()) return match;

    // Remove on* event handlers
    let cleanAttrs = attrs.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Remove javascript: URIs in href/src/action
    cleanAttrs = cleanAttrs.replace(
      /\s+(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
      ''
    );

    // Remove data: URIs in src (except images)
    cleanAttrs = cleanAttrs.replace(
      /\s+src\s*=\s*(?:"data:(?!image\/)[^"]*"|'data:(?!image\/)[^']*')/gi,
      ''
    );

    return `<${tagName}${cleanAttrs}>`;
  });

  return result;
}

/**
 * Sanitize plain text that will be inserted into HTML via .split('\n').
 * Escapes HTML entities to prevent XSS.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
