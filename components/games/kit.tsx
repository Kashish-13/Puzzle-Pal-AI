"use client";

import React, { useRef, useState } from "react";
import Icon from "@/components/Icon";
import type { GameOutcome } from "@/lib/games/types";

export interface GameProgress {
  round: number;
  total: number;
  correct: number;
  mistakes: number;
}

/** Contract every game component implements. */
export interface GameProps<R> {
  rounds: R[];
  playful: boolean;
  onProgress: (p: GameProgress) => void;
  onComplete: (o: GameOutcome) => void;
}

/**
 * Round flow for single-answer games: records the pick, shows feedback,
 * then advances (or completes) after a short pause.
 */
export function useChoiceRounds(
  total: number,
  onProgress: (p: GameProgress) => void,
  onComplete: (o: GameOutcome) => void
) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const stats = useRef({ correct: 0, mistakes: 0, attempts: 0 });

  const answer = (choice: number, isCorrect: boolean) => {
    if (picked !== null) return;
    setPicked(choice);
    setLastCorrect(isCorrect);
    const s = stats.current;
    s.attempts += 1;
    if (isCorrect) s.correct += 1;
    else s.mistakes += 1;
    onProgress({ round: index, total, correct: s.correct, mistakes: s.mistakes });

    window.setTimeout(() => {
      if (index + 1 >= total) {
        onComplete({ correct: s.correct, total, attempts: s.attempts, mistakes: s.mistakes });
      } else {
        setIndex(index + 1);
        setPicked(null);
        setLastCorrect(null);
        onProgress({ round: index + 1, total, correct: s.correct, mistakes: s.mistakes });
      }
    }, isCorrect ? 800 : 1600);
  };

  return { index, picked, lastCorrect, answer };
}

export type OptionState = "idle" | "correct" | "wrong" | "reveal" | "dim";

export function optionState(i: number, picked: number | null, answer: number): OptionState {
  if (picked === null) return "idle";
  if (i === answer) return picked === i ? "correct" : "reveal";
  if (i === picked) return "wrong";
  return "dim";
}

/** Answer card with accessible, non-color-only feedback. */
export function OptionCard({
  state,
  onClick,
  children,
  label,
  playful,
  className = "",
}: {
  state: OptionState;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  playful?: boolean;
  className?: string;
}) {
  const styles: Record<OptionState, string> = {
    idle: "border-slate-200 bg-white hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-lift",
    correct: "border-green-500 bg-green-50 ring-2 ring-green-500/30 animate-pop",
    wrong: "border-rose-400 bg-rose-50 animate-shake",
    reveal: "border-green-500 bg-green-50/60 border-dashed",
    dim: "border-slate-200 bg-white opacity-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle"}
      aria-label={label}
      className={`relative flex items-center justify-center border-2 shadow-card transition-all duration-150 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        playful ? "rounded-3xl min-h-24 p-4" : "rounded-xl min-h-16 p-3"
      } ${styles[state]} ${className}`}
    >
      {children}
      {(state === "correct" || state === "reveal") && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
          <Icon name="check" className="w-3 h-3" />
          <span className="sr-only">Correct answer</span>
        </span>
      )}
      {state === "wrong" && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
          <Icon name="x" className="w-3 h-3" />
          <span className="sr-only">Your answer, incorrect</span>
        </span>
      )}
    </button>
  );
}

/** One-line result after each round. */
export function RoundFeedback({ correct, text }: { correct: boolean | null; text?: string }) {
  return (
    <div className="min-h-12" aria-live="polite">
      {correct !== null && (
        <div
          className={`inline-flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm animate-fade-up ${
            correct ? "bg-green-50 text-green-800" : "bg-rose-50 text-rose-800"
          }`}
        >
          <Icon name={correct ? "checkCircle" : "alertCircle"} className="w-4 h-4 mt-0.5" />
          <span>
            <span className="font-semibold">{correct ? "Correct." : "Not quite."}</span>
            {text ? ` ${text}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/** Prompt heading used at the top of most games. */
export function Prompt({ children, playful }: { children: React.ReactNode; playful?: boolean }) {
  return (
    <h2 className={`text-center font-semibold tracking-tight text-ink ${playful ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
      {children}
    </h2>
  );
}
