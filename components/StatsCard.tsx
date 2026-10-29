"use client";

import React from "react";
import Icon, { IconName } from "./Icon";
import { Tone, TONES } from "./tokens";

export interface StatItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon: IconName;
  tone: Tone;
}

/**
 * Grid of compact metric cards: icon, label, strong number, supporting text.
 */
export default function StatsCard({
  items,
  playful = false,
  columns,
}: {
  items: StatItem[];
  playful?: boolean;
  /** Force a 2-column grid (used beside another panel) */
  columns?: 2;
}) {
  return (
    <dl className={`grid grid-cols-2 gap-3 ${columns === 2 ? "" : "md:grid-cols-3 xl:grid-cols-5"}`}>
      {items.map((item) => (
        <div key={item.label} className={`panel p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${playful ? "rounded-3xl" : ""}`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 flex items-center justify-center ring-1 ring-inset ring-slate-900/5 ${playful ? "rounded-full" : "rounded-xl"} ${TONES[item.tone].soft}`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
            </span>
            <dt className="text-sm text-slate-500 truncate">{item.label}</dt>
          </div>
          <dd className="mt-3.5 text-[26px] leading-none font-semibold tracking-tight text-ink tabular-nums">{item.value}</dd>
          {item.subtext && <dd className="mt-1.5 text-xs text-slate-500 truncate">{item.subtext}</dd>}
        </div>
      ))}
    </dl>
  );
}
