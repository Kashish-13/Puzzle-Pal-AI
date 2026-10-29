"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ChallengeCard, { GameStatsSummary } from "@/components/games/ChallengeCard";
import { useAuth } from "@/lib/auth";
import { getChallengeHistory } from "@/lib/firestore";
import { gamesForMode } from "@/lib/games/catalog";
import { ChallengeDifficulty } from "@/lib/types";

export default function ChallengeSelectionPage() {
  const { user, profile } = useAuth();
  const isKids = profile?.userType === "kids";

  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty>(
    profile?.currentDifficulty || (isKids ? "easy" : "medium")
  );
  const [stats, setStats] = useState<Record<string, GameStatsSummary>>({});

  // Per-game progress from existing history (plays + best score)
  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getChallengeHistory(user.uid).then((history) => {
      if (ignore) return;
      const next: Record<string, GameStatsSummary> = {};
      for (const h of history) {
        const s = next[h.category] || { plays: 0, best: 0 };
        s.plays += 1;
        s.best = Math.max(s.best, h.score);
        next[h.category] = s;
      }
      setStats(next);
    });
    return () => {
      ignore = true;
    };
  }, [user]);

  const games = gamesForMode(profile?.userType);
  const recommended = profile?.currentDifficulty || (isKids ? "easy" : "medium");
  const difficulties: { key: ChallengeDifficulty; label: string; xp: number }[] = isKids
    ? [
        { key: "easy", label: "Starter", xp: 50 },
        { key: "medium", label: "Explorer", xp: 100 },
        { key: "hard", label: "Detective", xp: 150 },
        { key: "expert", label: "Master", xp: 200 },
      ]
    : [
        { key: "easy", label: "Foundational", xp: 50 },
        { key: "medium", label: "Intermediate", xp: 100 },
        { key: "hard", label: "Advanced", xp: 150 },
        { key: "expert", label: "Expert", xp: 200 },
      ];
  const playedCount = games.filter((g) => stats[g]?.plays).length;

  return (
    <ProtectedRoute>
      <div className={`min-h-screen text-ink flex flex-col canvas ${isKids ? "canvas-kids" : ""}`}>
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 page-enter">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                  {isKids ? "Home" : "Dashboard"}
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">{isKids ? "Puzzles" : "Puzzle library"}</span>
              </nav>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                {isKids ? "Pick a puzzle" : "Choose your challenge"}
              </h1>
              <p className="mt-1.5 text-slate-500 max-w-2xl">
                {isKids
                  ? `${games.length} games to train your eyes, memory and thinking. Tap one to start.`
                  : "Seven interactive reasoning games. Each session is freshly generated and adapts to your level."}
              </p>
              {!isKids && (
                <p className="mt-3 text-xs font-medium tracking-[0.12em] text-slate-400">THINK → SOLVE → ANALYZE → IMPROVE</p>
              )}
            </div>

            <div className="shrink-0">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">Difficulty</span>
                <span className="text-xs text-slate-500">
                  {playedCount}/{games.length} played
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-white border border-slate-200 p-1 shadow-card" role="radiogroup" aria-label="Difficulty">
                {difficulties.map((d) => {
                  const on = selectedDifficulty === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSelectedDifficulty(d.key)}
                      className={`relative rounded-lg px-3 py-1.5 text-left transition-all ${on ? "bg-brand-600 text-white shadow-card" : "hover:bg-slate-50"}`}
                    >
                      <span className={`block text-sm font-medium ${on ? "text-white" : "text-slate-700"}`}>{d.label}</span>
                      <span className={`block text-[11px] tabular-nums ${on ? "text-white/75" : "text-amber-600"}`}>+{d.xp} XP</span>
                      {recommended === d.key && (
                        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${on ? "bg-white" : "bg-brand-600"}`} title="Recommended for you" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Games */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isKids ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-4`}>
            {games.map((id) => (
              <ChallengeCard key={id} gameId={id} difficulty={selectedDifficulty} stats={stats[id]} playful={isKids} />
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
