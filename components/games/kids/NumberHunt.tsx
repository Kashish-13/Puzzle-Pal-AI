"use client";

import React, { useRef, useState } from "react";
import type { NumberHuntRound } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { GameProps, Prompt, RoundFeedback } from "../kit";

function Round({
  r,
  playful,
  onTap,
  onDone,
}: {
  r: NumberHuntRound;
  playful: boolean;
  onTap: (hit: boolean) => void;
  onDone: (wrong: number) => void;
}) {
  const [found, setFound] = useState<number[]>([]);
  const [wrongCell, setWrongCell] = useState<{ i: number; k: number } | null>(null);
  const wrong = useRef(0);
  const done = found.length === r.targets.length;

  const tap = (i: number) => {
    if (done || found.includes(i)) return;
    if (r.targets.includes(i)) {
      const next = [...found, i];
      setFound(next);
      onTap(true);
      if (next.length === r.targets.length) window.setTimeout(() => onDone(wrong.current), 800);
    } else {
      wrong.current += 1;
      setWrongCell({ i, k: wrong.current });
      onTap(false);
    }
  };

  const multi = r.targets.length > 1;

  return (
    <div className="space-y-6">
      <Prompt playful={playful}>
        {multi ? "Find every" : "Find"}{" "}
        <span className="inline-flex items-center justify-center min-w-14 px-3 py-1 rounded-2xl bg-brand-600 text-white tabular-nums">{r.target}</span>
      </Prompt>
      <p className="text-center text-sm text-slate-500 tabular-nums">
        {multi ? `Found ${found.length} of ${r.targets.length}` : "Tap it as fast as you can"}
      </p>

      <div
        className="mx-auto grid gap-2 sm:gap-2.5 w-full"
        style={{ gridTemplateColumns: `repeat(${r.cols}, minmax(0, 1fr))`, maxWidth: `${r.cols * 84}px` }}
      >
        {r.cells.map((c, i) => {
          const isFound = found.includes(i);
          const isWrong = wrongCell?.i === i;
          return (
            <button
              key={isWrong ? `${i}-${wrongCell?.k}` : i}
              type="button"
              onClick={() => tap(i)}
              aria-label={`Number ${c}`}
              className={`relative aspect-square rounded-2xl border-2 font-semibold tabular-nums transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand-600 ${
                c.length > 1 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              } ${
                isFound
                  ? "border-green-500 bg-green-50 text-green-700 animate-pop"
                  : isWrong
                  ? "border-rose-400 bg-rose-50 text-rose-700 animate-shake"
                  : "border-slate-200 bg-white text-ink hover:border-brand-300"
              }`}
            >
              {c}
              {isFound && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Icon name="check" className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <RoundFeedback correct={done ? true : null} text={done ? r.explanation : undefined} />
      </div>
    </div>
  );
}

export default function NumberHunt({ rounds, playful, onProgress, onComplete }: GameProps<NumberHuntRound>) {
  const [index, setIndex] = useState(0);
  const t = useRef({ correct: 0, wrong: 0, taps: 0 });

  const handleTap = (hit: boolean) => {
    t.current.taps += 1;
    if (!hit) t.current.wrong += 1;
    onProgress({ round: index, total: rounds.length, correct: t.current.correct, mistakes: t.current.wrong });
  };

  const handleDone = (wrongInRound: number) => {
    // A round counts as correct when solved without wrong taps
    if (wrongInRound === 0) t.current.correct += 1;
    if (index + 1 >= rounds.length) {
      onComplete({ correct: t.current.correct, total: rounds.length, attempts: t.current.taps, mistakes: t.current.wrong });
    } else {
      setIndex(index + 1);
      onProgress({ round: index + 1, total: rounds.length, correct: t.current.correct, mistakes: t.current.wrong });
    }
  };

  return <Round key={index} r={rounds[index]} playful={playful} onTap={handleTap} onDone={handleDone} />;
}
