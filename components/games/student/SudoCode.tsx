"use client";

import React, { useState } from "react";
import type { CodeRound } from "@/lib/games/types";
import { runArrange } from "@/lib/games/generators/student";
import Icon from "@/components/Icon";
import { GameProps, OptionCard, RoundFeedback, optionState, useChoiceRounds } from "../kit";

/** Minimal syntax colouring for the pseudo-language */
function CodeLine({ text }: { text: string }) {
  const [code, comment] = text.split("    # ");
  const parts = code.split(/(\brepeat\b|\btimes\b|\bif\b|\boutput\b|-?\b\d+\b|______)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^(repeat|times|if|output)$/.test(p) ? (
          <span key={i} className="text-brand-300 font-semibold">{p}</span>
        ) : /^-?\d+$/.test(p) ? (
          <span key={i} className="text-amber-300">{p}</span>
        ) : p === "______" ? (
          <span key={i} className="inline-block w-28 rounded bg-brand-500/30 border border-dashed border-brand-300 text-transparent">blank</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
      {comment && <span className="text-slate-500">{"    # " + comment}</span>}
    </>
  );
}

function CodePanel({
  lines,
  onLineClick,
  lineState,
}: {
  lines: string[];
  onLineClick?: (i: number) => void;
  lineState?: (i: number) => "idle" | "correct" | "wrong" | "reveal";
}) {
  return (
    <div className="rounded-2xl bg-[#0f1222] border border-slate-800 shadow-lift overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="ml-2 text-xs text-slate-500 font-mono">program.pal</span>
      </div>
      <ol className="py-3 font-mono text-[13px] sm:text-sm text-slate-200 overflow-x-auto">
        {lines.map((l, i) => {
          const st = lineState?.(i) ?? "idle";
          const content = (
            <>
              <span className="w-8 shrink-0 text-right pr-4 text-slate-600 select-none tabular-nums">{i + 1}</span>
              <span className="whitespace-pre"><CodeLine text={l} /></span>
              {st === "correct" || st === "reveal" ? <Icon name="check" className="w-4 h-4 ml-auto text-green-400" /> : st === "wrong" ? <Icon name="x" className="w-4 h-4 ml-auto text-rose-400" /> : null}
            </>
          );
          const tone =
            st === "correct" || st === "reveal" ? "bg-green-500/15" : st === "wrong" ? "bg-rose-500/15" : "";
          return (
            <li key={i}>
              {onLineClick ? (
                <button
                  type="button"
                  onClick={() => onLineClick(i)}
                  disabled={st !== "idle"}
                  className={`w-full flex items-center pr-4 py-1 text-left hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-none disabled:cursor-default ${tone}`}
                >
                  {content}
                </button>
              ) : (
                <div className={`flex items-center pr-4 py-1 ${tone}`}>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Arrange({ r, done, onSubmit }: { r: CodeRound; done: boolean; onSubmit: (ok: boolean, order: number[]) => void }) {
  const [order, setOrder] = useState<number[]>([]);
  const target = runArrange(r.lines[0], (r.answer as number[]).map((i) => r.options[i]));
  const placed = order.map((i) => r.options[i]);
  const result = order.length === r.options.length ? runArrange(r.lines[0], placed) : null;

  return (
    <div className="space-y-4">
      <CodePanel lines={[r.lines[0], ...(placed.length ? placed : ["______"]), "output x"]} />
      <p className="text-sm text-slate-500 text-center">Tap blocks in the order they should run. Tap a placed block to remove it.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {r.options.map((o, i) => {
          const pos = order.indexOf(i);
          return (
            <button
              key={i}
              type="button"
              disabled={done}
              onClick={() => setOrder(pos >= 0 ? order.filter((x) => x !== i) : [...order, i])}
              className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 font-mono text-sm transition-all ${
                pos >= 0 ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-ink hover:border-brand-300 hover:-translate-y-0.5"
              }`}
            >
              {pos >= 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center tabular-nums">{pos + 1}</span>}
              {o}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={done || order.length !== r.options.length}
          onClick={() => onSubmit(result === target, order)}
        >
          <Icon name="play" className="w-4 h-4" filled /> Run program
        </button>
      </div>
      {done && result !== null && (
        <p className="text-center text-sm text-slate-600 tabular-nums">
          Your program outputs <span className="font-mono font-semibold">{result}</span> (target {target})
        </p>
      )}
    </div>
  );
}

export default function SudoCode({ rounds, onProgress, onComplete }: GameProps<CodeRound>) {
  const { index, picked, lastCorrect, answer } = useChoiceRounds(rounds.length, onProgress, onComplete);
  const r = rounds[index];
  const kindLabel = { predict: "Predict the output", missing: "Fill the missing step", bug: "Find the bug", arrange: "Order the logic" }[r.kind];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="eyebrow">{kindLabel}</p>
        <h2 className="mt-2 text-lg sm:text-xl font-semibold text-ink max-w-xl mx-auto">{r.prompt}</h2>
      </div>

      {r.kind === "arrange" ? (
        <Arrange key={index} r={r} done={picked !== null} onSubmit={(ok) => answer(ok ? 1 : 0, ok)} />
      ) : r.kind === "bug" ? (
        <CodePanel
          lines={r.lines}
          onLineClick={(i) => answer(i, i === r.answer)}
          lineState={(i) => {
            const st = optionState(i, picked, r.answer as number);
            return st === "dim" ? "idle" : st;
          }}
        />
      ) : (
        <>
          <CodePanel lines={r.lines} />
          <div className={`grid gap-3 max-w-2xl mx-auto ${r.kind === "missing" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
            {r.options.map((o, i) => (
              <OptionCard key={i} state={optionState(i, picked, r.answer as number)} onClick={() => answer(i, i === r.answer)} label={o}>
                <span className="font-mono text-base font-semibold text-ink">{o}</span>
              </OptionCard>
            ))}
          </div>
        </>
      )}

      <div className="text-center">
        <RoundFeedback correct={lastCorrect} text={r.explanation} />
      </div>
    </div>
  );
}
