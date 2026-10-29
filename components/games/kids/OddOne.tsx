"use client";

import React from "react";
import type { OddOneRound } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { ShapeGlyph } from "../glyphs";
import { GameProps, Prompt, RoundFeedback, useChoiceRounds } from "../kit";

export default function OddOne({ rounds, playful, onProgress, onComplete }: GameProps<OddOneRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];

  return (
    <div className="space-y-6">
      <Prompt playful={playful}>Tap the one that is different</Prompt>

      <div
        className="mx-auto grid gap-2 sm:gap-3 w-full"
        style={{ gridTemplateColumns: `repeat(${r.cols}, minmax(0, 1fr))`, maxWidth: `${r.cols * 92}px` }}
      >
        {r.items.map((it, i) => {
          const isOdd = i === r.answer;
          const reveal = picked !== null && isOdd;
          const wrong = picked === i && !isOdd;
          return (
            <button
              key={`${index}-${i}`}
              type="button"
              disabled={picked !== null}
              onClick={() => answer(i, isOdd)}
              aria-label={`Item ${i + 1}`}
              className={`relative aspect-square rounded-2xl border-2 bg-white p-2.5 sm:p-3 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand-600 ${
                reveal
                  ? "border-green-500 bg-green-50 animate-pop"
                  : wrong
                  ? "border-rose-400 bg-rose-50 animate-shake"
                  : "border-slate-200 hover:border-brand-300 hover:-translate-y-0.5"
              }`}
            >
              <ShapeGlyph shape={it.shape} color={it.color} rotation={it.rotation} scale={it.scale} />
              {reveal && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Icon name="check" className="w-3 h-3" />
                  <span className="sr-only">The odd one</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <RoundFeedback correct={lastCorrect} text={r.explanation} />
      </div>
    </div>
  );
}
