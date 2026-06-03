export const dynamic = "force-dynamic";

import { StudentSidebar } from "@/components/layout/StudentSidebar";
import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentSidebar>{children}</StudentSidebar>;
}
