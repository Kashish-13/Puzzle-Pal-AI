import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeHistoryRecord,
  ReasoningEvaluation,
  UserProfile,
  CategoryStrength,
  UserType,
  Badge,
} from "./types";

export type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeHistoryRecord,
  ReasoningEvaluation,
  UserProfile,
  CategoryStrength,
  UserType,
  Badge,
};

export const CATEGORY_INFO: Record<
  ChallengeCategory,
  { name: string; icon: string; description: string; preview: string; audience: "student" | "kids" | "all" }
> = {
  // Student & Core Categories
  business: {
    name: "Business Decisions",
    icon: "📈",
    description: "Startup prioritization, product tradeoffs, unit economics, and strategic growth dilemmas.",
    preview: "Navigate realistic business trade-offs and defend your executive decisions.",
    audience: "student",
  },
  technical: {
    name: "Technical Challenges",
    icon: "💻",
    description: "Debugging code, system design bottlenecks, architecture tradeoffs, and algorithm analysis.",
    preview: "Diagnose architectural failures and pinpoint complex logic bugs.",
    audience: "student",
  },
  data: {
    name: "Data Reasoning",
    icon: "📊",
    description: "Small datasets, metric dashboards, churn anomalies, and business metric interpretation.",
    preview: "Analyze performance tables and uncover hidden trends or anomalies.",
    audience: "student",
  },
  logic: {
    name: "Logic & Lateral Thinking",
    icon: "🧩",
    description: "Multi-variable constraints, sequencing, probabilistic deduction, and game theory.",
    preview: "Solve rigorous constraint puzzles that test deductive clarity.",
    audience: "all",
  },
  mystery: {
    name: "Mystery & Deduction",
    icon: "🔍",
    description: "Analyzing forensic clues, witness testimonies, and eliminating impossible timelines.",
    preview: "Unravel sophisticated investigative mysteries through deductive reasoning.",
    audience: "all",
  },
  decision: {
    name: "Decision Making",
    icon: "🎯",
    description: "High-stakes crisis response, incomplete information, risk mitigation, and ethical tradeoffs.",
    preview: "Make critical decisions under uncertainty and defend your rationale.",
    audience: "student",
  },
  aptitude: {
    name: "Light Aptitude",
    icon: "🔢",
    description: "Coding-decoding, blood relations, number sequences, and analytical reasoning for placement prep.",
    preview: "Tackle placement-style reasoning and quick deduction patterns.",
    audience: "student",
  },
  word: {
    name: "Verbal Reasoning",
    icon: "🔤",
    description: "Critical reading, nuance evaluation, vocabulary deduction, and logical syllogisms.",
    preview: "Deconstruct textual arguments and evaluate subtle verbal nuances.",
    audience: "student",
  },

  // Kids Categories
  kids_mystery: {
    name: "Detective & Mystery",
    icon: "🕵️",
    description: "Fun detective cases, missing item clues, secret suspects, and footprint mysteries.",
    preview: "Put on your detective hat and find out who took the missing trophy!",
    audience: "kids",
  },
  kids_brain_teaser: {
    name: "Brain Teasers & Riddles",
    icon: "⚡",
    description: "Clever riddles, tricky questions, and fun mind-benders that make you think outside the box.",
    preview: "Crack playful riddles that have surprising and clever answers.",
    audience: "kids",
  },
  kids_pattern: {
    name: "Patterns & Sequences",
    icon: "🌀",
    description: "Color codes, shape sequences, clock puzzles, and spotting the hidden pattern.",
    preview: "Discover the secret rule that connects the shapes and numbers.",
    audience: "kids",
  },
  kids_math: {
    name: "Fun Math Puzzles",
    icon: "🔢",
    description: "Playful math mysteries, magic squares, pizza fraction dilemmas, and animal counts.",
    preview: "Use clever math tricks to balance scales and solve playful mysteries.",
    audience: "kids",
  },
  kids_creative: {
    name: "Creative Thinking",
    icon: "💡",
    description: "Inventive solutions, island survival questions, wacky inventions, and 'what-if' fun.",
    preview: "Invent unusual solutions to fun challenges where imagination is key.",
    audience: "kids",
  },
  kids_word: {
    name: "Word Games",
    icon: "🔤",
    description: "Secret anagrams, word ladders, hidden rhymes, and language mystery codes.",
    preview: "Decode secret messages and build clever word bridges.",
    audience: "kids",
  },
};

