"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ProgressBar from "@/components/ProgressBar";
import CategoryBadge from "@/components/CategoryBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
import { useAuth } from "@/lib/auth";
import {
  CATEGORY_INFO,
  STUDENT_CATEGORIES,
  KIDS_CATEGORIES,
  AVAILABLE_BADGES,
  getLevelTitle,
  getUserCategoryStrengths,
  getUserInsights,
  getChallengeHistory,
  updateUserProfile,
} from "@/lib/firestore";
import { ChallengeCategory, CategoryStrength, ChallengeHistoryRecord } from "@/lib/types";

export default function DashboardPage() {
  const { user, profile, refreshProfile, updateProfileLocally } = useAuth();

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const reasoningScore = profile?.reasoningScore ?? 0;
  const challengesSolved = profile?.challengesSolved ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const difficulty = profile?.currentDifficulty ?? "medium";
  const userType = profile?.userType || "student";
  const isKids = userType === "kids";

  const [categoryStrengths, setCategoryStrengths] = useState<CategoryStrength[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeHistoryRecord[]>([]);
  const [switchingMode, setSwitchingMode] = useState(false);

  useEffect(() => {
    if (user) {
      getUserCategoryStrengths(user.uid, userType).then(setCategoryStrengths);
      getUserInsights(user.uid).then(setInsights);
      getChallengeHistory(user.uid).then((history) => {
        setRecentChallenges(history.slice(0, 3));
      });
    }
  }, [user, userType]);

  const activeCategories: ChallengeCategory[] = isKids ? KIDS_CATEGORIES : STUDENT_CATEGORIES;
  const levelTitle = getLevelTitle(level, userType);

  // Recommended challenge determination
  const recommendedCategory: ChallengeCategory =
    profile?.interests && profile.interests.length > 0 && activeCategories.includes(profile.interests[0] as ChallengeCategory)
      ? (profile.interests[0] as ChallengeCategory)
      : isKids
      ? "kids_mystery"
      : "logic";

  const recommendedInfo = CATEGORY_INFO[recommendedCategory] || CATEGORY_INFO.logic;

  const handleToggleMode = async () => {
    if (!user) return;
    const newType = isKids ? "student" : "kids";
    const newDifficulty = newType === "kids" ? "easy" : "medium";

    // 1. Immediate optimistic update so UI switches in 0ms without delay or freezing
    updateProfileLocally({
      userType: newType,
      currentDifficulty: newDifficulty,
    });

    try {
      setSwitchingMode(true);
      await updateUserProfile(user.uid, {
        userType: newType,
        currentDifficulty: newDifficulty,
      });
      await refreshProfile();
    } catch (err) {
      console.error("Failed to toggle mode:", err);
    } finally {
      setSwitchingMode(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Top Welcome Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className={isKids ? "text-amber-400 font-bold" : "text-indigo-400"}>
                  {isKids ? "🧒 Kids Puzzle Hub" : "🎓 Cognitive Workspace"}
                </span>
                <span>•</span>
                <span>{levelTitle} (Level {level})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {isKids
                  ? `Ready for today's challenge, ${profile?.fullName?.split(" ")[0] || "Explorer"}? 🚀`
                  : `Welcome back, ${profile?.fullName || user?.email?.split("@")[0] || "Scholar"} 👋`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {isKids
                  ? "Explore fun mysteries, connect story clues, and level up your brain power!"
                  : "Strengthen your analytical rigor, evaluate real-world trade-offs, and master structured problem solving."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Persona Switcher */}
              <button
                type="button"
                onClick={handleToggleMode}
                disabled={switchingMode}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                title="Switch between Kids and Student mode anytime"
              >
                <span>{isKids ? "Switch to 🎓 Students" : "Switch to 🧒 Kids"}</span>
              </button>

              <Link
                href={`/challenge/session?category=${recommendedCategory}&difficulty=${difficulty}`}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 ${
                  isKids
                    ? "bg-amber-400 hover:bg-amber-300 shadow-amber-500/20 text-slate-950 font-black"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25 text-white"
                }`}
              >
                <span>{isKids ? "Play Recommended Puzzle" : "Launch Challenge"}</span>
                <span>⚡</span>
              </Link>
            </div>
          </div>

          {/* 4 Primary KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label={isKids ? "Average Star Score" : "Reasoning Score"}
              value={reasoningScore > 0 ? `${reasoningScore.toFixed(1)} / 10` : "—"}
              subtext={isKids ? "Based on all puzzles" : "Weighted average score"}
              icon={isKids ? "⭐" : "🧠"}
              badge={reasoningScore >= 8.5 ? "Master" : reasoningScore >= 7.0 ? "Skilled" : undefined}
            />
            <StatsCard
              label="Experience Points"
              value={`${xp} XP`}
              subtext={`${levelTitle}`}
              icon="⚡"
              badge={`Lvl ${level}`}
            />
            <StatsCard
              label={isKids ? "Puzzles Solved" : "Challenges Completed"}
              value={`${challengesSolved}`}
              subtext="Lifetime completions"
              icon={isKids ? "🏆" : "🎯"}
            />
            <StatsCard
              label="Active Thinking Streak"
              value={currentStreak > 0 ? `${currentStreak} Days` : "0 Days"}
              subtext={currentStreak > 0 ? "Daily momentum" : "Solve 1 today!"}
              icon="🔥"
              badge={currentStreak >= 3 ? "On Fire" : undefined}
            />
          </div>

          {/* Level Progress */}
          <ProgressBar xp={xp} level={level} levelTitle={levelTitle} userType={userType} />

          {/* Featured / Recommended Challenge Banner */}
          <div
            className={`rounded-2xl border p-6 sm:p-7 relative overflow-hidden backdrop-blur-md ${
              isKids
                ? "bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30"
                : "bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isKids
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-indigo-500/20 text-indigo-300"
                    }`}
                  >
                    Recommended For You
                  </span>
                  <CategoryBadge category={recommendedCategory} size="sm" />
                  <DifficultyBadge difficulty={difficulty} size="sm" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {recommendedInfo.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {recommendedInfo.preview}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/challenge/session?category=${recommendedCategory}&difficulty=${difficulty}`}
                  className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 ${
                    isKids
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20 font-black"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  }`}
                >
                  <span>{isKids ? "Start Playing Now" : "Begin Challenge"}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trophies & Badges Showcase */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{isKids ? "Your Trophy Case 🏆" : "Reasoning Badges & Accomplishments 🎖️"}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({(profile?.badges || []).length} / {AVAILABLE_BADGES.length} Unlocked)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isKids
                    ? "Solve puzzles, keep your daily streak alive, and collect all trophies!"
                    : "Earn verified milestone badges for high scores, streaks, and diverse analytical thinking."}
                </p>
              </div>
              <Link
                href="/profile"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View all in Profile →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AVAILABLE_BADGES.map((badge) => {
                const isUnlocked = (profile?.badges || []).includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isUnlocked
                        ? "bg-slate-950/80 border-indigo-500/40 text-slate-100 shadow-xs"
                        : "bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-60"
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {badge.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {badge.description}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isUnlocked
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isUnlocked ? "Unlocked ✓" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Insights and Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Insights panel */}
            <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  <span>✨</span>
                  <span>{isKids ? "Your Brain Insights" : "AI Cognitive Feedback"}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">
                  Personalized Thinking Feedback
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 mb-4">
                  &ldquo;{profile?.aiInsight || "Complete challenges to generate tailored analytical feedback."}&rdquo;
                </p>

                {insights.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Performance Observations
                    </div>
                    {insights.map((ins, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2"
                      >
                        <span className="shrink-0 mt-0.5">•</span>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/60 mt-4">
                <Link
                  href="/challenge"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
                >
                  <span>Configure custom difficulty</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Category Performance Bars */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100">
                  {isKids ? "Your Puzzle Strengths" : "Category Competency"}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Adaptive Level: <span className="text-indigo-400 uppercase font-bold">{difficulty}</span>
                </span>
              </div>

              <div className="space-y-3.5">
                {categoryStrengths.map((cs) => {
                  const pct = Math.round((cs.averageScore / 10) * 100);
                  return (
                    <div key={cs.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{cs.icon}</span>
                          <span>{cs.displayName}</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {cs.count > 0 ? (
                            <>
                              <span className="text-slate-100 font-bold">{cs.averageScore}</span>
                              /10 ({cs.count} solved)
                            </>
                          ) : (
                            <span className="text-slate-500">Unattempted</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 80
                              ? "bg-emerald-500"
                              : pct >= 60
                              ? "bg-indigo-500"
                              : pct > 0
                              ? "bg-amber-500"
                              : "bg-slate-800"
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {isKids ? "Explore All Fun Puzzle Categories" : "Explore Reasoning Domains"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isKids
                    ? "Pick any puzzle theme to start thinking, guessing, and finding answers!"
                    : "Select a specialized reasoning discipline to train specific mental models."}
                </p>
              </div>
              <Link
                href="/challenge"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                All options →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategories.map((catKey) => {
                const item = CATEGORY_INFO[catKey];
                return (
                  <Link
                    key={catKey}
                    href={`/challenge/session?category=${catKey}&difficulty=${difficulty}`}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/70 hover:border-slate-700 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform">
                          {item.icon}
                        </span>
                        <CategoryBadge category={catKey} size="sm" />
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Difficulty: <span className="uppercase text-slate-400">{difficulty}</span>
                      </span>
                      <span className="font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        Launch →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          {recentChallenges.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100">
                  Recent Activity
                </h3>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View full history →
                </Link>
              </div>

              <div className="space-y-3">
                {recentChallenges.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryBadge category={rec.category} size="sm" />
                        <DifficultyBadge difficulty={rec.difficulty} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{rec.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                        &ldquo;{rec.feedback}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-emerald-400">
                          {rec.score}/10
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          +{rec.xpEarned} XP
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
