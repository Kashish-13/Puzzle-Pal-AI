"use client";

import React, { useState } from "react";
import { CodeSnippet } from "@/lib/types";

export default function CodeSnippetRenderer({
  codeSnippet,
}: {
  codeSnippet: CodeSnippet;
}) {
  const [copied, setCopied] = useState(false);

  if (!codeSnippet || !codeSnippet.code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 bg-slate-900/60 text-xs">
        <span className="font-mono text-indigo-400 font-semibold uppercase tracking-wider">
          {codeSnippet.language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-200 transition-colors font-mono"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
        <pre>{codeSnippet.code}</pre>
      </div>
    </div>
  );
}

