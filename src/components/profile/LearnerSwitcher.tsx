"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Avatar, Modal } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { User, LogIn } from "lucide-react";

interface Learner {
  id: string;
  displayName: string;
  grade: number;
  totalXp: number;
  currentStreak: number;
  avatarUrl?: string | null;
}

interface LearnerSwitcherProps {
  currentLearnerId: string;
  learners: Learner[];
  onSwitch?: () => void;
}

export function LearnerSwitcher({ currentLearnerId, learners, onSwitch }: LearnerSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();

  const current = learners.find(l => l.id === currentLearnerId);

  async function switchLearner(learnerId: string) {
    setSwitching(true);
    await signIn("credentials", { learnerId, redirect: false });
    setOpen(false);
    setSwitching(false);
    onSwitch?.();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-surface-sunken transition-colors"
      >
        <Avatar src={current?.avatarUrl} name={current?.displayName} size="sm" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-text truncate">{current?.displayName}</p>
          <p className="text-xs text-text-muted">Grade {current?.grade} • {current?.totalXp} XP</p>
        </div>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Switch Learner" size="sm">
        <div className="space-y-2">
          {learners.map(learner => (
            <button
              key={learner.id}
              onClick={() => switchLearner(learner.id)}
              disabled={switching || learner.id === currentLearnerId}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                learner.id === currentLearnerId
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-surface-sunken border border-transparent"
              )}
            >
              <Avatar src={learner.avatarUrl} name={learner.displayName} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">{learner.displayName}</p>
                <p className="text-xs text-text-muted">Grade {learner.grade} • {learner.totalXp} XP • 🔥 {learner.currentStreak} day streak</p>
              </div>
              {learner.id === currentLearnerId && (
                <span className="text-xs font-semibold text-primary">Active</span>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
