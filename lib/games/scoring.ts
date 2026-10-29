import type { ChallengeDifficulty, ReasoningEvaluation } from "@/lib/types";
import { GAMES } from "./catalog";
import type { GameResult } from "./types";

const DIFF_TIME_FACTOR: Record<ChallengeDifficulty, number> = { easy: 1, medium: 1.15, hard: 1.3, expert: 1.45 };

/** Clamps untrusted client numbers into a sane result. */
export function sanitizeResult(raw: GameResult): GameResult {
  const n = (v: unknown, min: number, max: number) => {
    const x = Number(v);
    return Number.isFinite(x) ? Math.min(max, Math.max(min, Math.round(x))) : min;
  };
  const total = n(raw.total, 1, 100);
  return {
    gameId: raw.gameId,
    difficulty: raw.difficulty,
    total,
    correct: n(raw.correct, 0, total),
    attempts: n(raw.attempts, 0, 1000),
    mistakes: n(raw.mistakes, 0, 1000),
    timeMs: n(raw.timeMs, 0, 60 * 60 * 1000),
    hintsUsed: n(raw.hintsUsed, 0, 50),
  };
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function computeGameMetrics(r: GameResult) {
  const def = GAMES[r.gameId];
  const accuracy = r.total > 0 ? r.correct / r.total : 0;
  const efficiency = 1 / (1 + r.mistakes / Math.max(1, r.total));
  const targetMs = def.estMinutes * 60_000 * DIFF_TIME_FACTOR[r.difficulty] * 0.75;
  const speed = r.timeMs <= targetMs ? 1 : Math.max(0.3, targetMs / r.timeMs);
  const raw = 10 * (0.65 * accuracy + 0.2 * efficiency + 0.15 * speed) - 0.4 * r.hintsUsed;
  const overall = Math.max(0, Math.min(10, Number(raw.toFixed(1))));
  return { accuracy, efficiency, speed, overall };
}

/** Deterministic score + rule-based review. The AI layer may rewrite the text, never the numbers. */
export function scoreGame(r: GameResult): ReasoningEvaluation {
  const def = GAMES[r.gameId];
  const m = computeGameMetrics(r);
  const kids = def.mode === "kids";
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (m.accuracy >= 0.8) strengths.push(kids ? `Great ${def.skill.toLowerCase()} — you got most of them right` : `Strong ${def.skill.toLowerCase()}: ${r.correct}/${r.total} correct`);
  else if (m.accuracy >= 0.5) strengths.push(kids ? "You kept going and solved more than half" : `Solid foundation in ${def.skill.toLowerCase()}`);
  if (m.efficiency >= 0.8) strengths.push(kids ? "Careful choices with very few wrong taps" : "Disciplined decisions with few wasted attempts");
  if (m.speed >= 0.95) strengths.push(kids ? "Quick and confident" : "Fast, confident execution");
  if (r.hintsUsed === 0) strengths.push(kids ? "Solved it all on your own" : "Worked independently without hints");
  if (strengths.length === 0) strengths.push(kids ? "You finished the whole game — well done for trying" : "Completed the full session");

  if (m.accuracy < 0.8) improvements.push(kids ? "Slow down a little and check before you tap" : "Verify your answer against the rule before committing");
  if (m.efficiency < 0.7) improvements.push(kids ? "Try to look carefully first, then choose" : "Reduce trial-and-error: eliminate options deliberately");
  if (m.speed < 0.7) improvements.push(kids ? "Practice will help you spot things faster" : "Build speed by recognizing common patterns earlier");
  if (r.hintsUsed > 0) improvements.push(kids ? "Next time, try one round before using a hint" : "Attempt a full pass before reaching for a hint");
  if (improvements.length === 0) improvements.push(kids ? "Try the next level for a bigger challenge" : "Move up a difficulty level to keep improving");

  const feedback = kids
    ? m.overall >= 8
      ? `Fantastic work on ${def.name}! Your ${def.skill.toLowerCase()} is really strong.`
      : m.overall >= 5
      ? `Nice job on ${def.name}. A little more care and you'll ace it.`
      : `${def.name} was tricky this time. Every round makes your brain stronger — try again!`
    : m.overall >= 8
    ? `High-quality performance on ${def.name}. Your ${def.skill.toLowerCase()} is consistent under time pressure.`
    : m.overall >= 5
    ? `Competent performance on ${def.name}. Accuracy is the main lever for a higher score.`
    : `${def.name} exposed gaps in ${def.skill.toLowerCase()}. Slow down and apply a systematic strategy.`;

  return {
    overallScore: m.overall,
    decisionQuality: Math.round(m.accuracy * 10),
    logic: Math.round(m.efficiency * 10),
    tradeoffAwareness: Math.round(m.speed * 10),
    clarity: Math.max(0, 10 - r.hintsUsed * 3),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 2),
    feedback,
    missedConsiderations: [],
    idealApproach: def.howTo,
    gameStats: {
      gameId: r.gameId,
      correct: r.correct,
      total: r.total,
      mistakes: r.mistakes,
      attempts: r.attempts,
      timeMs: r.timeMs,
      hintsUsed: r.hintsUsed,
    },
  };
}
