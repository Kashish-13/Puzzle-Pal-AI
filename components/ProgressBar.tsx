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
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2.5">
        <span className="text-sm font-semibold text-ink">
          Level {level}
          {levelTitle && <span className="text-slate-500 font-normal"> · {levelTitle}</span>}
        </span>
        <span className="text-sm text-slate-500 tabular-nums">
          <span className="font-medium text-ink">{currentInRange}</span> / {range} XP
          <span className="ml-2 font-medium text-brand-600">{percentage}%</span>
        </span>
      </div>

      <div
        className={`w-full rounded-full bg-slate-100 overflow-hidden ${isKids ? "h-3" : "h-2"}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full origin-left animate-grow ${
            isKids
              ? "bg-gradient-to-r from-sky-400 via-brand-500 to-brand-600"
              : "bg-gradient-to-r from-brand-500 to-brand-600"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {remaining > 0 ? `${remaining} XP to Level ${nextLevel}` : "Highest milestone reached"}
      </div>
    </div>
  );
}
