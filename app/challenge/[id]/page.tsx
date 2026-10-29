"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import GameSessionPage from "@/components/games/GameSessionPage";
import LoadingState from "@/components/LoadingState";

function GameFromParams() {
  const params = useParams<{ id: string }>();
  return <GameSessionPage forcedGame={params?.id} />;
}

/** /challenge/[id] — the id is a game id (e.g. /challenge/tile-path). */
export default function DynamicChallengePage() {
  return (
    <Suspense fallback={<div className="py-16"><LoadingState message="Loading puzzle..." size="lg" /></div>}>
      <GameFromParams />
    </Suspense>
  );
}
