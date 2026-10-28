import { NextRequest, NextResponse } from "next/server";
import { evaluateAIReasoning } from "@/lib/ai";
import { Challenge } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
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
