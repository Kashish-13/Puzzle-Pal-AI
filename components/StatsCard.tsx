"use client";

import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  badge?: string;
}

export default function StatsCard({
  label,
  value,
  subtext,
  icon,
  badge,
}: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-100">
          {value}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 font-medium truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
