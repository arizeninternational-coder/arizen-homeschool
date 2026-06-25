"use client";

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
  BadgeIllustration,
} from "@/components/design/gold-fractions/StoryIllustrationMock";
import {
  FractionCircle,
  FractionRect,
} from "@/components/design/gold-fractions/FractionDiagram";
import { AdminControlsMock } from "@/components/design/gold-fractions/AdminControlsMock";

export default function GoldFractionsDesignTarget() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Gold Fractions Lesson Visual Target
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Static design target. Not connected to Supabase.
              </p>
            </div>
            <div className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-semibold rounded-lg">
              Design Mockup
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
          <p className="text-amber-800 text-sm leading-relaxed">
            This route shows the intended visual direction for the Gold Fractions lesson.
            Each step demonstrates the two-layer design: story illustrations for warmth
            and learning diagrams for mathematical clarity. No authentication, no database,
            no deployment. This is a visual prototype for review.
          </p>
        </div>

        {/* Step Rail */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Journey Progress</h2>
          <PolishedStepRailMock currentStep={3} />
        </section>

        {/* Step 1: Welcome */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 1: Welcome</h2>
          <GoldLessonShellMock stepNumber={1} title="Welcome to Halves" accent="warm">
            <div className="space-y-6">
              {/* Story illustration */}
              <StoryIllustrationMock
                illustration={<AminaIllustration />}
                caption="Amina has one round chapati to share."
              />

              {/* Learning diagram */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
                <p className="text-sm text-slate-600 mb-4 text-center">
                  One whole chapati
                </p>
                <div className="flex justify-center">
                  <ChapatiWholeIllustration />
                </div>
              </div>

              {/* CTA button */}
              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                Start lesson
              </button>
            </div>
          </GoldLessonShellMock>
        </section>

        {/* Step 2: Mission */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 2: Mission</h2>
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

              {/* Accept button */}
              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                Accept mission
              </button>
            </div>
          </GoldLessonShellMock>
        </section>

        {/* Step 3: Think First */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 3: Think First</h2>
          <GoldLessonShellMock stepNumber={3} title="Think First" accent="warm">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                <p className="text-lg font-bold text-slate-900 mb-2">
                  Which picture shows fair sharing?
                </p>
                <p className="text-sm text-slate-700">
                  Imagine one chapati shared between two friends.
                </p>
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

              {/* Feedback mock */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300 flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <p className="text-green-900 font-semibold">
                  Yes. Fair sharing means both pieces are the same size.
                </p>
              </div>
            </div>
          </GoldLessonShellMock>
        </section>

        {/* Step 4: Learn */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 4: Learn</h2>
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
        </section>

        {/* Step 5: Halves Around Us */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 5: Halves Around Us</h2>
          <GoldLessonShellMock stepNumber={5} title="Halves Around Us" accent="warm">
            <div className="space-y-6">
              <StoryIllustrationMock
                illustration={<KittensBiscuitIllustration />}
                caption="Two kittens share one biscuit equally."
              />

              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
                <p className="text-sm text-slate-600 mb-4 text-center">
                  Tap one half
                </p>
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
                  Yes. That is one half because it is one of two equal parts.
                </p>
              </div>
            </div>
          </GoldLessonShellMock>
        </section>

        {/* Step 6: Worked Example (optional) */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 6: Worked Example</h2>
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
        </section>

        {/* Step 7: Practice */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 7: Practice</h2>
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
        </section>

        {/* Step 10: Complete */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Step 10: Complete</h2>
          <CompletionCelebrationMock
            badgeName="Fraction Explorer"
            xpEarned={50}
            recapItems={[
              "Show one half of a circle",
              "Tell when two parts are equal",
              "Explain why unequal pieces are not halves",
            ]}
          />
        </section>

        {/* Admin Controls Mock */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Admin Controls (Design Target)</h2>
          <AdminControlsMock />
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-200">
          <p className="text-sm text-slate-600 text-center">
            This is a static design target route. Review the screenshots and confirm the visual direction before implementation.
          </p>
        </footer>
      </div>
    </div>
  );
}
