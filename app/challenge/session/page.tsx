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
import Icon from "@/components/Icon";
import { DIFFICULTY_XP } from "@/components/tokens";
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

  const xpReward = challenge ? DIFFICULTY_XP[challenge.difficulty] ?? 100 : 0;
  const ready = userReasoning.trim().length >= minChars;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Back + metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/challenge"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink transition-colors"
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          <span>{isKids ? "Back to puzzles" : "Back to challenges"}</span>
        </Link>

        {challenge && (
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={challenge.category} size="sm" />
            <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Icon name="clock" className="w-3.5 h-3.5" />
              ~{challenge.estimatedTime} min
            </span>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loadingChallenge && (
        <div className="panel p-6 sm:p-8 space-y-5" aria-busy="true">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="w-4 h-4 rounded-full border-2 border-brand-100 border-t-brand-600 animate-spin" />
            {isKids ? "Creating your puzzle story..." : "Generating your reasoning scenario..."}
          </div>
          <div className="skeleton h-7 w-2/3" />
          <div className="space-y-2.5">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/5" />
          </div>
          <div className="skeleton h-20 w-full rounded-xl" />
        </div>
      )}

      {/* Error Banner */}
      {error && !loadingChallenge && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-start gap-2">
            <Icon name="alertCircle" className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleNextChallenge}
            className="btn btn-sm border border-rose-200 bg-white text-rose-700 hover:bg-rose-100 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Active Challenge */}
      {!loadingChallenge && challenge && (
        <div className="space-y-6 page-enter">
          <article className={`panel overflow-hidden ${isKids ? "rounded-3xl" : ""}`}>
            {/* Header */}
            <header className={`px-6 sm:px-8 pt-7 pb-6 border-b border-slate-100 ${isKids ? "bg-gradient-to-b from-sky-50/70 to-white" : "bg-gradient-to-b from-slate-50 to-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{isKids ? "Puzzle story" : "Scenario"}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  <Icon name="zap" className="w-3 h-3" filled />+{xpReward} XP
                </span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-[28px] font-semibold tracking-tight text-ink leading-tight">
                {challenge.title}
              </h1>
            </header>

            <div className="px-6 sm:px-8 py-7 space-y-6">
              {/* Reading area */}
              <p className="text-[16px] sm:text-[17px] text-slate-700 leading-8 whitespace-pre-line max-w-prose">
                {challenge.scenario}
              </p>

              {challenge.codeSnippet && <CodeSnippetRenderer codeSnippet={challenge.codeSnippet} />}
              {challenge.dataTable && <DataTableRenderer dataTable={challenge.dataTable} />}

              {challenge.context && (
                <div className={`rounded-xl border p-4 sm:p-5 ${isKids ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50"}`}>
                  <h2 className="text-sm font-semibold text-ink mb-1.5 flex items-center gap-2">
                    <Icon name={isKids ? "search" : "fileText"} className={`w-4 h-4 ${isKids ? "text-amber-600" : "text-slate-500"}`} />
                    {isKids ? "Key clues & rules" : "Constraints & known conditions"}
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">{challenge.context}</p>
                </div>
              )}
            </div>

            {/* Mission */}
            <div className="mx-4 sm:mx-6 mb-6 rounded-xl bg-brand-600 px-5 py-5 sm:px-6 text-white">
              <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
                {isKids ? "Your mission" : "Your task"}
              </h2>
              <p className="mt-1.5 text-lg sm:text-xl font-semibold leading-snug">{challenge.question}</p>
            </div>
          </article>

          {/* AI hint panel */}
          {(hint || hintLoading) && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 flex items-start gap-3.5 animate-fade-up" aria-live="polite">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Icon name="sparkles" className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">AI hint</div>
                {hint ? (
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed">{hint}</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="skeleton h-3 w-11/12 bg-brand-100" />
                    <div className="skeleton h-3 w-3/5 bg-brand-100" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newly unlocked badges */}
          {unlockedBadges.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4 animate-pop">
              <span className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Icon name="trophy" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {isKids ? "New trophy unlocked!" : "Achievement unlocked"}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {unlockedBadges
                    .map((bId) => AVAILABLE_BADGES.find((b) => b.id === bId)?.name || bId)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Evaluation or answer form */}
          {evaluation ? (
            <ScoreBreakdownCard
              evaluation={evaluation}
              xpEarned={xpEarned}
              userType={isKids ? "kids" : "student"}
              onNextChallenge={handleNextChallenge}
              nextChallengeLabel={isKids ? "Next puzzle" : "Continue"}
              showProgress
            />
          ) : (
            <form onSubmit={handleSubmitReasoning} className={`panel p-6 sm:p-8 space-y-4 ${isKids ? "rounded-3xl" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <label htmlFor="reasoning" className="text-base font-semibold text-ink">
                    {isKids ? "Your answer" : "Your reasoning"}
                  </label>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {isKids
                      ? "Explain who or what the answer is, and how the clues helped you."
                      : "State your decision, validate assumptions, weigh trade-offs, and note risks."}
                  </p>
                </div>

                {!hint && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={hintLoading}
                    className="btn btn-sm self-start shrink-0 border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    <Icon name="sparkles" className="w-4 h-4" />
                    <span>{hintLoading ? "Thinking..." : "Need a hint?"}</span>
                  </button>
                )}
              </div>

              {!isKids && (
                <div className="flex flex-wrap gap-1.5">
                  {["Primary objective", "Constraint analysis", "Tradeoff weighing", "Risk mitigation"].map((d) => (
                    <span key={d} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {d}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <textarea
                  id="reasoning"
                  rows={isKids ? 5 : 7}
                  value={userReasoning}
                  onChange={(e) => setUserReasoning(e.target.value)}
                  disabled={evaluating}
                  placeholder={
                    isKids
                      ? "I think the answer is... because in the story it says... and the clue shows that..."
                      : "Explain your structured recommendation and justification. Address the key constraints, explain why competing alternatives were rejected, and identify what key risk you would actively monitor..."
                  }
                  className={`input text-[15px] leading-relaxed resize-y disabled:bg-slate-50 ${isKids ? "min-h-[150px] rounded-2xl" : "min-h-[170px] rounded-xl"}`}
                />

                <div className="flex justify-between items-center gap-3 text-xs mt-2">
                  {ready ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <Icon name="checkCircle" className="w-3.5 h-3.5" />
                      Ready to submit
                    </span>
                  ) : (
                    <span className="text-slate-500">Minimum {minChars} characters</span>
                  )}
                  <span className="text-slate-400 tabular-nums">
                    {isKids ? `${userReasoning.length} characters` : `${userReasoning.length} / 5,000`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={!ready || evaluating}
                  className="btn btn-primary btn-lg w-full sm:w-auto"
                >
                  {evaluating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isKids ? "Checking your thinking..." : "Evaluating your reasoning..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKids ? "Check my answer" : "Submit answer"}</span>
                      <Icon name="arrowRight" className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChallengeSessionPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="max-w-3xl mx-auto px-4 py-16 text-center">
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
