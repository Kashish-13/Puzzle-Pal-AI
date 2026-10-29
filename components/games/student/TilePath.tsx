"use client";

import React, { useRef, useState } from "react";
import type { TileBoard } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { GameProps, Prompt, RoundFeedback } from "../kit";

const adjacent = (a: number, b: number, size: number) => {
  const ar = Math.floor(a / size), ac = a % size, br = Math.floor(b / size), bc = b % size;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

function Board({
  b,
  onFinish,
  onInvalid,
}: {
  b: TileBoard;
  onFinish: (solved: boolean, moves: number, backtracks: number) => void;
  onInvalid: () => void;
}) {
  const [path, setPath] = useState<number[]>([b.start]);
  const [message, setMessage] = useState<string | null>(null);
  const backtracks = useRef(0);
  const blocked = new Set(b.blocked);
  const head = path[path.length - 1];
  const moves = path.length - 1;
  const solved = head === b.end;
  const outOfMoves = b.moveLimit !== null && moves >= b.moveLimit && !solved;

  const tryMove = (i: number) => {
    if (solved) return;
    if (path.length > 1 && i === head) {
      backtracks.current += 1;
      setPath(path.slice(0, -1));
      setMessage(null);
      return;
    }
    if (blocked.has(i) || path.includes(i) || !adjacent(head, i, b.size)) {
      onInvalid();
      setMessage(blocked.has(i) ? "That tile is blocked." : path.includes(i) ? "Your path can't cross itself." : "Move to a tile next to the end of your path.");
      return;
    }
    if (outOfMoves) {
      setMessage("Move limit reached — undo or reset.");
      return;
    }
    const next = [...path, i];
    setPath(next);
    setMessage(null);
    if (i === b.end) window.setTimeout(() => onFinish(true, next.length - 1, backtracks.current), 900);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const r = Math.floor(head / b.size), c = head % b.size;
    const map: Record<string, number | null> = {
      ArrowUp: r > 0 ? head - b.size : null,
      ArrowDown: r < b.size - 1 ? head + b.size : null,
      ArrowLeft: c > 0 ? head - 1 : null,
      ArrowRight: c < b.size - 1 ? head + 1 : null,
    };
    if (e.key in map) {
      e.preventDefault();
      const target = map[e.key];
      if (target === null) return;
      tryMove(path.length > 1 && path[path.length - 2] === target ? head : target);
    } else if (e.key === "Backspace" && path.length > 1) {
      e.preventDefault();
      tryMove(head);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="text-slate-500">
          Moves <span className="font-semibold text-ink tabular-nums">{moves}</span>
          {b.moveLimit !== null && <span className="text-slate-400 tabular-nums"> / {b.moveLimit}</span>}
        </span>
        <span className="text-slate-500">
          Shortest possible <span className="font-semibold text-ink tabular-nums">{b.shortest}</span>
        </span>
      </div>

      <div
        role="grid"
        aria-label="Tile path board. Use arrow keys to move, Backspace to undo."
        tabIndex={0}
        onKeyDown={onKey}
        className="mx-auto grid gap-1 sm:gap-1.5 w-full rounded-2xl p-2 bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-600"
        style={{ gridTemplateColumns: `repeat(${b.size}, minmax(0, 1fr))`, maxWidth: `${b.size * 64}px` }}
      >
        {Array.from({ length: b.size * b.size }, (_, i) => {
          const step = path.indexOf(i);
          const isBlocked = blocked.has(i);
          const isStart = i === b.start, isEnd = i === b.end;
          const isHead = i === head;
          const canStep = !solved && !isBlocked && step < 0 && adjacent(head, i, b.size) && !outOfMoves;
          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => tryMove(i)}
              aria-label={isStart ? "Start" : isEnd ? "End" : isBlocked ? "Blocked" : step >= 0 ? `Path step ${step}` : "Empty tile"}
              className={`relative aspect-square rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                isBlocked
                  ? "bg-slate-700 bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,0.07)_5px_10px)] cursor-not-allowed"
                  : step >= 0
                  ? solved
                    ? "bg-green-500 text-white"
                    : `bg-brand-600 text-white ${isHead ? "ring-2 ring-offset-2 ring-offset-slate-100 ring-brand-600" : ""}`
                  : canStep
                  ? "bg-white ring-2 ring-inset ring-brand-200 hover:bg-brand-50"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              {isStart ? "S" : isEnd ? (step >= 0 ? <Icon name="flag" className="w-4 h-4 mx-auto" /> : <span className="text-green-600">E</span>) : step > 0 ? <span className="opacity-80 tabular-nums">{step}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-6 text-center text-sm" aria-live="polite">
        {message && <span className="text-rose-600">{message}</span>}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => tryMove(head)} disabled={path.length <= 1 || solved}>
          <Icon name="undo" className="w-4 h-4" /> Undo
        </button>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={solved}
          onClick={() => {
            backtracks.current += path.length - 1;
            setPath([b.start]);
            setMessage(null);
          }}
        >
          <Icon name="rotate" className="w-4 h-4" /> Reset
        </button>
        <button type="button" className="btn btn-sm btn-ghost" disabled={solved} onClick={() => onFinish(false, moves, backtracks.current)}>
          Skip board
        </button>
      </div>

      <div className="text-center">
        <RoundFeedback
          correct={solved ? true : null}
          text={solved ? (moves === b.shortest ? "Optimal route!" : `Reached the end in ${moves} moves (shortest is ${b.shortest}).`) : undefined}
        />
      </div>
    </div>
  );
}

export default function TilePath({ rounds, playful, onProgress, onComplete }: GameProps<TileBoard>) {
  const [index, setIndex] = useState(0);
  const t = useRef({ correct: 0, mistakes: 0, attempts: 0 });

  const finish = (solved: boolean, moves: number, backtracks: number) => {
    const s = t.current;
    const b = rounds[index];
    s.attempts += moves + backtracks;
    if (solved) {
      s.correct += 1;
      s.mistakes += Math.max(0, moves - b.shortest) + backtracks;
    } else s.mistakes += 3;
    if (index + 1 >= rounds.length) onComplete({ correct: s.correct, total: rounds.length, attempts: s.attempts, mistakes: s.mistakes });
    else {
      setIndex(index + 1);
      onProgress({ round: index + 1, total: rounds.length, correct: s.correct, mistakes: s.mistakes });
    }
  };

  const invalid = () => {
    t.current.mistakes += 1;
    onProgress({ round: index, total: rounds.length, correct: t.current.correct, mistakes: t.current.mistakes });
  };

  return (
    <div className="space-y-5">
      <Prompt playful={playful}>Build a path from S to E</Prompt>
      <Board key={index} b={rounds[index]} onFinish={finish} onInvalid={invalid} />
    </div>
  );
}
