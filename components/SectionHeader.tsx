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
    <div className="flex items-baseline justify-between gap-4 mb-4">
      <h2 className="relative pl-3 text-base font-semibold tracking-tight text-ink before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-brand-500 before:to-blue-500">
        {title}
        {meta && <span className="ml-2 text-sm font-normal text-slate-500">{meta}</span>}
      </h2>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0">
          {action.label}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
