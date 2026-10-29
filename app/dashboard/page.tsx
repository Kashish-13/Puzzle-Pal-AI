"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ProgressBar from "@/components/ProgressBar";
import Icon, { CategoryIcon, stripLeadingEmoji } from "@/components/Icon";
import ReasoningGraph from "@/components/ReasoningGraph";
import RecentActivityList from "@/components/RecentActivityList";
import AchievementGrid from "@/components/AchievementGrid";
import { CATEGORY_TONE, DIFFICULTY_XP, TONES } from "@/components/tokens";
import SectionHeader from "@/components/SectionHeader";
import ChallengeCard from "@/components/games/ChallengeCard";
import ChallengePreview from "@/components/games/ChallengePreview";
import { GAMES, isGameId } from "@/lib/games/catalog";
import type { GameId } from "@/lib/games/types";
import { useAuth } from "@/lib/auth";
import {
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
      : activeCategories[0];


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

  // Time-of-day greeting, read on the client only (server renders a neutral greeting)
  const hour = useSyncExternalStore(
    () => () => {},
    () => new Date().getHours(),
    () => -1
  );
  const greeting =
    hour < 0 ? "Welcome back" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // "Continue learning": the game played most recently in this mode, else the recommendation
  const lastPlayed = recentChallenges.find((r) => activeCategories.includes(r.category))?.category;
  const heroGame = (isGameId(lastPlayed) ? lastPlayed : isGameId(recommendedCategory) ? recommendedCategory : activeCategories[0]) as GameId;
  const hero = GAMES[heroGame];
  const isContinuing = Boolean(lastPlayed);

  // Three more games to try, preferring interests and ones not yet played
  const played = new Set(categoryStrengths.filter((c) => c.count > 0).map((c) => c.category));
  const moreGames = [
    ...((profile?.interests || []).filter((i) => activeCategories.includes(i as ChallengeCategory)) as ChallengeCategory[]),
    ...activeCategories.filter((c) => !played.has(c)),
    ...activeCategories,
  ]
    .filter((c, i, arr) => c !== heroGame && arr.indexOf(c) === i && isGameId(c))
    .slice(0, 3) as GameId[];

  const radius = isKids ? "rounded-3xl" : "rounded-2xl";
  const accuracyPct = reasoningScore > 0 ? Math.round(reasoningScore * 10) : null;

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
              <p className="mt-1.5 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-ink">Level {level}</span>
                <span className="text-slate-300">·</span>
                <span className="tabular-nums">{xp} XP</span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name={isKids ? "smile" : "graduationCap"} className={`w-3.5 h-3.5 ${isKids ? "text-sky-600" : "text-brand-600"}`} />
                  {isKids ? "Kids mode" : "Student mode"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMode}
              disabled={switchingMode}
              className="btn btn-sm btn-secondary self-start md:self-auto"
              title="Switch between Kids and Student mode anytime"
            >
              <Icon name="arrowLeftRight" className="w-4 h-4 text-slate-500" />
              <span>{isKids ? "Switch to Student" : "Switch to Kids"}</span>
            </button>
          </div>

          {/* Hero: continue learning */}
          <section
            className={`relative overflow-hidden ${radius} text-white ${
              isKids ? "bg-gradient-to-br from-brand-600 via-brand-500 to-sky-500" : "bg-gradient-to-br from-brand-700 via-brand-600 to-blue-600"
            }`}
          >
            <ReasoningGraph className="hidden md:block absolute -left-16 -bottom-24 w-96 opacity-[0.12] [&_circle]:fill-white [&_line]:stroke-white" />
            <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 p-6 sm:p-8">
              <div className="md:col-span-3 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                  {isContinuing ? "Continue learning" : "Recommended for you"}
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{hero.name}</h2>
                <p className="mt-2 text-white/80 max-w-md">{hero.tagline} {hero.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-white/15 px-2 py-1 font-medium">{hero.skill}</span>
                  <span className="rounded-md bg-white/15 px-2 py-1 font-medium capitalize">{difficulty}</span>
                  <span className="rounded-md bg-white/15 px-2 py-1 font-medium">+{DIFFICULTY_XP[difficulty] ?? 100} XP</span>
                  <span className="rounded-md bg-white/15 px-2 py-1 font-medium">~{hero.estMinutes} min</span>
                </div>
                <div className="mt-6">
                  <Link
                    href={`/challenge/session?game=${heroGame}&difficulty=${difficulty}`}
                    className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-lift"
                  >
                    <Icon name="play" className="w-4 h-4" filled />
                    {isContinuing ? "Continue challenge" : "Start challenge"}
                  </Link>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-center">
                <div className="rounded-3xl bg-white/95 shadow-lift p-6 sm:p-8 min-w-56 flex items-center justify-center rotate-[-2deg]">
                  <div className="scale-125">
                    <ChallengePreview gameId={heroGame} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Progress */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`panel ${radius} p-5 sm:p-6 lg:col-span-1 flex flex-col justify-between`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Level {level}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{levelTitle}</p>
              </div>
              <div className="mt-5">
                <ProgressBar xp={xp} level={level} levelTitle={undefined} userType={userType} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <StatsCard
                playful={isKids}
                columns={2}
                items={[
                  {
                    label: "Streak",
                    value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
                    subtext: currentStreak > 0 ? "Keep it going" : "Solve one today",
                    icon: "flame",
                    tone: "amber",
                  },
                  { label: "Puzzles solved", value: challengesSolved, subtext: "All time", icon: "checkCircle", tone: "green" },
                  {
                    label: isKids ? "Star score" : "Reasoning score",
                    value: accuracyPct === null ? "—" : `${accuracyPct}%`,
                    subtext: "Average across games",
                    icon: "activity",
                    tone: "brand",
                  },
                  { label: "Experience", value: `${xp} XP`, subtext: `Adaptive level: ${difficulty}`, icon: "zap", tone: "blue" },
                ]}
              />
            </div>
          </section>

          {/* Recommended games */}
          <section>
            <SectionHeader
              title={isKids ? "More games for you" : "Recommended next"}
              action={{ href: "/challenge", label: "All puzzles" }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreGames.map((g) => (
                <ChallengeCard key={g} gameId={g} difficulty={difficulty} playful={isKids} />
              ))}
            </div>
          </section>

          {/* Activity & performance */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionHeader
                title="Recent activity"
                action={recentChallenges.length > 0 ? { href: "/history", label: "View history" } : undefined}
              />
              <RecentActivityList
                records={recentChallenges}
                emptyLabel={isKids ? "Play your first game to see it here." : "Complete your first challenge to see it here."}
              />
            </div>

            <div className="space-y-6">
              <div>
                <SectionHeader title={isKids ? "Your strengths" : "Performance by game"} />
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
                            {cs.count > 0 ? `${pct}% · ${cs.count}` : "—"}
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
                  {profile?.aiInsight || "Complete a game to get tailored feedback on your reasoning."}
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
              </div>
            </div>
          </section>

          {/* Achievements preview */}
          <section>
            <SectionHeader
              title={isKids ? "Trophies" : "Achievements"}
              meta={`${unlockedBadges.length} of ${AVAILABLE_BADGES.length} unlocked`}
              action={{ href: "/profile#trophies", label: "View all" }}
            />
            <AchievementGrid unlocked={unlockedBadges} isKids={isKids} limit={5} />
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
