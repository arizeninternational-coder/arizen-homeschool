// POST /api/admin/lessons/[id]/review-journey
// Admin-only: Approve, reject, or request revision for a generated journey draft
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";
import { validateJourney, isJourneyReadyForApproval, detectDuplicateJourneys } from "@/lib/curriculum/journey-validation";
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
    const { action } = body; // "approve" | "reject" | "needs_revision"

    if (!action || !["approve", "reject", "needs_revision"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve', 'reject', or 'needs_revision'." },
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

    // ── Validation (runs for approve and needs_revision) ──────────────────
    if (action === "approve" || action === "needs_revision") {
      if (!Array.isArray(draft) || draft.length === 0) {
        return NextResponse.json(
          { error: "No draft journey to review." },
          { status: 400 }
        );
      }

      // Run comprehensive validation
      const validation = validateJourney(draft);
      const { ready, reasons } = isJourneyReadyForApproval(draft);

      // Check for duplicate journeys in same grade/subject
      let duplicates: { id: string; title: string; similarity: number }[] = [];
      try {
        const grade = meta?.curriculum?.grade || meta?.grade || 0;
        const subject = meta?.curriculum?.subject || meta?.subject || "";
        if (grade && subject) {
          const { data: siblings } = await supabase
            .from("Lesson")
            .select("id, title, contentBlocks")
            .neq("id", lessonId)
            .limit(100);
          
          if (siblings) {
            const existingJourneys = siblings
              .map((s: any) => {
                let scb: any = {};
                try { scb = JSON.parse(s.contentBlocks || "{}"); } catch {}
                return {
                  id: s.id,
                  title: s.title,
                  journey: scb.studentJourney || scb.studentJourneyDraft || [],
                };
              })
              .filter((s: any) => s.journey.length > 0);
            
            duplicates = detectDuplicateJourneys(draft, existingJourneys);
          }
        }
      } catch (e) {
        console.error("[REVIEW_JOURNEY] Duplicate check error:", e);
      }

      // If approving and validation fails, auto-reject
      if (action === "approve" && !ready) {
        const newMeta = {
          ...meta,
          aiMetadata: {
            ...aiMeta,
            reviewStatus: "NEEDS_REVISION",
            reviewedAt: new Date().toISOString(),
            validationErrors: reasons,
            validationScore: validation.score,
            duplicates: duplicates.map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
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
          console.error("[REVIEW_JOURNEY] Auto-reject error:", updateErr);
          return NextResponse.json(
            { error: "Failed to update journey status." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: false,
          message: "Journey validation failed. Status set to NEEDS_REVISION.",
          reviewStatus: "NEEDS_REVISION",
          validation: {
            valid: false,
            errors: validation.errors.map(e => ({ code: e.code, message: e.message, step: e.step })),
            warnings: validation.warnings.map(w => ({ code: w.code, message: w.message })),
            score: validation.score,
          },
          duplicates: duplicates.map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
        });
      }

      // APPROVE: Copy draft → live, KEEP draft as backup (don't clear)
      if (action === "approve") {
        const newMeta = {
          ...meta,
          studentJourney: draft,
          studentJourneyDraft: draft, // Keep draft as backup (don't clear)
          aiMetadata: {
            ...aiMeta,
            reviewStatus: "APPROVED",
            reviewedAt: new Date().toISOString(),
            validationScore: validation.score,
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

        let readiness: any = null;
        try {
          const { checkLessonReadiness } = await import("@/lib/curriculum/lesson-journey");
          readiness = checkLessonReadiness(newMeta);
        } catch {}

        return NextResponse.json({
          success: true,
          message: "Journey approved and copied to published journey field. Draft kept as backup.",
          reviewStatus: "APPROVED",
          validation: {
            valid: true,
            score: validation.score,
            warnings: validation.warnings.length,
          },
          duplicates: duplicates.length > 0 ? duplicates : undefined,
          readiness,
        });
      }

      // NEEDS_REVISION: Mark without copying
      if (action === "needs_revision") {
        const newMeta = {
          ...meta,
          aiMetadata: {
            ...aiMeta,
            reviewStatus: "NEEDS_REVISION",
            reviewedAt: new Date().toISOString(),
            validationErrors: reasons,
            validationScore: validation.score,
            duplicates: duplicates.map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
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
          console.error("[REVIEW_JOURNEY] Revision error:", updateErr);
          return NextResponse.json(
            { error: "Failed to mark journey for revision." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Journey marked as NEEDS_REVISION.",
          reviewStatus: "NEEDS_REVISION",
          validation: {
            valid: ready,
            errors: validation.errors.map(e => ({ code: e.code, message: e.message, step: e.step })),
            warnings: validation.warnings.map(w => ({ code: w.code, message: w.message })),
            score: validation.score,
          },
          duplicates: duplicates.map(d => ({ id: d.id, title: d.title, similarity: d.similarity })),
        });
      }
    }

    // ── Reject: set reviewStatus to REJECTED, keep draft but don't publish ──
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
  } catch (err: any) {
    console.error("[REVIEW_JOURNEY] Critical error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to review journey" },
      { status: 500 }
    );
  }
}
