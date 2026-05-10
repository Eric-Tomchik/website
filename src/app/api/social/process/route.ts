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
 * POST /api/social/process
 *
 * Cron-triggered: finds all scheduled posts that are due and publishes them.
 * Auth: x-cron-secret must match CONVEX_AUTH_SECRET.
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!cronSecret || !authSecret || cronSecret !== authSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();

  try {
    // Get all scheduled posts
    const scheduled: any[] = await convexQuery('socialPosts:list', {
      adminKey: authSecret,
      status: 'scheduled',
    });

    // Filter to posts that are due
    const due = (scheduled ?? []).filter(
      (p: any) => p.scheduled_at && p.scheduled_at <= now,
    );

    if (due.length === 0) {
      return NextResponse.json({ processed: 0, published: 0, failed: 0 });
    }

    const publishers: Record<string, (data: any) => Promise<PublishResult>> = {
      facebook: publishToFacebook,
      instagram: publishToInstagram,
      x: publishToX,
      linkedin: publishToLinkedIn,
    };

    let published = 0;
    let failed = 0;

    for (const post of due) {
      const postData = {
        content: post.content,
        imageUrl: post.image_url,
        hashtags: post.hashtags ?? [],
      };

      // Publish to each platform in parallel
      const platformResults: Record<string, PublishResult> = {};
      await Promise.all(
        (post.platforms as string[]).map(async (platform: string) => {
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

      const allFailed = Object.values(platformResults).every((r) => !r.success);

      // Build platform_links
      const platformLinks: Record<string, string | undefined> = {};
      for (const [platform, result] of Object.entries(platformResults)) {
        if (result.success && result.platformUrl) {
          platformLinks[platform] = result.platformUrl;
        }
      }

      // Update the post
      await convexMutation('socialPosts:update', {
        adminKey: authSecret,
        id: post._id,
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

      if (allFailed) failed++;
      else published++;
    }

    // Audit log
    try {
      await convexMutation('auditLog:create', {
        adminKey: authSecret,
        action: 'social_auto_publish',
        actor: 'system',
        entity_type: 'social_post',
        details: `Processed ${due.length} due posts: ${published} published, ${failed} failed`,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ processed: due.length, published, failed });
  } catch (err) {
    console.error('Social process error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
