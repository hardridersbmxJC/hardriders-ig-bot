import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import {
  getAllUserMedia,
  getMediaInsights,
  PermissionError,
  type InstagramMedia,
} from "@/lib/instagram/provider";
import { createInstagramContext } from "@/lib/instagram/provider";

export const maxDuration = 60;
const INSIGHTS_CONCURRENCY = 8;
const MAX_POSTS = 100;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

function isVideoLike(media: InstagramMedia): boolean {
  return media.media_product_type === "REELS" || media.media_type === "VIDEO";
}

export interface ViralHistoryPost {
  id: string;
  views: number;
  reach: number | null;
  caption: string;
  firstLine: string;
  mediaType: string;
  timestamp: string;
  permalink: string | null;
}

export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const account = await getWorkspaceInstagramAccount(
    workspaceId,
    request.nextUrl.searchParams.get("instagramAccountId")
  );

  if (!account) {
    return NextResponse.json(
      {
        success: false,
        error: "No connected Instagram account found. Please connect your account first.",
      },
      { status: 400 }
    );
  }

  try {
    const accessToken = await createInstagramContext(account);
    const media = await getAllUserMedia({ context: accessToken, max: MAX_POSTS });

    const insights = await mapWithConcurrency(
      media,
      INSIGHTS_CONCURRENCY,
      async (m) => {
        const metrics = isVideoLike(m)
          ? ["views", "reach", "saved", "shares"]
          : ["reach", "saved", "shares"];
        try {
          return await getMediaInsights({
            context: accessToken,
            mediaId: m.id,
            metrics: metrics,
          });
        } catch (err) {
          if (err instanceof PermissionError) {
            // Insights permission missing or not granted yet
          }
          return null;
        }
      }
    );

    const posts: ViralHistoryPost[] = media.map((m, i) => {
      const ins = insights[i];
      const rawCaption = m.caption?.trim() || "";
      const firstLine = rawCaption.split("\n")[0]?.trim() || "";
      const likesFallback = (m.like_count ?? 0) * 10;
      const views = ins?.views ?? ins?.reach ?? likesFallback;

      return {
        id: m.id,
        views: views > 0 ? views : 100,
        reach: ins?.reach ?? null,
        caption: rawCaption,
        firstLine: firstLine,
        mediaType: m.media_product_type ?? m.media_type,
        timestamp: m.timestamp,
        permalink: m.permalink ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
      },
      total: posts.length,
      posts,
    });
  } catch (err) {
    console.error("[Viral History API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load Instagram post history" },
      { status: 500 }
    );
  }
}
