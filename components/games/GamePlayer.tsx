"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChallengeDifficulty, ReasoningEvaluation } from "@/lib/types";
import type { GameId, GameOutcome, GameResult, GameSession } from "@/lib/games/types";
import { GAMES } from "@/lib/games/catalog";
import { formatDuration, scoreGame } from "@/lib/games/scoring";
import { useAuth } from "@/lib/auth";
import { recordChallengeResult, AVAILABLE_BADGES } from "@/lib/firestore";
import Icon, { CategoryIcon } from "@/components/Icon";
import DifficultyBadge from "@/components/DifficultyBadge";
import { CATEGORY_TONE, DIFFICULTY_XP, TONES } from "@/components/tokens";
import ChallengePreview from "./ChallengePreview";
import ResultCard from "./ResultCard";
import { GAME_COMPONENTS } from "./registry";
import type { GameProgress } from "./kit";

const DIFFICULTIES: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];

type Phase = "intro" | "playing" | "evaluating" | "done";

export default function GamePlayer({
  gameId,
  initialDifficulty,
}: {
  gameId: GameId;
  initialDifficulty: ChallengeDifficulty;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const game = GAMES[gameId];
  const playful = game.mode === "kids";
  const tone = TONES[CATEGORY_TONE[gameId] || "brand"];

  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>(initialDifficulty);
  const [nonce, setNonce] = useState(0);
  const requestKey = `${gameId}|${difficulty}|${nonce}`;
  const [loaded, setLoaded] = useState<{ key: string; session: GameSession } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [hintRounds, setHintRounds] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const [result, setResult] = useState<{
    evaluation: ReasoningEvaluation;
    xpEarned?: number;
    nextDifficulty?: ChallengeDifficulty;
    newBadges: string[];
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Generate a fresh session whenever game, difficulty or "play again" changes
  useEffect(() => {
    let ignore = false;
    fetch("/api/generate-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, difficulty }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to generate game");
        return res.json();
      })
      .then((session: GameSession) => {
        if (!ignore) setLoaded({ key: requestKey, session });
      })
      .catch(() => {
        if (!ignore) setFailedKey(requestKey);
      });
    return () => {
      ignore = true;
    };
  }, [gameId, difficulty, requestKey]);

  // Visible timer while playing
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const session = loaded && loaded.key === requestKey ? loaded.session : null;
  const failed = failedKey === requestKey && !session;

  const resetForNewSession = (nextDifficulty: ChallengeDifficulty) => {
    setDifficulty(nextDifficulty);
    setNonce((n) => n + 1);
    setPhase("intro");
    setProgress(null);
    setHintRounds([]);
    setElapsed(0);
    setResult(null);
    setSaveError(null);
  };

  const start = () => {
    if (!session) return;
    startedAt.current = Date.now();
    setElapsed(0);
    setProgress({ round: 0, total: session.rounds.length, correct: 0, mistakes: 0 });
    setPhase("playing");
  };

  const finish = async (outcome: GameOutcome) => {
    if (!session) return;
    const timeMs = Date.now() - startedAt.current;
    setElapsed(timeMs);
    setPhase("evaluating");
    const gameResult: GameResult = { ...outcome, gameId, difficulty, timeMs, hintsUsed: hintRounds.length };

    let evaluation: ReasoningEvaluation;
    try {
      const res = await fetch("/api/evaluate-reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameResult }),
      });
      if (!res.ok) throw new Error("evaluation failed");
      evaluation = await res.json();
    } catch {
      evaluation = scoreGame(gameResult);
    }

    let xpEarned: number | undefined;
    let nextDifficulty: ChallengeDifficulty | undefined;
    let newBadges: string[] = [];
    if (user) {
      try {
        const saved = await recordChallengeResult(user.uid, {
          challengeId: `${gameId}-${session.seed}`,
          title: game.name,
          category: gameId,
          difficulty,
          userType: profile?.userType || undefined,
          evaluation,
          reasoning: `${outcome.correct}/${outcome.total} correct · ${outcome.mistakes} wrong attempts · ${formatDuration(timeMs)} · ${hintRounds.length} hint${hintRounds.length === 1 ? "" : "s"}`,
          hintsUsed: hintRounds.length,
        });
        xpEarned = saved.xpEarned;
        nextDifficulty = saved.newDifficulty;
        newBadges = saved.newBadges;
        await refreshProfile();
      } catch (err) {
        console.error("Failed to save game result:", err);
        setSaveError("Your result couldn't be saved. Check your connection — your score is shown below.");
      }
    }
    setResult({ evaluation, xpEarned, nextDifficulty, newBadges });
    setPhase("done");
  };

  const revealHint = () => {
    if (!progress || hintRounds.includes(progress.round)) return;
    setHintRounds([...hintRounds, progress.round]);
  };

  const Game = GAME_COMPONENTS[gameId];
  const currentHint = session && progress ? session.rounds[Math.min(progress.round, session.rounds.length - 1)]?.hint : undefined;
  const hintVisible = progress !== null && hintRounds.includes(progress.round);
  const radius = playful ? "rounded-3xl" : "rounded-2xl";

  /* ---------- Loading / error ---------- */
  if (failed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div role="alert" className="panel p-6 text-center">
          <Icon name="alertCircle" className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="mt-3 text-sm text-slate-700">We couldn&apos;t set up this game. Please try again.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => resetForNewSession(difficulty)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/challenge" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink transition-colors">
          <Icon name="arrowLeft" className="w-4 h-4" />
          {playful ? "All puzzles" : "Puzzle library"}
        </Link>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${tone.soft}`}>
            <CategoryIcon category={gameId} className="w-3.5 h-3.5" />
            {game.name}
          </span>
          <DifficultyBadge difficulty={difficulty} size="sm" />
        </div>
      </div>

      {/* INTRO */}
      {phase === "intro" && (
        <div className={`panel ${radius} overflow-hidden page-enter`}>
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className={`md:col-span-2 min-h-56 relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${playful ? "from-sky-50 via-white to-amber-50" : "from-brand-50 via-white to-blue-50"} border-b md:border-b-0 md:border-r border-slate-100`}>
              <div className="absolute inset-0 dots opacity-70 [mask-image:radial-gradient(65%_65%_at_50%_50%,#000,transparent)]" aria-hidden="true" />
              <div className="relative scale-125 animate-pop">
                <ChallengePreview gameId={gameId} />
              </div>
            </div>
            <div className="md:col-span-3 p-6 sm:p-8">
              <p className="eyebrow">{game.skill}</p>
              <h1 className={`mt-2 font-semibold tracking-tight text-ink ${playful ? "text-3xl" : "text-2xl sm:text-3xl"}`}>{game.name}</h1>
              <p className="mt-2 text-slate-500 leading-relaxed">{game.description}</p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 flex items-start gap-3">
                <Icon name="play" className="w-4 h-4 mt-0.5 text-brand-600" />
                <p className="text-sm text-slate-700">{game.howTo}</p>
              </div>

              <div className="mt-6">
                <span className="label">Difficulty</span>
                <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Difficulty">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={difficulty === d}
                      onClick={() => d !== difficulty && resetForNewSession(d)}
                      className={`rounded-lg px-2 py-2 text-center transition-all ${difficulty === d ? "bg-white shadow-card" : "hover:bg-white/60"}`}
                    >
                      <span className={`block text-sm font-medium capitalize ${difficulty === d ? "text-ink" : "text-slate-600"}`}>{d}</span>
                      <span className="block text-[11px] text-amber-600 tabular-nums">+{DIFFICULTY_XP[d]} XP</span>
                    </button>
                  ))}
                </div>
                {profile?.currentDifficulty && (
                  <p className="mt-2 text-xs text-slate-500">
                    Your adaptive level is <span className="capitalize font-medium text-slate-700">{profile.currentDifficulty}</span>, based on your recent scores.
                  </p>
                )}
              </div>

              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
                <button type="button" onClick={start} disabled={!session} className="btn btn-primary btn-lg">
                  {session ? (
                    <>
                      <Icon name="play" className="w-4 h-4" filled /> Start
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Preparing puzzle…
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <Icon name="sparkles" className="w-3.5 h-3.5 text-brand-500" />
                  AI reviews your reasoning when you finish
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {(phase === "playing" || phase === "evaluating") && session && progress && (
        <div className="space-y-4">
          {/* Game controls bar */}
          <div className={`panel ${radius} px-4 py-3 sm:px-5 flex flex-wrap items-center gap-x-6 gap-y-3 bg-white/90 backdrop-blur sticky top-[72px] z-20`}>
            <div className="flex-1 min-w-40">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>
                  {gameId === "memory-match" ? "Pairs" : "Round"}{" "}
                  <span className="font-semibold text-ink tabular-nums">
                    {Math.min(progress.round + (gameId === "memory-match" ? 0 : 1), progress.total)}
                  </span>{" "}
                  of {progress.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${(Math.min(progress.round, progress.total) / progress.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-green-700" title="Correct">
                <Icon name="checkCircle" className="w-4 h-4" />
                <span className="tabular-nums font-medium">{progress.correct}</span>
                <span className="sr-only">correct</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-600" title="Wrong attempts">
                <Icon name="x" className="w-4 h-4" />
                <span className="tabular-nums font-medium">{progress.mistakes}</span>
                <span className="sr-only">wrong attempts</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600" title="Time">
                <Icon name="clock" className="w-4 h-4" />
                <span className="tabular-nums font-medium font-mono">{formatDuration(elapsed)}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={revealHint}
              disabled={hintVisible || phase !== "playing"}
              className="btn btn-sm border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
            >
              <Icon name="sparkles" className="w-4 h-4" />
              {hintVisible ? "Hint shown" : "Hint"}
            </button>
          </div>

          {hintVisible && currentHint && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 flex items-start gap-3 animate-fade-up" aria-live="polite">
              <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Icon name="sparkles" className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">AI hint</p>
                <p className="text-sm text-slate-700 mt-0.5">{currentHint}</p>
              </div>
            </div>
          )}

          <div className={`panel ${radius} p-5 sm:p-8 relative ${playful ? "bg-[linear-gradient(180deg,rgba(14,165,233,0.06),#fff_42%)]" : "bg-[linear-gradient(180deg,rgba(91,75,255,0.04),#fff_38%)]"}`}>
            <Game
              key={requestKey}
              rounds={session.rounds}
              playful={playful}
              onProgress={setProgress}
              onComplete={finish}
            />
            {phase === "evaluating" && (
              <div className={`absolute inset-0 ${radius} bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-fade-up`} role="status">
                <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Icon name="sparkles" className="w-5 h-5" />
                </span>
                <p className="text-sm font-medium text-ink">Analyzing your reasoning…</p>
                <div className="w-40 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-1/2 bg-brand-600 rounded-full animate-[slide_1.1s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === "done" && result && (
        <div className="space-y-4">
          {saveError && (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
              <Icon name="alertCircle" className="w-4 h-4 mt-0.5" /> {saveError}
            </div>
          )}
          {result.newBadges.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4 animate-pop">
              <span className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Icon name="trophy" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{playful ? "New trophy unlocked!" : "Achievement unlocked"}</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {result.newBadges.map((id) => AVAILABLE_BADGES.find((b) => b.id === id)?.name || id).join(", ")}
                </p>
              </div>
            </div>
          )}
          <ResultCard
            evaluation={result.evaluation}
            difficulty={difficulty}
            xpEarned={result.xpEarned}
            nextDifficulty={result.nextDifficulty}
            onPlayAgain={() => resetForNewSession(difficulty)}
            onNext={() => resetForNewSession(result.nextDifficulty ?? difficulty)}
          />
        </div>
      )}
    </div>
  );
}
