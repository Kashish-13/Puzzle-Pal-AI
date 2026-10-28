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
export default function StatsCard({ items, playful = false }: { items: StatItem[]; playful?: boolean }) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {items.map((item) => (
        <div key={item.label} className={`panel p-4 ${playful ? "rounded-3xl" : ""}`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 flex items-center justify-center ${playful ? "rounded-full" : "rounded-lg"} ${TONES[item.tone].soft}`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
            </span>
            <dt className="text-sm text-slate-500 truncate">{item.label}</dt>
          </div>
          <dd className="mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">{item.value}</dd>
          {item.subtext && <dd className="mt-0.5 text-xs text-slate-500 truncate">{item.subtext}</dd>}
        </div>
      ))}
    </dl>
  );
}
