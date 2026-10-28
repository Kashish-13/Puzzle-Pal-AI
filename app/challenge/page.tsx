"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Icon, { CategoryIcon } from "@/components/Icon";
import DifficultyBadge from "@/components/DifficultyBadge";
import { CATEGORY_TONE, TONES } from "@/components/tokens";
import { CATEGORY_INFO, STUDENT_CATEGORIES, KIDS_CATEGORIES } from "@/lib/firestore";
import { ChallengeCategory, ChallengeDifficulty } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export default function ChallengeSelectionPage() {
  const { profile } = useAuth();
  const isKids = profile?.userType === "kids";

  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty>(
    profile?.currentDifficulty || (isKids ? "easy" : "medium")
  );

  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>(
    isKids ? "kids_mystery" : "business"
  );

  // Strict persona separation: Kids see ONLY Kids categories, Students see ONLY Student categories
  const displayedCategories: ChallengeCategory[] = isKids
    ? KIDS_CATEGORIES
    : STUDENT_CATEGORIES;

  // Ensure selected category is valid for current persona
  const currentCategory = displayedCategories.includes(selectedCategory)
    ? selectedCategory
    : displayedCategories[0];

  const difficulties: { key: ChallengeDifficulty; label: string; xp: number; desc: string }[] = isKids
    ? [
        { key: "easy", label: "Starter", xp: 50, desc: "Gentle clues and clear story details for beginners" },
        { key: "medium", label: "Explorer", xp: 100, desc: "A few extra clues and creative thinking required" },
        { key: "hard", label: "Detective", xp: 150, desc: "Tricky puzzles with hidden secrets and clever twists" },
        { key: "expert", label: "Master", xp: 200, desc: "Super brain-benders for champion problem solvers" },
      ]
    : [
        { key: "easy", label: "Foundational", xp: 50, desc: "Direct single-variable scenarios and clear operational principles" },
        { key: "medium", label: "Intermediate", xp: 100, desc: "Multi-factor trade-offs, standard constraints, and strategic balance" },
        { key: "hard", label: "Advanced", xp: 150, desc: "High ambiguity, non-obvious constraints, and second-order risk analysis" },
        { key: "expert", label: "Complex System", xp: 200, desc: "Distributed failure modes, crisis trade-offs, and critical architecture dilemmas" },
      ];

  const selectedDiff = difficulties.find((d) => d.key === selectedDifficulty) || difficulties[1];
  const recommended = profile?.currentDifficulty || (isKids ? "easy" : "medium");
  const estTime = isKids ? "5–10 min" : "6–8 min";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 page-enter">
          {/* Header */}
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
              <Link href="/dashboard" className="hover:text-ink transition-colors">
                {isKids ? "Home" : "Dashboard"}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">{isKids ? "Puzzles" : "Challenges"}</span>
            </nav>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">Choose your challenge</h1>
            <p className="mt-1.5 text-slate-500 max-w-2xl">
              {isKids
                ? "Pick a level, then start any puzzle theme to earn XP."
                : "Set the difficulty, then pick a reasoning discipline. Each challenge is generated fresh for you."}
            </p>
          </div>

          {/* Difficulty filter */}
          <section className="panel p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Difficulty</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selectedDiff.desc}</p>
              </div>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 shrink-0"
                role="radiogroup"
                aria-label="Difficulty"
              >
                {difficulties.map((diff) => {
                  const isSelected = selectedDifficulty === diff.key;
                  return (
                    <button
                      key={diff.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedDifficulty(diff.key)}
                      className={`relative rounded-lg px-3.5 py-2 text-left transition-all ${
                        isSelected ? "bg-white shadow-card" : "hover:bg-white/60"
                      }`}
                    >
                      <span className={`block text-sm font-medium ${isSelected ? "text-ink" : "text-slate-600"}`}>
                        {diff.label}
                      </span>
                      <span className="block text-xs text-amber-600 tabular-nums">+{diff.xp} XP</span>
                      {recommended === diff.key && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-600" title="Recommended" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Challenge cards */}
          <section>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 className="text-base font-semibold text-ink">
                {isKids ? "Puzzle themes" : "Reasoning disciplines"}
              </h2>
              <span className="text-sm text-slate-500">
                {displayedCategories.length} available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCategories.map((catKey) => {
                const item = CATEGORY_INFO[catKey];
                const isSelected = currentCategory === catKey;
                const tone = TONES[CATEGORY_TONE[catKey] || "brand"];
                const href = `/challenge/session?category=${catKey}&difficulty=${selectedDifficulty}`;
                return (
                  <div
                    key={catKey}
                    onMouseEnter={() => setSelectedCategory(catKey)}
                    onFocus={() => setSelectedCategory(catKey)}
                    className={`group relative panel ${isKids ? "rounded-3xl" : ""} card-interactive p-5 flex flex-col ${
                      isSelected ? "border-brand-200" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`w-10 h-10 flex items-center justify-center ${isKids ? "rounded-full" : "rounded-xl"} ${tone.soft}`}>
                        <CategoryIcon category={catKey} className="w-5 h-5" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Icon name="clock" className="w-3.5 h-3.5" />
                        {estTime}
                      </span>
                    </div>
                    <p className={`mt-4 text-xs font-medium ${tone.text}`}>{item.name}</p>
                    <h3 className="mt-1 text-base font-semibold text-ink leading-snug">{item.preview}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed flex-1">{item.description}</p>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <DifficultyBadge difficulty={selectedDifficulty} size="sm" />
                      <Link
                        href={href}
                        className="btn btn-sm btn-primary after:absolute after:inset-0 after:content-['']"
                        aria-label={`Start ${item.name}`}
                      >
                        Start
                        <Icon name="arrowRight" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
