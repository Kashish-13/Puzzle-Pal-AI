import { Timestamp } from "firebase/firestore";

export type UserType = "kids" | "student";

export type ChallengeCategory =
  // Student & General Categories
  | "mystery"
  | "business"
  | "data"
  | "technical"
  | "logic"
  | "decision"
  | "aptitude"
  | "word"
  // Kids Categories
  | "kids_mystery"
  | "kids_brain_teaser"
  | "kids_pattern"
  | "kids_math"
  | "kids_creative"
  | "kids_word"
  // Interactive games (current library) — older categories above are kept for history
  | "color-detective"
  | "whats-behind"
  | "odd-one"
  | "shadow-guess"
  | "memory-match"
  | "where-belongs"
  | "what-changed"
  | "number-hunt"
  | "crack-code"
  | "tile-path"
  | "memory-grid"
  | "rotate-it"
  | "escape-grid"
  | "sudocode"
  | "spot-change";

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "expert";

export interface CodeSnippet {
  language: "python" | "javascript" | "typescript" | "sql";
  code: string;
}

export interface DataTable {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
}

export interface Challenge {
  id?: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  userType?: UserType;
  scenario: string;
  question: string;
  context?: string;
  constraints?: string[];
  codeSnippet?: CodeSnippet;
  dataTable?: DataTable;
  expectedReasoningPoints?: string[];
  hint?: string;
  hints?: string[];
  estimatedTime: number; // in minutes
}

export interface ReasoningEvaluation {
  overallScore: number; // e.g. 8.4 out of 10
  decisionQuality: number; // 0 - 10
  logic: number; // 0 - 10
  tradeoffAwareness: number; // 0 - 10
  clarity: number; // 0 - 10
  strengths: string[];
  improvements: string[];
  feedback: string;
  missedConsiderations: string[];
  idealApproach: string;
  /** Present for interactive games: the measured performance behind the score */
  gameStats?: GameStats;
}

export interface GameStats {
  gameId: string;
  correct: number;
  total: number;
  mistakes: number;
  attempts: number;
  timeMs: number;
  hintsUsed: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  categoryRequirement?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  userType?: UserType | null;
  ageRange?: string; // For kids: '8-10', '11-13', '14-16'
  academicLevel?: string; // For students: 'High School', 'College / Undergrad', 'Early Career'
  interests?: string[];
  onboardingCompleted?: boolean;
  xp: number;
  level: number;
  reasoningScore: number; // Average reasoning score (e.g. 8.2)
  challengesSolved: number;
  currentStreak: number;
  currentDifficulty: ChallengeDifficulty;
  totalHints: number;
  badges?: string[];
  lastCompletedDate?: string | null;
  aiInsight?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ChallengeHistoryRecord {
  id?: string;
  challengeId?: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  userType?: UserType;
  score: number;
  xpEarned: number;
  reasoning: string;
  feedback: string;
  evaluation: ReasoningEvaluation;
  hintsUsed: number;
  completedAt: Timestamp | null;
}

export interface CategoryStrength {
  category: ChallengeCategory;
  displayName: string;
  averageScore: number;
  count: number;
  icon: string;
}
