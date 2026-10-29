"use client";

import React from "react";
import Link from "next/link";
import { ChallengeHistoryRecord } from "@/lib/types";
import { CATEGORY_INFO } from "@/lib/firestore";
import { CategoryIcon } from "./Icon";
import Icon from "./Icon";
import { CATEGORY_TONE, TONES } from "./tokens";

function formatDate(record: ChallengeHistoryRecord): string {
  if (!record.completedAt) return "Recent";
  try {
    const dateObj =
      typeof record.completedAt.toDate === "function"
        ? record.completedAt.toDate()
        : new Date(record.completedAt as unknown as string | number);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

export function scoreTone(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 5) return "text-ink";
  return "text-rose-600";
}

/** Compact list of completed challenges (title, category, score, XP, date). */
export default function RecentActivityList({
  records,
  emptyLabel = "No completed challenges yet.",
}: {
  records: ChallengeHistoryRecord[];
  emptyLabel?: string;
}) {
  if (records.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-slate-500">{emptyLabel}</p>
        <Link href="/challenge" className="btn btn-sm btn-secondary mt-4">
          Browse challenges
        </Link>
      </div>
    );
  }

  return (
    <ul className="panel divide-y divide-slate-100">
      {records.map((rec) => {
        const tone = TONES[CATEGORY_TONE[rec.category] || "brand"];
        return (
          <li key={rec.id} className="p-4 sm:px-5 flex items-center gap-4 transition-colors hover:bg-slate-50/80 first:rounded-t-2xl last:rounded-b-2xl">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone.soft}`}>
              <CategoryIcon category={rec.category} className="w-[18px] h-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-ink truncate">{rec.title}</h3>
              <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>{CATEGORY_INFO[rec.category]?.name || rec.category}</span>
                <span className="text-slate-300">·</span>
                <span>{formatDate(rec)}</span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-green-600">
                  <Icon name="checkCircle" className="w-3 h-3" />
                  Completed
                </span>
              </p>
            </div>
            <div className="text-right shrink-0 tabular-nums">
              <div className={`text-sm font-semibold ${scoreTone(rec.score)}`}>{rec.score}/10</div>
              <div className="text-xs font-medium text-amber-600">+{rec.xpEarned} XP</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
