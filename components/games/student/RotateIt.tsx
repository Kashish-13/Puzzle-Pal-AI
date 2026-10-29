"use client";

import React, { useState } from "react";
import type { RotateRound } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { Polyomino } from "../glyphs";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

function Target({ r }: { r: RotateRound }) {
  const [turns, setTurns] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-44 h-44 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-center bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:16px_16px]">
        <div className="transition-transform duration-300" style={{ transform: `rotate(${turns * 90}deg)` }}>
          <Polyomino cells={r.target} className="w-32 h-32" color="#111827" />
        </div>
      </div>
      {r.allowPreviewRotate ? (
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setTurns(turns + 1)}>
          <Icon name="rotate" className="w-4 h-4" /> Rotate target 90°
        </button>
      ) : (
        <span className="text-xs text-slate-500">Rotate it in your head — no preview at this level</span>
      )}
    </div>
  );
}

export default function RotateIt({ rounds, playful, onProgress, onComplete }: GameProps<RotateRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];

  return (
    <div className="space-y-7">
      <Prompt playful={playful}>Which option is the same shape, rotated?</Prompt>
      <Target key={index} r={r} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {r.options.map((o, i) => (
          <OptionCard key={i} state={optionState(i, picked, r.answer)} onClick={() => answer(i, i === r.answer)} label={`Option ${String.fromCharCode(65 + i)}`} className="aspect-square">
            <span className="absolute top-2 left-2.5 text-xs font-semibold text-slate-400">{String.fromCharCode(65 + i)}</span>
            <Polyomino cells={o} className="w-20 h-20" />
          </OptionCard>
        ))}
      </div>

      <div className="text-center">
        <RoundFeedback correct={lastCorrect} text={r.explanation} />
      </div>
    </div>
  );
}
