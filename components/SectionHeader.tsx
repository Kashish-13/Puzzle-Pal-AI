import React from "react";
import Link from "next/link";

/** Section title row with optional metadata and a trailing link. */
export default function SectionHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-3">
      <h2 className="text-base font-semibold text-ink">
        {title}
        {meta && <span className="ml-2 text-sm font-normal text-slate-500">{meta}</span>}
      </h2>
      {action && (
        <Link href={action.href} className="text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  );
}
