// GET /api/admin/migration-status — Check if InteractionResponse table exists
// POST /api/admin/migration-status — Attempt to create the table

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("InteractionResponse")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        tableExists: false,
        error: error.message,
        migrationNeeded: true,
      });
    }

    return NextResponse.json({
      tableExists: true,
      message: "InteractionResponse table exists and is ready",
    });
  } catch (err: any) {
    return NextResponse.json({
      tableExists: false,
      error: err.message,
      migrationNeeded: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminRes = await requireAdmin(req);
    if (adminRes) return adminRes;

    const { error } = await supabase.rpc("exec_sql", {
      sql: `CREATE TABLE IF NOT EXISTS "InteractionResponse" (
        id TEXT NOT NULL DEFAULT gen_random_uuid(),
        "learnerId" TEXT NOT NULL,
        "lessonId" TEXT NOT NULL,
        "activityId" TEXT NOT NULL,
        "conceptId" TEXT,
        "selectedAnswer" TEXT NOT NULL,
        "expectedAnswer" TEXT NOT NULL,
        correct BOOLEAN NOT NULL DEFAULT false,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "InteractionResponse_pkey" PRIMARY KEY (id)
      );CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_idx" ON "InteractionResponse"("learnerId");CREATE INDEX IF NOT EXISTS "InteractionResponse_lessonId_idx" ON "InteractionResponse"("lessonId");CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_lessonId_idx" ON "InteractionResponse"("learnerId","lessonId");`,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Automatic migration not available. Please execute the SQL manually.",
        sql: `CREATE TABLE IF NOT EXISTS "InteractionResponse" (
    id TEXT NOT NULL DEFAULT gen_random_uuid(),
    "learnerId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "conceptId" TEXT,
    "selectedAnswer" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InteractionResponse_pkey" PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_idx" ON "InteractionResponse"("learnerId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_lessonId_idx" ON "InteractionResponse"("lessonId");
CREATE INDEX IF NOT EXISTS "InteractionResponse_learnerId_lessonId_idx" ON "InteractionResponse"("learnerId", "lessonId");
ALTER TABLE "InteractionResponse" ADD CONSTRAINT "InteractionResponse_learnerId_fkey" 
    FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InteractionResponse" ADD CONSTRAINT "InteractionResponse_lessonId_fkey" 
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE RESTRICT ON UPDATE CASCADE;`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "InteractionResponse table created successfully",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      message: "Migration failed. Please execute the SQL manually.",
    }, { status: 500 });
  }
}
