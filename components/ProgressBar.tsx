"use client";

import React from "react";

interface ProgressBarProps {
  xp: number;
  level: number;
  levelTitle?: string;
  userType?: "kids" | "student";
}

export default function ProgressBar({
  xp,
  level,
  levelTitle,
  userType = "student",
}: ProgressBarProps) {
  let min = 0;
  let max = 500;
  let nextLevel = 2;

  if (level === 1) {
    min = 0;
    max = 500;
    nextLevel = 2;
  } else if (level === 2) {
    min = 500;
    max = 1200;
    nextLevel = 3;
  } else if (level === 3) {
    min = 1200;
    max = 2000;
    nextLevel = 4;
  } else if (level === 4) {
    min = 2000;
    max = 3000;
    nextLevel = 5;
  } else {
    min = 3000;
    max = 5000;
    nextLevel = 6;
  }

  const range = max - min;
  const currentInRange = Math.max(0, xp - min);
  const percentage = Math.min(100, Math.round((currentInRange / range) * 100));
  const remaining = Math.max(0, max - xp);

  const isKids = userType === "kids";

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-md transition-all ${
      isKids
        ? "bg-slate-900/70 border-amber-500/30 shadow-md shadow-amber-500/5"
        : "bg-slate-900/60 border-slate-800 shadow-sm"
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
            isKids
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
              : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-mono"
          }`}>
            {level}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                {levelTitle || `Level ${level}`}
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {xp} Total XP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isKids
                ? "Keep solving fun puzzles to unlock your next explorer level!"
                : "Active learning progress toward higher reasoning complexity tiers"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-sm font-mono font-black ${
            isKids ? "text-amber-400" : "text-indigo-400"
          }`}>
            {percentage}%
          </span>
          <span className="block text-[10px] font-mono text-slate-500">Tier Completion</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-3.5 rounded-full bg-slate-950/90 overflow-hidden border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
            isKids
              ? "bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 shadow-amber-500/40"
              : "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-indigo-500/40"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bottom Trajectory & Milestones */}
      <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
        <span className="font-mono">
          {currentInRange} / {range} XP in this tier
        </span>
        <span>
          {remaining > 0 ? (
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <span>{isKids ? "🚀" : "🎯"}</span>
              <span>{remaining} XP to Level {nextLevel}</span>
            </span>
          ) : (
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>✨</span>
              <span>Highest Milestone Reached</span>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
