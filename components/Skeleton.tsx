import React from "react";

/** Loading placeholder rows for lists while data is fetched. */
export default function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-slate-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-5 flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
          <div className="skeleton h-5 w-12" />
        </div>
      ))}
    </div>
  );
}
