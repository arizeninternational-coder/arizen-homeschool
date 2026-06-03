"use client";

import { Settings, Bell, Shield, User } from "lucide-react";
import { PageHeader, SectionHeader, GradientButton } from "@/components/ui/Pill";

export default function SettingsPage() {
  return (
    <div className="space-y-8 fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <SectionHeader title="Account" />
      <div className="rounded-[1.75rem] border border-border-soft bg-white p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text">Profile Settings</p>
            <p className="text-xs text-text-muted">Update your name, grade, and avatar</p>
          </div>
          <GradientButton variant="secondary" size="sm">Edit</GradientButton>
        </div>
      </div>

      <SectionHeader title="Notifications" />
      <div className="rounded-[1.75rem] border border-border-soft bg-white p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent-blue-soft flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text">Push Notifications</p>
            <p className="text-xs text-text-muted">Lesson reminders and achievement alerts</p>
          </div>
          <div className="w-12 h-6 rounded-full bg-primary relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>

      <SectionHeader title="Privacy" />
      <div className="rounded-[1.75rem] border border-border-soft bg-white p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent-purple-soft flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text">Privacy Settings</p>
            <p className="text-xs text-text-muted">Control who can see your profile and progress</p>
          </div>
          <GradientButton variant="secondary" size="sm">Manage</GradientButton>
        </div>
      </div>
    </div>
  );
}