export const STUDENT_CATEGORIES: ChallengeCategory[] = [
  "business",
  "technical",
  "data",
  "logic",
  "mystery",
  "decision",
  "aptitude",
  "word",
];

export const KIDS_CATEGORIES: ChallengeCategory[] = [
  "kids_mystery",
  "kids_brain_teaser",
  "kids_pattern",
  "kids_math",
  "kids_creative",
  "kids_word",
];

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_solve",
    name: "First Spark",
    icon: "🌟",
    description: "Solved your first AI reasoning challenge",
  },
  {
    id: "high_score",
    name: "Mastermind",
    icon: "🧠",
    description: "Achieved an outstanding 9.0+ reasoning score",
  },
  {
    id: "streak_3",
    name: "Momentum",
    icon: "🔥",
    description: "Maintained a 3-day active thinking streak",
  },
  {
    id: "streak_7",
    name: "Unstoppable",
    icon: "⚡",
    description: "Maintained a 7-day active thinking streak",
  },
  {
    id: "level_2",
    name: "Curious Mind",
    icon: "🚀",
    description: "Ascended to Level 2 (500+ XP)",
  },
  {
    id: "level_3",
    name: "Problem Solver",
    icon: "🏆",
    description: "Reached Level 3 (1200+ XP)",
  },
  {
    id: "level_5",
    name: "Grand Strategist",
    icon: "👑",
    description: "Reached Level 5 (3000+ XP)",
  },
  {
    id: "clean_solve",
    name: "Sharp Instinct",
    icon: "🎯",
    description: "Solved a medium or hard challenge with zero hints",
  },
  {
    id: "diverse_thinker",
    name: "Renaissance Mind",
    icon: "🌐",
    description: "Tackled challenges across 3 or more categories",
  },
  {
    id: "kids_adventurer",
    name: "Puzzle Hero",
    icon: "🦸",
    description: "Completed 5 exciting brain challenges",
  },
];

/**
 * Maps level number to an engaging title
 */
export function getLevelTitle(level: number, userType?: UserType | null): string {
  if (userType === "kids") {
    switch (level) {
      case 1:
        return "Junior Explorer";
      case 2:
        return "Brain Detective";
      case 3:
        return "Puzzle Master";
      case 4:
        return "Super Wizard";
      case 5:
      default:
        return "Grand Champion";
    }
  }

  // Student & Young Professional
  switch (level) {
    case 1:
      return "Explorer";
    case 2:
      return "Thinker";
    case 3:
      return "Problem Solver";
    case 4:
      return "Strategist";
    case 5:
    default:
      return "Mastermind";
  }
}

/**
 * Calculates user level from total XP:
 * 0–499    -> Level 1
 * 500–1199 -> Level 2
 * 1200–1999-> Level 3
 * 2000–2999-> Level 4
 * 3000+    -> Level 5+
 */
export function calculateLevel(xp: number): number {
  if (xp >= 3000) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 1200) return 3;
  if (xp >= 500) return 2;
  return 1;
}

/**
 * Calculates XP earned based on difficulty and hints used:
 * Easy: 50 XP
 * Medium: 100 XP
 * Hard: 150 XP
 * Expert: 200 XP
 * 0 hints: 100% XP, 1 hint: 90% XP, 2+ hints: 75% XP
 */
export function calculateXPEarned(
  difficulty: ChallengeDifficulty,
  hintsUsed: number
): number {
  let baseXP = 100;
  switch (difficulty) {
    case "easy":
      baseXP = 50;
      break;
    case "medium":
      baseXP = 100;
      break;
    case "hard":
      baseXP = 150;
      break;
    case "expert":
      baseXP = 200;
      break;
  }

  let multiplier = 1.0;
  if (hintsUsed === 1) multiplier = 0.9;
  else if (hintsUsed >= 2) multiplier = 0.75;

  return Math.round(baseXP * multiplier);
}

