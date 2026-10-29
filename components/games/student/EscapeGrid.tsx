"use client";

import React, { useRef, useState } from "react";
import type { EscapeBoard } from "@/lib/games/types";
import { escapeStep, type EscState } from "@/lib/games/generators/student";
import Icon from "@/components/Icon";
import { GameProps, Prompt, RoundFeedback } from "../kit";

function Board({
  b,
  onFinish,
  onBlocked,
}: {
  b: EscapeBoard;
  onFinish: (escaped: boolean, moves: number) => void;
  onBlocked: () => void;
}) {
  const initial: EscState = { pos: b.start, key: false, gate: false };
  const [s, setS] = useState<EscState>(initial);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const totalMoves = useRef(0);
  const outOfMoves = b.moveLimit !== null && moves >= b.moveLimit && !won;

  const move = (to: number | null) => {
    if (won || to === null) return;
    if (outOfMoves) {
      setMessage("Out of moves — reset to try a better route.");
      return;
    }
    const next = escapeStep(b.tiles, s, to);
    if (!next) {
      onBlocked();
      const t = b.tiles[to];
      setMessage(t === "door" ? "Locked. You need the key first." : t === "gate" ? "The gate is closed. Find the switch." : "That's a wall.");
      return;
    }
    setS(next);
    setMoves(moves + 1);
    totalMoves.current += 1;
    const t = b.tiles[to];
    setMessage(
      t === "key" && !s.key ? "Key collected — doors will open now." : t === "switch" ? (next.gate ? "Switch on — gate opened." : "Switch off — gate closed.") : null
    );
    if (t === "exit") {
      setWon(true);
      window.setTimeout(() => onFinish(true, moves + 1), 1000);
    }
  };

  const dir = (dr: number, dc: number) => {
    const r = Math.floor(s.pos / b.size) + dr, c = (s.pos % b.size) + dc;
    if (r < 0 || c < 0 || r >= b.size || c >= b.size) return null;
    return r * b.size + c;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (map[e.key]) {
      e.preventDefault();
      move(dir(...map[e.key]));
    }
  };

  const reset = () => {
    setS(initial);
    setMoves(0);
    setMessage(null);
    onBlocked(); // a reset counts as one wasted attempt
  };

  const tileView = (i: number) => {
    const t = b.tiles[i];
    if (t === "wall") return { cls: "bg-slate-700", node: null, label: "Wall" };
    if (t === "exit") return { cls: "bg-green-50 ring-2 ring-inset ring-green-500", node: <Icon name="flag" className="w-4 h-4 text-green-600" />, label: "Exit" };
    if (t === "door") return { cls: s.key ? "bg-amber-50" : "bg-amber-100 ring-2 ring-inset ring-amber-400", node: <Icon name={s.key ? "check" : "lock"} className="w-4 h-4 text-amber-700" />, label: s.key ? "Door, unlocked" : "Locked door" };
    if (t === "key") return { cls: "bg-white", node: s.key ? null : <Icon name="key" className="w-4 h-4 text-amber-600" />, label: s.key ? "Floor" : "Key" };
    if (t === "switch") return { cls: s.gate ? "bg-blue-50" : "bg-white", node: <Icon name="toggle" className={`w-4 h-4 ${s.gate ? "text-blue-600" : "text-slate-500"}`} />, label: `Switch, ${s.gate ? "on" : "off"}` };
    if (t === "gate") return {
      cls: s.gate ? "bg-blue-50" : "bg-blue-100 bg-[repeating-linear-gradient(90deg,#3b82f6_0_3px,transparent_3px_9px)]",
      node: null,
      label: s.gate ? "Gate, open" : "Gate, closed",
    };
    return { cls: "bg-white", node: null, label: "Floor" };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1">
          Moves <span className="font-semibold text-ink tabular-nums">{moves}</span>
          {b.moveLimit !== null && <span className="text-slate-400 tabular-nums">/ {b.moveLimit}</span>}
        </span>
        {b.tiles.includes("key") && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${s.key ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-200 text-slate-500"}`}>
            <Icon name="key" className="w-3.5 h-3.5" /> {s.key ? "Key collected" : "No key"}
          </span>
        )}
        {b.tiles.includes("gate") && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${s.gate ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-500"}`}>
            <Icon name="toggle" className="w-3.5 h-3.5" /> Gate {s.gate ? "open" : "closed"}
          </span>
        )}
      </div>

      <div
        role="grid"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="Escape grid. Use arrow keys to move."
        className="mx-auto grid gap-1 w-full p-2 rounded-2xl bg-slate-200 focus-visible:outline-2 focus-visible:outline-brand-600"
        style={{ gridTemplateColumns: `repeat(${b.size}, minmax(0, 1fr))`, maxWidth: `${b.size * 56}px` }}
      >
        {b.tiles.map((_, i) => {
          const v = tileView(i);
          const here = s.pos === i;
          const r = Math.floor(i / b.size), c = i % b.size, pr = Math.floor(s.pos / b.size), pc = s.pos % b.size;
          const adj = Math.abs(r - pr) + Math.abs(c - pc) === 1;
          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => (adj ? move(i) : undefined)}
              aria-label={here ? `You, on ${v.label}` : v.label}
              className={`relative aspect-square rounded-md flex items-center justify-center transition-colors ${v.cls} ${adj && !won ? "cursor-pointer hover:brightness-95" : "cursor-default"}`}
            >
              {v.node}
              {here && (
                <span className={`absolute inset-1.5 rounded-full shadow-lift transition-all ${won ? "bg-green-500" : "bg-brand-600"} ring-2 ring-white`} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* D-pad for touch */}
      <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto sm:hidden" aria-label="Movement controls">
        <span />
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => move(dir(-1, 0))} aria-label="Up"><Icon name="arrowUp" className="w-4 h-4" /></button>
        <span />
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => move(dir(0, -1))} aria-label="Left"><Icon name="arrowLeft" className="w-4 h-4" /></button>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => move(dir(1, 0))} aria-label="Down"><Icon name="arrowDown" className="w-4 h-4" /></button>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => move(dir(0, 1))} aria-label="Right"><Icon name="arrowRight" className="w-4 h-4" /></button>
      </div>

      <div className="min-h-6 text-center text-sm" aria-live="polite">
        {message && <span className={message.startsWith("Locked") || message.startsWith("The gate") || message.startsWith("That's") || message.startsWith("Out") ? "text-rose-600" : "text-slate-600"}>{message}</span>}
      </div>

      <div className="flex justify-center gap-2">
        <button type="button" className="btn btn-sm btn-secondary" onClick={reset} disabled={won || moves === 0}>
          <Icon name="rotate" className="w-4 h-4" /> Reset
        </button>
        <button type="button" className="btn btn-sm btn-ghost" disabled={won} onClick={() => onFinish(false, totalMoves.current)}>
          Skip board
        </button>
      </div>

      <div className="text-center">
        <RoundFeedback
          correct={won ? true : null}
          text={won ? (moves === b.optimal ? "Escaped with the optimal route!" : `Escaped in ${moves} moves (optimal is ${b.optimal}).`) : undefined}
        />
      </div>
    </div>
  );
}

export default function EscapeGrid({ rounds, playful, onProgress, onComplete }: GameProps<EscapeBoard>) {
  const [index, setIndex] = useState(0);
  const t = useRef({ correct: 0, mistakes: 0, attempts: 0 });

  const finish = (escaped: boolean, moves: number) => {
    const s = t.current;
    s.attempts += moves;
    if (escaped) {
      s.correct += 1;
      s.mistakes += Math.max(0, moves - rounds[index].optimal);
    } else s.mistakes += 4;
    if (index + 1 >= rounds.length) onComplete({ correct: s.correct, total: rounds.length, attempts: s.attempts, mistakes: s.mistakes });
    else {
      setIndex(index + 1);
      onProgress({ round: index + 1, total: rounds.length, correct: s.correct, mistakes: s.mistakes });
    }
  };

  const blocked = () => {
    t.current.mistakes += 1;
    onProgress({ round: index, total: rounds.length, correct: t.current.correct, mistakes: t.current.mistakes });
  };

  return (
    <div className="space-y-5">
      <Prompt playful={playful}>Reach the exit</Prompt>
      <Board key={index} b={rounds[index]} onFinish={finish} onBlocked={blocked} />
    </div>
  );
}
