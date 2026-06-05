// Curriculum Import — redirects to the grades page where the real import flow lives.
// The actual CSV import is handled at the subject level:
//   Admin → Grades → [Grade] → [Subject] → Upload CSV
// This avoids orphaned imports without grade/subject context.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminCurriculumImportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/grades");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7FBF7" }}>
      <div style={{ textAlign: "center", color: "#64748B" }}>
        <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Redirecting to Grades…</p>
        <p style={{ fontSize: "0.8125rem", marginTop: 4 }}>
          CSV import is available at the subject level.
        </p>
      </div>
    </div>
  );
}
