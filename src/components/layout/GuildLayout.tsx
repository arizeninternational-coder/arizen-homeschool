"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Sidebar, TopBar } from "./Sidebar";
import { useUIStore } from "@/stores";

interface GuildLayoutProps {
  children: ReactNode;
  title?: string;
  guildName?: string;
  learnerName?: string;
  totalXp?: number;
  streak?: number;
  grade?: number;
}

export function GuildLayout({
  children,
  title,
  guildName,
  totalXp,
  streak,
  grade,
}: GuildLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        guildName={guildName}
        totalXp={totalXp}
        streak={streak}
        grade={grade}
      />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <TopBar title={title} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
