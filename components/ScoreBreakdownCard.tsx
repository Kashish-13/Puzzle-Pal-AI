"use client";

import React from "react";
import Link from "next/link";
import { ReasoningEvaluation } from "@/lib/types";

interface ScoreBreakdownCardProps {
  evaluation: ReasoningEvaluation;
  xpEarned?: number;
  onNextChallenge?: () => void;
  nextChallengeLabel?: string;
  userType?: "kids" | "student";
}

export default function ScoreBreakdownCard({
  evaluation,
  xpEarned,
  onNextChallenge,
  nextChallengeLabel = "Next Challenge →",
  userType,
}: ScoreBreakdownCardProps) {
  // Infer kids vs student if not passed explicitly
  const isKids =
    userType === "kids" ||
    (evaluation.feedback && evaluation.feedback.toLowerCase().includes("puzzle")) ||
    (evaluation.feedback && evaluation.feedback.toLowerCase().includes("detective"));

  // Calculate 100-point scale score
  const score100 = Math.round(evaluation.overallScore * 10);

  const getRatingLabel = (score: number) => {
    if (isKids) {
      if (score >= 8.5) return "🌟 Champion Detective Deduction!";
      if (score >= 7.0) return "⭐ Great Brain Thinking!";
      if (score >= 5.0) return "🔍 Good Effort — Clues Spotted!";
      return "💡 Keep Practicing — Look Closer at Clues!";
    }
    if (score >= 9.0) return "Masterful Analytical Rigor";
    if (score >= 8.0) return "Exceptional Reasoning & Depth";
    if (score >= 7.0) return "Strong Analytical Foundation";
    if (score >= 5.5) return "Competent Rationale with Blindspots";
    return "Superficial Reasoning — Needs Structural Depth";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "text-emerald-400";
    if (score >= 6.5) return "text-indigo-400";
    if (score >= 5.0) return "text-amber-400";
    return "text-rose-400";
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
    <div className={`space-y-6 rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all ${
      isKids
        ? "bg-slate-900/90 border-amber-500/40 shadow-amber-500/5"
        : "bg-slate-900/80 border-indigo-500/30 shadow-indigo-500/5"
    }`}>
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isKids
                ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                : "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
            }`}>
              {isKids ? "PUZZLE COMPLETE ⭐" : "CHALLENGE COMPLETE 🎉"}
            </span>
            <span className="text-xs text-slate-400 font-sans">AI Evaluator</span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${getScoreColor(
              evaluation.overallScore
            )}`}>
              {score100}
            </span>
            <span className="text-xl text-slate-500 font-mono">/ 100</span>
            <span className="text-xs font-mono text-slate-400 ml-1">
              ({evaluation.overallScore.toFixed(1)} / 10)
            </span>
          </div>

          <p className="mt-1 text-sm sm:text-base font-bold text-slate-200">
            {getRatingLabel(evaluation.overallScore)}
          </p>
        </div>

        {/* XP Reward Badge */}
        {xpEarned !== undefined && (
          <div className="sm:self-start flex flex-col items-start sm:items-end gap-1">
            <div className={`px-4 py-2.5 rounded-2xl border font-mono font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg ${
              isKids
                ? "bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-amber-500/20"
                : "bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-indigo-600/20"
            }`}>
              <span className="text-lg">⚡</span>
              <span>+{xpEarned} XP Earned</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Added to your lifetime level progress
            </span>
          </div>
        )}
      </div>

      {/* 4 Cognitive Dimension Progress Meters */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>{isKids ? "Your Thinking Scorecard" : "Cognitive Dimension Breakdown"}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {scoreBars.map((bar, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-bold text-slate-200">{bar.label}</span>
                <span className="font-mono font-bold text-slate-300">
                  {bar.value * 10} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 truncate">
                {bar.desc}
              </p>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    bar.value >= 8
                      ? "bg-emerald-400"
                      : bar.value >= 6
                      ? "bg-indigo-400"
                      : bar.value >= 4
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                  style={{ width: `${Math.min(100, bar.value * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <span>✓</span> What You Did Well
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <span>⚠</span> {isKids ? "Tips for Next Time" : "Areas to Improve"}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {evaluation.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">↗</span>
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Learning Insight */}
      {evaluation.feedback && (
        <div className={`rounded-2xl border p-5 ${
          isKids
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-indigo-500/30 bg-indigo-950/20"
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
            isKids ? "text-amber-300" : "text-indigo-300"
          }`}>
            <span>✨</span>
            <span>{isKids ? "AI Detective Coach Insight" : "AI Reasoning Assessment"}</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            &ldquo;{evaluation.feedback}&rdquo;
          </p>
        </div>
      )}

      {/* Missed Considerations */}
      {evaluation.missedConsiderations && evaluation.missedConsiderations.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
            <span>🔍</span>
            <span>{isKids ? "Clues You Could Also Notice" : "Key Constraints & Blindspots to Factor"}</span>
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
            {evaluation.missedConsiderations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ideal Benchmark Approach */}
      {evaluation.idealApproach && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>{isKids ? "How to Solve This Mystery Step-by-Step" : "Ideal Problem-Solving Framework"}</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {evaluation.idealApproach}
          </p>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-800">
        <Link
          href="/history"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 text-center transition-colors"
        >
          Review in History ↗
        </Link>

        {onNextChallenge && (
          <button
            type="button"
            onClick={onNextChallenge}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
              isKids
                ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-500/20"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
            }`}
          >
            <span>{nextChallengeLabel}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}

