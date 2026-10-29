"use client";

import React from "react";
import type { ColorRound } from "@/lib/games/types";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

export default function ColorDetective({ rounds, playful, onProgress, onComplete }: GameProps<ColorRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];
  const showSwatches = r.kind === "name-to-swatch" || r.kind === "mix";

  return (
    <div className="space-y-8">
      <Prompt playful={playful}>{r.prompt}</Prompt>

      {/* Stimulus */}
      <div className="flex justify-center">
        {r.kind === "stroop" && (
          <span className="text-5xl sm:text-6xl font-black tracking-tight" style={{ color: r.ink }}>
            {r.word}
          </span>
        )}
        {r.kind === "name-to-swatch" && (
          <span className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-3xl sm:text-4xl font-bold tracking-wide text-ink">
            {r.word}
          </span>
        )}
        {r.kind === "swatch-to-name" && (
          <span className="w-32 h-32 rounded-3xl shadow-lift border-4 border-white" style={{ background: r.swatch }} aria-label="Color swatch" />
        )}
        {r.kind === "mix" && r.mix && (
          <div className="flex items-center gap-4">
            <span className="w-20 h-20 rounded-full shadow-lift border-4 border-white ring-1 ring-slate-200" style={{ background: r.mix[0] }} />
            <span className="text-3xl font-semibold text-slate-400">+</span>
            <span className="w-20 h-20 rounded-full shadow-lift border-4 border-white ring-1 ring-slate-200" style={{ background: r.mix[1] }} />
            <span className="text-3xl font-semibold text-slate-400">=</span>
            <span className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center text-2xl font-semibold text-slate-400">?</span>
          </div>
        )}
      </div>

      <div className={`grid gap-3 ${r.options.length > 4 ? "grid-cols-2 sm:grid-cols-3" : r.options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {r.options.map((o, i) => (
          <OptionCard
            key={i}
            playful={playful}
            state={optionState(i, picked, r.answer)}
            onClick={() => answer(i, i === r.answer)}
            label={o.label || `Option ${i + 1}`}
          >
            {showSwatches ? (
              <span className="flex flex-col items-center gap-2">
                <span className="w-14 h-14 rounded-2xl border border-black/5" style={{ background: o.hex }} />
                {picked !== null && <span className="text-xs font-medium text-slate-600">{o.label}</span>}
              </span>
            ) : (
              <span className="text-lg font-semibold text-ink">{o.label}</span>
            )}
          </OptionCard>
        ))}
      </div>

      <RoundFeedback correct={lastCorrect} text={r.explanation} />
    </div>
  );
}