/**
 * Computes next adaptive difficulty based on recent performance
 */
export function computeAdaptiveDifficulty(
  currentDifficulty: ChallengeDifficulty,
  recentScore: number
): ChallengeDifficulty {
  const levels: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];
  const currentIndex = levels.indexOf(currentDifficulty);

  if (recentScore >= 8.5) {
    return levels[Math.min(levels.length - 1, currentIndex + 1)];
  } else if (recentScore >= 7.0) {
    if (currentDifficulty === "easy") return "medium";
    return currentDifficulty;
  } else if (recentScore < 5.0) {
    return levels[Math.max(0, currentIndex - 1)];
  }

  return currentDifficulty;
}

/**
 * Calculates daily streak increment or reset
 */
export function calculateStreak(
  currentStreak: number,
  lastCompletedDateStr?: string | null
): number {
  const today = new Date().toISOString().split("T")[0];
  if (!lastCompletedDateStr) {
    return 1;
  }
  if (lastCompletedDateStr === today) {
    return currentStreak; // Already logged today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (lastCompletedDateStr === yesterday) {
    return currentStreak + 1;
  }

  return 1; // Missed a day, reset to 1
}

/**
 * Initializes a new user profile document in Firestore
 */
export async function createUserProfile(
  uid: string,
  email: string,
  fullName?: string,
  userType?: UserType | null
): Promise<UserProfile> {
  const userRef = doc(db, "users", uid);
  const initialProfile: UserProfile = {
    uid,
    email,
    fullName: fullName || email.split("@")[0],
    userType: userType || null,
    onboardingCompleted: Boolean(userType),
    interests: [],
    xp: 0,
    level: 1,
    reasoningScore: 0,
    challengesSolved: 0,
    currentStreak: 0,
    currentDifficulty: userType === "kids" ? "easy" : "medium",
    totalHints: 0,
    badges: [],
    lastCompletedDate: null,
    aiInsight: userType === "kids" 
      ? "Welcome to PuzzlePal! Pick a fun puzzle and let's start solving!" 
      : "Complete your first challenge to receive tailored reasoning feedback.",
  };

  await setDoc(userRef, {
    ...initialProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return initialProfile;
}

/**
 * Safely updates editable user profile fields without passing undefined
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, "fullName" | "userType" | "ageRange" | "academicLevel" | "interests" | "onboardingCompleted" | "currentDifficulty">>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const cleanUpdates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      cleanUpdates[key] = val;
    }
  }

  // Update local storage backup immediately
  if (typeof window !== "undefined") {
    try {
      const key = `puzzlepal_profile_${uid}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        localStorage.setItem(key, JSON.stringify({ ...parsed, ...updates }));
      }
    } catch {}
  }

  // Race setDoc against a 3.5s timeout to prevent hanging if network acknowledgment is slow
  const setDocPromise = setDoc(userRef, cleanUpdates, { merge: true });
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
  await Promise.race([setDocPromise, timeoutPromise]);
}

/**
 * Fetches user profile or creates it if not yet existing
 */
export async function getUserProfile(
  uid: string,
  email?: string | null
): Promise<UserProfile> {
  const userRef = doc(db, "users", uid);

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const d = snap.data();
      const xp = d.xp ?? 0;
      return {
        uid,
        email: d.email || email || "user@puzzlepal.ai",
        fullName: d.fullName || d.email?.split("@")[0] || "Puzzle Solver",
        userType: (d.userType as UserType) || null,
        ageRange: d.ageRange,
        academicLevel: d.academicLevel,
        interests: d.interests || [],
        onboardingCompleted: d.onboardingCompleted ?? Boolean(d.userType),
        xp,
        level: d.level ?? calculateLevel(xp),
        reasoningScore: d.reasoningScore ?? 0,
        challengesSolved: d.challengesSolved ?? 0,
        currentStreak: d.currentStreak ?? 0,
        currentDifficulty: (d.currentDifficulty as ChallengeDifficulty) || (d.userType === "kids" ? "easy" : "medium"),
        totalHints: d.totalHints ?? 0,
        badges: d.badges || [],
        lastCompletedDate: d.lastCompletedDate ?? null,
        aiInsight: d.aiInsight ?? "Sharpen your analytical framework across multiple categories.",
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    }

    return await createUserProfile(uid, email || "user@puzzlepal.ai");
  } catch (err) {
    console.warn("Failed to fetch Firestore user profile, using fallback profile:", err);

    // Read from local storage backup if available before falling back
    let cachedType: UserType = "student";
    let cachedDiff: ChallengeDifficulty = "medium";
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`puzzlepal_profile_${uid}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.userType) cachedType = parsed.userType;
          if (parsed.currentDifficulty) cachedDiff = parsed.currentDifficulty;
        }
      } catch {}
    }

    return {
      uid,
      email: email || "user@puzzlepal.ai",
      fullName: email?.split("@")[0] || "Puzzle Solver",
      userType: cachedType,
      onboardingCompleted: true,
      xp: 0,
      level: 1,
      reasoningScore: 0,
      challengesSolved: 0,
      currentStreak: 0,
      currentDifficulty: cachedDiff,
      totalHints: 0,
      badges: [],
      lastCompletedDate: null,
      aiInsight: "Complete a challenge to generate your AI reasoning feedback.",
    };
  }
}

/**
 * Evaluates earned badges based on profile stats and recent solve
 */
function evaluateNewBadges(
  existingBadges: string[],
  newChallengesSolved: number,
  newScore: number,
  newStreak: number,
  newLevel: number,
  hintsUsed: number,
  difficulty: ChallengeDifficulty,
  distinctCategoriesCount: number,
  userType?: UserType | null
): string[] {
  const newlyAwarded: string[] = [];
  const has = (id: string) => existingBadges.includes(id) || newlyAwarded.includes(id);

  if (!has("first_solve") && newChallengesSolved >= 1) {
    newlyAwarded.push("first_solve");
  }

  if (!has("high_score") && newScore >= 9.0) {
    newlyAwarded.push("high_score");
  }

  if (!has("streak_3") && newStreak >= 3) {
    newlyAwarded.push("streak_3");
  }

  if (!has("streak_7") && newStreak >= 7) {
    newlyAwarded.push("streak_7");
  }

  if (!has("level_2") && newLevel >= 2) {
    newlyAwarded.push("level_2");
  }

  if (!has("level_3") && newLevel >= 3) {
    newlyAwarded.push("level_3");
  }

  if (!has("level_5") && newLevel >= 5) {
    newlyAwarded.push("level_5");
  }

  if (!has("clean_solve") && hintsUsed === 0 && (difficulty === "medium" || difficulty === "hard" || difficulty === "expert")) {
    newlyAwarded.push("clean_solve");
  }

  if (!has("diverse_thinker") && distinctCategoriesCount >= 3) {
    newlyAwarded.push("diverse_thinker");
  }

  if (!has("kids_adventurer") && (userType === "kids" || newChallengesSolved >= 5)) {
    if (newChallengesSolved >= 5) {
      newlyAwarded.push("kids_adventurer");
    }
  }

  return newlyAwarded;
}

/**
 * Records completed challenge, updates stats, XP, level, badges, and adaptive difficulty
 */
export async function recordChallengeResult(
  uid: string,
  data: {
    challengeId?: string;
    title: string;
    category: ChallengeCategory;
    difficulty: ChallengeDifficulty;
    userType?: UserType;
    evaluation: ReasoningEvaluation;
    reasoning: string;
    hintsUsed: number;
  }
): Promise<{
  xpEarned: number;
  newXP: number;
  newLevel: number;
  newDifficulty: ChallengeDifficulty;
  newReasoningScore: number;
  newStreak: number;
  newBadges: string[];
}> {
  const profile = await getUserProfile(uid);

  const xpEarned = calculateXPEarned(data.difficulty, data.hintsUsed);
  const newXP = profile.xp + xpEarned;
  const newLevel = calculateLevel(newXP);
  const newChallengesSolved = profile.challengesSolved + 1;

  // Running average calculation for reasoning score
  const newReasoningScore = Number(
    (
      (profile.reasoningScore * profile.challengesSolved +
        data.evaluation.overallScore) /
      newChallengesSolved
    ).toFixed(1)
  );

  const newDifficulty = computeAdaptiveDifficulty(
    profile.currentDifficulty,
    data.evaluation.overallScore
  );

  const newStreak = calculateStreak(profile.currentStreak, profile.lastCompletedDate);
  const todayStr = new Date().toISOString().split("T")[0];

  // Dynamic AI Insight synthesis based on strengths/improvements
  let aiInsight = profile.aiInsight;
  if (profile.userType === "kids") {
    if (data.evaluation.overallScore >= 8.5) {
      aiInsight = `Amazing job! You have fantastic observation skills in ${CATEGORY_INFO[data.category]?.name || "puzzles"}!`;
    } else {
      aiInsight = `Great effort! Keep practicing noticing small details in ${CATEGORY_INFO[data.category]?.name || "puzzles"}.`;
    }
  } else {
    if (data.evaluation.strengths.length > 0 && data.evaluation.improvements.length > 0) {
      aiInsight = `Strong at ${data.evaluation.strengths[0].toLowerCase()}, but focus on ${data.evaluation.improvements[0].toLowerCase()} in future scenarios.`;
    } else if (data.evaluation.overallScore >= 8.0) {
      aiInsight = `Solid performance in ${CATEGORY_INFO[data.category]?.name || "deduction"}. Focus on addressing hidden edge cases to reach 9+.`;
    }
  }

  // Fetch past history to check distinct categories for badges
  const existingHistory = await getChallengeHistory(uid);
  const distinctCategories = new Set(existingHistory.map((h) => h.category));
  distinctCategories.add(data.category);

  // Evaluate badges
  const currentBadges = profile.badges || [];
  const newlyAwardedBadges = evaluateNewBadges(
    currentBadges,
    newChallengesSolved,
    data.evaluation.overallScore,
    newStreak,
    newLevel,
    data.hintsUsed,
    data.difficulty,
    distinctCategories.size,
    profile.userType
  );

  const updatedBadges = [...currentBadges, ...newlyAwardedBadges];

  // 1. Update user document
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    xp: newXP,
    level: newLevel,
    reasoningScore: newReasoningScore,
    challengesSolved: newChallengesSolved,
    currentDifficulty: newDifficulty,
    currentStreak: newStreak,
    totalHints: profile.totalHints + data.hintsUsed,
    badges: updatedBadges,
    lastCompletedDate: todayStr,
    aiInsight: aiInsight ?? null,
    updatedAt: serverTimestamp(),
  });

  // 2. Add challenge record to subcollection
  try {
    const historyCol = collection(db, "users", uid, "challengeHistory");
    await addDoc(historyCol, {
      challengeId: data.challengeId || "",
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      userType: data.userType || profile.userType || "student",
      score: data.evaluation.overallScore,
      xpEarned,
      reasoning: data.reasoning,
      feedback: data.evaluation.feedback || "",
      evaluation: data.evaluation,
      hintsUsed: data.hintsUsed,
      completedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not write challenge history record:", err);
  }

  return {
    xpEarned,
    newXP,
    newLevel,
    newDifficulty,
    newReasoningScore,
    newStreak,
    newBadges: newlyAwardedBadges,
  };
}

/**
 * Retrieves past challenges for the user
 */
export async function getChallengeHistory(
  uid: string,
  categoryFilter?: ChallengeCategory
): Promise<ChallengeHistoryRecord[]> {
  try {
    const historyCol = collection(db, "users", uid, "challengeHistory");
    let q = query(historyCol, orderBy("completedAt", "desc"));

    if (categoryFilter) {
      q = query(historyCol, where("category", "==", categoryFilter), orderBy("completedAt", "desc"));
    }

    const snap = await getDocs(q);
    const records: ChallengeHistoryRecord[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      records.push({
        id: docSnap.id,
        challengeId: d.challengeId,
        title: d.title || "Reasoning Challenge",
        category: d.category,
        difficulty: d.difficulty,
        userType: d.userType,
        score: d.score ?? 0,
        xpEarned: d.xpEarned ?? 0,
        reasoning: d.reasoning || "",
        feedback: d.feedback || "",
        evaluation: d.evaluation || {
          overallScore: d.score ?? 0,
          decisionQuality: 0,
          logic: 0,
          tradeoffAwareness: 0,
          clarity: 0,
          strengths: [],
          improvements: [],
          feedback: d.feedback || "",
          missedConsiderations: [],
          idealApproach: "",
        },
        hintsUsed: d.hintsUsed ?? 0,
        completedAt: d.completedAt || null,
      });
    });

    return records;
  } catch (err) {
    console.warn("Could not query challengeHistory:", err);
    return [];
  }
}

/**
 * Computes average performance by category
 */
export async function getUserCategoryStrengths(
  uid: string,
  userType?: UserType | null
): Promise<CategoryStrength[]> {
  const history = await getChallengeHistory(uid);

  const relevantCategories: ChallengeCategory[] =
    userType === "kids"
      ? KIDS_CATEGORIES
      : STUDENT_CATEGORIES;

  return relevantCategories.map((cat) => {
    const matching = history.filter((h) => h.category === cat);
    const avg =
      matching.length > 0
        ? Number(
          (
            matching.reduce((acc, curr) => acc + curr.score, 0) /
            matching.length
          ).toFixed(1)
        )
        : 0;

    return {
      category: cat,
      displayName: CATEGORY_INFO[cat]?.name || cat,
      icon: CATEGORY_INFO[cat]?.icon || "🧩",
      averageScore: avg,
      count: matching.length,
    };
  });
}

/**
 * Generates data-driven insights from actual Firestore history
 */
export async function getUserInsights(uid: string): Promise<string[]> {
  const history = await getChallengeHistory(uid);
  if (history.length === 0) {
    return ["Complete your first challenge to generate personalized analytical insights."];
  }

  const insights: string[] = [];
  const profile = await getUserProfile(uid);

  // 1. Identify strongest category
  const categoryScores: Record<string, { total: number; count: number }> = {};
  for (const h of history) {
    if (!categoryScores[h.category]) {
      categoryScores[h.category] = { total: 0, count: 0 };
    }
    categoryScores[h.category].total += h.score;
    categoryScores[h.category].count += 1;
  }

  let topCat = "";
  let topAvg = -1;
  for (const [cat, data] of Object.entries(categoryScores)) {
    const avg = data.total / data.count;
    if (avg > topAvg && data.count >= 1) {
      topAvg = avg;
      topCat = cat;
    }
  }

  if (topCat && CATEGORY_INFO[topCat as ChallengeCategory]) {
    const catName = CATEGORY_INFO[topCat as ChallengeCategory].name;
    if (profile.userType === "kids") {
      insights.push(`🌟 You shine brightest at ${catName}! Your average score is ${topAvg.toFixed(1)}/10.`);
    } else {
      insights.push(`🎯 Your highest performing area is ${catName} with an average score of ${topAvg.toFixed(1)}/10.`);
    }
  }

  // 2. Score trend (compare last 3 vs first 3 if enough data)
  if (history.length >= 4) {
    const recent = history.slice(0, 3);
    const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
    if (recentAvg >= 8.0) {
      insights.push(`📈 Strong upward trend: your last 3 challenges averaged ${recentAvg.toFixed(1)}/10.`);
    }
  }

  // 3. Hints efficiency
  const totalHints = history.reduce((a, b) => a + b.hintsUsed, 0);
  if (history.length >= 2 && totalHints === 0) {
    insights.push(`💡 Independent problem solver: you haven't needed hints on your recent challenges!`);
  }

  // 4. Streak
  if (profile.currentStreak >= 2) {
    insights.push(`🔥 Consistent focus: on a ${profile.currentStreak}-day active streak!`);
  }

  if (insights.length === 0) {
    insights.push("Continue solving challenges to unlock deeper reasoning patterns.");
  }

  return insights;
}
