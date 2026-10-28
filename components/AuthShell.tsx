import React from "react";
import Link from "next/link";
import { Logo } from "./Navbar";
import ReasoningGraph from "./ReasoningGraph";

/** Split auth layout: brand panel (desktop) + form column. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between bg-brand-600 p-12 text-white">
        <ReasoningGraph className="absolute -right-24 top-1/2 -translate-y-1/2 w-[560px] opacity-25 [&_circle]:fill-white [&_line]:stroke-white" />
        <Link href="/" aria-label="PuzzlePal AI home" className="relative">
          <Logo inverted />
        </Link>
        <div className="relative max-w-sm">
          <p className="text-3xl font-semibold tracking-tight leading-tight">Learning how to think better.</p>
          <p className="mt-4 text-white/75 leading-relaxed">
            Open-ended challenges, scored on how you reason — not just whether you got it right.
          </p>
        </div>
        <p className="relative text-sm font-medium tracking-[0.2em] text-white/60">THINK · REASON · SOLVE · IMPROVE</p>
      </aside>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-sm page-enter">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" aria-label="PuzzlePal AI home">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
