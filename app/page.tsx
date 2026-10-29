"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar, { Logo } from "@/components/Navbar";
import Icon, { CategoryIcon, IconName } from "@/components/Icon";
import ReasoningGraph from "@/components/ReasoningGraph";
import ChallengePreview from "@/components/games/ChallengePreview";
import { CATEGORY_TONE, TONES } from "@/components/tokens";
import { GAMES, KIDS_GAMES, STUDENT_GAMES } from "@/lib/games/catalog";
import type { GameId } from "@/lib/games/types";
import { useAuth } from "@/lib/auth";

const STEPS: { title: string; body: string; icon: IconName }[] = [
  { title: "Think", body: "Pick an interactive game. Every session is generated fresh and calibrated to your level.", icon: "puzzle" },
  { title: "Solve", body: "Play with real interactions — grids, sequences, memory and spatial puzzles. No typing walls of text.", icon: "grid" },
  { title: "Analyze", body: "Get an AI reasoning review: accuracy, speed, what you did well and exactly what to improve.", icon: "sparkles" },
  { title: "Improve", body: "Difficulty adapts to your results. Earn XP, keep your streak, and unlock achievements.", icon: "trendingUp" },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-[400/380]" aria-hidden="true">
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-blue-50 border border-slate-200/70" />
      <ReasoningGraph className="absolute inset-0 w-full h-full p-6 opacity-70" />

      <div className="absolute left-0 sm:-left-6 top-8 panel px-4 py-3.5 shadow-lift animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
          <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
            <Icon name="activity" className="w-3 h-3" />
          </span>
          Crack the Code
        </div>
        <ChallengePreview gameId="crack-code" />
      </div>

      <div className="absolute right-0 sm:-right-4 top-[42%] panel p-3 shadow-lift animate-fade-up" style={{ animationDelay: "220ms" }}>
        <ChallengePreview gameId="tile-path" />
      </div>

      <div className="absolute left-4 sm:left-2 bottom-6 panel px-4 py-3 shadow-lift w-52 animate-fade-up" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Challenge complete</span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-600"><Icon name="zap" className="w-3 h-3" filled />+100 XP</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-ink tabular-nums">86%</span>
          <span className="text-xs text-slate-400">· 4/5 · 01:42</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-[86%] rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  );
}

function GameTile({ id }: { id: GameId }) {
  const g = GAMES[id];
  const tone = TONES[CATEGORY_TONE[id] || "brand"];
  return (
    <div className="panel overflow-hidden card-interactive">
      <div className="h-28 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-center">
        <div className="scale-90">
          <ChallengePreview gameId={id} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-md flex items-center justify-center ${tone.soft}`}>
            <CategoryIcon category={id} className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-ink">{g.name}</h3>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{g.tagline}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"student" | "kids">("student");
  const shown = activeTab === "student" ? STUDENT_GAMES : KIDS_GAMES;

  return (
    <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="page-enter">
              <p className="eyebrow">AI-powered reasoning games</p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-ink leading-[1.05]">
                Think. Reason. <span className="text-brand-600">Solve.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-500 leading-relaxed">
                Interactive puzzles that adapt to you — and an AI coach that reviews how you think, not just whether you got it right.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href={user ? "/dashboard" : "/signup"} className="btn btn-primary btn-lg">
                  <span>Start solving</span>
                  <Icon name="arrowRight" className="w-4 h-4" />
                </Link>
                <Link href={user ? "/challenge" : "#games"} className="btn btn-secondary btn-lg">
                  Explore games
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-green-500" /> 15 interactive games</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-green-500" /> Adaptive difficulty</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-green-500" /> AI reasoning review</span>
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* Two experiences */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Two experiences, one way of thinking</h2>
            <p className="mt-2 text-slate-500">Pick the experience that fits — switch any time from your account.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-7 shadow-card">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-50" aria-hidden="true" />
              <div className="absolute top-10 right-10 w-10 h-10 rounded-full bg-amber-100" aria-hidden="true" />
              <div className="relative">
                <span className="w-11 h-11 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Icon name="smile" className="w-6 h-6" />
                </span>
                <p className="mt-5 text-sm font-medium text-sky-600">Kids · 8 games</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Play. Solve. Learn.</h3>
                <p className="mt-2 text-slate-500 leading-relaxed">
                  Big, colorful, touch-friendly games that build attention, memory and visual reasoning.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {KIDS_GAMES.slice(0, 5).map((id) => (
                    <li key={id} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{GAMES[id].name}</li>
                  ))}
                  <li className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">+3 more</li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-ink p-7 text-white shadow-card">
              <ReasoningGraph className="absolute -right-10 -bottom-12 w-72 opacity-25" />
              <div className="relative">
                <span className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <Icon name="graduationCap" className="w-6 h-6" />
                </span>
                <p className="mt-5 text-sm font-medium text-brand-300">Students &amp; professionals · 7 games</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Think. Solve. Analyze.</h3>
                <p className="mt-2 text-white/70 leading-relaxed">
                  Code-breaking, pathfinding, spatial rotation and program logic — with analytical feedback.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {STUDENT_GAMES.slice(0, 5).map((id) => (
                    <li key={id} className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/80">{GAMES[id].name}</li>
                  ))}
                  <li className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/60">+2 more</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Game library */}
        <section id="games" className="bg-white border-y border-slate-200 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The game library</p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">See how every game plays</h2>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm self-start" role="tablist">
                {(["student", "kids"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3.5 py-1.5 rounded-md transition-all ${activeTab === t ? "bg-white text-ink font-medium shadow-card" : "text-slate-500 hover:text-ink"}`}
                  >
                    {t === "student" ? "Student" : "Kids"}
                  </button>
                ))}
              </div>
            </div>

            <div key={activeTab} className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
              {shown.map((id) => <GameTile key={id} id={id} />)}
            </div>
          </div>
        </section>

        {/* Method */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="eyebrow">The PuzzlePal method</p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight max-w-xl">Learning how to think better</h2>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => (
              <li key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon name={step.icon} className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-medium text-slate-400 tabular-nums">0{idx + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* AI review preview */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-2">
            <p className="eyebrow">AI reasoning review</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">Feedback that explains your thinking</h2>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Scores come from what you actually did — accuracy, speed, wrong attempts and hints. The AI coach then
              tells you what worked and the one thing to change next time.
            </p>
          </div>
          <div className="lg:col-span-3 panel p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Crack the Code · Medium</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">86%</p>
              </div>
              <dl className="flex gap-6 text-sm">
                {[["Accuracy", "4/5"], ["Time", "01:42"], ["Hints", "0"]].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="flex items-start gap-2.5 rounded-lg bg-green-50/60 p-3">
                <Icon name="check" className="w-4 h-4 mt-0.5 text-green-600" />
                <p>Strong pattern recognition and a good elimination strategy on the multi-step sequences.</p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 p-3">
                <Icon name="arrowUpRight" className="w-4 h-4 mt-0.5 text-amber-600" />
                <p>Check the second transformation before selecting an answer — one miss came from a ×2 then +1 rule.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 sm:px-12 text-white">
            <ReasoningGraph className="absolute -right-16 -top-10 w-96 opacity-20 [&_circle]:fill-white [&_line]:stroke-white" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to improve how you think?</h2>
                <p className="mt-2 text-white/75">Fifteen games, one adaptive coach. Free to start.</p>
              </div>
              <Link href={user ? "/dashboard" : "/signup"} className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-lift shrink-0">
                <span>Start solving</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-slate-500">
          <Logo />
          <span>Think · Solve · Analyze · Improve</span>
        </div>
      </footer>
    </div>
  );
}
