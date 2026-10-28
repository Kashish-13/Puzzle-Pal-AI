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
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs">
        <span className="font-mono font-medium text-slate-600">
          {codeSnippet.language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="font-medium text-slate-500 hover:text-ink transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-800 leading-relaxed">
        <pre>{codeSnippet.code}</pre>
      </div>
    </div>
  );
}
