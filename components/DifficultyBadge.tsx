"use client";

import React from "react";
import { ChallengeDifficulty } from "@/lib/types";

interface DifficultyBadgeProps {
  difficulty: ChallengeDifficulty;
  size?: "sm" | "md";
}

export default function DifficultyBadge({
  difficulty,
  size = "md",
}: DifficultyBadgeProps) {
  const styles: Record<ChallengeDifficulty, { label: string; style: string; xp: string }> = {
    easy: {
      label: "Easy",
      style: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60",
      xp: "50 XP",
    },
    medium: {
      label: "Medium",
      style: "bg-blue-950/50 text-blue-300 border-blue-800/60",
      xp: "100 XP",
    },
    hard: {
      label: "Hard",
      style: "bg-amber-950/50 text-amber-300 border-amber-800/60",
      xp: "150 XP",
    },
    expert: {
      label: "Expert",
      style: "bg-purple-950/50 text-purple-300 border-purple-800/60",
      xp: "200 XP",
    },
  };

  const item = styles[difficulty] || styles.medium;
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs font-semibold px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider ${item.style} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{item.label}</span>
      <span className="opacity-60 normal-case font-normal text-[10px]">
        ({item.xp})
      </span>
    </span>
  );
}

