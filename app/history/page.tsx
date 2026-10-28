"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
import ScoreBreakdownCard from "@/components/ScoreBreakdownCard";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/lib/auth";
import { getChallengeHistory, CATEGORY_INFO } from "@/lib/firestore";
import { ChallengeCategory, ChallengeHistoryRecord } from "@/lib/types";

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const isKids = profile?.userType === "kids";

  const [history, setHistory] = useState<ChallengeHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<ChallengeHistoryRecord | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      if (!user) return;
      try {
        setLoading(true);
        const filter = selectedCategory === "all" ? undefined : selectedCategory;
        const records = await getChallengeHistory(user.uid, filter);
        if (!ignore) {
          setHistory(records);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [user, selectedCategory]);

  const filterTabs: { key: ChallengeCategory | "all"; label: string }[] = isKids
    ? [
        { key: "all", label: "All Puzzles" },
        { key: "kids_mystery", label: "🕵️ Detective" },
        { key: "kids_brain_teaser", label: "⚡ Brain Teasers" },
        { key: "kids_pattern", label: "🌀 Patterns" },
        { key: "kids_math", label: "🔢 Math" },
        { key: "kids_creative", label: "💡 Creative" },
        { key: "kids_word", label: "🔤 Words" },
      ]
    : [
        { key: "all", label: "All Disciplines" },
        { key: "business", label: "Business" },
        { key: "technical", label: "Technical" },
        { key: "data", label: "Data" },
        { key: "logic", label: "Logic" },
        { key: "mystery", label: "Mystery" },
        { key: "decision", label: "Decision" },
        { key: "aptitude", label: "Aptitude" },
        { key: "word", label: "Verbal" },
      ];

  const totalCompletions = history.length;
  const avgScore =
    totalCompletions > 0
      ? (history.reduce((acc, h) => acc + h.score, 0) / totalCompletions).toFixed(1)
      : "—";
  const totalXPEarned = history.reduce((acc, h) => acc + h.xpEarned, 0);

  const getKidStars = (score: number) => {
    if (score >= 8.5) return "⭐⭐⭐⭐⭐";
    if (score >= 7.0) return "⭐⭐⭐⭐";
    if (score >= 5.0) return "⭐⭐⭐";
    return "⭐⭐";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
                  {isKids ? "Home" : "Dashboard"}
                </Link>
                <span>/</span>
                <span className={isKids ? "text-amber-400 font-bold" : "text-indigo-400"}>
                  {isKids ? "Adventure Log" : "Performance Archive"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {isKids ? "Your Solved Puzzle Adventure Log 🏆" : "Cognitive Performance Archive 🧠"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {isKids
                  ? "Look back at all the mysteries, clues, and brain teasers you solved with your detective skills!"
                  : "Review historical reasoning submissions, decision quality breakdowns, and cognitive feedback trajectory."}
              </p>
            </div>

            <Link
              href="/challenge"
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isKids
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
              }`}
            >
              <span>{isKids ? "Play New Puzzle 🚀" : "Launch New Challenge ⚡"}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border text-center backdrop-blur-xs ${
              isKids
                ? "bg-slate-900/60 border-amber-500/30 shadow-xs"
                : "bg-slate-900/60 border-slate-800"
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                {isKids ? "Puzzles Solved" : "Completed Challenges"}
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {totalCompletions}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center backdrop-blur-xs ${
              isKids
                ? "bg-slate-900/60 border-amber-500/30 shadow-xs"
                : "bg-slate-900/60 border-slate-800"
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                {isKids ? "Average Star Score" : "Reasoning Score Average"}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-2xl font-black font-mono ${isKids ? "text-amber-400" : "text-emerald-400"}`}>
                  {avgScore}
                </span>
                {avgScore !== "—" && (
                  <span className="text-xs text-slate-500 font-mono">/ 10</span>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-center backdrop-blur-xs ${
              isKids
                ? "bg-slate-900/60 border-amber-500/30 shadow-xs"
                : "bg-slate-900/60 border-slate-800"
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                {isKids ? "Total Adventure XP" : "Total Experience Earned"}
              </span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {totalXPEarned} XP
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterTabs.map((tab) => {
              const isSelected = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? isKids
                        ? "bg-amber-400 border-amber-300 text-slate-950 font-black shadow-xs"
                        : "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* History List or Empty State */}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
              <LoadingState
                message={isKids ? "Opening your adventure log..." : "Loading performance records..."}
                size="md"
              />
            </div>
          ) : history.length === 0 ? (
            <div className={`rounded-3xl border p-12 text-center space-y-4 ${
              isKids
                ? "border-amber-500/30 bg-slate-900/60"
                : "border-slate-800 bg-slate-900/40"
            }`}>
              <div className="text-4xl">{isKids ? "🧭" : "📂"}</div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">
                  {isKids ? "No Puzzles Solved in this Category Yet!" : "No Challenge Records Found"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {selectedCategory === "all"
                    ? isKids
                      ? "Start your first brain mission! Play any fun mystery to unlock your trophy case and earn XP stars."
                      : "You haven't completed any challenges yet. Solve your first scenario to begin tracking analytical telemetry!"
                    : `No completions recorded in the ${CATEGORY_INFO[selectedCategory as ChallengeCategory]?.name || selectedCategory} category.`}
                </p>
              </div>
              <Link
                href="/challenge"
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                  isKids
                    ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                <span>{isKids ? "Start First Puzzle Adventure →" : "Launch First Challenge →"}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => {
                const dateStr = record.completedAt
                  ? new Date(record.completedAt.toDate()).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isKids
                        ? "bg-slate-900/70 border-amber-500/20 hover:border-amber-400/50 hover:bg-slate-900"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={record.category} size="sm" />
                        <DifficultyBadge difficulty={record.difficulty} size="sm" />
                        <span className="text-[11px] font-mono text-slate-500">
                          {dateStr}
                        </span>
                        {record.hintsUsed > 0 ? (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            {record.hintsUsed} hint{record.hintsUsed > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isKids
                              ? "text-amber-300 bg-amber-950/60 border-amber-800/40 font-bold"
                              : "text-emerald-400 bg-emerald-950/60 border-emerald-800/40"
                          }`}>
                            {isKids ? "Zero hints needed 💡" : "Zero hints"}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold transition-colors ${
                        isKids
                          ? "text-white group-hover:text-amber-300"
                          : "text-white group-hover:text-indigo-300"
                      }`}>
                        {record.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                        {record.feedback || record.reasoning}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-800 sm:pl-6">
                      <div className="text-right">
                        {isKids ? (
                          <div>
                            <div className="text-xs mb-0.5">{getKidStars(record.score)}</div>
                            <div className="text-sm font-black font-mono text-amber-300">
                              {record.score.toFixed(1)} / 10
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono font-bold">
                              +{record.xpEarned} XP
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-lg font-black font-mono text-emerald-400">
                              {record.score.toFixed(1)}{" "}
                              <span className="text-xs text-slate-500">/ 10</span>
                            </div>
                            <div className="text-[11px] font-mono text-amber-400 font-semibold">
                              +{record.xpEarned} XP
                            </div>
                          </div>
                        )}
                      </div>

                      <span className={`transition-all group-hover:translate-x-0.5 ${
                        isKids ? "text-amber-400" : "text-slate-600 group-hover:text-slate-300"
                      }`}>
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal / Detail View when a record is clicked */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl ${
                isKids ? "border-amber-500/40" : "border-slate-700"
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={selectedRecord.category} size="sm" />
                      <DifficultyBadge difficulty={selectedRecord.difficulty} size="sm" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedRecord.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-sm font-mono transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* User's Original Submitted Reasoning */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {isKids ? "Your Submitted Answer & Clues:" : "Your Submitted Rationale:"}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {selectedRecord.reasoning}
                  </p>
                </div>

                {/* Score Breakdown */}
                <ScoreBreakdownCard
                  evaluation={selectedRecord.evaluation}
                  xpEarned={selectedRecord.xpEarned}
                  userType={selectedRecord.userType || (isKids ? "kids" : "student")}
                  onNextChallenge={() => setSelectedRecord(null)}
                  nextChallengeLabel="Close Details"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
