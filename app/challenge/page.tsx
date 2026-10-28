"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
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

  const difficulties: { key: ChallengeDifficulty; label: string; xp: number; desc: string; icon: string }[] = isKids
    ? [
        { key: "easy", label: "Starter", xp: 50, desc: "Gentle clues and clear story details for beginners", icon: "🌱" },
        { key: "medium", label: "Explorer", xp: 100, desc: "A few extra clues and creative thinking required", icon: "🧭" },
        { key: "hard", label: "Detective", xp: 150, desc: "Tricky puzzles with hidden secrets and clever twists", icon: "🔍" },
        { key: "expert", label: "Master", xp: 200, desc: "Super brain-benders for champion problem solvers", icon: "👑" },
      ]
    : [
        { key: "easy", label: "Foundational", xp: 50, desc: "Direct single-variable scenarios and clear operational principles", icon: "🔹" },
        { key: "medium", label: "Intermediate", xp: 100, desc: "Multi-factor trade-offs, standard constraints, and strategic balance", icon: "🔸" },
        { key: "hard", label: "Advanced", xp: 150, desc: "High ambiguity, non-obvious constraints, and second-order risk analysis", icon: "🔷" },
        { key: "expert", label: "Complex System", xp: 200, desc: "Distributed failure modes, crisis trade-offs, and critical architecture dilemmas", icon: "🔶" },
      ];

  const currentCategoryInfo = CATEGORY_INFO[currentCategory] || (isKids ? CATEGORY_INFO.kids_mystery : CATEGORY_INFO.business);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
                  {isKids ? "Home" : "Dashboard"}
                </Link>
                <span>/</span>
                <span className={isKids ? "text-amber-400 font-bold" : "text-indigo-400"}>
                  {isKids ? "Puzzle Selection" : "Cognitive Domain Catalog"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {isKids ? "Choose Your Next Puzzle Adventure 🧩" : "Select Reasoning Discipline & Difficulty 🧠"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {isKids
                  ? "Pick a mystery or fun challenge, choose your difficulty, and earn exciting stars and XP!"
                  : "Calibrate complexity level and choose a dedicated thinking discipline to evaluate your analytical decisions."}
              </p>
            </div>

            <Link
              href={`/challenge/session?category=${currentCategory}&difficulty=${selectedDifficulty}`}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                isKids
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              <span>{isKids ? `Play ${currentCategoryInfo.name}` : `Launch ${currentCategoryInfo.name}`}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Section 1: Difficulty Calibration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>{isKids ? "⭐ Step 1: Pick Your Challenge Level" : "⚙️ Step 1: Calibrate Cognitive Difficulty"}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Recommended:{" "}
                <span className={`uppercase font-bold ${isKids ? "text-amber-400" : "text-indigo-400"}`}>
                  {profile?.currentDifficulty || (isKids ? "easy" : "medium")}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {difficulties.map((diff) => {
                const isSelected = selectedDifficulty === diff.key;
                return (
                  <button
                    key={diff.key}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.key)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? isKids
                          ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10"
                          : "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-600/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{diff.icon}</span>
                        <DifficultyBadge difficulty={diff.key} size="sm" />
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        +{diff.xp} XP
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>{diff.label}</span>
                      {isSelected && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isKids ? "bg-amber-400/20 text-amber-300" : "bg-indigo-500/20 text-indigo-300"
                        }`}>
                          Selected ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Categories / Domains */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span>{isKids ? "🧩 Step 2: Choose Your Puzzle Theme" : "🎯 Step 2: Choose Reasoning Discipline"}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isKids
                    ? "Explore fun detective stories, wacky riddles, pattern quests, and creative brain games!"
                    : "Target specific analytical competencies: business models, technical architecture, data analysis, and deductive logic."}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {displayedCategories.length} {isKids ? "Themes" : "Disciplines"} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCategories.map((catKey) => {
                const item = CATEGORY_INFO[catKey];
                const isSelected = currentCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? isKids
                          ? "bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/10"
                          : "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/50 shadow-md shadow-indigo-600/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-2xl p-2.5 rounded-xl border transition-transform group-hover:scale-105 ${
                          isSelected
                            ? isKids
                              ? "bg-amber-950/60 border-amber-500/40"
                              : "bg-indigo-950/60 border-indigo-500/40"
                            : "bg-slate-950 border-slate-800"
                        }`}>
                          {item.icon}
                        </span>
                        <CategoryBadge category={catKey} size="sm" />
                      </div>
                      <h3 className={`text-base font-bold transition-colors ${
                        isSelected
                          ? isKids ? "text-amber-300" : "text-indigo-300"
                          : "text-slate-100 group-hover:text-white"
                      }`}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">
                        {isKids ? "🌟 5–10 min" : "Est: ~6–8 min"}
                      </span>
                      {isSelected ? (
                        <span className={`font-bold flex items-center gap-1 ${
                          isKids ? "text-amber-400" : "text-indigo-400"
                        }`}>
                          <span>Ready</span>
                          <span>✓</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Bottom Launch Banner */}
          <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md ${
            isKids
              ? "bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30"
              : "bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 border-indigo-500/30"
          }`}>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Selected:</span>
                <span className={`font-bold ${isKids ? "text-amber-300" : "text-indigo-300"}`}>
                  {currentCategoryInfo.name}
                </span>
                <span>•</span>
                <span className="uppercase text-slate-300">{selectedDifficulty}</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {isKids ? "Ready to solve this adventure?" : "Ready to engage this scenario?"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCategoryInfo.preview}
              </p>
            </div>

            <Link
              href={`/challenge/session?category=${currentCategory}&difficulty=${selectedDifficulty}`}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
                isKids
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              <span>{isKids ? "Start Puzzle Adventure 🚀" : "Launch Reasoning Studio ⚡"}</span>
              <span>→</span>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
