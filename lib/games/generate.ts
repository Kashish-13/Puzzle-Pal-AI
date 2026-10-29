import type { ChallengeDifficulty } from "@/lib/types";
import { createRng } from "./rng";
import type { GameConfig, GameId, GameSession } from "./types";
import * as kids from "./generators/kids";
import * as student from "./generators/student";

/** Builds a playable, fully-validated session for a game at a difficulty. */
export function generateGame(gameId: GameId, difficulty: ChallengeDifficulty, seed: number): GameSession {
  const rng = createRng(seed);
  let config: GameConfig;
  switch (gameId) {
    case "color-detective": config = { gameId, rounds: kids.colorDetective(rng, difficulty) }; break;
    case "whats-behind": config = { gameId, rounds: kids.whatsBehind(rng, difficulty) }; break;
    case "odd-one": config = { gameId, rounds: kids.oddOne(rng, difficulty) }; break;
    case "shadow-guess": config = { gameId, rounds: kids.shadowGuess(rng, difficulty) }; break;
    case "memory-match": config = { gameId, rounds: kids.memoryMatch(rng, difficulty) }; break;
    case "where-belongs": config = { gameId, rounds: kids.whereBelongs(rng, difficulty) }; break;
    case "what-changed": config = { gameId, rounds: kids.whatChanged(rng, difficulty) }; break;
    case "number-hunt": config = { gameId, rounds: kids.numberHunt(rng, difficulty) }; break;
    case "crack-code": config = { gameId, rounds: student.crackCode(rng, difficulty) }; break;
    case "tile-path": config = { gameId, rounds: student.tilePath(rng, difficulty) }; break;
    case "memory-grid": config = { gameId, rounds: student.memoryGrid(rng, difficulty) }; break;
    case "rotate-it": config = { gameId, rounds: student.rotateIt(rng, difficulty) }; break;
    case "escape-grid": config = { gameId, rounds: student.escapeGrid(rng, difficulty) }; break;
    case "sudocode": config = { gameId, rounds: student.sudocode(rng, difficulty) }; break;
    case "spot-change": config = { gameId, rounds: student.spotChange(rng, difficulty) }; break;
  }
  return { ...config, difficulty, seed };
}
