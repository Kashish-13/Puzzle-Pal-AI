"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"scenario" | "evaluation">("evaluation");

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 sm:pt-28 sm:pb-32 border-b border-slate-800/80">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 mb-8 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next-Gen AI Thinking & Reasoning Platform</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight sm:leading-none">
              🧠 PuzzlePal AI
            </h1>

            {/* Tagline */}
            <p className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-300 via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              Think. Reason. Solve.
            </p>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-medium text-slate-400 leading-relaxed font-sans">
              Smart puzzles for curious kids. Rigorous analytical challenges for students, developers, and professionals.
              PuzzlePal evaluates <span className="text-slate-200 font-bold">how you think</span>, not just whether you got it right.
            </p>

            {/* Dual Persona Choice Quick Banner */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xs flex items-start gap-3">
                <span className="text-3xl">🧒</span>
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">For Kids & Teens</div>
                  <div className="text-sm font-bold text-white mt-0.5">Fun Puzzles & Brain Challenges</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Detective mysteries, patterns, math riddles, and creative thinking that spark curiosity!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xs flex items-start gap-3">
                <span className="text-3xl">🎓</span>
                <div>
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">For Students & Pros</div>
                  <div className="text-sm font-bold text-white mt-0.5">Logic & Real-World Reasoning</div>
                  <p className="text-xs text-slate-400 mt-1">
                    System trade-offs, business dilemmas, light aptitude prep, and multi-variable logic.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
                <span>→</span>
              </Link>

              <Link
                href={user ? "/challenge" : "/login"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold text-sm sm:text-base border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign In to Continue</span>
                <span>⚡</span>
              </Link>
            </div>

            {/* Live Interactive Simulation Card */}
            <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 text-left shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                    Live Reasoning Preview
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                    Business • Medium
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("scenario")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === "scenario"
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Scenario
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("evaluation")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === "evaluation"
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    AI Evaluation
                  </button>
                </div>
              </div>

              {activeTab === "scenario" ? (
                <div className="space-y-3 font-sans">
                  <h3 className="text-lg font-bold text-white">
                    The Retention vs Acquisition Dilemma
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    A B2B analytics startup has scaled from 10k to 28k MAU through aggressive marketing. However, 90-day retention has dropped from 46% to 27%. Meanwhile, sales demands enterprise features for $400K ARR. Engineering has capacity for only one initiative.
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono">
                    Directive: Which initiative should product leadership prioritize? Justify your decision with tradeoff analysis.
                  </div>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Evaluated Score</span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        8.8 <span className="text-xs text-slate-500">/ 10</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block">Logic</span>
                        <span className="text-slate-200 font-bold">9/10</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tradeoffs</span>
                        <span className="text-slate-200 font-bold">9/10</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Clarity</span>
                        <span className="text-slate-200 font-bold">8/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-300">
                      <span className="font-bold text-emerald-400">✓ Strengths: </span>
                      Identified that pouring spend into a leaky bucket destroys unit economics before Series A.
                    </div>
                    <div className="text-slate-300">
                      <span className="font-bold text-amber-400">⚠ Improvement: </span>
                      Explicitly quantify the runway impact of foregoing the $400K enterprise revenue.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4 Feature Pillars */}
        <section className="py-20 border-b border-slate-800/80 bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                How PuzzlePal Evaluates Your Thinking
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                A structured four-dimensional assessment engine designed for real cognitive growth
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xs">
                <span className="text-3xl block mb-4">⚖️</span>
                <h3 className="text-base font-bold text-white mb-2">
                  Tradeoff Awareness
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Evaluates whether you acknowledge the sacrifices, opportunity costs, and risks inherent in your solution.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xs">
                <span className="text-3xl block mb-4">🧩</span>
                <h3 className="text-base font-bold text-white mb-2">
                  Deductive Logic
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Tests for internal consistency, avoidance of logical fallacies, and validity of intermediate conclusions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xs">
                <span className="text-3xl block mb-4">📈</span>
                <h3 className="text-base font-bold text-white mb-2">
                  Adaptive Growth
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Difficulty calibrates dynamically as you solve challenges, ensuring you are constantly at your learning edge.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xs">
                <span className="text-3xl block mb-4">🏆</span>
                <h3 className="text-base font-bold text-white mb-2">
                  Verified Badges & XP
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Earn milestone trophies and level up from Explorer to Mastermind as you solve diverse categories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Showcase */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Specialized Thinking Categories
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Tailored domains designed for curiosity, analytical depth, and interview prep
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">🕵️</span>
                <h4 className="text-sm font-bold text-white">Detective & Mystery</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Footprint tracking, timelines, and eliminating impossible alibis.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">📈</span>
                <h4 className="text-sm font-bold text-white">Business Decisions</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Startup tradeoffs, product roadmaps, pricing, and capital allocation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">💻</span>
                <h4 className="text-sm font-bold text-white">Technical Challenges</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Debugging code snippets, database deadlocks, and system design.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">📊</span>
                <h4 className="text-sm font-bold text-white">Data Reasoning</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Metrics interpretation, Simpson&apos;s paradox, and cohort anomalies.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">⚡</span>
                <h4 className="text-sm font-bold text-white">Brain Teasers & Riddles</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tricky lateral riddles and clever thinking outside the box.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">🌀</span>
                <h4 className="text-sm font-bold text-white">Patterns & Sequences</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Secret color codes, stepping stones, and shape transformations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">🔢</span>
                <h4 className="text-sm font-bold text-white">Light Aptitude</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Coding-decoding, blood relations, and interview aptitude patterns.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-2xl block mb-2">💡</span>
                <h4 className="text-sm font-bold text-white">Creative Thinking</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inventive solutions, island shelters, and contraption designs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>🧠</span>
            <span className="text-slate-300 font-bold">PuzzlePal AI</span>
            <span>— Think. Reason. Solve.</span>
          </div>
          <div>
            Next.js • Firebase Auth & Firestore • OpenAI API
          </div>
        </div>
      </footer>
    </div>
  );
}
