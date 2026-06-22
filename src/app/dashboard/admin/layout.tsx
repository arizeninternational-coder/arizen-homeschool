export const dynamic = "force-dynamic";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ErrorBoundary><TeacherSidebar>{children}</TeacherSidebar></ErrorBoundary>;
}
