"use client";

import React, { useEffect, useRef, useState } from "react";
import type { MemoryGridRound } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { GameProps, Prompt, RoundFeedback } from "../kit";

function Round({ r, onDone }: { r: MemoryGridRound; onDone: (exact: boolean, wrong: number) => void }) {
  const [phase, setPhase] = useState<"preview" | "recall" | "review">("preview");
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("recall"), r.previewMs);
    return () => window.clearTimeout(t);
  }, [r.previewMs]);

  const toggle = (i: number) => {
    if (phase !== "recall") return;
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  };

  const target = new Set(r.cells);
  const wrongPicks = selected.filter((i) => !target.has(i)).length;
  const missed = r.cells.filter((i) => !selected.includes(i)).length;
  const exact = wrongPicks === 0 && missed === 0;

  const check = () => {
    setPhase("review");
    window.setTimeout(() => onDone(exact, wrongPicks + missed), exact ? 900 : 1800);
  };

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-slate-500" aria-live="polite">
        {phase === "preview"
          ? `Memorize ${r.cells.length} cells`
          : phase === "recall"
          ? `Selected ${selected.length} of ${r.cells.length}`
          : exact
          ? "Perfect recall"
          : `${r.cells.length - missed} of ${r.cells.length} correct · ${wrongPicks} extra`}
      </p>

      {phase === "preview" && (
        <div className="mx-auto max-w-xs h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-brand-600 origin-left" style={{ animation: `shrink ${r.previewMs}ms linear forwards` }} />
        </div>
      )}

      <div
        className="mx-auto grid gap-1.5 sm:gap-2 w-full p-2 rounded-2xl bg-slate-100"
        style={{ gridTemplateColumns: `repeat(${r.size}, minmax(0, 1fr))`, maxWidth: `${r.size * 72}px` }}
      >
        {Array.from({ length: r.size * r.size }, (_, i) => {
          const isTarget = target.has(i);
          const isSel = selected.includes(i);
          let cls = "bg-white hover:bg-slate-50";
          let mark: React.ReactNode = null;
          if (phase === "preview" && isTarget) cls = "bg-brand-600 shadow-[0_0_0_3px_rgba(91,75,255,0.15)]";
          if (phase === "recall" && isSel) cls = "bg-blue-500";
          if (phase === "review") {
            if (isTarget && isSel) { cls = "bg-green-500"; mark = <Icon name="check" className="w-4 h-4 text-white" />; }
            else if (isTarget) { cls = "bg-white ring-2 ring-inset ring-green-500"; mark = <span className="sr-only">Missed</span>; }
            else if (isSel) { cls = "bg-rose-500"; mark = <Icon name="x" className="w-4 h-4 text-white" />; }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={phase !== "recall"}
              onClick={() => toggle(i)}
              aria-pressed={isSel}
              aria-label={`Cell ${Math.floor(i / r.size) + 1}, ${(i % r.size) + 1}`}
              className={`aspect-square rounded-lg flex items-center justify-center transition-colors duration-150 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-brand-600 ${cls}`}
            >
              {mark}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-2">
        {phase === "recall" && (
          <>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelected([])} disabled={!selected.length}>
              Clear
            </button>
            <button type="button" className="btn btn-primary" onClick={check} disabled={!selected.length}>
              Check pattern
            </button>
          </>
        )}
      </div>

      <div className="text-center">
        <RoundFeedback
          correct={phase === "review" ? exact : null}
          text={phase === "review" && !exact ? "Green outlines show cells you missed." : undefined}
        />
      </div>
    </div>
  );
}

export default function MemoryGrid({ rounds, playful, onProgress, onComplete }: GameProps<MemoryGridRound>) {
  const [index, setIndex] = useState(0);
  const t = useRef({ correct: 0, mistakes: 0 });

  const done = (exact: boolean, wrong: number) => {
    if (exact) t.current.correct += 1;
    t.current.mistakes += wrong;
    if (index + 1 >= rounds.length) onComplete({ correct: t.current.correct, total: rounds.length, attempts: rounds.length, mistakes: t.current.mistakes });
    else {
      setIndex(index + 1);
      onProgress({ round: index + 1, total: rounds.length, correct: t.current.correct, mistakes: t.current.mistakes });
    }
  };

  return (
    <div className="space-y-5">
      <Prompt playful={playful}>Rebuild the pattern</Prompt>
      <Round key={index} r={rounds[index]} onDone={done} />
    </div>
  );
}
