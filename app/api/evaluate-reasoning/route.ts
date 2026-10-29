import { NextRequest, NextResponse } from "next/server";
import { evaluateAIReasoning, evaluateGamePerformance } from "@/lib/ai";
import { Challenge, ChallengeDifficulty } from "@/lib/types";
import { isGameId } from "@/lib/games/catalog";
import { sanitizeResult } from "@/lib/games/scoring";
import type { GameResult } from "@/lib/games/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Interactive games: score from measured performance, AI writes the review
    if (body.gameResult) {
      const raw = body.gameResult as GameResult;
      const difficulties: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];
      if (!isGameId(raw.gameId) || !difficulties.includes(raw.difficulty)) {
        return NextResponse.json({ error: "Invalid game result." }, { status: 400 });
      }
      const evaluation = await evaluateGamePerformance(sanitizeResult(raw));
      return NextResponse.json(evaluation);
    }

    const { challenge, userReasoning } = body;

    if (!challenge || typeof userReasoning !== "string") {
      return NextResponse.json(
        { error: "Invalid payload. Both challenge and userReasoning are required." },
        { status: 400 }
      );
    }

    const trimmed = userReasoning.trim();
    if (trimmed.length < 5) {
      return NextResponse.json(
        { error: "Please enter an explanation of your reasoning before submitting." },
        { status: 400 }
      );
    }

    if (trimmed.length > 5000) {
      return NextResponse.json(
        { error: "Reasoning submission exceeds maximum limit of 5,000 characters." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateAIReasoning(challenge as Challenge, trimmed);
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error in /api/evaluate-reasoning:", error);
    const msg = error instanceof Error ? error.message : "Unable to evaluate your reasoning right now. Please try again.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
