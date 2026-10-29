"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/lib/auth";
import { GAMES, gamesForMode, isGameId } from "@/lib/games/catalog";
import type { ChallengeDifficulty } from "@/lib/types";
import GamePlayer from "./GamePlayer";

const DIFFICULTIES: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];

function SessionContent({ forcedGame }: { forcedGame?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();

  // ?game=…, or a game id passed as /challenge/[id] or ?category=…
  const candidates = [forcedGame, params.get("game"), params.get("category")];
  const gameId = candidates.find(isGameId) ?? null;
  const qDifficulty = params.get("difficulty") as ChallengeDifficulty | null;
  const difficulty: ChallengeDifficulty =
    qDifficulty && DIFFICULTIES.includes(qDifficulty) ? qDifficulty : profile?.currentDifficulty || "medium";

  // Older links (retired text-challenge categories) have no game — send them to the library
  useEffect(() => {
    if (!gameId) router.replace("/challenge");
  }, [gameId, router]);

  if (!gameId) {
    return (
      <div className="py-16">
        <LoadingState message="Opening the puzzle library..." />
      </div>
    );
  }

  const outOfMode = profile?.userType && !gamesForMode(profile.userType).includes(gameId);

  return (
    <>
      {outOfMode && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            {GAMES[gameId].name} is part of the {GAMES[gameId].mode === "kids" ? "Kids" : "Student"} library. You can still play it here.
          </p>
        </div>
      )}
      <GamePlayer key={`${gameId}-${difficulty}`} gameId={gameId} initialDifficulty={difficulty} />
    </>
  );
}

/** Full page shell for playing a game: auth guard, navbar, and the player. */
export default function GameSessionPage({ forcedGame }: { forcedGame?: string }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="py-16">
                <LoadingState message="Loading puzzle..." size="lg" />
              </div>
            }
          >
            <SessionContent forcedGame={forcedGame} />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
