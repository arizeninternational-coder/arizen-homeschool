"use client";

import { BookOpen } from "lucide-react";
import { PageHeader, EmptyStateCard, GradientButton } from "@/components/ui/Pill";

export default function LibraryPage() {
  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Library" subtitle="Explore books and learning resources" />
      <EmptyStateCard
        icon={<BookOpen className="w-8 h-8" />}
        title="Library coming soon"
        description="We're curating a collection of books and resources for your learning journey."
      />
    </div>
  );
}
