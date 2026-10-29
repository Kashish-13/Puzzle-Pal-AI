"use client";

import React from "react";
import type { ObjectChoiceRound } from "@/lib/games/types";
import { OBJECT_NAMES } from "@/lib/games/objects";
import { ObjectGlyph } from "../glyphs";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

export default function ShadowGuess({ rounds, playful, onProgress, onComplete }: GameProps<ObjectChoiceRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];

  return (
    <div className="space-y-8">
      <Prompt playful={playful}>Whose shadow is this?</Prompt>

      <div className="flex justify-center">
        <div className="relative w-44 h-44 rounded-3xl bg-gradient-to-b from-sky-50 to-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
          <span className="absolute bottom-6 w-28 h-3 rounded-full bg-slate-300/60 blur-sm" aria-hidden="true" />
          {picked === null ? (
            <ObjectGlyph object={r.target} silhouette className="relative w-28 h-28" />
          ) : (
            <span className="relative animate-pop">
              <ObjectGlyph object={r.target} color={r.targetColor} className="w-28 h-28" />
            </span>
          )}
        </div>
      </div>

      <div className={`grid gap-3 ${r.options.length >= 5 ? "grid-cols-2 sm:grid-cols-3" : r.options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {r.options.map((o, i) => (
          <OptionCard
            key={o}
            playful={playful}
            state={optionState(i, picked, r.answer)}
            onClick={() => answer(i, i === r.answer)}
            label={OBJECT_NAMES[o]}
          >
            <span className="flex flex-col items-center gap-1.5">
              <ObjectGlyph object={o} color="#334155" className="w-12 h-12" />
              <span className="text-sm font-medium text-slate-700">{OBJECT_NAMES[o]}</span>
            </span>
          </OptionCard>
        ))}
      </div>

      <RoundFeedback correct={lastCorrect} text={r.explanation} />
    </div>
  );
}
