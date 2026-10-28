# 🧠 PuzzlePal AI

> **"Think. Reason. Solve."**  
> AI-powered reasoning challenges and smart puzzles designed to evaluate how you think — not just whether you're correct.

PuzzlePal AI is a full-stack, dual-experience cognitive platform built with Next.js 16 (App Router), TypeScript, Firebase Authentication, Firebase Firestore, and OpenAI server-side APIs.

---

## 🌟 Dual Personalized Experiences

During onboarding, users select their persona to personalize puzzles, language, categories, and feedback:

#
## 🧒 1. Kids Experience ("Fun Puzzles & Brain Challenges")
- **Audience**: Children and teenagers (age groups: 8–10, 11–13, 14–16).
- **Goal**: Spark curiosity, build observation skills, and foster creative problem-solving.
- **Categories**:
  - 🕵️ **Detective & Mystery**: Missing items, footprint clues, and suspect alibis.
  - ⚡ **Brain Teasers & Riddles**: Lateral thinking puzzles and mind-benders.
  - 🌀 **Patterns & Sequences**: Shape sequences, color patterns, and clock codes.
  - 🔢 **Fun Math Puzzles**: Pizza fractions, animal legs, and balance scales.
  - 💡 **Creative Thinking**: Desert island shelters and wacky inventions.
  - 🔤 **Word Games**: Secret anagrams, word ladders, and ciphers.
- **Tone**: Playful, encouraging, positive, and curiosity-driven.

### 🎓 2. Students & Young Professionals ("Logic, Reasoning & Real-World Thinking")
- **Audience**: College students, developers, aspiring managers, and job seekers.
- **Goal**: Master system trade-offs, analytical decision-making, and placement aptitude.
- **Categories**:
  - 📈 **Business Decisions**: Startup prioritization, unit economics, and growth dilemmas.
  - 💻 **Technical Challenges**: Real code bugs, deadlocks, and distributed systems architecture.
  - 📊 **Data Reasoning**: Metric tables, Simpson's paradox, and cohort churn diagnosis.
  - 🧩 **Logic & Lateral Thinking**: Constraint satisfaction, truth-tellers, and binary deductions.
  - 🔍 **Mystery & Deduction**: Forensic timelines, conflicting alibis, and historical analysis.
  - 🎯 **Crisis Decision Making**: High-stakes mitigation, security patches, and ethical dilemmas.
  - 🔢 **Light Aptitude**: Coding-decoding, blood relations, and seating arrangements for placement prep.
  - 🔤 **Verbal Reasoning**: Syllogisms, argument deconstruction, and rhetorical fallacies.
- **Tone**: Intellectually rigorous, professional, and career-relevant.

---

## 🔄 Core User Workflow

```
Sign Up (Name, Email, Password with Strength Meter)
                       │
                       ▼
            [Onboarding Selection]
       🧒 Kids  ◄──────────────►  🎓 Students
  (Age & Interests)          (Stage & Focus Areas)
                       │
                       ▼
       Personalized Dashboard & Recommendations
                       │
                       ▼
          AI Generates Structured Scenario
         (or Curated Offline Fallback Bank)
                       │
                       ▼
      User Analyzes & Submits Reasoning
                       │
                       ▼
     AI Evaluates Reasoning (0–10 Score Rubric)
   (Logic, Decision Quality, Tradeoffs, Clarity)
                       │
                       ▼
      XP Awarded + Trophies / Badges Unlocked
                       │
                       ▼
      Adaptive Difficulty Automatically Calibrates
                       │
                       ▼
         Persistent Firestore History & Insights



   ##          🏗️ AECHITECTURE 

User
  │
  ▼
Next.js Frontend
  │
  ├── Authentication
  ├── Dashboard
  ├── Challenges
  ├── History
  └── Profile
  │
  ▼
Firebase Services
  ├── Firebase Authentication
  ├── Firestore
  └── Storage
  │
  ▼
Next.js API Routes
  ├── /api/generate-challenge
  ├── /api/evaluate-reasoning
  └── /api/hint
  │
  ▼
AI Processing
  ├── Challenge Generation
  ├── Reasoning Evaluation
  └── AI Hints
  │
  ▼
Score + Feedback
  │
  ▼
XP + Badges + Streaks
  │
  ▼
Progress & History
  │
  ▼
Firestore

## 🏆 Rewards & Gamification

- **XP Progression**:
  - Easy: 50 XP | Medium: 100 XP | Hard: 150 XP | Expert: 200 XP
  - Hint multipliers (1 hint: 90% XP, 2+ hints: 75% XP)
- **Levels**:
  - Level 1: Explorer / Junior Explorer (0–499 XP)
  - Level 2: Thinker / Brain Detective (500–1,199 XP)
  - Level 3: Problem Solver / Puzzle Master (1,200–1,999 XP)
  - Level 4: Strategist / Super Wizard (2,000–2,999 XP)
  - Level 5+: Mastermind / Grand Champion (3,000+ XP)
- **Badges**:
  - 🌟 **First Spark**: Solved first challenge
  - 🧠 **Mastermind**: Scored 9.0+ on a challenge
  - 🔥 **Momentum**: 3-day active thinking streak
  - ⚡ **Unstoppable**: 7-day active thinking streak
  - 🎯 **Sharp Instinct**: Solved without hints
  - 🌐 **Renaissance Mind**: Explored 3+ categories
  - 🦸 **Puzzle Hero**: Completed 5 challenges

---

## 🛡️ Security & Privacy

1. **Server-Side AI API**: `OPENAI_API_KEY` is strictly accessed server-side in Next.js API routes (`/api/*`). It is never bundled into client components or exposed in browser network payloads.
2. **Offline Fallback Engine**: If `OPENAI_API_KEY` is omitted or network is offline, PuzzlePal automatically switches to an extensive offline challenge bank and heuristic reasoning evaluator.
3. **Firestore Security Rules**: All user records and challenge history documents are scoped to `request.auth.uid == userId`. No unauthenticated reads/writes are allowed.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=puzzlepal-5385d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Add OpenAI API key for live AI generation and evaluation
OPENAI_API_KEY=your_openai_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run lint
npm run build
```
Both commands pass cleanly with 0 errors!
