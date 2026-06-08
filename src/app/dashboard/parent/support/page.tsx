"use client";

import React, { useState } from "react";
import {
  Headphones, MessageCircle, Mail, Phone, HelpCircle, BookOpen,
  CreditCard, Users, AlertCircle, Send, CheckCircle, ChevronRight,
  Loader2, Sparkles, Heart
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GradientButton } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "technical", label: "Technical Issue", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/60" },
  { value: "billing", label: "Billing", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "progress", label: "Child Progress", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200/60" },
  { value: "lesson", label: "Lesson Issue", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200/60" },
  { value: "other", label: "Other", icon: HelpCircle, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200/60" },
];

const HELP_TOPICS = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn how to link your child's account, navigate the dashboard, and set up your first lesson.",
    color: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-100",
  },
  {
    icon: Users,
    title: "Managing Children",
    description: "Add or remove children, switch between profiles, and manage parent permissions.",
    color: "from-sky-500/10 to-cyan-500/10",
    iconColor: "text-sky-500",
    borderColor: "border-sky-100",
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Understand your subscription, update payment methods, or change your plan anytime.",
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-100",
  },
  {
    icon: HelpCircle,
    title: "Lesson Help",
    description: "Troubleshoot lesson issues, report content problems, or request new subjects.",
    color: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
    borderColor: "border-purple-100",
  },
  {
    icon: MessageCircle,
    title: "Progress Reports",
    description: "Understand XP, streaks, levels, and how to interpret your child's learning data.",
    color: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-500",
    borderColor: "border-pink-100",
  },
  {
    icon: Phone,
    title: "Contact Us",
    description: "Reach our team by email or phone. We typically respond within 24 hours on business days.",
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
  },
];

export default function ParentSupportPage() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !subject.trim() || !message.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/parent/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setCategory("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-accent-purple/10 flex items-center justify-center">
              <Headphones className="w-4.5 h-4.5 text-primary" />
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-text tracking-tight">
              Parent Support
            </h1>
          </div>
          <p className="text-sm text-text-muted leading-relaxed ml-[42px]">
            We&apos;re here to help! Browse common topics or send us a message.
          </p>
        </div>
      </div>

      {/* Quick Contact Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent-purple/5 to-pink/5 border border-primary/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-md flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text">Need immediate help?</p>
            <p className="text-xs text-text-muted">Our support team is available Mon–Fri, 9am–6pm</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-0 sm:ml-auto">
          <a
            href="mailto:support@arizenschool.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 border border-border-soft/40 text-sm font-bold text-text shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Mail className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">support@arizenschool.com</span>
            <span className="sm:hidden">Email Us</span>
          </a>
        </div>
      </div>

      {/* Help Topics */}
      <div>
        <h2 className="text-base font-extrabold text-text tracking-tight mb-1">
          Common Help Topics
        </h2>
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          Click a topic to learn more, or scroll down to submit a support request.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HELP_TOPICS.map((topic) => (
            <button
              key={topic.title}
              type="button"
              onClick={() => {
                // Map help topic to category
                const catMap: Record<string, string> = {
                  "Getting Started": "technical",
                  "Managing Children": "technical",
                  "Billing & Plans": "billing",
                  "Lesson Help": "lesson",
                  "Progress Reports": "progress",
                  "Contact Us": "other",
                };
                setCategory(catMap[topic.title] || "other");
                // Scroll to form
                document.getElementById("support-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "group text-left rounded-2xl bg-white p-4 transition-all duration-200 cursor-pointer",
                "shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)]",
                "border border-border-soft/40 hover:-translate-y-0.5",
                "active:scale-[0.98]"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                topic.color
              )}>
                <topic.icon className={cn("w-5 h-5", topic.iconColor)} />
              </div>
              <h3 className="text-sm font-bold text-text mb-1 flex items-center gap-1.5">
                {topic.title}
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                {topic.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Support Request Form */}
      <div id="support-form">
        <h2 className="text-base font-extrabold text-text tracking-tight mb-1">
          Submit a Support Request
        </h2>
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          Fill out the form below and we&apos;ll get back to you as soon as possible.
        </p>

        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-border-soft/40 overflow-hidden">
          {/* Form Header Accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent-purple to-pink" />

          <div className="p-5 sm:p-6">
            {status === "sent" ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                  <div className="relative">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1" />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-text mb-1">
                  Message Sent!
                </h3>
                <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
                  Thank you for reaching out. We&apos;ve received your support request and will respond within 24 hours.
                </p>
                <GradientButton
                  variant="secondary"
                  onClick={() => setStatus("idle")}
                  icon={<MessageCircle className="w-4 h-4" />}
                >
                  Send Another Message
                </GradientButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-[0.08em] text-text-muted/70 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200",
                          category === cat.value
                            ? cn(cat.bg, cat.border, cat.color, "shadow-sm")
                            : "bg-white border-border-soft/40 text-text-muted hover:bg-bg-main/60"
                        )}
                      >
                        <cat.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="support-subject" className="block text-xs font-extrabold uppercase tracking-[0.08em] text-text-muted/70 mb-2">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue..."
                    required
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-medium text-text",
                      "bg-bg-main/40 border border-border-soft/50",
                      "placeholder:text-text-muted/50",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
                      "transition-all duration-200"
                    )}
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="support-message" className="block text-xs font-extrabold uppercase tracking-[0.08em] text-text-muted/70 mb-2">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more about what you need help with..."
                    required
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-medium text-text resize-none",
                      "bg-bg-main/40 border border-border-soft/50",
                      "placeholder:text-text-muted/50",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
                      "transition-all duration-200"
                    )}
                  />
                </div>

                {/* Error State */}
                {status === "error" && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50/80 border border-red-200/60">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-[11px] text-text-muted">
                    We typically respond within 24 hours.
                  </p>
                  <GradientButton
                    type="submit"
                    variant="primary"
                    disabled={!category || !subject.trim() || !message.trim() || status === "sending"}
                    icon={
                      status === "sending"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />
                    }
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </GradientButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-border-soft/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">Email Support</h3>
              <p className="text-xs text-text-muted">Best for detailed questions</p>
            </div>
          </div>
          <a
            href="mailto:support@arizenschool.com"
            className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
          >
            support@arizenschool.com
          </a>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-border-soft/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">Phone Support</h3>
              <p className="text-xs text-text-muted">Mon–Fri, 9am–6pm</p>
            </div>
          </div>
          <a
            href="tel:+18005551234"
            className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
          >
            (800) 555-1234
          </a>
        </div>
      </div>
    </div>
  );
}
