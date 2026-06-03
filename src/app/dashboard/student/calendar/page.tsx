"use client";

import { CalendarDays } from "lucide-react";
import { PageHeader, EmptyStateCard } from "@/components/ui/Pill";

export default function CalendarPage() {
  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Calendar" subtitle="Your learning schedule and events" />
      <EmptyStateCard
        icon={<CalendarDays className="w-8 h-8" />}
        title="Calendar coming soon"
        description="We're building a calendar to help you plan your learning activities."
      />
    </div>
  );
}
