"use client";

import React from "react";
import { DataTable } from "@/lib/types";

export default function DataTableRenderer({ dataTable }: { dataTable: DataTable }) {
  if (!dataTable || !dataTable.headers || !dataTable.rows) return null;

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
      {dataTable.caption && (
        <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          📊 {dataTable.caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/40 text-slate-300 border-b border-slate-800">
            <tr>
              {dataTable.headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {dataTable.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

