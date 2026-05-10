import { NextRequest, NextResponse } from 'next/server';
import { convexQuery, convexMutation } from '@/lib/convexRaw';
import {
  publishToFacebook,
  publishToInstagram,
  publishToX,
  publishToLinkedIn,
  type PublishResult,
} from '@/lib/socialPublishers';

/**
 * POST /api/social/publish
 *
 * Publishes a single social post to its selected platforms.
 * Body: { postId: string }
 * Auth: admin_ck cookie or x-cron-secret header
 */
export async function POST(req: NextRequest) {
  const adminKey = req.cookies.get('admin_ck')?.value ?? req.headers.get('x-cron-secret') ?? '';
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!adminKey || !authSecret || adminKey !== authSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 });
  }

  try {
    // Fetch the post
    const post: any = await convexQuery('socialPosts:get', { adminKey, id: postId });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = {
      content: post.content,
      imageUrl: post.image_url,
      hashtags: post.hashtags ?? [],
    };

    // Publish to each platform in parallel
    const platformResults: Record<string, PublishResult> = {};
    const publishers: Record<string, (data: typeof postData) => Promise<PublishResult>> = {
      facebook: publishToFacebook,
      instagram: publishToInstagram,
      x: publishToX,
      linkedin: publishToLinkedIn,
    };

    await Promise.all(
      (post.platforms as string[]).map(async (platform) => {
        const publisher = publishers[platform];
        if (publisher) {
          platformResults[platform] = await publisher(postData);
        } else {
          platformResults[platform] = {
            success: false,
            error: `Publisher not implemented for ${platform}`,
          };
        }
      }),
    );

    // Determine overall status
    const allResults = Object.values(platformResults);
    const anySuccess = allResults.some((r) => r.success);
    const allFailed = allResults.every((r) => !r.success);

    // Build platform_links from successful publishes
    const platformLinks: Record<string, string | undefined> = {};
    for (const [platform, result] of Object.entries(platformResults)) {
      if (result.success && result.platformUrl) {
        platformLinks[platform] = result.platformUrl;
      }
    }

    // Update the post in Convex
    await convexMutation('socialPosts:update', {
      adminKey,
      id: postId,
      status: allFailed ? 'failed' : 'published',
      ...(Object.keys(platformLinks).length > 0
        ? {
            platform_links: {
              facebook: platformLinks.facebook,
              instagram: platformLinks.instagram,
              x: platformLinks.x,
              linkedin: platformLinks.linkedin,
              tiktok: platformLinks.tiktok,
            },
          }
        : {}),
    });

    // Audit log
    try {
      await convexMutation('auditLog:create', {
        adminKey,
        action: 'social_publish',
        actor: 'system',
        entity_type: 'social_post',
        details: `Published to ${Object.entries(platformResults)
          .map(([p, r]) => `${p}: ${r.success ? '✓' : '✗ ' + r.error}`)
          .join(', ')}`,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: anySuccess,
      status: allFailed ? 'failed' : 'published',
      platforms: platformResults,
    });
  } catch (err) {
    console.error('Social publish error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
