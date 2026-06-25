"use client";

import { useState, useEffect } from "react";
import { GoldLessonShellMock } from "@/components/design/gold-fractions/GoldLessonShellMock";
import { MissionCardMock } from "@/components/design/gold-fractions/MissionCardMock";
import { ChoiceCardMock } from "@/components/design/gold-fractions/ChoiceCardMock";
import { TeachingPanelMock } from "@/components/design/gold-fractions/TeachingPanelMock";
import { ShadingPracticeMock } from "@/components/design/gold-fractions/ShadingPracticeMock";
import { CompletionCelebrationMock } from "@/components/design/gold-fractions/CompletionCelebrationMock";
import { PolishedStepRailMock } from "@/components/design/gold-fractions/PolishedStepRailMock";
import {
  StoryIllustrationMock,
  AminaIllustration,
  ChapatiWholeIllustration,
  KittensBiscuitIllustration,
  PaperFoldIllustration,
} from "@/components/design/gold-fractions/StoryIllustrationMock";
import { AdminControlsMock } from "@/components/design/gold-fractions/AdminControlsMock";

/**
 * Gold Fractions Lesson — Visual Design Target
 *
 * Static design route. Not connected to Supabase.
 * Review the look and feel before production implementation.
 *
 * URL: /design/gold-fractions-lesson
 * Commit: eec5391+
 */

const SECTION_NAV = [
  { id: "step-1-target", label: "Step 1 Target", title: "Welcome" },
  { id: "step-2-target", label: "Step 2 Target", title: "Mission" },
  { id: "step-3-target", label: "Step 3 Target", title: "Think First" },
  { id: "step-4-target", label: "Step 4 Target", title: "Learn" },
  { id: "step-5-target", label: "Step 5 Target", title: "Connect" },
  { id: "step-6-target", label: "Step 6 Target", title: "Worked Example" },
  { id: "step-7-target", label: "Step 7 Target", title: "Practice" },
  { id: "step-10-target", label: "Step 10 Target", title: "Complete" },
  { id: "admin-target", label: "Admin Target", title: "Admin Controls" },
];

