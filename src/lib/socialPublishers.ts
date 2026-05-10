/**
 * Platform-specific publishing functions.
 *
 * Each function takes credentials + post data and returns
 * { success, platformUrl?, error? }
 *
 * Env-var based credentials (set in Vercel/hosting):
 *   Facebook:  FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN
 *   Instagram: IG_USER_ID, IG_ACCESS_TOKEN (same as FB token if using Graph API)
 *   X:         X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *   LinkedIn:  LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN (e.g. "urn:li:person:abc123")
 */

export interface PublishResult {
  success: boolean;
  platformUrl?: string;
  postId?: string;
  error?: string;
}

interface PostData {
  content: string;
  imageUrl?: string;
  hashtags: string[];
}

/* ─── Facebook Pages API ──────────────────────────────────────────── */

export async function publishToFacebook(post: PostData): Promise<PublishResult> {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    return { success: false, error: 'FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not configured' };
  }

  try {
    const message = formatWithHashtags(post.content, post.hashtags);

    if (post.imageUrl) {
      // Photo post
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: post.imageUrl,
          message,
          access_token: token,
        }),
      });
      const data = await res.json();
      if (data.error) return { success: false, error: data.error.message };
      return {
        success: true,
        postId: data.id,
        platformUrl: `https://www.facebook.com/${data.id}`,
      };
    } else {
      // Text post
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          access_token: token,
        }),
      });
      const data = await res.json();
      if (data.error) return { success: false, error: data.error.message };
      return {
        success: true,
        postId: data.id,
        platformUrl: `https://www.facebook.com/${data.id}`,
      };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ─── Instagram Graph API ─────────────────────────────────────────── */

export async function publishToInstagram(post: PostData): Promise<PublishResult> {
  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN ?? process.env.FB_PAGE_ACCESS_TOKEN;

  if (!userId || !token) {
    return { success: false, error: 'IG_USER_ID or IG_ACCESS_TOKEN not configured' };
  }

  // Instagram requires an image
  if (!post.imageUrl) {
    return { success: false, error: 'Instagram requires an image' };
  }

  try {
    const caption = formatWithHashtags(post.content, post.hashtags);

    // Step 1: Create media container
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: post.imageUrl,
        caption,
        access_token: token,
      }),
    });
    const container = await containerRes.json();
    if (container.error) return { success: false, error: container.error.message };

    // Step 2: Publish the container
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: token,
      }),
    });
    const published = await publishRes.json();
    if (published.error) return { success: false, error: published.error.message };

    return {
      success: true,
      postId: published.id,
      platformUrl: `https://www.instagram.com/p/${published.id}/`,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ─── X (Twitter) API v2 ─────────────────────────────────────────── */

export async function publishToX(post: PostData): Promise<PublishResult> {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { success: false, error: 'X API credentials not configured (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)' };
  }

  try {
    const text = formatWithHashtags(post.content, post.hashtags, 280);

    // OAuth 1.0a signing
    const url = 'https://api.x.com/2/tweets';
    const oauthHeader = buildOAuth1Header(
      'POST', url, apiKey, apiSecret, accessToken, accessSecret
    );

    const body: Record<string, unknown> = { text };
    // Note: media upload requires separate step — text only for now
    // Image posting requires Twitter media upload endpoint first

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: oauthHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.errors || data.detail) {
      return { success: false, error: data.errors?.[0]?.message ?? data.detail ?? JSON.stringify(data) };
    }

    const tweetId = data.data?.id;
    return {
      success: true,
      postId: tweetId,
      platformUrl: tweetId ? `https://x.com/i/status/${tweetId}` : undefined,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ─── LinkedIn API ────────────────────────────────────────────────── */

export async function publishToLinkedIn(post: PostData): Promise<PublishResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (!token || !personUrn) {
    return { success: false, error: 'LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN not configured' };
  }

  try {
    const text = formatWithHashtags(post.content, post.hashtags);

    const body: Record<string, unknown> = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: post.imageUrl ? 'IMAGE' : 'NONE',
          ...(post.imageUrl
            ? {
                media: [
                  {
                    status: 'READY',
                    originalUrl: post.imageUrl,
                  },
                ],
              }
            : {}),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `LinkedIn ${res.status}: ${errText}` };
    }

    const postUrn = res.headers.get('x-restli-id') ?? '';
    const activityId = postUrn.replace('urn:li:share:', '');

    return {
      success: true,
      postId: postUrn,
      platformUrl: activityId ? `https://www.linkedin.com/feed/update/${postUrn}` : undefined,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatWithHashtags(content: string, hashtags: string[], maxLen?: number): string {
  const hashStr = hashtags.length > 0 ? '\n\n' + hashtags.map((h) => `#${h}`).join(' ') : '';
  const full = content + hashStr;
  if (maxLen && full.length > maxLen) {
    // Trim content to fit
    const available = maxLen - hashStr.length - 3; // for "..."
    return content.slice(0, Math.max(available, 50)) + '...' + hashStr;
  }
  return full;
}

/**
 * OAuth 1.0a header builder for X/Twitter API
 */
function buildOAuth1Header(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  token: string,
  tokenSecret: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, '');

  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: token,
    oauth_version: '1.0',
  };

  // Build signature base string
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeRFC3986(k)}=${encodeRFC3986(params[k])}`)
    .join('&');

  const baseString = `${method}&${encodeRFC3986(url)}&${encodeRFC3986(sortedParams)}`;
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(tokenSecret)}`;

  // HMAC-SHA1 (using Web Crypto — works in Edge Runtime)
  // Note: We need sync HMAC for OAuth, but Web Crypto is async.
  // For server-side Node.js, we can use the crypto module directly.
  const hmac = require('crypto')
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  params.oauth_signature = hmac;

  const header = Object.keys(params)
    .sort()
    .map((k) => `${encodeRFC3986(k)}="${encodeRFC3986(params[k])}"`)
    .join(', ');

  return `OAuth ${header}`;
}

function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
