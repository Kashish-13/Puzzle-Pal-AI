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

  const [activeTab, setActiveTab] = useState<"current" | "all">("current");

  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>(
    isKids ? "kids_mystery" : "business"
  );

  const displayedCategories: ChallengeCategory[] =
    activeTab === "all"
      ? [...STUDENT_CATEGORIES, ...KIDS_CATEGORIES]
      : isKids
      ? KIDS_CATEGORIES
      : STUDENT_CATEGORIES;

  const difficulties: { key: ChallengeDifficulty; label: string; xp: number; desc: string }[] = isKids
    ? [
        { key: "easy", label: "Starter", xp: 50, desc: "Gentle clues and clear story details for beginners" },
        { key: "medium", label: "Explorer", xp: 100, desc: "A few extra clues and creative thinking required" },
        { key: "hard", label: "Detective", xp: 150, desc: "Tricky puzzles with hidden secrets and clever twists" },
        { key: "expert", label: "Master", xp: 200, desc: "Super brain-benders for champion problem solvers" },
      ]
    : [
        { key: "easy", label: "Easy", xp: 50, desc: "Direct single-variable scenarios and foundational principles" },
        { key: "medium", label: "Medium", xp: 100, desc: "Multi-factor tradeoffs and standard operational complexity" },
        { key: "hard", label: "Hard", xp: 150, desc: "High ambiguity, non-obvious constraints, and second-order risks" },
        { key: "expert", label: "Expert", xp: 200, desc: "Complex distributed systems, corporate crises, and edge cases" },
      ];

  const currentCategoryInfo = CATEGORY_INFO[selectedCategory] || CATEGORY_INFO.business;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-200">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-indigo-400">Challenge Configuration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {isKids ? "Choose Your Next Puzzle Adventure 🧩" : "Configure Your Reasoning Session 🧠"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isKids
                  ? "Select a puzzle topic and pick how challenging you want it to be!"
                  : "Choose a cognitive domain and calibrate the difficulty to match your career and thinking goals."}
              </p>
            </div>

            <Link
              href={`/challenge/session?category=${selectedCategory}&difficulty=${selectedDifficulty}`}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                isKids
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <span>Launch {currentCategoryInfo.name}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Step 1: Select Difficulty */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                1. Calibrate Difficulty Level
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Adaptive recommendation:{" "}
                <span className="text-indigo-400 uppercase font-bold">
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
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-xs"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <DifficultyBadge difficulty={diff.key} />
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        +{diff.xp} XP
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200">{diff.label}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Select Category */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. Select Challenge Category
              </h2>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("current")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    activeTab === "current"
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isKids ? "Kids Categories" : "Student Domains"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    activeTab === "all"
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All Categories
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCategories.map((catKey) => {
                const item = CATEGORY_INFO[catKey];
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/50 shadow-md"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                          {item.icon}
                        </span>
                        <CategoryBadge category={catKey} size="sm" />
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">
                        Estimated: 5–8 min
                      </span>
                      {isSelected ? (
                        <span className="font-bold text-indigo-400">
                          Selected ✓
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-slate-200">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Bottom Action */}
          <div className="pt-4 flex justify-end">
            <Link
              href={`/challenge/session?category=${selectedCategory}&difficulty=${selectedDifficulty}`}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                isKids
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <span>Launch {currentCategoryInfo.name} ({selectedDifficulty.toUpperCase()})</span>
              <span>⚡</span>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
