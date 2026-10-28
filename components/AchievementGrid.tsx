"use client";

import React from "react";
import { AVAILABLE_BADGES } from "@/lib/firestore";
import Icon, { BADGE_ICONS } from "./Icon";

interface AchievementGridProps {
  unlocked: string[];
  isKids?: boolean;
  /** Show only this many achievements (unlocked first) */
  limit?: number;
}

export default function AchievementGrid({ unlocked, isKids = false, limit }: AchievementGridProps) {
  const sorted = [...AVAILABLE_BADGES].sort(
    (a, b) => Number(unlocked.includes(b.id)) - Number(unlocked.includes(a.id))
  );
  const badges = limit ? sorted.slice(0, limit) : sorted;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {badges.map((badge) => {
        const isUnlocked = unlocked.includes(badge.id);
        return (
          <li
            key={badge.id}
            className={`relative rounded-2xl border p-4 transition-colors ${
              isUnlocked
                ? isKids
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-brand-200 bg-brand-50/50"
                : "border-dashed border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isUnlocked
                    ? isKids
                      ? "bg-amber-500 text-white"
                      : "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Icon name={BADGE_ICONS[badge.id] || "award"} className="w-5 h-5" />
              </span>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <Icon name="checkCircle" className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Icon name="lock" className="w-3.5 h-3.5" />
                  Locked
                </span>
              )}
            </div>
            <div className={`mt-3 text-sm font-semibold ${isUnlocked ? "text-ink" : "text-slate-500"}`}>
              {badge.name}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{badge.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
