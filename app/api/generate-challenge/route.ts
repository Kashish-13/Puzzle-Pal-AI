import { NextRequest, NextResponse } from "next/server";
import { generateAIChallenge } from "@/lib/ai";
import { ChallengeCategory, ChallengeDifficulty, UserType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validCategories: ChallengeCategory[] = [
      "mystery",
      "business",
      "data",
      "technical",
      "logic",
      "decision",
      "aptitude",
      "word",
      "kids_mystery",
      "kids_brain_teaser",
      "kids_pattern",
      "kids_math",
      "kids_creative",
      "kids_word",
    ];
    const validDifficulties: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];

    const category: ChallengeCategory = validCategories.includes(body.category)
      ? body.category
      : body.userType === "kids"
      ? "kids_mystery"
      : "business";

    const difficulty: ChallengeDifficulty = validDifficulties.includes(body.difficulty)
      ? body.difficulty
      : body.userType === "kids"
      ? "easy"
      : "medium";

    const userType: UserType | undefined = body.userType === "kids" || body.userType === "student"
      ? body.userType
      : undefined;

    const challenge = await generateAIChallenge(category, difficulty, {
      userType,
      ageRange: typeof body.ageRange === "string" ? body.ageRange : undefined,
      academicLevel: typeof body.academicLevel === "string" ? body.academicLevel : undefined,
      interests: Array.isArray(body.interests) ? body.interests : undefined,
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Error in /api/generate-challenge:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating your challenge. Please try again." },
      { status: 500 }
    );
  }
}
