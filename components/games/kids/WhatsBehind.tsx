"use client";

import React, { useEffect, useState } from "react";
import type { ObjectChoiceRound } from "@/lib/games/types";
import { OBJECT_NAMES } from "@/lib/games/objects";
import { ObjectGlyph } from "../glyphs";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

function Round({
  r,
  playful,
  picked,
  lastCorrect,
  onAnswer,
}: {
  r: ObjectChoiceRound;
  playful: boolean;
  picked: number | null;
  lastCorrect: boolean | null;
  onAnswer: (i: number) => void;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHidden(true), r.previewMs ?? 1500);
    return () => window.clearTimeout(t);
  }, [r.previewMs]);

  return (
    <div className="space-y-8">
      <Prompt playful={playful}>{hidden ? "What was behind the card?" : "Remember this!"}</Prompt>

      <div className="flex justify-center">
        <div className="relative w-44 h-44 [perspective:800px]">
          <div
            className={`absolute inset-0 rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] ${hidden && picked === null ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <div className="absolute inset-0 rounded-3xl bg-white border-2 border-slate-200 shadow-lift flex items-center justify-center [backface-visibility:hidden]">
              <ObjectGlyph object={r.target} color={r.targetColor} className="w-24 h-24" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-brand-600 shadow-lift flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]">
              <span className="text-6xl font-semibold text-white/90">?</span>
            </div>
          </div>
        </div>
      </div>

      {!hidden ? (
        <div className="mx-auto max-w-xs h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-brand-600 origin-left"
            style={{ animation: `shrink ${r.previewMs ?? 1500}ms linear forwards` }}
          />
        </div>
      ) : (
        <div className={`grid gap-3 ${r.options.length > 4 ? "grid-cols-2 sm:grid-cols-3" : r.options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"} animate-fade-up`}>
          {r.options.map((o, i) => (
            <OptionCard
              key={o}
              playful={playful}
              state={optionState(i, picked, r.answer)}
              onClick={() => onAnswer(i)}
              label={OBJECT_NAMES[o]}
            >
              <span className="flex flex-col items-center gap-1.5">
                <ObjectGlyph object={o} color="#334155" className="w-12 h-12" />
                <span className="text-sm font-medium text-slate-700">{OBJECT_NAMES[o]}</span>
              </span>
            </OptionCard>
          ))}
        </div>
      )}

      <RoundFeedback correct={lastCorrect} text={r.explanation} />
    </div>
  );
}

export default function WhatsBehind({ rounds, playful, onProgress, onComplete }: GameProps<ObjectChoiceRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];
  return (
    <Round
      key={index}
      r={r}
      playful={playful}
      picked={picked}
      lastCorrect={lastCorrect}
      onAnswer={(i) => answer(i, i === r.answer)}
    />
  );
}
