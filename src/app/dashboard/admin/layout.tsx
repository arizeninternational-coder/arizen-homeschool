export const dynamic = "force-dynamic";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <TeacherSidebar>{children}</TeacherSidebar>;
}
