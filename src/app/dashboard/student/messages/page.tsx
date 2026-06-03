"use client";

import { MessageCircle } from "lucide-react";
import { PageHeader, EmptyStateCard } from "@/components/ui/Pill";

export default function MessagesPage() {
  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Messages" subtitle="Chat with your teachers and classmates" />
      <EmptyStateCard
        icon={<MessageCircle className="w-8 h-8" />}
        title="Messages coming soon"
        description="We're building a messaging system to connect you with your learning community."
      />
    </div>
  );
}
