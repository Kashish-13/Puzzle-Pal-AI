"use client";

import React, { useRef, useState } from "react";
import type { CompareRound, PlacedItem } from "@/lib/games/types";
import Icon from "@/components/Icon";
import { ObjectGlyph, ShapeGlyph } from "./glyphs";
import { GameProps, Prompt, RoundFeedback } from "./kit";

function Item({ it }: { it: PlacedItem }) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.size}%`, aspectRatio: "1" }}
    >
      {it.kind.type === "shape" ? (
        <ShapeGlyph shape={it.kind.shape} color={it.color} rotation={it.rotation} />
      ) : (
        <span className="block w-full h-full" style={{ transform: `rotate(${it.rotation}deg)` }}>
          <ObjectGlyph object={it.kind.object} color={it.color} className="w-full h-full" />
        </span>
      )}
    </span>
  );
}

function aspectFor(r: CompareRound): string {
  if (r.layout !== "grid") return "1 / 1";
  const cols = new Set(r.left.map((i) => Math.round(i.x))).size;
  const rows = new Set(r.left.map((i) => Math.round(i.y))).size;
  return `${cols} / ${rows}`;
}

function Round({
  r,
  playful,
  onDone,
  onTap,
}: {
  r: CompareRound;
  playful: boolean;
  onDone: (wrong: number) => void;
  onTap: (hit: boolean, foundCount: number) => void;
}) {
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<{ x: number; y: number; k: number } | null>(null);
  const wrong = useRef(0);
  const done = found.length === r.changedIds.length;

  // Hit targets: every id at its position in the right panel (or where it used to be)
  const targets = [...new Set([...r.left.map((i) => i.id), ...r.right.map((i) => i.id)])].map((id) => {
    const it = r.right.find((i) => i.id === id) || r.left.find((i) => i.id === id)!;
    return { id, x: it.x, y: it.y, size: Math.max(it.size, r.left.find((i) => i.id === id)?.size ?? 0) };
  });

  const tapTarget = (id: string) => {
    if (done || found.includes(id)) return;
    if (r.changedIds.includes(id)) {
      const next = [...found, id];
      setFound(next);
      onTap(true, next.length);
      if (next.length === r.changedIds.length) window.setTimeout(() => onDone(wrong.current), 900);
    } else {
      wrong.current += 1;
      const t = targets.find((x) => x.id === id)!;
      setMiss({ x: t.x, y: t.y, k: wrong.current });
      onTap(false, found.length);
    }
  };

  const tapBackground = (e: React.MouseEvent<HTMLDivElement>) => {
    if (done || e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    wrong.current += 1;
    setMiss({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, k: wrong.current });
    onTap(false, found.length);
  };

  const ring = (id: string, panel: "left" | "right") => {
    const it = (panel === "right" ? r.right.find((i) => i.id === id) : undefined) || r.left.find((i) => i.id === id)!;
    return (
      <span
        key={`${panel}-${id}`}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-green-500 bg-green-500/10 animate-pop pointer-events-none flex items-start justify-end"
        style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.size * 1.6}%`, aspectRatio: "1" }}
      >
        {panel === "right" && (
          <span className="-mt-1 -mr-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Icon name="check" className="w-3 h-3" />
          </span>
        )}
      </span>
    );
  };

  const panelCls = `relative w-full rounded-2xl border-2 bg-white overflow-hidden ${playful ? "border-sky-100" : "border-slate-200"}`;
  const style = { aspectRatio: aspectFor(r) };

  return (
    <div className="space-y-5">
      <Prompt playful={playful}>
        {r.changedIds.length > 1 ? `Find ${r.changedIds.length} changes` : "What changed?"}
      </Prompt>
      <p className="text-center text-sm text-slate-500 tabular-nums">
        Found {found.length} of {r.changedIds.length} · tap the change in the right picture
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <figure>
          <div className={panelCls} style={style}>
            {r.left.map((it) => <Item key={it.id} it={it} />)}
            {found.map((id) => ring(id, "left"))}
          </div>
          <figcaption className="mt-1.5 text-center text-xs font-medium text-slate-500">Before</figcaption>
        </figure>
        <figure>
          <div className={`${panelCls} cursor-crosshair`} style={style} onClick={tapBackground} role="group" aria-label="Picture to compare — tap the changes">
            {r.right.map((it) => <Item key={it.id} it={it} />)}
            {targets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => tapTarget(t.id)}
                aria-label="Object"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-brand-600"
                style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.size * 1.35}%`, aspectRatio: "1" }}
              />
            ))}
            {found.map((id) => ring(id, "right"))}
            {miss && (
              <span
                key={miss.k}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-500/90 text-white flex items-center justify-center pointer-events-none animate-[fade-out_0.9s_ease-out_forwards]"
                style={{ left: `${miss.x}%`, top: `${miss.y}%` }}
              >
                <Icon name="x" className="w-4 h-4" />
              </span>
            )}
          </div>
          <figcaption className="mt-1.5 text-center text-xs font-medium text-slate-500">After</figcaption>
        </figure>
      </div>

      <div className="text-center">
        <RoundFeedback correct={done ? true : null} text={done ? r.explanation : undefined} />
      </div>
    </div>
  );
}

/** Shared engine for "What Changed?" (kids) and "Spot the Change" (students). */
export default function ComparePanels({ rounds, playful, onProgress, onComplete }: GameProps<CompareRound>) {
  const [index, setIndex] = useState(0);
  const totals = useRef({ found: 0, wrong: 0, correct: 0, taps: 0 });
  const totalTargets = rounds.reduce((a, r) => a + r.changedIds.length, 0);

  const handleTap = (hit: boolean, foundInRound: number) => {
    const t = totals.current;
    t.taps += 1;
    if (!hit) t.wrong += 1;
    const foundSoFar = rounds.slice(0, index).reduce((a, r) => a + r.changedIds.length, 0) + foundInRound;
    onProgress({ round: index, total: rounds.length, correct: foundSoFar, mistakes: t.wrong });
  };

  const handleDone = (wrongInRound: number) => {
    const t = totals.current;
    // Each wrong tap cancels out one find in that round
    t.correct += Math.max(0, rounds[index].changedIds.length - wrongInRound);
    if (index + 1 >= rounds.length) {
      onComplete({ correct: t.correct, total: totalTargets, attempts: t.taps, mistakes: t.wrong });
    } else {
      setIndex(index + 1);
      onProgress({ round: index + 1, total: rounds.length, correct: rounds.slice(0, index + 1).reduce((a, r) => a + r.changedIds.length, 0), mistakes: t.wrong });
    }
  };

  return <Round key={index} r={rounds[index]} playful={playful} onDone={handleDone} onTap={handleTap} />;
}
