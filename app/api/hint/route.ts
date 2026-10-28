import { NextRequest, NextResponse } from "next/server";
import { generateAIHint } from "@/lib/ai";
import { Challenge } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { challenge, userReasoning } = body;

    if (!challenge) {
      return NextResponse.json(
        { hint: "Examine the primary constraints and identify which assumption carries the highest operational risk." },
        { status: 200 }
      );
    }

    const hint = await generateAIHint(challenge as Challenge, userReasoning);
    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Error in /api/hint:", error);
    return NextResponse.json(
      { hint: "Break the problem down into immediate impacts versus second-order consequences." },
      { status: 200 }
    );
  }
}
