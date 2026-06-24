"use client";

import React, { useState } from "react";

// -- Feedback Display --------------------------------------------------------

interface FeedbackSpec {
  correct?: string;
  incorrect?: string;
  hint?: string;
}

interface FeedbackDisplayProps {
  feedback: FeedbackSpec;
  state: "idle" | "correct" | "incorrect";
  className?: string;
}

export function FeedbackDisplay({ feedback, state, className = "" }: FeedbackDisplayProps) {
  if (state === "idle") {
    return feedback.hint ? (
      <div className={`mt-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 ${className}`}>
        <p className="text-xs font-semibold text-amber-700">💡 {feedback.hint}</p>
      </div>
    ) : null;
  }

  if (state === "correct") {
    return (
      <div className={`mt-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 ${className}`}>
        <p className="text-sm font-bold text-emerald-800">
          ✅ {feedback.correct || "Correct! Well done!"}
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 ${className}`}>
      <p className="text-sm font-bold text-orange-800">
        {feedback.incorrect || "Not quite. Try again!"}
      </p>
      {feedback.hint && (
        <p className="text-xs text-orange-600 mt-1">💡 {feedback.hint}</p>
      )}
    </div>
  );
}

// -- Tap Continue ------------------------------------------------------------

interface TapContinueProps {
  prompt?: string;
  onContinue: () => void;
  feedback?: FeedbackSpec;
  buttonLabel?: string;
}

export function TapContinue({ prompt, onContinue, feedback, buttonLabel }: TapContinueProps) {
  const [tapped, setTapped] = useState(false);

  // Use provided buttonLabel or sensible defaults
  const defaultLabel = buttonLabel || "Continue";
  const tappedLabel = buttonLabel ? `✓ ${buttonLabel}` : "✓ Let's go!";

  return (
    <div className="mt-4 space-y-3">
      {prompt && (
        <p className="text-sm text-slate-600 font-medium text-center">{prompt}</p>
      )}
      <button
        onClick={() => {
          setTapped(true);
          onContinue();
        }}
        className="w-full px-5 py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100"
      >
        {tapped ? tappedLabel : defaultLabel}
      </button>
      {tapped && feedback?.correct && (
        <FeedbackDisplay feedback={feedback} state="correct" />
      )}
    </div>
  );
}

// -- Tap Choice --------------------------------------------------------------

interface TapChoiceOption {
  id: string;
  label: string;
  description?: string;
  visual?: React.ReactNode;
}

interface TapChoiceProps {
  prompt?: string;
  options: TapChoiceOption[];
  correctChoiceId?: string;
  onSelect: (choiceId: string) => void;
  feedback?: FeedbackSpec;
  disabled?: boolean;
}

export function TapChoice({
  prompt,
  options,
  correctChoiceId,
  onSelect,
  feedback,
  disabled = false,
}: TapChoiceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (id: string) => {
    if (submitted || disabled) return;
    setSelectedId(id);
    setSubmitted(true);
    onSelect(id);
  };

  const state = !submitted
    ? "idle"
    : selectedId === correctChoiceId
    ? "correct"
    : "incorrect";

  return (
    <div className="mt-4 space-y-3">
      {prompt && (
        <p className="text-base font-bold text-slate-800">{prompt}</p>
      )}
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.id === correctChoiceId;
          let btnClass =
            "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md text-slate-700";
          if (submitted) {
            if (isSelected && isCorrect)
              btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-lg shadow-emerald-100";
            else if (isSelected && !isCorrect)
              btnClass = "border-orange-500 bg-orange-50 text-orange-800 shadow-lg shadow-orange-100";
            else if (!isSelected && isCorrect)
              btnClass = "border-emerald-300 bg-emerald-50 text-emerald-700";
            else btnClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
          } else if (isSelected) {
            btnClass = "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-lg shadow-indigo-100";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={submitted || disabled}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-base">{opt.label}.</span>
                {opt.visual && <span className="flex-shrink-0">{opt.visual}</span>}
                {opt.description && (
                  <span className="text-sm font-medium">{opt.description}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {feedback && <FeedbackDisplay feedback={feedback} state={state} />}
    </div>
  );
}

// -- Multiple Choice (Enhanced) -----------------------------------------------

interface MultipleChoiceProps {
  question: string;
  options: string[];
  correctIndex: number;
  feedback?: FeedbackSpec;
  onAnswer?: (correct: boolean, selectedIndex: number) => void;
}

export function MultipleChoice({
  question,
  options,
  correctIndex,
  feedback,
  onAnswer,
}: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i: number) => {
    if (submitted) return;
    setSelectedIndex(i);
    setSubmitted(true);
    onAnswer?.(i === correctIndex, i);
  };

  const state = !submitted
    ? "idle"
    : selectedIndex === correctIndex
    ? "correct"
    : "incorrect";

  return (
    <div className="mt-4 space-y-3">
      <p className="text-base font-bold text-slate-800">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === correctIndex;
          let btnClass =
            "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md text-slate-700";
          if (submitted) {
            if (isSelected && isCorrect)
              btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-lg shadow-emerald-100";
            else if (isSelected && !isCorrect)
              btnClass = "border-orange-500 bg-orange-50 text-orange-800 shadow-lg shadow-orange-100";
            else if (!isSelected && isCorrect)
              btnClass = "border-emerald-300 bg-emerald-50 text-emerald-700";
            else btnClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
          } else if (isSelected) {
            btnClass = "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-lg shadow-indigo-100";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  submitted && isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : submitted && isSelected && !isCorrect
                    ? "border-orange-500 bg-orange-500 text-white"
                    : isSelected
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-300 text-slate-500"
                }`}>
                  {submitted && isCorrect ? "✓" : submitted && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
      {feedback && <FeedbackDisplay feedback={feedback} state={state} />}
    </div>
  );
}

// -- Reflection Chips ---------------------------------------------------------

interface ReflectionChipsProps {
  prompt?: string;
  chips: string[];
  sentenceStarter?: string;
  onSave?: (selectedChips: string[], text: string) => void;
}

export function ReflectionChips({
  prompt,
  chips,
  sentenceStarter,
  onSave,
}: ReflectionChipsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleChip = (chip: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  };

  const handleSave = () => {
    setSaved(true);
    onSave?.(Array.from(selected), text);
  };

  return (
    <div className="mt-4 space-y-3">
      {prompt && (
        <p className="text-base font-bold text-slate-800">{prompt}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isSelected = selected.has(chip);
          return (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {sentenceStarter && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 italic">{sentenceStarter}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reflection..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saved || (selected.size === 0 && !text.trim())}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
          saved
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40"
        }`}
      >
        {saved ? "✓ Reflection saved" : "Save Reflection"}
      </button>
    </div>
  );
}
