"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ProgressBar from "@/components/ProgressBar";
import DifficultyBadge from "@/components/DifficultyBadge";
import Icon, { CategoryIcon, stripLeadingEmoji } from "@/components/Icon";
import ReasoningGraph from "@/components/ReasoningGraph";
import RecentActivityList from "@/components/RecentActivityList";
import AchievementGrid from "@/components/AchievementGrid";
import { CATEGORY_TONE, DIFFICULTY_XP, TONES } from "@/components/tokens";
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

  const displayName = isKids
    ? profile?.fullName?.split(" ")[0] || "Explorer"
    : profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Scholar";
  const unlockedBadges = profile?.badges || [];
  const estTime = isKids ? "5–10 min" : "6–8 min";

  // Time-of-day greeting, read on the client only (server renders a neutral greeting)
  const hour = useSyncExternalStore(
    () => () => {},
    () => new Date().getHours(),
    () => -1
  );
  const greeting =
    hour < 0 ? "Welcome back" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Three more categories to try, preferring the user's interests
  const moreCategories = [
    ...((profile?.interests || []).filter((i) =>
      activeCategories.includes(i as ChallengeCategory)
    ) as ChallengeCategory[]),
    ...activeCategories,
  ]
    .filter((c, i, arr) => c !== recommendedCategory && arr.indexOf(c) === i)
    .slice(0, 3);

  const radius = isKids ? "rounded-3xl" : "rounded-2xl";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10 page-enter">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                {greeting}, {displayName}
              </h1>
              <p className="mt-1.5 text-slate-500">
                {isKids ? "Ready for today's puzzle?" : "Ready to sharpen your reasoning?"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm shadow-card">
                <Icon name="layers" className="w-4 h-4 text-brand-600" />
                <span className="font-medium">Level {level}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{levelTitle}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700">
                <Icon name="zap" className="w-4 h-4" filled />
                {xp} XP
              </span>
              <button
                type="button"
                onClick={handleToggleMode}
                disabled={switchingMode}
                className="btn btn-sm btn-ghost"
                title="Switch between Kids and Student mode anytime"
              >
                <Icon name="arrowLeftRight" className="w-4 h-4" />
                <span>{isKids ? "Student mode" : "Kids mode"}</span>
              </button>
            </div>
          </div>

          {/* Main CTA: recommended challenge */}
          <section
            className={`relative overflow-hidden ${radius} p-6 sm:p-8 text-white ${
              isKids ? "bg-gradient-to-br from-brand-600 to-sky-500" : "bg-brand-600"
            }`}
          >
            <ReasoningGraph className="hidden sm:block absolute -right-10 -top-8 w-80 opacity-20 [&_circle]:fill-white [&_line]:stroke-white" />
            <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
                  {challengesSolved > 0 ? "Continue learning · Recommended for you" : "Recommended for you"}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-xs font-medium">
                  <CategoryIcon category={recommendedCategory} className="w-3.5 h-3.5" />
                  {recommendedInfo.name}
                </div>
                <h2 className="mt-3 text-2xl sm:text-[28px] font-semibold tracking-tight leading-tight">
                  {recommendedInfo.preview}
                </h2>
                <p className="mt-3 text-sm text-white/75 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="capitalize">{difficulty}</span>
                  <span className="text-white/40">·</span>
                  <span>{DIFFICULTY_XP[difficulty] ?? 100} XP</span>
                  <span className="text-white/40">·</span>
                  <span>~{estTime}</span>
                </p>
              </div>

              <Link
                href={`/challenge/session?category=${recommendedCategory}&difficulty=${difficulty}`}
                className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-lift self-start lg:self-auto"
              >
                <span>{isKids ? "Start puzzle" : "Start challenge"}</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Progress */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-ink">Your progress</h2>
            <StatsCard
              playful={isKids}
              items={[
                { label: "Level", value: level, subtext: levelTitle, icon: "layers", tone: "brand" },
                { label: "XP", value: xp, subtext: "Lifetime experience", icon: "zap", tone: "amber" },
                {
                  label: "Streak",
                  value: `${currentStreak}d`,
                  subtext: currentStreak > 0 ? "Keep it going" : "Solve one today",
                  icon: "flame",
                  tone: isKids ? "sky" : "blue",
                },
                {
                  label: isKids ? "Puzzles solved" : "Solved",
                  value: challengesSolved,
                  subtext: "All time",
                  icon: "checkCircle",
                  tone: "green",
                },
                {
                  label: isKids ? "Star score" : "Avg. score",
                  value: reasoningScore > 0 ? reasoningScore.toFixed(1) : "—",
                  subtext: reasoningScore >= 8.5 ? "Master" : reasoningScore >= 7.0 ? "Skilled" : "Out of 10",
                  icon: "activity",
                  tone: "brand",
                },
              ]}
            />
            <div className={`panel ${radius} p-5 sm:p-6`}>
              <ProgressBar xp={xp} level={level} levelTitle={levelTitle} userType={userType} />
            </div>
          </section>

          {/* Recommended challenges */}
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <h2 className="text-base font-semibold text-ink">
                {isKids ? "More puzzles for you" : "Recommended challenges"}
              </h2>
              <Link href="/challenge" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {moreCategories.map((catKey) => {
                const item = CATEGORY_INFO[catKey];
                const tone = TONES[CATEGORY_TONE[catKey] || "brand"];
                return (
                  <Link
                    key={catKey}
                    href={`/challenge/session?category=${catKey}&difficulty=${difficulty}`}
                    className={`group panel ${radius} card-interactive p-5 flex flex-col`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${tone.soft}`}>
                        <CategoryIcon category={catKey} className="w-3.5 h-3.5" />
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                        <Icon name="clock" className="w-3.5 h-3.5" />
                        {estTime}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold text-ink leading-snug flex-1">{item.preview}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <DifficultyBadge difficulty={difficulty} size="sm" />
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                        Start
                        <Icon name="arrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Activity & performance */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="text-base font-semibold text-ink">Recent activity</h2>
                {recentChallenges.length > 0 && (
                  <Link href="/history" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    View history
                  </Link>
                )}
              </div>
              <RecentActivityList
                records={recentChallenges}
                emptyLabel={isKids ? "Solve your first puzzle to see it here." : "Complete your first challenge to see it here."}
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h2 className="text-base font-semibold text-ink">
                    {isKids ? "Puzzle strengths" : "Reasoning by category"}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Adaptive: <span className="capitalize text-slate-700">{difficulty}</span>
                  </span>
                </div>
                <div className={`panel ${radius} p-5 space-y-3.5`}>
                  {categoryStrengths.map((cs) => {
                    const pct = Math.round((cs.averageScore / 10) * 100);
                    const tone = TONES[CATEGORY_TONE[cs.category] || "brand"];
                    return (
                      <div key={cs.category}>
                        <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                          <span className="flex items-center gap-2 text-slate-700 min-w-0">
                            <CategoryIcon category={cs.category} className={`w-3.5 h-3.5 ${tone.text}`} />
                            <span className="truncate">{cs.displayName}</span>
                          </span>
                          <span className="text-xs text-slate-500 tabular-nums shrink-0">
                            {cs.count > 0 ? (
                              <>
                                <span className="font-medium text-ink">{cs.averageScore}</span>/10 · {cs.count}
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                        <div className={`w-full rounded-full bg-slate-100 overflow-hidden ${isKids ? "h-2" : "h-1.5"}`}>
                          <div
                            className={`h-full rounded-full origin-left animate-grow ${isKids ? tone.solid : pct >= 80 ? "bg-green-500" : "bg-brand-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`panel ${radius} p-5`}>
                <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Icon name="sparkles" className="w-4 h-4 text-brand-600" />
                  {isKids ? "Your thinking insights" : "AI insights"}
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {profile?.aiInsight || "Complete challenges to generate tailored analytical feedback."}
                </p>
                {insights.length > 0 && (
                  <ul className="mt-4 space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
                    {insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2 w-1 h-1 rounded-full bg-brand-400 shrink-0" />
                        <span className="leading-relaxed">{stripLeadingEmoji(ins)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/challenge"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Configure custom difficulty
                  <Icon name="arrowRight" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Achievements preview */}
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <h2 className="text-base font-semibold text-ink">
                {isKids ? "Trophies" : "Achievements"}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {unlockedBadges.length} of {AVAILABLE_BADGES.length} unlocked
                </span>
              </h2>
              <Link
                href="/profile#trophies"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>
            <AchievementGrid unlocked={unlockedBadges} isKids={isKids} limit={5} />
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
