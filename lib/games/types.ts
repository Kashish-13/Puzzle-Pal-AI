import type { ChallengeDifficulty, UserType } from "@/lib/types";

export type KidsGameId =
  | "color-detective"
  | "whats-behind"
  | "odd-one"
  | "shadow-guess"
  | "memory-match"
  | "where-belongs"
  | "what-changed"
  | "number-hunt";

export type StudentGameId =
  | "crack-code"
  | "tile-path"
  | "memory-grid"
  | "rotate-it"
  | "escape-grid"
  | "sudocode"
  | "spot-change";

export type GameId = KidsGameId | StudentGameId;

export type InteractionType = "choice" | "grid" | "memory" | "spatial" | "sequence" | "compare" | "search";

export interface GameDefinition {
  id: GameId;
  name: string;
  mode: UserType;
  tagline: string;
  description: string;
  skill: string;
  interaction: InteractionType;
  /** Typical session length in minutes */
  estMinutes: number;
  /** One-line "how to play" shown on the game screen */
  howTo: string;
}

/* ---------- Shared building blocks ---------- */

export type ShapeKind = "circle" | "square" | "triangle" | "diamond" | "hexagon" | "star";

export interface ShapeItem {
  shape: ShapeKind;
  color: string;
  rotation?: number;
  scale?: number;
}

/** Object ids are rendered by components/games/glyphs.tsx */
export type ObjectId =
  | "sun" | "moon" | "star" | "cloud"
  | "tree" | "leaf" | "flower"
  | "book" | "pencil" | "ruler"
  | "apple" | "cup" | "egg"
  | "fish" | "anchor" | "wave"
  | "note" | "bell" | "drum"
  | "house" | "key" | "heart"
  | "car" | "bike" | "umbrella";

export interface PlacedItem {
  id: string;
  x: number; // 0..100
  y: number; // 0..100
  kind: { type: "shape"; shape: ShapeKind } | { type: "object"; object: ObjectId };
  color: string;
  size: number; // relative, ~8..18
  rotation: number;
}

/* ---------- Per-game configs ---------- */

export interface RoundBase {
  hint: string;
  explanation?: string;
}

export interface ColorRound extends RoundBase {
  kind: "name-to-swatch" | "swatch-to-name" | "mix" | "stroop";
  prompt: string;
  /** Display: a word (optionally in an ink color) or a swatch, or two swatches to mix */
  word?: string;
  ink?: string;
  swatch?: string;
  mix?: [string, string];
  options: { label?: string; hex?: string }[];
  answer: number;
}

export interface ObjectChoiceRound extends RoundBase {
  target: ObjectId;
  targetColor: string;
  options: ObjectId[];
  answer: number;
  /** Whats-behind: how long the object is shown, in ms */
  previewMs?: number;
}

export interface OddOneRound extends RoundBase {
  cols: number;
  items: ShapeItem[];
  answer: number;
}

export interface BelongRound extends RoundBase {
  object: ObjectId;
  color: string;
  bins: { id: string; label: string; icon: ObjectId }[];
  answer: number;
}

export interface CompareRound extends RoundBase {
  left: PlacedItem[];
  right: PlacedItem[];
  changedIds: string[];
  /** Kids use a tidy grid layout; students get free-form scenes */
  layout: "grid" | "scene";
}

export interface NumberHuntRound extends RoundBase {
  cols: number;
  cells: string[];
  target: string;
  /** Indices of every cell that must be found */
  targets: number[];
}

export interface CodeRound extends RoundBase {
  kind: "predict" | "missing" | "bug" | "arrange";
  lines: string[];
  prompt: string;
  /** predict / missing: option labels; arrange: shuffled block labels */
  options: string[];
  /** predict/missing: option index; bug: line index; arrange: correct order of option indices */
  answer: number | number[];
  blankLine?: number;
}

export interface SequenceRound extends RoundBase {
  terms: string[];
  options: string[];
  answer: number;
}

export interface RotateRound extends RoundBase {
  target: [number, number][];
  options: [number, number][][];
  answer: number;
  allowPreviewRotate: boolean;
}

export interface MemoryGridRound extends RoundBase {
  size: number;
  cells: number[];
  previewMs: number;
}

export interface TileBoard extends RoundBase {
  size: number;
  blocked: number[];
  start: number;
  end: number;
  shortest: number;
  moveLimit: number | null;
}

export type EscapeTile = "floor" | "wall" | "door" | "key" | "switch" | "gate" | "exit";

export interface EscapeBoard extends RoundBase {
  size: number;
  tiles: EscapeTile[];
  start: number;
  optimal: number;
  moveLimit: number | null;
}

export interface MemoryMatchConfig extends RoundBase {
  cards: { object: ObjectId; color: string }[];
  pairs: number;
}

export type GameConfig =
  | { gameId: "color-detective"; rounds: ColorRound[] }
  | { gameId: "whats-behind"; rounds: ObjectChoiceRound[] }
  | { gameId: "odd-one"; rounds: OddOneRound[] }
  | { gameId: "shadow-guess"; rounds: ObjectChoiceRound[] }
  | { gameId: "memory-match"; rounds: MemoryMatchConfig[] }
  | { gameId: "where-belongs"; rounds: BelongRound[] }
  | { gameId: "what-changed"; rounds: CompareRound[] }
  | { gameId: "number-hunt"; rounds: NumberHuntRound[] }
  | { gameId: "crack-code"; rounds: SequenceRound[] }
  | { gameId: "tile-path"; rounds: TileBoard[] }
  | { gameId: "memory-grid"; rounds: MemoryGridRound[] }
  | { gameId: "rotate-it"; rounds: RotateRound[] }
  | { gameId: "escape-grid"; rounds: EscapeBoard[] }
  | { gameId: "sudocode"; rounds: CodeRound[] }
  | { gameId: "spot-change"; rounds: CompareRound[] };

export type GameSession = GameConfig & {
  difficulty: ChallengeDifficulty;
  seed: number;
};

/** What a game reports back when the player finishes */
export interface GameOutcome {
  correct: number;
  total: number;
  attempts: number;
  mistakes: number;
}

export interface GameResult extends GameOutcome {
  gameId: GameId;
  difficulty: ChallengeDifficulty;
  timeMs: number;
  hintsUsed: number;
}
