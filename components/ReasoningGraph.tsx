import React from "react";

// Abstract "connected reasoning" pattern: clue nodes linking into a conclusion.
const NODES: [number, number, number][] = [
  [60, 70, 7], [150, 40, 5], [230, 95, 8], [110, 160, 6], [200, 190, 5],
  [300, 150, 7], [70, 250, 5], [170, 270, 8], [280, 250, 6], [350, 60, 5],
  [360, 220, 5], [240, 330, 6], [120, 340, 5], [330, 320, 4],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 2], [2, 5], [3, 4], [4, 5], [5, 9], [2, 9],
  [3, 6], [6, 7], [4, 7], [7, 8], [5, 8], [8, 10], [5, 10], [7, 11], [8, 11],
  [6, 12], [7, 12], [11, 13], [10, 13],
];
// Highlighted path: the line of reasoning that leads to the answer
const PATH = new Set(["0-3", "3-4", "4-7", "7-8", "8-11"]);
const PATH_NODES = new Set([0, 3, 4, 7, 8, 11]);

export default function ReasoningGraph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 380" className={className} aria-hidden="true">
      {EDGES.map(([a, b]) => {
        const on = PATH.has(`${a}-${b}`);
        return (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
            stroke={on ? "#5b4bff" : "#cbd5e1"}
            strokeWidth={on ? 2 : 1}
            strokeOpacity={on ? 0.7 : 0.7}
            strokeDasharray={on ? undefined : "3 4"}
          />
        );
      })}
      {NODES.map(([x, y, r], i) => {
        const on = PATH_NODES.has(i);
        return (
          <g key={i}>
            {on && <circle cx={x} cy={y} r={r + 6} fill="#5b4bff" fillOpacity={0.08} />}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={on ? "#5b4bff" : "#ffffff"}
              stroke={on ? "#5b4bff" : "#cbd5e1"}
              strokeWidth={1.5}
            />
          </g>
        );
      })}
    </svg>
  );
}
