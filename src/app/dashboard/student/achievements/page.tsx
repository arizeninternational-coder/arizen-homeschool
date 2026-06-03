"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AchievementsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/student/badges");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Redirecting to badges…</p>
      </div>
    </div>
  );
}
