"use client";

import React, { useState } from "react";
import type { BelongRound } from "@/lib/games/types";
import { OBJECT_NAMES } from "@/lib/games/objects";
import { ObjectGlyph } from "../glyphs";
import { GameProps, OptionCard, Prompt, RoundFeedback, optionState, useChoiceRounds } from "../kit";

export default function WhereBelongs({ rounds, playful, onProgress, onComplete }: GameProps<BelongRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const r = rounds[index];

  return (
    <div className="space-y-8">
      <Prompt playful={playful}>Where does it belong?</Prompt>

      <div className="flex justify-center">
        <div
          key={index}
          draggable={picked === null}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", "object")}
          className={`w-40 h-40 rounded-3xl bg-white border-2 border-slate-200 shadow-lift flex flex-col items-center justify-center gap-2 animate-pop ${picked === null ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          <ObjectGlyph object={r.object} color={r.color} className="w-20 h-20" />
          <span className="text-sm font-semibold text-ink">{OBJECT_NAMES[r.object]}</span>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">Tap a group, or drag the card onto it.</p>

      <div className={`grid gap-3 ${r.bins.length === 2 ? "grid-cols-2" : r.bins.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
        {r.bins.map((b, i) => (
          <div
            key={b.id}
            onDragOver={(e) => {
              if (picked !== null) return;
              e.preventDefault();
              setDragOver(i);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              if (picked === null) answer(i, i === r.answer);
            }}
            className={`rounded-3xl transition-shadow ${dragOver === i ? "ring-4 ring-brand-200" : ""}`}
          >
            <OptionCard
              playful={playful}
              state={optionState(i, picked, r.answer)}
              onClick={() => answer(i, i === r.answer)}
              label={b.label}
              className="w-full min-h-32"
            >
              <span className="flex flex-col items-center gap-2">
                <span className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <ObjectGlyph object={b.icon} color="#64748b" className="w-8 h-8" />
                </span>
                <span className="text-sm font-semibold text-ink text-center leading-tight">{b.label}</span>
              </span>
            </OptionCard>
          </div>
        ))}
      </div>

      <RoundFeedback correct={lastCorrect} text={r.explanation} />
    </div>
  );
}
