import type { ComponentType } from "react";
import type { GameId } from "@/lib/games/types";
import type { GameProps } from "./kit";
import ColorDetective from "./kids/ColorDetective";
import WhatsBehind from "./kids/WhatsBehind";
import OddOne from "./kids/OddOne";
import ShadowGuess from "./kids/ShadowGuess";
import MemoryMatch from "./kids/MemoryMatch";
import WhereBelongs from "./kids/WhereBelongs";
import NumberHunt from "./kids/NumberHunt";
import ComparePanels from "./ComparePanels";
import CrackCode from "./student/CrackCode";
import TilePath from "./student/TilePath";
import MemoryGrid from "./student/MemoryGrid";
import RotateIt from "./student/RotateIt";
import EscapeGrid from "./student/EscapeGrid";
import SudoCode from "./student/SudoCode";

/** Game id → its interactive board. "What Changed?" and "Spot the Change" share one engine. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps<any>>> = {
  "color-detective": ColorDetective,
  "whats-behind": WhatsBehind,
  "odd-one": OddOne,
  "shadow-guess": ShadowGuess,
  "memory-match": MemoryMatch,
  "where-belongs": WhereBelongs,
  "what-changed": ComparePanels,
  "number-hunt": NumberHunt,
  "crack-code": CrackCode,
  "tile-path": TilePath,
  "memory-grid": MemoryGrid,
  "rotate-it": RotateIt,
  "escape-grid": EscapeGrid,
  sudocode: SudoCode,
  "spot-change": ComparePanels,
};
