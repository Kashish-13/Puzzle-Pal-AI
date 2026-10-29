"use client";

import React, { useRef, useState } from "react";
import type { MemoryMatchConfig } from "@/lib/games/types";
import { OBJECT_NAMES } from "@/lib/games/objects";
import { ObjectGlyph } from "../glyphs";
import { GameProps, Prompt } from "../kit";

export default function MemoryMatch({ rounds, playful, onProgress, onComplete }: GameProps<MemoryMatchConfig>) {
  const { cards, pairs } = rounds[0];
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [turns, setTurns] = useState(0);
  const locked = useRef(false);

  const flip = (i: number) => {
    if (locked.current || open.includes(i) || matched.has(i)) return;
    if (open.length === 0) {
      setOpen([i]);
      return;
    }
    const first = open[0];
    const nextTurns = turns + 1;
    setTurns(nextTurns);
    setOpen([first, i]);
    const isMatch = cards[first].object === cards[i].object;

    if (isMatch) {
      const next = new Set(matched);
      next.add(first);
      next.add(i);
      setMatched(next);
      setOpen([]);
      const found = next.size / 2;
      onProgress({ round: found, total: pairs, correct: found, mistakes: nextTurns - found });
      if (found === pairs) {
        // Ideal play still needs some exploring turns; score against ~1.5 turns per pair
        const ideal = Math.round(pairs * 1.5);
        window.setTimeout(
          () =>
            onComplete({
              correct: Math.min(pairs, Math.round((pairs * ideal) / Math.max(nextTurns, ideal))),
              total: pairs,
              attempts: nextTurns,
              mistakes: Math.max(0, nextTurns - ideal),
            }),
          700
        );
      }
    } else {
      locked.current = true;
      onProgress({ round: matched.size / 2, total: pairs, correct: matched.size / 2, mistakes: nextTurns - matched.size / 2 });
      window.setTimeout(() => {
        setOpen([]);
        locked.current = false;
      }, 850);
    }
  };

  const cols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : cards.length <= 16 ? 4 : 5;

  return (
    <div className="space-y-6">
      <Prompt playful={playful}>Find all the matching pairs</Prompt>
      <p className="text-center text-sm text-slate-500 tabular-nums">
        {matched.size / 2} of {pairs} pairs · {turns} turns
      </p>

      <div className="mx-auto grid gap-2.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 112}px` }}>
        {cards.map((c, i) => {
          const faceUp = open.includes(i) || matched.has(i);
          const isMatched = matched.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              disabled={isMatched}
              aria-label={faceUp ? OBJECT_NAMES[c.object] : `Hidden card ${i + 1}`}
              className="relative aspect-square [perspective:600px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 rounded-2xl"
            >
              <span
                className={`absolute inset-0 rounded-2xl transition-transform duration-300 [transform-style:preserve-3d] ${faceUp ? "[transform:rotateY(180deg)]" : ""}`}
              >
                <span className="absolute inset-0 rounded-2xl bg-brand-600 hover:bg-brand-700 shadow-card [backface-visibility:hidden] flex items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.2),transparent_55%)]">
                  <span className="w-6 h-6 rounded-lg border-2 border-white/40" />
                </span>
                <span
                  className={`absolute inset-0 rounded-2xl border-2 shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center ${
                    isMatched ? "bg-green-50 border-green-400" : "bg-white border-slate-200"
                  }`}
                >
                  <ObjectGlyph object={c.object} color={c.color} className="w-3/5 h-3/5" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
