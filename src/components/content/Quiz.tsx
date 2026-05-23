"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, XCircle, HelpCircle, Trophy, ArrowRight, RotateCcw } from "lucide-react";

interface QuizOption {
  label: string;
  value: string | number;
}

interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  xpReward?: number;
}

interface QuizProps {
  quiz: QuizData;
  onComplete?: (correct: boolean, xpEarned: number) => void;
  className?: string;
}

export function Quiz({ quiz, onComplete, className }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const isCorrect = selectedIndex === quiz.correctIndex;
  const xpAmount = quiz.xpReward || 25;

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null || submitted) return;

    setSubmitted(true);
    const correct = selectedIndex === quiz.correctIndex;
    const xp = correct ? xpAmount : Math.floor(xpAmount * 0.25); // 25% XP for trying
    setXpEarned(xp);
    onComplete?.(correct, xp);
  }, [selectedIndex, submitted, quiz.correctIndex, xpAmount, onComplete]);

  const handleRetry = useCallback(() => {
    setSelectedIndex(null);
    setSubmitted(false);
    setXpEarned(0);
  }, []);

  return (
    <div className={cn("bg-surface-raised rounded-2xl border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-700">
          <HelpCircle className="w-3 h-3" />
          Quiz
        </span>
      </div>

      {/* Question */}
      <div className="px-5 pt-3 pb-4">
        <p className="text-base font-semibold text-text">{quiz.question}</p>
      </div>

      {/* Options */}
      <div className="px-5 pb-4 space-y-2">
        {quiz.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === quiz.correctIndex;

          let optionStyle = "border-border bg-surface hover:border-primary/50 hover:bg-primary/5";
          if (submitted) {
            if (isCorrectOption) {
              optionStyle = "border-success bg-success/5";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-danger bg-danger/5";
            } else {
              optionStyle = "border-border bg-surface opacity-50";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/5";
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelectedIndex(i)}
              disabled={submitted}
              className={cn(
                "w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between",
                optionStyle
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0",
                    submitted && isCorrectOption
                      ? "border-success bg-success text-white"
                      : submitted && isSelected && !isCorrect
                      ? "border-danger bg-danger text-white"
                      : isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text-muted"
                  )}
                >
                  {submitted && isCorrectOption ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : submitted && isSelected && !isCorrect ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="text-text">{option}</span>
              </div>
              {submitted && isCorrectOption && (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && quiz.explanation && (
        <div className="mx-5 mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">{quiz.explanation}</p>
        </div>
      )}

      {/* XP Feedback */}
      {submitted && xpEarned > 0 && (
        <div className={cn(
          "mx-5 mb-4 p-3 rounded-xl flex items-center justify-between",
          isCorrect ? "bg-amber-50 border border-amber-200" : "bg-surface-sunken border border-border"
        )}>
          <div className="flex items-center gap-2">
            <Trophy className={cn("w-5 h-5", isCorrect ? "text-amber-500" : "text-text-muted")} />
            <span className={cn("text-sm font-semibold", isCorrect ? "text-amber-700" : "text-text-muted")}>
              {isCorrect ? "Correct! Well done!" : "Not quite — but you learned something!"}
            </span>
          </div>
          <span className={cn("text-sm font-bold", isCorrect ? "text-amber-600" : "text-text-muted")}>
            +{xpEarned} XP
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="flex-1 bg-primary text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Check Answer
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            {!isCorrect && (
              <button
                onClick={handleRetry}
                className="flex-1 bg-surface-sunken border border-border text-text rounded-xl py-2.5 font-semibold text-sm hover:bg-border transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            )}
            <button
              onClick={() => onComplete?.(isCorrect, xpEarned)}
              className={cn(
                "flex-1 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2",
                isCorrect ? "bg-success hover:bg-green-600" : "bg-primary hover:bg-primary-dark"
              )}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Quiz from content block data ─────────────────────────────

interface QuizFromBlockProps {
  blockData: Record<string, unknown>;
  onComplete?: (correct: boolean, xpEarned: number) => void;
  className?: string;
}

export function QuizFromBlock({ blockData, onComplete, className }: QuizFromBlockProps) {
  const quiz: QuizData = {
    question: (blockData.question as string) || "Question",
    options: (blockData.options as string[]) || [],
    correctIndex: (blockData.correctIndex as number) || 0,
    explanation: (blockData.explanation as string) || undefined,
    xpReward: (blockData.xpReward as number) || 25,
  };

  return <Quiz quiz={quiz} onComplete={onComplete} className={className} />;
}
