"use client";

import React from "react";
import { DataTable } from "@/lib/types";

export default function DataTableRenderer({ dataTable }: { dataTable: DataTable }) {
  if (!dataTable || !dataTable.headers || !dataTable.rows) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {dataTable.caption && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          {dataTable.caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="text-slate-700 border-b border-slate-200">
            <tr>
              {dataTable.headers.map((header, idx) => (
                <th key={idx} className="px-4 py-2.5 font-medium whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
            {dataTable.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
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
