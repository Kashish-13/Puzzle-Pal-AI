import { ChallengeCategory, ChallengeDifficulty } from "@/lib/types";

// Semantic accent tones. Blue = progress, green = success, amber = reward,
// brand = primary/AI, sky = playful accent for Kids mode.
export type Tone = "brand" | "blue" | "green" | "amber" | "sky";

export const TONES: Record<Tone, { soft: string; solid: string; text: string; border: string }> = {
  brand: { soft: "bg-brand-50 text-brand-600", solid: "bg-brand-600", text: "text-brand-600", border: "border-brand-200" },
  blue: { soft: "bg-blue-50 text-blue-600", solid: "bg-blue-500", text: "text-blue-600", border: "border-blue-200" },
  green: { soft: "bg-green-50 text-green-600", solid: "bg-green-500", text: "text-green-600", border: "border-green-200" },
  amber: { soft: "bg-amber-50 text-amber-600", solid: "bg-amber-500", text: "text-amber-600", border: "border-amber-200" },
  sky: { soft: "bg-sky-50 text-sky-600", solid: "bg-sky-500", text: "text-sky-600", border: "border-sky-200" },
};

export const CATEGORY_TONE: Record<ChallengeCategory, Tone> = {
  business: "blue",
  technical: "brand",
  data: "green",
  logic: "brand",
  mystery: "amber",
  decision: "blue",
  aptitude: "green",
  word: "sky",
  kids_mystery: "amber",
  kids_brain_teaser: "brand",
  kids_pattern: "sky",
  kids_math: "blue",
  kids_creative: "amber",
  kids_word: "green",
};

export const DIFFICULTY_TONE: Record<ChallengeDifficulty, Tone> = {
  easy: "green",
  medium: "blue",
  hard: "amber",
  expert: "brand",
};

export const DIFFICULTY_XP: Record<ChallengeDifficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 150,
  expert: 200,
};
