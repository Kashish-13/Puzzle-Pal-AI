"use client";

import React from "react";
import type { SequenceRound } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

export default function CrackCode({ rounds, playful, onProgress, onComplete }: GameProps<SequenceRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];

  return (
    <div className="space-y-8">
      <Prompt playful={playful}>What comes next?</Prompt>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label={`Sequence: ${r.terms.join(", ")}, then unknown`}>
        {r.terms.map((t, i) => (
          <React.Fragment key={`${index}-${i}`}>
            <span
              className="min-w-14 h-14 sm:min-w-16 sm:h-16 px-3 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-center font-mono text-xl sm:text-2xl font-semibold text-ink tabular-nums animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {t}
            </span>
            <Icon name="arrowRight" className="w-4 h-4 text-slate-300" />
          </React.Fragment>
        ))}
        <span
          className={`min-w-14 h-14 sm:min-w-16 sm:h-16 px-3 rounded-xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl font-semibold tabular-nums ${
            picked === null ? "border-dashed border-brand-300 bg-brand-50 text-brand-600" : "border-green-500 bg-green-50 text-green-700 animate-pop"
          }`}
        >
          {picked === null ? "?" : r.options[r.answer]}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {r.options.map((o, i) => (
          <OptionCard key={i} state={optionState(i, picked, r.answer)} onClick={() => answer(i, i === r.answer)} label={`Answer ${o}`}>
            <span className="font-mono text-xl font-semibold text-ink tabular-nums">{o}</span>
          </OptionCard>
        ))}
      </div>

      <div className="text-center">
        <RoundFeedback correct={lastCorrect} text={r.explanation} />
      </div>
    </div>
  );
}
