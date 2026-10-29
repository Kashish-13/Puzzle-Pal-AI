"use client";

import React from "react";
import { ChallengeDifficulty } from "@/lib/types";
import { DIFFICULTY_TONE, TONES } from "./tokens";

interface DifficultyBadgeProps {
  difficulty: ChallengeDifficulty;
  size?: "sm" | "md";
}

export default function DifficultyBadge({
  difficulty,
  size = "md",
}: DifficultyBadgeProps) {
  const styles: Record<ChallengeDifficulty, { label: string; xp: string }> = {
    easy: { label: "Easy", xp: "50 XP" },
    medium: { label: "Medium", xp: "100 XP" },
    hard: { label: "Hard", xp: "150 XP" },
    expert: { label: "Expert", xp: "200 XP" },
  };

  const item = styles[difficulty] || styles.medium;
  const tone = TONES[DIFFICULTY_TONE[difficulty] || "blue"];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white font-medium text-slate-700 ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.solid}`} />
      <span>{item.label}</span>
      <span className="text-amber-600">· {item.xp}</span>
    </span>
  );
}
