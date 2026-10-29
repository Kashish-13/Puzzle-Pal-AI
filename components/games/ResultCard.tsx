"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { ChallengeDifficulty, ReasoningEvaluation } from "@/lib/types";
import { GAMES, isGameId } from "@/lib/games/catalog";
import { formatDuration } from "@/lib/games/scoring";
import { useAuth } from "@/lib/auth";
import { getLevelTitle } from "@/lib/firestore";
import Icon from "@/components/Icon";
import ProgressBar from "@/components/ProgressBar";

/** Counts up to a number for the XP reward. */
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

export default function ResultCard({
  evaluation,
  difficulty,
  xpEarned,
  nextDifficulty,
  onPlayAgain,
  onNext,
  compact = false,
}: {
  evaluation: ReasoningEvaluation;
  difficulty: ChallengeDifficulty;
  xpEarned?: number;
  nextDifficulty?: ChallengeDifficulty;
  onPlayAgain?: () => void;
  onNext?: () => void;
  compact?: boolean;
}) {
  const { profile } = useAuth();
  const stats = evaluation.gameStats;
  const game = stats && isGameId(stats.gameId) ? GAMES[stats.gameId] : null;
  const kids = game?.mode === "kids";
  const pct = Math.round(evaluation.overallScore * 10);
  const ringColor = evaluation.overallScore >= 8 ? "#22c55e" : evaluation.overallScore >= 5 ? "#5b4bff" : "#f43f5e";
  const r = 40, c = 2 * Math.PI * r;

  return (
    <div className={`panel overflow-hidden ${kids ? "rounded-3xl" : ""} animate-fade-up`}>
      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-brand-50/70 via-white to-white border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2ff" strokeWidth="9" />
              <circle cx="50" cy="50" r={r} fill="none" stroke={ringColor} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} className="transition-[stroke-dasharray] duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`${pct >= 100 ? "text-2xl" : "text-[28px]"} font-semibold tracking-tight text-ink tabular-nums leading-none`}>{pct}%</span>
              <span className="text-[11px] text-slate-500">score</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <Icon name="checkCircle" className="w-3.5 h-3.5" />
              Challenge complete
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-ink">{game?.name ?? "Challenge"}</h2>
            {stats && (
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">Accuracy</dt>
                  <dd className="font-semibold text-ink tabular-nums">{stats.correct}/{stats.total}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Time</dt>
                  <dd className="font-semibold text-ink tabular-nums">{formatDuration(stats.timeMs)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Wrong attempts</dt>
                  <dd className="font-semibold text-ink tabular-nums">{stats.mistakes}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Hints</dt>
                  <dd className="font-semibold text-ink tabular-nums">{stats.hintsUsed}</dd>
                </div>
              </dl>
            )}
          </div>

          {xpEarned !== undefined && (
            <div className="animate-pop rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 sm:text-center self-start sm:self-center" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center sm:justify-center gap-1.5 text-amber-600">
                <Icon name="zap" className="w-4 h-4" filled />
                <span className="text-2xl font-semibold tabular-nums">+<CountUp to={xpEarned} /></span>
              </div>
              <div className="text-xs text-amber-700/80">XP earned</div>
            </div>
          )}
        </div>
      </div>

      {/* AI review */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Icon name="sparkles" className="w-4 h-4" />
          </span>
          <h3 className="text-base font-semibold text-ink">AI reasoning review</h3>
        </div>

        <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">{evaluation.feedback}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-xl border border-green-100 bg-green-50/40 p-5">
            <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Icon name="checkCircle" className="w-4 h-4 text-green-600" /> What you did well
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2"><Icon name="check" className="w-4 h-4 mt-0.5 text-green-600" />{s}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-amber-100 bg-amber-50/40 p-5">
            <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Icon name="trendingUp" className="w-4 h-4 text-amber-600" /> Improve
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {evaluation.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2"><Icon name="arrowUpRight" className="w-4 h-4 mt-0.5 text-amber-600" />{s}</li>
              ))}
            </ul>
          </section>
        </div>

        {evaluation.idealApproach && (
          <section className="rounded-xl bg-slate-50 p-5">
            <h4 className="text-sm font-semibold text-ink mb-1">Strategy for next time</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{evaluation.idealApproach}</p>
          </section>
        )}

        {!compact && (
          <>
            {(profile || nextDifficulty) && (
            <section className="rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
              <div className="sm:col-span-2">
                {profile && (
                  <ProgressBar
                    xp={profile.xp ?? 0}
                    level={profile.level ?? 1}
                    levelTitle={getLevelTitle(profile.level ?? 1, profile.userType)}
                    userType={kids ? "kids" : "student"}
                  />
                )}
              </div>
              {nextDifficulty && (
                <div className="sm:border-l sm:border-slate-100 sm:pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Next challenge</p>
                  <p className="mt-1 text-sm text-ink">
                    Recommended difficulty: <span className="font-semibold capitalize">{nextDifficulty}</span>
                    {nextDifficulty !== difficulty && (
                      <span className={`ml-1.5 text-xs font-medium ${["easy", "medium", "hard", "expert"].indexOf(nextDifficulty) > ["easy", "medium", "hard", "expert"].indexOf(difficulty) ? "text-green-600" : "text-amber-600"}`}>
                        ({["easy", "medium", "hard", "expert"].indexOf(nextDifficulty) > ["easy", "medium", "hard", "expert"].indexOf(difficulty) ? "level up" : "eased"})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </section>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <Link href="/challenge" className="btn btn-ghost">
                <Icon name="arrowLeft" className="w-4 h-4" /> All puzzles
              </Link>
              <div className="flex flex-col sm:flex-row gap-2">
                {onPlayAgain && (
                  <button type="button" onClick={onPlayAgain} className="btn btn-secondary">
                    <Icon name="rotate" className="w-4 h-4" /> Play again
                  </button>
                )}
                {onNext && (
                  <button type="button" onClick={onNext} className="btn btn-primary btn-lg">
                    Continue <Icon name="arrowRight" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
