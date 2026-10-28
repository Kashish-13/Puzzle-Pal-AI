"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingState({
  message = "Processing...",
  size = "md",
}: LoadingStateProps) {
  const spinnerSizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div
          className={`${spinnerSizes[size]} rounded-full border-slate-700 border-t-indigo-500 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-indigo-400">
          ●
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
}
