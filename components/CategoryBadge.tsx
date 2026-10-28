"use client";

import React from "react";
import { ChallengeCategory } from "@/lib/types";
import { CATEGORY_INFO } from "@/lib/firestore";
import { CategoryIcon } from "./Icon";
import { CATEGORY_TONE, TONES } from "./tokens";

interface CategoryBadgeProps {
  category: ChallengeCategory;
  size?: "sm" | "md";
}

export default function CategoryBadge({
  category,
  size = "md",
}: CategoryBadgeProps) {
  const name = CATEGORY_INFO[category]?.name || category;
  const tone = TONES[CATEGORY_TONE[category] || "brand"];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium ${tone.soft} ${sizeClass}`}>
      <CategoryIcon category={category} className="w-3.5 h-3.5" />
      {name}
    </span>
  );
}
