import React from "react";
import Link from "next/link";
import type { ChallengeDifficulty } from "@/lib/types";
import type { GameId } from "@/lib/games/types";
import { GAMES } from "@/lib/games/catalog";
import Icon, { CategoryIcon } from "@/components/Icon";
import DifficultyBadge from "@/components/DifficultyBadge";
import { CATEGORY_TONE, TONES } from "@/components/tokens";
import ChallengePreview from "./ChallengePreview";

export interface GameStatsSummary {
  plays: number;
  best: number;
}

const PREVIEW_BG: Record<string, string> = {
  brand: "from-brand-50 to-white",
  blue: "from-blue-50 to-white",
  green: "from-green-50 to-white",
  amber: "from-amber-50 to-white",
  sky: "from-sky-50 to-white",
};

/** Visual game card: preview, name, description, difficulty/XP, progress and CTA. */
export default function ChallengeCard({
  gameId,
  difficulty,
  stats,
  playful = false,
}: {
  gameId: GameId;
  difficulty: ChallengeDifficulty;
  stats?: GameStatsSummary;
  playful?: boolean;
}) {
  const game = GAMES[gameId];
  const toneKey = CATEGORY_TONE[gameId] || "brand";
  const tone = TONES[toneKey];
  const played = stats && stats.plays > 0;

  return (
    <Link
      href={`/challenge/session?game=${gameId}&difficulty=${difficulty}`}
      className={`group panel card-interactive overflow-hidden flex flex-col ${playful ? "rounded-3xl" : ""}`}
    >
      <div className={`relative h-36 bg-gradient-to-b ${PREVIEW_BG[toneKey]} border-b border-slate-100 flex items-center justify-center`}>
        <div className="transition-transform duration-300 group-hover:scale-[1.04]">
          <ChallengePreview gameId={gameId} />
        </div>
        {played && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
            <Icon name="checkCircle" className="w-3 h-3" />
            Best {stats!.best.toFixed(1)}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${tone.soft}`}>
            <CategoryIcon category={gameId} className="w-3.5 h-3.5" />
            {game.skill}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Icon name="clock" className="w-3.5 h-3.5" />
            {game.estMinutes} min
          </span>
        </div>
        <h3 className={`mt-3 font-semibold text-ink ${playful ? "text-lg" : "text-base"}`}>{game.name}</h3>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed flex-1">{game.description}</p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <DifficultyBadge difficulty={difficulty} size="sm" />
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            {played ? `Play again · ${stats!.plays}` : "Play"}
            <Icon name="arrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
