import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-full max-w-md bg-slate-900/80 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
        <span className="text-5xl block animate-bounce">🧩</span>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
            404 — Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Puzzle Not Found
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The page or reasoning challenge you are looking for does not exist, has been solved, or has moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <span>Return to Safety</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

