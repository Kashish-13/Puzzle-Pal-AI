"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
import ScoreBreakdownCard from "@/components/ScoreBreakdownCard";
import ResultCard from "@/components/games/ResultCard";
import { GAMES, gamesForMode } from "@/lib/games/catalog";
import Icon, { CategoryIcon } from "@/components/Icon";
import SkeletonList from "@/components/Skeleton";
import { scoreTone } from "@/components/RecentActivityList";
import { CATEGORY_TONE, TONES } from "@/components/tokens";
import { useAuth } from "@/lib/auth";
import { getChallengeHistory, CATEGORY_INFO } from "@/lib/firestore";
import { ChallengeCategory, ChallengeHistoryRecord } from "@/lib/types";

interface FormattedHistoryRecord extends ChallengeHistoryRecord {
  formattedDate: string;
}

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const isKids = profile?.userType === "kids";

  const [history, setHistory] = useState<FormattedHistoryRecord[]>([]);
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
          const formatted: FormattedHistoryRecord[] = records.map((record) => {
            let formattedDate = "Recent";
            if (record.completedAt) {
              try {
                const dateObj =
                  typeof record.completedAt.toDate === "function"
                    ? record.completedAt.toDate()
                    : new Date(record.completedAt as unknown as string | number);
                formattedDate = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              } catch {
                formattedDate = "Recent";
              }
            }
            return {
              ...record,
              formattedDate,
            };
          });
          setHistory(formatted);
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

  const filterTabs: { key: ChallengeCategory | "all"; label: string }[] = [
    { key: "all", label: isKids ? "All puzzles" : "All" },
    ...gamesForMode(profile?.userType).map((id) => ({ key: id as ChallengeCategory, label: GAMES[id].name })),
  ];

  const totalCompletions = history.length;
  const avgScore =
    totalCompletions > 0
      ? (history.reduce((acc, h) => acc + h.score, 0) / totalCompletions).toFixed(1)
      : "—";
  const totalXPEarned = history.reduce((acc, h) => acc + h.xpEarned, 0);

  const getKidStars = (score: number) => {
    if (score >= 8.5) return 5;
    if (score >= 7.0) return 4;
    if (score >= 5.0) return 3;
    return 2;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 page-enter">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                  {isKids ? "Home" : "Dashboard"}
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">History</span>
              </nav>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                {isKids ? "Your solved puzzles" : "Challenge history"}
              </h1>
              <p className="mt-1.5 text-slate-500 max-w-2xl">
                {isKids
                  ? "Look back at the mysteries and brain teasers you have solved."
                  : "Review past submissions, score breakdowns, and feedback over time."}
              </p>
            </div>

            <Link href="/challenge" className="btn btn-primary self-start sm:self-auto">
              <span>{isKids ? "New puzzle" : "New challenge"}</span>
              <Icon name="arrowRight" className="w-4 h-4" />
            </Link>
          </div>

          {/* Summary */}
          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: isKids ? "Puzzles solved" : "Completed", value: totalCompletions, icon: "checkCircle" as const, tone: "bg-green-50 text-green-600" },
              {
                label: isKids ? "Average stars" : "Average score",
                value: avgScore === "—" ? "—" : `${avgScore}/10`,
                icon: "activity" as const,
                tone: "bg-brand-50 text-brand-600",
              },
              { label: "XP earned", value: totalXPEarned, icon: "zap" as const, tone: "bg-amber-50 text-amber-600" },
            ].map((m) => (
              <div key={m.label} className="panel p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center ${m.tone}`}>
                    <Icon name={m.icon} className="w-4 h-4" />
                  </span>
                  <dt className="text-xs sm:text-sm text-slate-500">{m.label}</dt>
                </div>
                <dd className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-4">
            {/* Category filter */}
            <div className="border-b border-slate-200 overflow-x-auto">
              <div className="flex gap-6 min-w-max" role="tablist">
                {filterTabs.map((tab) => {
                  const isSelected = selectedCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedCategory(tab.key)}
                      className={`relative pb-3 text-sm whitespace-nowrap transition-colors ${
                        isSelected
                          ? "text-brand-700 font-medium after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-600"
                          : "text-slate-500 hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <SkeletonList rows={4} />
            ) : history.length === 0 ? (
              <div className="panel py-14 px-6 text-center">
                <span className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon name={isKids ? "puzzle" : "fileText"} className="w-6 h-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {isKids ? "No puzzles solved here yet" : "No challenges yet"}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {selectedCategory === "all"
                    ? isKids
                      ? "Play any mystery to start earning XP and trophies."
                      : "Complete your first challenge to start tracking your progress."
                    : `No completions recorded in the ${CATEGORY_INFO[selectedCategory as ChallengeCategory]?.name || selectedCategory} category.`}
                </p>
                <Link href="/challenge" className="btn btn-primary mt-6">
                  {isKids ? "Start your first puzzle" : "Start your first challenge"}
                </Link>
              </div>
            ) : (
              <ul className="panel divide-y divide-slate-100 overflow-hidden">
                {history.map((record) => {
                  const dateStr = record.formattedDate || "Recent";
                  const tone = TONES[CATEGORY_TONE[record.category] || "brand"];

                  return (
                    <li key={record.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="group w-full text-left p-4 sm:px-5 sm:py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center shrink-0 ${tone.soft}`}>
                          <CategoryIcon category={record.category} className="w-[18px] h-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-ink truncate">{record.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className={tone.text}>{CATEGORY_INFO[record.category]?.name || record.category}</span>
                            <span className="text-slate-300">·</span>
                            <span className="capitalize">{record.difficulty}</span>
                            <span className="text-slate-300">·</span>
                            <span>{dateStr}</span>
                            <span className="text-slate-300">·</span>
                            <span>
                              {record.hintsUsed > 0
                                ? `${record.hintsUsed} hint${record.hintsUsed > 1 ? "s" : ""}`
                                : "No hints"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1 hidden sm:block">
                            {record.feedback || record.reasoning}
                          </p>
                        </div>

                        <div className="text-right tabular-nums shrink-0">
                          {isKids && (
                            <div className="flex justify-end gap-0.5 mb-1 text-amber-500" aria-label={`${getKidStars(record.score)} of 5 stars`}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Icon
                                  key={n}
                                  name="star"
                                  filled={n <= getKidStars(record.score)}
                                  className={`w-3.5 h-3.5 ${n <= getKidStars(record.score) ? "" : "text-slate-300"}`}
                                />
                              ))}
                            </div>
                          )}
                          <div className={`text-sm font-semibold ${scoreTone(record.score)}`}>
                            {record.score.toFixed(1)}
                            <span className="font-normal text-slate-400">/10</span>
                          </div>
                          <div className="text-xs font-medium text-amber-600">+{record.xpEarned} XP</div>
                        </div>
                        <Icon name="arrowRight" className="hidden sm:block w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Detail modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]">
              <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-50 shadow-lift animate-pop">
                <div className="sticky top-0 z-10 bg-white flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                  <div className="space-y-1.5 min-w-0">
                    <h2 className="text-lg font-semibold text-ink">{selectedRecord.title}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={selectedRecord.category} size="sm" />
                      <DifficultyBadge difficulty={selectedRecord.difficulty} size="sm" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 -mr-1.5 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {selectedRecord.evaluation?.gameStats ? (
                    <ResultCard
                      evaluation={selectedRecord.evaluation}
                      difficulty={selectedRecord.difficulty}
                      xpEarned={selectedRecord.xpEarned}
                      compact
                    />
                  ) : (
                    <>
                      <section className="panel p-5">
                        <h3 className="text-sm font-semibold text-ink mb-1.5">
                          {isKids ? "Your answer" : "Your submitted reasoning"}
                        </h3>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {selectedRecord.reasoning}
                        </p>
                      </section>

                      <ScoreBreakdownCard
                        evaluation={selectedRecord.evaluation}
                        xpEarned={selectedRecord.xpEarned}
                        userType={selectedRecord.userType || (isKids ? "kids" : "student")}
                        onNextChallenge={() => setSelectedRecord(null)}
                        nextChallengeLabel="Close details"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
