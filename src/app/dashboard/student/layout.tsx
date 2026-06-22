export const dynamic = "force-dynamic";

import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <ErrorBoundary><StudentSidebar>{children}</StudentSidebar></ErrorBoundary>;
}