export default function GoldFractionsDesignTarget() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    for (const section of SECTION_NAV) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">
                Gold Fractions Lesson — Visual Target
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review the look and feel before production implementation
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                DESIGN TARGET — NOT LIVE
              </div>
            </div>
          </div>

          {/* Quick-jump navigation */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
            {SECTION_NAV.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeSection === s.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Review banner */}
        <div className="mb-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-900 mb-1">
                Static Visual Target for Review
              </h2>
              <p className="text-sm text-amber-800 leading-relaxed">
                This route shows the intended visual direction for the Gold Fractions lesson.
                Each step demonstrates the two-layer design: <strong>story illustrations</strong> for warmth
                and <strong>learning diagrams</strong> for mathematical clarity. No authentication, no database,
                no deployment. Review the look and feel here before we implement anything in production.
              </p>
            </div>
          </div>
        </div>

        {/* Journey Progress rail */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Journey Progress Bar (shows step position)
          </h2>
          <PolishedStepRailMock currentStep={3} />
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 1: Welcome — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-1-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-xl font-bold text-slate-900">Step 1 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">WELCOME</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Warm welcome with Amina chapati story illustration + clean math diagram.
            Story context BEFORE action button.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={1} title="Welcome to Halves" accent="warm">
              <div className="space-y-6">
                <StoryIllustrationMock
                  illustration={<AminaIllustration />}
                  caption="Amina has one round chapati to share."
                />
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
                  <p className="text-sm text-slate-600 mb-4 text-center">One whole chapati</p>
                  <div className="flex justify-center">
                    <ChapatiWholeIllustration />
                  </div>
                </div>
                <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Start lesson
                </button>
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 2: Mission — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-2-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-xl font-bold text-slate-900">Step 2 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">MISSION</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Empty mission checklist (no pre-completed items). Learner taps &quot;Accept mission&quot; to lock in intent.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={2} title="Your Challenge Today" accent="warm">
              <div className="space-y-6">
                <p className="text-base text-slate-700 leading-relaxed">
                  By the end, you will be able to show one half and explain why the two parts must be equal.
                </p>
                <MissionCardMock
                  title="Your mission checklist"
                  items={[
                    "Start with one whole circle",
                    "Split it into two equal parts",
                    "Shade one equal part",
                    'Say: "This is one half"',
                  ]}
                />
                <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Accept mission
                </button>
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 3: Think First — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-3-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</div>
            <h2 className="text-xl font-bold text-slate-900">Step 3 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">THINK FIRST</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Three large choice cards with fraction visuals. No duplicate A/B/C labels.
            Correct-state shown: card B selected, green feedback.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={3} title="Think First" accent="warm">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                  <p className="text-lg font-bold text-slate-900 mb-2">Which picture shows fair sharing?</p>
                  <p className="text-sm text-slate-700">Imagine one chapati shared between two friends.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ChoiceCardMock
                    label="A"
                    title="One big piece and one small piece"
                    visual={
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#D4A574" strokeWidth="3" />
                        <path d="M 60 10 A 50 50 0 0 1 85 105 L 60 60 Z" fill="#FF6B35" />
                        <line x1="60" y1="10" x2="85" y2="105" stroke="#D4A574" strokeWidth="3" />
                      </svg>
                    }
                    selected={false}
                  />
                  <ChoiceCardMock
                    label="B"
                    title="Two same-size pieces"
                    visual={
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#D4A574" strokeWidth="3" />
                        <path d="M 60 10 A 50 50 0 0 1 60 110 L 60 60 Z" fill="#FF6B35" />
                        <line x1="60" y1="10" x2="60" y2="110" stroke="#D4A574" strokeWidth="3" />
                      </svg>
                    }
                    selected={true}
                    correct={true}
                  />
                  <ChoiceCardMock
                    label="C"
                    title="One whole chapati, not split"
                    visual={
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="#FFE5D9" stroke="#D4A574" strokeWidth="3" />
                      </svg>
                    }
                    selected={false}
                  />
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300 flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <p className="text-green-900 font-semibold">
                    Yes. Fair sharing means both pieces are the same size.
                  </p>
                </div>
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 4: Learn — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-4-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</div>
            <h2 className="text-xl font-bold text-slate-900">Step 4 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">LEARN</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Horizontal teaching strip: whole → split → shaded. Clean math visual,
            concept note reinforcing the equal-parts rule.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={4} title="What Is One Half?" accent="warm">
              <div className="space-y-6">
                <TeachingPanelMock
                  title="How to find one half"
                  steps={[
                    {
                      label: "1. One whole chapati",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#FFE5D9" stroke="#D4A574" strokeWidth="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "2. Fold or cut into two equal parts",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#FFE5D9" stroke="#D4A574" strokeWidth="3" />
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#D4A574" strokeWidth="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "3. Shade one half",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#FFE5D9" stroke="#D4A574" strokeWidth="3" />
                          <path d="M 50 10 A 40 40 0 0 1 50 90 L 50 50 Z" fill="#FF6B35" />
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#D4A574" strokeWidth="3" />
                        </svg>
                      ),
                    },
                  ]}
                />
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-blue-900 text-center font-semibold">
                    A half only works when the two parts are equal.
                  </p>
                </div>
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 5: Halves Around Us (Connect) — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-5-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</div>
            <h2 className="text-xl font-bold text-slate-900">Step 5 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">CONNECT</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Real-life connection: kittens sharing a biscuit. One chapati visual with tap target.
            Green feedback confirms the correct half.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={5} title="Halves Around Us" accent="warm">
              <div className="space-y-6">
                <StoryIllustrationMock
                  illustration={<KittensBiscuitIllustration />}
                  caption="Two kittens share one biscuit equally."
                />
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
                  <p className="text-sm text-slate-600 mb-4 text-center">Tap one half</p>
                  <div className="flex justify-center">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="cursor-pointer">
                      <circle cx="100" cy="100" r="80" fill="#FFE5D9" stroke="#D4A574" strokeWidth="4" />
                      <path d="M 100 20 A 80 80 0 0 1 100 180 L 100 100 Z" fill="#FF6B35" opacity="0.8" />
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#D4A574" strokeWidth="4" />
                      <text x="60" y="100" fontSize="24" fontWeight="bold" fill="#D4A574">½</text>
                      <text x="140" y="100" fontSize="24" fontWeight="bold" fill="#D4A574">½</text>
                    </svg>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300">
                  <p className="text-green-900 font-semibold">
                    ✓ Yes. That is one half because it is one of two equal parts.
                  </p>
                </div>
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 6: Worked Example — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-6-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</div>
            <h2 className="text-xl font-bold text-slate-900">Step 6 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">WORKED EXAMPLE</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Paper-fold illustration. Three-step strip in blue/paper theme,
            showing fold line and final shaded half.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={6} title="Worked Example" accent="warm">
              <div className="space-y-6">
                <StoryIllustrationMock
                  illustration={<PaperFoldIllustration />}
                  caption="Amina folds a circular paper cutout."
                />
                <TeachingPanelMock
                  title="Watch Amina fold her paper"
                  steps={[
                    {
                      label: "1. Whole paper circle",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#F0F4FF" stroke="#90A4AE" strokeWidth="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "2. Fold line through the middle",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#F0F4FF" stroke="#90A4AE" strokeWidth="3" />
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#90A4AE" strokeWidth="3" strokeDasharray="5,5" />
                        </svg>
                      ),
                    },
                    {
                      label: "3. Two equal parts, one half shaded",
                      visual: (
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="#F0F4FF" stroke="#90A4AE" strokeWidth="3" />
                          <path d="M 50 10 A 40 40 0 0 1 50 90 L 50 50 Z" fill="#4FC3F7" />
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#90A4AE" strokeWidth="3" />
                        </svg>
                      ),
                    },
                  ]}
                />
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 7: Practice — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-7-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">7</div>
            <h2 className="text-xl font-bold text-slate-900">Step 7 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">PRACTICE</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Interactive shading interaction: crayon tool palette, tap-to-shade halves,
            live shade counter, &quot;Check my shading&quot; button.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <GoldLessonShellMock stepNumber={7} title="Your Turn" accent="warm">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                  <p className="text-lg font-bold text-slate-900 text-center">
                    Shade one half of the circle.
                  </p>
                </div>
                <ShadingPracticeMock />
              </div>
            </GoldLessonShellMock>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STEP 10: Complete — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="step-10-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">10</div>
            <h2 className="text-xl font-bold text-slate-900">Step 10 Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">COMPLETE</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Celebration panel: Fraction Explorer badge, +50 XP, confetti pieces,
            recap checklist of three skills learned, and Finish lesson button.
          </p>
          <div className="ring-2 ring-orange-200/60 ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl">
            <CompletionCelebrationMock
              badgeName="Fraction Explorer"
              xpEarned={50}
              recapItems={[
                "Show one half of a circle",
                "Tell when two parts are equal",
                "Explain why unequal pieces are not halves",
              ]}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ADMIN CONTROLS — TARGET
            ═══════════════════════════════════════════════════════════ */}
        <section id="admin-target" className="mb-12 scroll-mt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-600 text-white flex items-center justify-center text-sm font-bold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.31-.09.64-.09.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z" fill="white"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Controls Target</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-semibold">ADMIN MOCK</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Visual target for admin illustration controls: Generate, Upload, Approve, Regenerate, Remove.
            Child-facing control also shown where enabled. Not wired to backend.
          </p>
          <AdminControlsMock />
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-200">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Review Notes</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Illustrations are SVG mockups — final product will use AI-assisted raster images</li>
              <li>• Chapati-themed math visuals use warm cream/orange color palette</li>
              <li>• Celebration uses CSS confetti particles (static here, animated in production)</li>
              <li>• Icons: lucide-react SVGs, no emoji in interactive chrome</li>
              <li>• All content is static — not connected to Supabase or lesson data</li>
              <li>• After review, this design will guide the production lesson player refactor</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500 text-center">
              Route: <code className="bg-white px-2 py-0.5 rounded text-slate-700">/design/gold-fractions-lesson</code>
              &nbsp;·&nbsp; Public (no auth required) · Static build
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
