// POST /api/admin/lessons/[id]/video
// Admin-only: Add, approve, replace, or remove a YouTube video for a lesson step
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const lessonId = params.id;

  try {
    const body = await req.json();
    const { stepIndex, action, videoUrl, videoTitle } = body;
    // action: "add" | "approve" | "replace" | "remove"

    if (stepIndex === undefined || !action) {
      return NextResponse.json(
        { error: "stepIndex and action are required" },
        { status: 400 }
      );
    }

    // Validate YouTube URL for add/replace actions
    if ((action === "add" || action === "replace") && videoUrl) {
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        return NextResponse.json(
          { error: "Invalid YouTube URL. Please provide a valid YouTube video link (youtube.com/watch, youtu.be, youtube.com/shorts, or youtube.com/embed)." },
          { status: 400 }
        );
      }
    }

    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select("id, contentBlocks")
      .eq("id", lessonId)
      .single();

    if (fetchErr || !lesson) {
      return NextResponse.json(
        { error: fetchErr?.message || "Lesson not found" },
        { status: 404 }
      );
    }

    let meta: any = {};
    try { meta = JSON.parse(lesson.contentBlocks || "{}"); } catch {}

    const journey = meta.studentJourney || meta.studentJourneyDraft || [];
    const step = journey[stepIndex];

    if (!step) {
      return NextResponse.json(
        { error: `Step at index ${stepIndex} not found` },
        { status: 404 }
      );
    }

    if (!step.media) step.media = {};
    if (!step.media.video) {
      step.media.video = {
        searchKeywords: [],
        suggestedUrl: null,
        approvedUrl: null,
        approvedByAdmin: false,
        approvedTitle: null,
      };
    }

    const video = step.media.video;

    if (action === "add") {
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      video.suggestedUrl = `https://www.youtube.com/watch?v=${videoId}`;
      video.approvedUrl = null;
      video.approvedByAdmin = false;
      video.approvedTitle = videoTitle || null;
    } else if (action === "approve") {
      if (video.suggestedUrl) {
        const videoId = extractYouTubeId(video.suggestedUrl);
        if (videoId) {
          video.approvedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } else {
          video.approvedUrl = video.suggestedUrl;
        }
        video.approvedByAdmin = true;
        video.approvedTitle = videoTitle || video.approvedTitle || "Lesson video";
      } else if (video.approvedUrl) {
        // Already approved, just re-confirm
        video.approvedByAdmin = true;
      } else {
        return NextResponse.json(
          { error: "No video URL to approve. Add a YouTube URL first." },
          { status: 400 }
        );
      }
    } else if (action === "replace") {
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      video.suggestedUrl = `https://www.youtube.com/watch?v=${videoId}`;
      video.approvedUrl = null;
      video.approvedByAdmin = false;
      video.approvedTitle = videoTitle || null;
    } else if (action === "remove") {
      step.media.video = {
        searchKeywords: video.searchKeywords || [],
        suggestedUrl: null,
        approvedUrl: null,
        approvedByAdmin: false,
        approvedTitle: null,
      };
    }

    const newMeta = { ...meta };
    if (meta.studentJourneyDraft) {
      newMeta.studentJourneyDraft = journey;
    } else {
      newMeta.studentJourney = journey;
    }

    const { error: updateErr } = await supabase
      .from("Lesson")
      .update({
        contentBlocks: JSON.stringify(newMeta),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update video. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "add" ? "Video URL added. Approve to make it visible to students." :
        action === "approve" ? "Video approved and now visible to students." :
        action === "replace" ? "Video replaced. Approve to make it visible to students." :
        "Video removed.",
      stepIndex,
      video: step.media.video,
    });
  } catch (err: any) {
    console.error("[VIDEO_API] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process video" },
      { status: 500 }
    );
  }
}
