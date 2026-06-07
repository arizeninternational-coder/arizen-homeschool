// POST /api/admin/lessons/[id]/review-journey
// Admin-only: Approve or reject a generated journey draft
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const lessonId = params.id;

  try {
    const body = await req.json();
    const { action } = body; // "approve" | "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    // Fetch current lesson
    const { data: lesson, error: fetchErr } = await supabase
      .from("Lesson")
      .select("contentBlocks")
      .eq("id", lessonId)
      .single();

    if (fetchErr || !lesson) {
      return NextResponse.json(
        { error: fetchErr?.message || "Lesson not found" },
        { status: 404 }
      );
    }

    // Parse contentBlocks
    let meta: any = {};
    try {
      meta = JSON.parse(lesson.contentBlocks || "{}");
    } catch {}

    const draft = meta.studentJourneyDraft;
    const aiMeta = meta.aiMetadata || {};

    if (action === "approve") {
      if (!Array.isArray(draft) || draft.length === 0) {
        return NextResponse.json(
          { error: "No draft journey to approve." },
          { status: 400 }
        );
      }

      // Copy draft to approved, clear draft
      const newMeta = {
        ...meta,
        studentJourney: draft,
        studentJourneyDraft: [],
        aiMetadata: {
          ...aiMeta,
          reviewStatus: "APPROVED",
          reviewedAt: new Date().toISOString(),
        },
      };

      const { error: updateErr } = await supabase
        .from("Lesson")
        .update({
          contentBlocks: JSON.stringify(newMeta),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", lessonId);

      if (updateErr) {
        console.error("[REVIEW_JOURNEY] Approve error:", updateErr);
        return NextResponse.json(
          { error: "Failed to approve journey." },
          { status: 500 }
        );
      }

      // Calculate new readiness
      let readiness: any = null;
      try {
        const { checkLessonReadiness } = await import("@/lib/curriculum/lesson-journey");
        readiness = checkLessonReadiness(newMeta);
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Journey approved and is now student-visible.",
        reviewStatus: "APPROVED",
        readiness,
      });
    } else {
      // Reject: set reviewStatus to REJECTED, keep draft but don't publish
      const newMeta = {
        ...meta,
        aiMetadata: {
          ...aiMeta,
          reviewStatus: "REJECTED",
          reviewedAt: new Date().toISOString(),
        },
      };

      const { error: updateErr } = await supabase
        .from("Lesson")
        .update({
          contentBlocks: JSON.stringify(newMeta),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", lessonId);

      if (updateErr) {
        console.error("[REVIEW_JOURNEY] Reject error:", updateErr);
        return NextResponse.json(
          { error: "Failed to reject journey." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Journey draft rejected. Students will not see it.",
        reviewStatus: "REJECTED",
      });
    }
  } catch (err: any) {
    console.error("[REVIEW_JOURNEY] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to review journey" },
      { status: 500 }
    );
  }
}
