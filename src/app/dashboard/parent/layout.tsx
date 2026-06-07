import { ParentSidebar } from "@/components/layout/ParentSidebar";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentSidebar>{children}</ParentSidebar>;
}
