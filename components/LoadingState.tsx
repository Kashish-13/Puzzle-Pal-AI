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
    md: "w-7 h-7 border-2",
    lg: "w-9 h-9 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4" role="status">
      <div
        className={`${spinnerSizes[size]} rounded-full border-brand-100 border-t-brand-600 animate-spin`}
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
