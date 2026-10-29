import React from "react";
import type { GameId } from "@/lib/games/types";
import { ObjectGlyph, Polyomino, ShapeGlyph } from "./glyphs";
import Icon from "@/components/Icon";

/** Small static illustration that shows how each game plays — before opening it. */
export default function ChallengePreview({ gameId }: { gameId: GameId }) {
  switch (gameId) {
    case "color-detective":
      return (
        <div className="flex flex-col items-center gap-2.5">
          <span className="rounded-md bg-white px-2.5 py-0.5 text-xs font-bold tracking-wider text-ink shadow-card">BLUE</span>
          <div className="flex gap-1.5">
            {["#ef4444", "#3b82f6", "#22c55e", "#eab308"].map((c) => (
              <span key={c} className={`w-8 h-8 rounded-lg shadow-card ${c === "#3b82f6" ? "ring-2 ring-offset-2 ring-ink/70" : ""}`} style={{ background: c }} />
            ))}
          </div>
        </div>
      );
    case "whats-behind":
      return (
        <div className="flex items-center gap-3">
          <span className="w-14 h-16 rounded-xl bg-white shadow-card flex items-center justify-center"><ObjectGlyph object="apple" color="#ef4444" className="w-8 h-8" /></span>
          <Icon name="arrowRight" className="w-4 h-4 text-slate-400" />
          <span className="w-14 h-16 rounded-xl bg-brand-600 shadow-card flex items-center justify-center text-2xl font-semibold text-white/90">?</span>
        </div>
      );
    case "odd-one":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`w-8 h-8 rounded-lg bg-white shadow-card p-1.5 ${i === 4 ? "ring-2 ring-green-500" : ""}`}>
              <ShapeGlyph shape={i === 4 ? "square" : "circle"} color="#0ea5e9" />
            </span>
          ))}
        </div>
      );
    case "shadow-guess":
      return (
        <div className="flex items-center gap-3">
          <span className="w-16 h-16 rounded-xl bg-white/70 shadow-card flex items-center justify-center"><ObjectGlyph object="fish" silhouette className="w-10 h-10" /></span>
          <div className="grid grid-cols-2 gap-1">
            {(["fish", "bell", "car", "leaf"] as const).map((o) => (
              <span key={o} className={`w-7 h-7 rounded-md bg-white shadow-card flex items-center justify-center ${o === "fish" ? "ring-2 ring-green-500" : ""}`}><ObjectGlyph object={o} color="#334155" className="w-4 h-4" /></span>
            ))}
          </div>
        </div>
      );
    case "memory-match":
      return (
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className={`w-8 h-9 rounded-md shadow-card flex items-center justify-center ${i === 1 || i === 6 ? "bg-white ring-2 ring-green-500" : "bg-brand-600"}`}>
              {(i === 1 || i === 6) && <ObjectGlyph object="star" color="#f59e0b" className="w-5 h-5" />}
            </span>
          ))}
        </div>
      );
    case "where-belongs":
      return (
        <div className="flex items-center gap-2.5">
          <span className="w-12 h-12 rounded-xl bg-white shadow-card flex items-center justify-center"><ObjectGlyph object="book" color="#5b4bff" className="w-7 h-7" /></span>
          <Icon name="arrowRight" className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col gap-1">
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-ink shadow-card ring-2 ring-green-500">School</span>
            <span className="rounded-md bg-white/70 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-card">Sea</span>
          </div>
        </div>
      );
    case "what-changed":
    case "spot-change": {
      const scene = gameId === "spot-change";
      const dots = scene
        ? [[20, 30, "#5b4bff"], [60, 22, "#22c55e"], [38, 64, "#f59e0b"], [72, 70, "#3b82f6"], [50, 44, "#ec4899"]]
        : [[25, 30, "#3b82f6"], [75, 30, "#22c55e"], [25, 70, "#f59e0b"], [75, 70, "#ec4899"]];
      return (
        <div className="flex gap-2">
          {[0, 1].map((p) => (
            <span key={p} className="relative w-[4.5rem] h-[4.5rem] rounded-lg bg-white shadow-card">
              {dots.map(([x, y, c], i) => (
                <span
                  key={i}
                  className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 ${i % 2 ? "rounded-sm" : "rounded-full"}`}
                  style={{ left: `${x}%`, top: `${y}%`, background: p === 1 && i === 2 ? "#ef4444" : (c as string) }}
                />
              ))}
              {p === 1 && <span className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500" style={{ left: `${dots[2][0]}%`, top: `${dots[2][1]}%` }} />}
            </span>
          ))}
        </div>
      );
    }
    case "number-hunt":
      return (
        <div className="grid grid-cols-3 gap-1">
          {["8", "3", "7", "5", "9", "1", "4", "6", "2"].map((n) => (
            <span key={n} className={`w-8 h-8 rounded-md text-sm font-semibold flex items-center justify-center shadow-card ${n === "9" ? "bg-green-500 text-white" : "bg-white text-ink"}`}>{n}</span>
          ))}
        </div>
      );
    case "crack-code":
      return (
        <div className="flex items-center gap-1.5 font-mono text-sm font-semibold">
          {["4", "8", "12"].map((n) => (
            <React.Fragment key={n}>
              <span className="min-w-8 h-8 px-1.5 rounded-md bg-white shadow-card flex items-center justify-center text-ink">{n}</span>
              <span className="text-slate-400">→</span>
            </React.Fragment>
          ))}
          <span className="min-w-8 h-8 px-1.5 rounded-md border-2 border-dashed border-brand-400 bg-brand-50 flex items-center justify-center text-brand-600">?</span>
        </div>
      );
    case "tile-path": {
      const path = [0, 1, 6, 11, 12, 13, 18, 23, 24];
      const blocked = [2, 5, 8, 10, 16, 20, 21];
      return (
        <div className="grid grid-cols-5 gap-0.5 p-1 rounded-lg bg-slate-200/70">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} className={`w-5 h-5 rounded-sm ${blocked.includes(i) ? "bg-slate-600" : path.includes(i) ? "bg-blue-500" : "bg-white"}`} />
          ))}
        </div>
      );
    }
    case "memory-grid":
      return (
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-200/70">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={`w-6 h-6 rounded-sm ${[1, 6, 7, 12, 14].includes(i) ? "bg-green-500" : "bg-white"}`} />
          ))}
        </div>
      );
    case "rotate-it":
      return (
        <div className="flex items-center gap-2">
          <Polyomino cells={[[0, 0], [1, 0], [2, 0], [2, 1]]} className="w-12 h-12" color="#111827" />
          <Icon name="rotate" className="w-5 h-5 text-sky-500" />
          <Polyomino cells={[[0, 0], [0, 1], [0, 2], [1, 0]]} className="w-12 h-12" color="#0ea5e9" />
        </div>
      );
    case "escape-grid": {
      const walls = [2, 7, 8, 13, 15, 16];
      return (
        <div className="grid grid-cols-5 gap-0.5 p-1 rounded-lg bg-slate-300/70">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} className={`w-5 h-5 rounded-sm flex items-center justify-center ${walls.includes(i) ? "bg-slate-600" : i === 19 ? "bg-amber-100" : i === 24 ? "bg-green-100" : "bg-white"}`}>
              {i === 0 && <span className="w-3 h-3 rounded-full bg-brand-600" />}
              {i === 10 && <Icon name="key" className="w-3 h-3 text-amber-600" />}
              {i === 19 && <Icon name="lock" className="w-3 h-3 text-amber-700" />}
              {i === 24 && <Icon name="flag" className="w-3 h-3 text-green-600" />}
            </span>
          ))}
        </div>
      );
    }
    case "sudocode":
      return (
        <div className="rounded-lg bg-[#0f1222] px-3 py-2 font-mono text-[10px] leading-relaxed text-slate-200 shadow-card">
          <div>x = <span className="text-amber-300">5</span></div>
          <div>x = x + <span className="text-amber-300">3</span></div>
          <div>x = x * <span className="text-amber-300">2</span></div>
          <div><span className="text-brand-300">output</span> x</div>
        </div>
      );
  }
}
