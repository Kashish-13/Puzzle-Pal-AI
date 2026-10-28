"use client";

import React from "react";
import Link from "next/link";
import { ReasoningEvaluation } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { getLevelTitle } from "@/lib/firestore";
import Icon from "./Icon";
import ProgressBar from "./ProgressBar";

interface ScoreBreakdownCardProps {
  evaluation: ReasoningEvaluation;
  xpEarned?: number;
  onNextChallenge?: () => void;
  nextChallengeLabel?: string;
  userType?: "kids" | "student";
  /** Show the user's current level progress (used right after completing a challenge) */
  showProgress?: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 10));
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#5b4bff" : "#f43f5e";
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90 shrink-0" aria-hidden="true">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        className="transition-[stroke-dasharray] duration-700"
      />
    </svg>
  );
}

export default function ScoreBreakdownCard({
  evaluation,
  xpEarned,
  onNextChallenge,
  nextChallengeLabel = "Continue",
  userType,
  showProgress = false,
}: ScoreBreakdownCardProps) {
  const { profile } = useAuth();

  // Infer kids vs student if not passed explicitly
  const isKids =
    userType === "kids" ||
    (evaluation.feedback && evaluation.feedback.toLowerCase().includes("puzzle")) ||
    (evaluation.feedback && evaluation.feedback.toLowerCase().includes("detective"));

  const getRatingLabel = (score: number) => {
    if (isKids) {
      if (score >= 8.5) return "Champion detective deduction";
      if (score >= 7.0) return "Great thinking";
      if (score >= 5.0) return "Good effort — you spotted the clues";
      return "Keep practicing — look closer at the clues";
    }
    if (score >= 9.0) return "Masterful analytical rigor";
    if (score >= 8.0) return "Exceptional reasoning and depth";
    if (score >= 7.0) return "Strong analytical foundation";
    if (score >= 5.5) return "Competent rationale with blindspots";
    return "Superficial reasoning — needs structural depth";
  };

  const scoreBars = [
    {
      label: isKids ? "Deduction Quality" : "Decision Quality",
      value: evaluation.decisionQuality,
      desc: isKids ? "Did your answer make sense?" : "Defensibility of your chosen path",
    },
    {
      label: isKids ? "Clue Connection" : "Logic & Soundness",
      value: evaluation.logic,
      desc: isKids ? "Did you use clues from the story?" : "Deductive validity without contradictions",
    },
    {
      label: isKids ? "Rule Awareness" : "Tradeoff Awareness",
      value: evaluation.tradeoffAwareness,
      desc: isKids ? "Did you follow the puzzle rules?" : "Recognition of costs, constraints & risks",
    },
    {
      label: isKids ? "Explanation Clarity" : "Clarity & Structure",
      value: evaluation.clarity,
      desc: isKids ? "Was your thinking easy to understand?" : "Precision and coherence of thought",
    },
  ];

  return (
    <div className="panel overflow-hidden animate-fade-up">
      {/* Score header */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
        <div className="relative">
          <ScoreRing score={evaluation.overallScore} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {evaluation.overallScore.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400">/ 10</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2.5 py-1">
            <Icon name="checkCircle" className="w-3.5 h-3.5" />
            <span>{isKids ? "Puzzle complete" : "Challenge complete"}</span>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Reasoning score</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">{getRatingLabel(evaluation.overallScore)}</p>
        </div>

        {xpEarned !== undefined && (
          <div className="animate-pop rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 sm:text-center" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center sm:justify-center gap-1.5 text-amber-600">
              <Icon name="zap" className="w-4 h-4" filled />
              <span className="text-xl font-semibold tabular-nums">+{xpEarned} XP</span>
            </div>
            <div className="text-xs text-amber-700/80">XP earned</div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Strengths & improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-xl border border-green-100 bg-green-50/40 p-5">
            <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Icon name="checkCircle" className="w-4 h-4 text-green-600" />
              What you did well
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Icon name="check" className="w-4 h-4 mt-0.5 text-green-600" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-amber-100 bg-amber-50/40 p-5">
            <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Icon name="trendingUp" className="w-4 h-4 text-amber-600" />
              {isKids ? "Tips for next time" : "Improve your reasoning"}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Icon name="arrowUpRight" className="w-4 h-4 mt-0.5 text-amber-600" />
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* AI feedback */}
        {evaluation.feedback && (
          <section className="rounded-xl bg-brand-50/60 border border-brand-100 p-5">
            <h4 className="text-sm font-semibold text-ink mb-1.5 flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4 text-brand-600" />
              {isKids ? "Coach feedback" : "AI feedback"}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
          </section>
        )}

        {/* Dimension breakdown */}
        <section>
          <h4 className="text-sm font-semibold text-ink mb-4">
            {isKids ? "Your thinking scorecard" : "Score breakdown"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {scoreBars.map((bar, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-slate-800">{bar.label}</span>
                  <span className="text-slate-600 tabular-nums">{bar.value}/10</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 mb-2 truncate">{bar.desc}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full origin-left animate-grow ${
                      bar.value >= 8 ? "bg-green-500" : bar.value >= 4 ? "bg-brand-600" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, bar.value * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Missed considerations */}
        {evaluation.missedConsiderations && evaluation.missedConsiderations.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-ink mb-2.5">
              {isKids ? "Clues you could also notice" : "Constraints and blindspots to factor in"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5 marker:text-slate-300">
              {evaluation.missedConsiderations.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Ideal approach */}
        {evaluation.idealApproach && (
          <details className="group rounded-xl border border-slate-200 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-ink">
              {isKids ? "How to solve it step by step" : "Ideal problem-solving approach"}
              <Icon name="arrowRight" className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{evaluation.idealApproach}</p>
          </details>
        )}

        {/* Progress toward next level */}
        {showProgress && profile && (
          <section className="rounded-xl border border-slate-200 p-5">
            <ProgressBar
              xp={profile.xp ?? 0}
              level={profile.level ?? 1}
              levelTitle={getLevelTitle(profile.level ?? 1, profile.userType)}
              userType={isKids ? "kids" : "student"}
            />
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <Link href="/history" className="btn btn-ghost">
            Review in history
          </Link>

          {onNextChallenge && (
            <button type="button" onClick={onNextChallenge} className="btn btn-primary btn-lg">
              <span>{nextChallengeLabel}</span>
              <Icon name="arrowRight" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
