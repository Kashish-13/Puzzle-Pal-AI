"use client";

import React from "react";
import { ChallengeCategory } from "@/lib/types";
import { CATEGORY_INFO } from "@/lib/firestore";

interface CategoryBadgeProps {
  category: ChallengeCategory;
  size?: "sm" | "md";
}

export default function CategoryBadge({
  category,
  size = "md",
}: CategoryBadgeProps) {
  const info = CATEGORY_INFO[category] || {
    name: category,
    icon: "⚡",
  };

  const colorStyles: Record<ChallengeCategory, string> = {
    business: "bg-blue-950/60 text-blue-300 border-blue-800/60",
    technical: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    data: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
    logic: "bg-purple-950/60 text-purple-300 border-purple-800/60",
    mystery: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    decision: "bg-rose-950/60 text-rose-300 border-rose-800/60",
    aptitude: "bg-indigo-950/60 text-indigo-300 border-indigo-800/60",
    word: "bg-teal-950/60 text-teal-300 border-teal-800/60",
    kids_mystery: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    kids_brain_teaser: "bg-yellow-950/60 text-yellow-300 border-yellow-800/60",
    kids_pattern: "bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60",
    kids_math: "bg-sky-950/60 text-sky-300 border-sky-800/60",
    kids_creative: "bg-orange-950/60 text-orange-300 border-orange-800/60",
    kids_word: "bg-lime-950/60 text-lime-300 border-lime-800/60",
  };

  const sizeClass =
    size === "sm" ? "text-xs px-2.5 py-0.5" : "text-xs sm:text-sm px-3 py-1";

  const badgeStyle = colorStyles[category] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${badgeStyle} ${sizeClass}`}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  );
}
