"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
import DataTableRenderer from "@/components/DataTableRenderer";
import CodeSnippetRenderer from "@/components/CodeSnippetRenderer";
import ScoreBreakdownCard from "@/components/ScoreBreakdownCard";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/lib/auth";
import {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ReasoningEvaluation,
} from "@/lib/types";
import { recordChallengeResult, AVAILABLE_BADGES } from "@/lib/firestore";

function ChallengeSessionContent() {
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const isKids = profile?.userType === "kids";

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const queryCategory =
    (searchParams.get("category") as ChallengeCategory) ||
    (isKids ? "kids_mystery" : "business");
  const queryDifficulty =
    (searchParams.get("difficulty") as ChallengeDifficulty) ||
    profile?.currentDifficulty ||
    (isKids ? "easy" : "medium");

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const challengeRef = useRef<Challenge | null>(null);
  useEffect(() => {
    challengeRef.current = challenge;
  }, [challenge]);

  const [loadingChallenge, setLoadingChallenge] = useState<boolean>(true);
  const [userReasoning, setUserReasoning] = useState<string>("");
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ReasoningEvaluation | null>(null);
  const [xpEarned, setXpEarned] = useState<number | undefined>(undefined);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const minChars = isKids ? 15 : 20;

  useEffect(() => {
    let ignore = false;

    async function fetchScenario() {
      try {
        const currentProfile = profileRef.current;
        const res = await fetch("/api/generate-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: queryCategory,
            difficulty: queryDifficulty,
            userType: currentProfile?.userType,
            ageRange: currentProfile?.ageRange,
            academicLevel: currentProfile?.academicLevel,
            interests: currentProfile?.interests,
          }),
        });

        if (!res.ok) {
          throw new Error("Challenge generation request failed");
        }

        const data: Challenge = await res.json();
        if (!ignore) {
          setChallenge(data);
          setEvaluation(null);
          setUserReasoning("");
          setHint(null);
          setHintsUsed(0);
          setXpEarned(undefined);
          setUnlockedBadges([]);
          setError(null);
          setEvaluating(false);
          setLoadingChallenge(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError("Something went wrong while creating your challenge. Please try again.");
          setLoadingChallenge(false);
        }
      }
    }

    fetchScenario();

    return () => {
      ignore = true;
    };
  }, [queryCategory, queryDifficulty]);

  const handleNextChallenge = async () => {
    // Clear previous evaluation and challenge states completely before fetching
    setChallenge(null);
    setUserReasoning("");
    setEvaluation(null);
    setHint(null);
    setHintsUsed(0);
    setXpEarned(undefined);
    setUnlockedBadges([]);
    setError(null);
    setEvaluating(false);
    setLoadingChallenge(true);

    try {
      const currentProfile = profileRef.current;
      const res = await fetch("/api/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: queryCategory,
          difficulty: queryDifficulty,
          userType: currentProfile?.userType,
          ageRange: currentProfile?.ageRange,
          academicLevel: currentProfile?.academicLevel,
          interests: currentProfile?.interests,
        }),
      });

      if (!res.ok) {
        throw new Error("Challenge generation request failed");
      }

      const data: Challenge = await res.json();
      setChallenge(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating your challenge. Please try again.");
    } finally {
      setLoadingChallenge(false);
    }
  };

  const handleRequestHint = async () => {
    if (!challenge || hintLoading || hint) return;

    try {
      setHintLoading(true);
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge,
          userReasoning: userReasoning || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHint(data.hint || challenge.hint || "Look closely at the key clues.");
        setHintsUsed((prev) => prev + 1);
      } else {
        setHint(challenge.hint || "Analyze the primary constraints before deciding.");
        setHintsUsed((prev) => prev + 1);
      }
    } catch {
      setHint(challenge.hint || "Identify which variables carry the highest operational risk.");
      setHintsUsed((prev) => prev + 1);
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmitReasoning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || evaluating) return;

    const currentChallengeId = challenge.id;
    const trimmed = userReasoning.trim();
    if (trimmed.length < minChars) {
      setError(`Please provide a more detailed response (minimum ${minChars} characters).`);
      return;
    }

    try {
      setEvaluating(true);
      setError(null);

      const res = await fetch("/api/evaluate-reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge,
          userReasoning: trimmed,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Evaluation failed. Please try again.");
      }

      const evalData: ReasoningEvaluation = await res.json();

      // Guard against stale async evaluation responses
      if (challengeRef.current?.id !== currentChallengeId) {
        return;
      }

      setEvaluation(evalData);

      if (user) {
        const result = await recordChallengeResult(user.uid, {
          challengeId: challenge.id,
          title: challenge.title,
          category: challenge.category,
          difficulty: challenge.difficulty,
          userType: profile?.userType || undefined,
          evaluation: evalData,
          reasoning: trimmed,
          hintsUsed,
        });

        // Ensure challenge hasn't changed while recording result
        if (challengeRef.current?.id === currentChallengeId) {
          setXpEarned(result.xpEarned);
          if (result.newBadges && result.newBadges.length > 0) {
            setUnlockedBadges(result.newBadges);
          }
        }
        await refreshProfile();
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err instanceof Error ? err.message : "Unable to evaluate your reasoning right now. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <Link
          href="/challenge"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800/60"
        >
          <span>←</span>
          <span>{isKids ? "Back to Puzzles" : "Back to Challenge Catalog"}</span>
        </Link>

        {challenge && (
          <div className="flex items-center gap-2">
            <CategoryBadge category={challenge.category} size="sm" />
            <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              ~{challenge.estimatedTime} min
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              +{challenge.difficulty === "easy" ? 50 : challenge.difficulty === "medium" ? 100 : challenge.difficulty === "hard" ? 150 : 200} XP
            </span>
          </div>
        )}
      </div>

      {/* Loading Scenario State */}
      {loadingChallenge && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <LoadingState
            message={isKids ? "Creating your fun puzzle story..." : "Generating structured reasoning scenario..."}
            size="lg"
          />
        </div>
      )}

      {/* Error Banner */}
      {error && !loadingChallenge && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/60 p-4 text-xs font-semibold text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleNextChallenge}
            className="px-3 py-1 bg-rose-900 text-rose-200 rounded-lg hover:bg-rose-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Active Challenge Workspace */}
      {!loadingChallenge && challenge && (
        <div className="space-y-6">
          {isKids ? (
            /* ================= KIDS ADVENTURE WORKSPACE ================= */
            <div className="space-y-6">
              {/* Adventure Story Card */}
              <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl shadow-amber-500/5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🕵️</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Puzzle Story & Mystery
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    +100 XP
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {challenge.title}
                </h1>

                <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 sm:p-6 text-sm sm:text-base text-slate-100 leading-relaxed font-sans whitespace-pre-line">
                  {challenge.scenario}
                </div>

                {/* Optional Data Table or Code Snippet if present */}
                {challenge.dataTable && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800">
                    <DataTableRenderer dataTable={challenge.dataTable} />
                  </div>
                )}
                {challenge.codeSnippet && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800">
                    <CodeSnippetRenderer codeSnippet={challenge.codeSnippet} />
                  </div>
                )}

                {/* Clues Card */}
                {challenge.context && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5">
                    <span className="text-2xl shrink-0 mt-0.5">🔍</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                        Secret Clues & Rules
                      </span>
                      <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
                        {challenge.context}
                      </p>
                    </div>
                  </div>
                )}

                {/* The Question / Mission */}
                <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-slate-950 to-amber-500/10 p-5 sm:p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    🎯 Your Detective Mission
                  </span>
                  <p className="text-base sm:text-lg font-black text-white leading-relaxed">
                    {challenge.question}
                  </p>
                </div>
              </div>

              {/* Hint Box (if revealed) */}
              {hint && (
                <div className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-5 flex items-start gap-3.5 animate-in fade-in">
                  <span className="text-2xl shrink-0">💡</span>
                  <div className="text-xs sm:text-sm text-amber-200 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider text-[11px]">
                      Detective Clue Hint:
                    </span>
                    {hint}
                  </div>
                </div>
              )}

              {/* Newly Unlocked Badge Banner */}
              {unlockedBadges.length > 0 && (
                <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 p-5 animate-pulse shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎉</span>
                    <div>
                      <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                        New Trophy Unlocked!
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {unlockedBadges.map((bId) => {
                          const bInfo = AVAILABLE_BADGES.find((b) => b.id === bId);
                          return (
                            <span
                              key={bId}
                              className="px-2.5 py-1 rounded-full bg-amber-500/30 border border-amber-400/60 text-amber-200 text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>{bInfo?.icon || "🏆"}</span>
                              <span>{bInfo?.name || bId}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluation or Input Workspace */}
              {evaluation ? (
                <ScoreBreakdownCard
                  evaluation={evaluation}
                  xpEarned={xpEarned}
                  userType="kids"
                  onNextChallenge={handleNextChallenge}
                  nextChallengeLabel="Next Fun Puzzle →"
                />
              ) : (
                <form
                  onSubmit={handleSubmitReasoning}
                  className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 sm:p-8 space-y-4 shadow-xl shadow-amber-500/5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                        <span>✏️</span>
                        <span>Tell Us Your Clues & Answer</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Explain who or what the answer is, and how you figured it out from the clues!
                      </p>
                    </div>

                    {!hint && (
                      <button
                        type="button"
                        onClick={handleRequestHint}
                        disabled={hintLoading}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-colors disabled:opacity-60"
                      >
                        <span>💡</span>
                        <span>{hintLoading ? "Finding clue..." : "Need a Hint?"}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      rows={5}
                      value={userReasoning}
                      onChange={(e) => setUserReasoning(e.target.value)}
                      disabled={evaluating}
                      placeholder="I think the answer is... because in the story it says... and the clue shows that..."
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-hidden font-sans leading-relaxed transition-colors resize-y min-h-[140px]"
                    />

                    <div className="flex justify-between items-center text-[11px] font-mono mt-2 px-1">
                      <span>
                        {userReasoning.trim().length < minChars ? (
                          <span className="text-amber-400">
                            Write just a little more (min {minChars} characters)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">
                            ✓ Ready for AI Detective check!
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500">
                        {userReasoning.length} characters
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={userReasoning.trim().length < minChars || evaluating}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 shadow-amber-500/20"
                    >
                      {evaluating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>AI Detective Reading Your Brain...</span>
                        </>
                      ) : (
                        <>
                          <span>Check My Thinking ⭐</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= STUDENTS INTERACTIVE WORKSPACE ================= */
            <div className="space-y-6">
              {/* Problem Statement Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                      Problem Context & Scenario
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Est. Time: ~{challenge.estimatedTime} min
                  </span>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {challenge.title}
                  </h1>

                  <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {challenge.scenario}
                  </p>
                </div>

                {/* Optional Code Snippet Renderer */}
                {challenge.codeSnippet && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800">
                    <CodeSnippetRenderer codeSnippet={challenge.codeSnippet} />
                  </div>
                )}

                {/* Optional Data Table Renderer */}
                {challenge.dataTable && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800">
                    <DataTableRenderer dataTable={challenge.dataTable} />
                  </div>
                )}

                {/* Constraints & Boundary Conditions Panel */}
                {challenge.context && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 text-xs sm:text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      <span>⚙️</span>
                      <span>Operational Constraints & Known Conditions</span>
                    </div>
                    <p className="leading-relaxed font-sans text-slate-300">
                      {challenge.context}
                    </p>
                  </div>
                )}

                {/* The Directive Box */}
                <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/20 p-5 sm:p-6">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1.5">
                    Directive & Core Question
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {challenge.question}
                  </p>
                </div>
              </div>

              {/* Progressive Hint Drawer (if revealed) */}
              {hint && (
                <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-5 flex items-start gap-3.5 animate-in fade-in">
                  <span className="text-xl text-indigo-400 shrink-0">💡</span>
                  <div className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                    <span className="font-mono font-bold text-indigo-400 block mb-1 text-[11px] uppercase tracking-wider">
                      Heuristic Guidance Hint:
                    </span>
                    {hint}
                  </div>
                </div>
              )}

              {/* Newly Unlocked Milestone Banner */}
              {unlockedBadges.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 p-5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎖️</span>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                        Milestone Badge Unlocked!
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {unlockedBadges.map((bId) => {
                          const bInfo = AVAILABLE_BADGES.find((b) => b.id === bId);
                          return (
                            <span
                              key={bId}
                              className="px-2.5 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>{bInfo?.icon || "🏆"}</span>
                              <span>{bInfo?.name || bId}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluation or Reasoning Studio Form */}
              {evaluation ? (
                <ScoreBreakdownCard
                  evaluation={evaluation}
                  xpEarned={xpEarned}
                  userType="student"
                  onNextChallenge={handleNextChallenge}
                  nextChallengeLabel="Generate Next Scenario →"
                />
              ) : (
                <form
                  onSubmit={handleSubmitReasoning}
                  className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span>⚡</span>
                        <span>Analytical Rationale & Solution Framework</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        State your decision, validate underlying assumptions, evaluate trade-offs, and note secondary risks.
                      </p>
                    </div>

                    {!hint && (
                      <button
                        type="button"
                        onClick={handleRequestHint}
                        disabled={hintLoading}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-60"
                      >
                        <span>💡</span>
                        <span>{hintLoading ? "Evaluating clue..." : "Request Hint"}</span>
                      </button>
                    )}
                  </div>

                  {/* Guidance Framework Pills */}
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                      Suggested Dimensions:
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      Primary Objective
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      Constraint Analysis
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      Tradeoff Weighing
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      Risk Mitigation
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={7}
                      value={userReasoning}
                      onChange={(e) => setUserReasoning(e.target.value)}
                      disabled={evaluating}
                      placeholder="Explain your structured recommendation and justification. Address the key constraints, explain why competing alternatives were rejected, and identify what key risk you would actively monitor..."
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden font-sans leading-relaxed transition-colors resize-y min-h-[160px]"
                    />

                    <div className="flex justify-between items-center text-[11px] font-mono mt-2 px-1 text-slate-500">
                      <span>
                        {userReasoning.trim().length < minChars ? (
                          <span className="text-amber-400">
                            Min {minChars} characters required for evaluation
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">
                            ✓ Ready for AI cognitive evaluation
                          </span>
                        )}
                      </span>
                      <span>{userReasoning.length} / 5,000 characters</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={userReasoning.trim().length < minChars || evaluating}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-indigo-600/25"
                    >
                      {evaluating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating Analytical Reasoning...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Reasoning ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChallengeSessionPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <LoadingState message="Loading reasoning session..." size="lg" />
              </div>
            }
          >
            <ChallengeSessionContent />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
