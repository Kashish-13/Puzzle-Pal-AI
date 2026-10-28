"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar, { Logo } from "@/components/Navbar";
import Icon, { IconName } from "@/components/Icon";
import ReasoningGraph from "@/components/ReasoningGraph";
import { useAuth } from "@/lib/auth";

const STEPS: { title: string; body: string; icon: IconName }[] = [
  {
    title: "Think",
    body: "AI generates a contextual scenario with real constraints, calibrated to your level. No multiple choice.",
    icon: "fileText",
  },
  {
    title: "Reason",
    body: "Explain your recommendation, why alternatives fail, and which risks you would monitor.",
    icon: "pen",
  },
  {
    title: "Solve",
    body: "Get a 4-dimension score — logic, decisions, tradeoffs, clarity — with specific blindspots.",
    icon: "sparkles",
  },
  {
    title: "Improve",
    body: "Difficulty adapts as you grow. Earn XP, level up, and unlock achievements.",
    icon: "trendingUp",
  },
];

const CATEGORIES = [
  "Detective & Mystery",
  "Business Decisions",
  "Technical Challenges",
  "Data Reasoning",
  "Brain Teasers & Riddles",
  "Patterns & Sequences",
  "Light Aptitude",
  "Creative Thinking",
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-[400/380]" aria-hidden="true">
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-sky-50 border border-slate-200/70" />
      <ReasoningGraph className="absolute inset-0 w-full h-full p-6" />

      <div className="absolute -left-2 sm:-left-6 top-10 panel px-4 py-3 shadow-lift w-52 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon name="search" className="w-3 h-3" />
          </span>
          Detective &amp; Mystery
        </div>
        <div className="mt-1.5 text-sm font-semibold text-ink leading-snug">The Case of the Missing Golden Trophy</div>
        <div className="mt-1 text-xs text-slate-500">Easy · <span className="text-amber-600">50 XP</span></div>
      </div>

      <div className="absolute -right-2 sm:-right-4 bottom-12 panel px-4 py-3 shadow-lift w-48 animate-fade-up" style={{ animationDelay: "260ms" }}>
        <div className="text-xs text-slate-500">Reasoning score</div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-ink tabular-nums">8.8</span>
          <span className="text-xs text-slate-400">/ 10</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-[88%] rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"scenario" | "evaluation">("evaluation");

  return (
    <div className="min-h-screen bg-slate-50 text-ink flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="page-enter">
              <p className="eyebrow">AI-powered reasoning practice</p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-ink leading-[1.05]">
                Think. Reason. <span className="text-brand-600">Solve.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-500 leading-relaxed">
                PuzzlePal AI evaluates how you think — not just whether you got the answer right.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href={user ? "/dashboard" : "/signup"} className="btn btn-primary btn-lg">
                  <span>Start solving</span>
                  <Icon name="arrowRight" className="w-4 h-4" />
                </Link>
                <Link href="/challenge" className="btn btn-secondary btn-lg">
                  Explore challenges
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-green-500" />
                  Open-ended, no multiple choice
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-green-500" />
                  Feedback in seconds
                </span>
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
            {/* Kids */}
            <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-7 shadow-card">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-50" aria-hidden="true" />
              <div className="absolute top-10 right-10 w-10 h-10 rounded-full bg-amber-100" aria-hidden="true" />
              <div className="relative">
                <span className="w-11 h-11 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Icon name="smile" className="w-6 h-6" />
                </span>
                <p className="mt-5 text-sm font-medium text-sky-600">Kids</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Play. Solve. Learn.</h3>
                <p className="mt-2 text-slate-500 leading-relaxed">
                  Detective mysteries, patterns, and logic puzzles that turn problem solving into an adventure.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {["Mystery puzzles", "Patterns", "Logic", "Rewards", "XP"].map((t) => (
                    <li key={t} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Students */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-ink p-7 text-white shadow-card">
              <ReasoningGraph className="absolute -right-10 -bottom-12 w-72 opacity-25" />
              <div className="relative">
                <span className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <Icon name="graduationCap" className="w-6 h-6" />
                </span>
                <p className="mt-5 text-sm font-medium text-brand-300">Students &amp; professionals</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Think. Solve. Analyze.</h3>
                <p className="mt-2 text-white/70 leading-relaxed">
                  Structured scenarios across business, technical, and data problems — with rigorous AI feedback.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {["Analytical reasoning", "Technical scenarios", "Structured problems", "AI feedback"].map((t) => (
                    <li key={t} className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/80">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Method */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <p className="eyebrow">The PuzzlePal method</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight max-w-xl">
              Learning how to think better
            </h2>

            <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, idx) => (
                <li key={step.title} className="relative">
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
          </div>
        </section>

        {/* Evaluation preview */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-2">
            <p className="eyebrow">AI evaluation</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">See exactly how you reasoned</h2>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Every response is scored on logic, tradeoffs, decisions, and clarity — with feedback on what to
              improve next time.
            </p>
            <p className="mt-6 text-sm text-slate-500">Categories include</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 panel p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">Business Strategy</span>
                Medium
              </span>

              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("scenario")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === "scenario" ? "bg-white text-ink font-medium shadow-card" : "text-slate-500 hover:text-ink"
                  }`}
                >
                  Scenario
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("evaluation")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === "evaluation" ? "bg-white text-ink font-medium shadow-card" : "text-slate-500 hover:text-ink"
                  }`}
                >
                  AI evaluation
                </button>
              </div>
            </div>

            {activeTab === "scenario" ? (
              <div className="space-y-3 animate-fade-up">
                <h3 className="text-lg font-semibold">The Retention vs Acquisition Dilemma</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A B2B analytics startup has scaled from 10k to 28k MAU through aggressive marketing. However, 90-day retention has dropped from 46% to 27%. Meanwhile, enterprise sales demands custom features for a $400K ARR contract. Engineering capacity allows only one initiative.
                </p>
                <div className="rounded-lg border-l-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-sm font-medium text-ink">
                  Which initiative should product leadership prioritize? Justify your decision with tradeoff and risk analysis.
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-up">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Reasoning score</span>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums">
                      8.8 <span className="text-base font-normal text-slate-400">/ 10</span>
                    </div>
                  </div>
                  <dl className="flex gap-6 text-sm">
                    {[["Logic", "9/10"], ["Tradeoffs", "9/10"], ["Clarity", "8/10"]].map(([k, v]) => (
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
                    <p>Recognized that acquiring users into an leaky bucket destroys lifetime unit economics before next funding round.</p>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 p-3">
                    <Icon name="arrowUpRight" className="w-4 h-4 mt-0.5 text-amber-600" />
                    <p>Quantify the cash runway impact and enterprise churn risk if the $400K contract is deferred.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 sm:px-12 text-white">
            <ReasoningGraph className="absolute -right-16 -top-10 w-96 opacity-20 [&_circle]:fill-white [&_line]:stroke-white" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to improve how you think?</h2>
                <p className="mt-2 text-white/75">Join students, curious kids, and professionals training their reasoning every day.</p>
              </div>
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-lift shrink-0"
              >
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
          <span>Think · Reason · Solve · Improve</span>
        </div>
      </footer>
    </div>
  );
}
