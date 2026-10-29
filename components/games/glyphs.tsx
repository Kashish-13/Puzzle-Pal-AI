import React from "react";
import type { ObjectId, ShapeKind } from "@/lib/games/types";

/* Simple line-art objects on a 24×24 grid. Drawn as outlines, or as solid silhouettes. */
const OBJECT_PATHS: Record<ObjectId, React.ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  star: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />,
  cloud: <path d="M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 18.8 9.5 4.75 4.75 0 0 1 18 19Z" />,
  tree: <><path d="M12 2 5 11h3.5L5 16h14l-3.5-5H19z" /><path d="M12 16v6" /></>,
  leaf: <><path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15Z" /><path d="M5 19 13 11" /></>,
  flower: <><circle cx="12" cy="5.5" r="2.6" /><circle cx="15.6" cy="9" r="2.6" /><circle cx="12" cy="12.5" r="2.6" /><circle cx="8.4" cy="9" r="2.6" /><circle cx="12" cy="9" r="1.2" /><path d="M12 15.1V22M12 19c-1.6-1.6-3.6-2-5-1.2" /></>,
  book: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" /><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3" /><path d="M8 7h8" /></>,
  pencil: <><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" /><path d="m14 6 4 4" /></>,
  ruler: <><rect x="2" y="8" width="20" height="8" rx="1.5" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></>,
  apple: <><path d="M12 7c-1-1-2.5-1.5-4-1.5A4.5 4.5 0 0 0 3.5 10c0 5 3 11 5.5 11 1.2 0 1.8-.7 3-.7s1.8.7 3 .7c2.5 0 5.5-6 5.5-11A4.5 4.5 0 0 0 16 5.5c-1.5 0-3 .5-4 1.5Z" /><path d="M12 7c0-2 1-4 3-5" /></>,
  cup: <><path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" /><path d="M8 2v3M12 2v3" /></>,
  egg: <path d="M12 2.5c3.5 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3.5-11 7-11Z" />,
  fish: <><path d="M3 12c2.5-4 6-6 10-6 4 0 7 3 8 6-1 3-4 6-8 6-4 0-7.5-2-10-6Z" /><path d="M3 12 1 8.5M3 12l-2 3.5" /><circle cx="16" cy="11" r=".8" /></>,
  anchor: <><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V21" /><path d="M5 13a7 7 0 0 0 14 0" /><path d="M9 11h6" /></>,
  wave: <><path d="M2 9c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 3.5-2 5-1" /><path d="M2 15c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 3.5-2 5-1" /></>,
  note: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2.2 2.2 0 0 0 4 0" /></>,
  drum: <><ellipse cx="12" cy="7" rx="8" ry="3" /><path d="M4 7v9c0 1.7 3.6 3 8 3s8-1.3 8-3V7" /><path d="M8 3l3 4M16 3l-3 4" /></>,
  house: <><path d="M3 11 12 3l9 8v10H3z" /><path d="M10 21v-6h4v6" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.8-9.8M17 6l2.5 2.5M14.5 8.5 16.5 10.5" /></>,
  heart: <path d="M12 20.5 4.2 12.7a5 5 0 0 1 7.1-7.1l.7.7.7-.7a5 5 0 0 1 7.1 7.1z" />,
  car: <><path d="M3 16v-4l2.5-5h13l2.5 5v4z" /><circle cx="7.5" cy="16.5" r="2" /><circle cx="16.5" cy="16.5" r="2" /><path d="M5 12h14" /></>,
  bike: <><circle cx="5.5" cy="16" r="4" /><circle cx="18.5" cy="16" r="4" /><path d="M5.5 16 9 8h6l3.5 8M9 8l3 8h-6.5M14 5h3" /></>,
  umbrella: <><path d="M22 12a10 10 0 0 0-20 0Z" /><path d="M12 12v7a2 2 0 0 0 4 0" /><path d="M12 2v1" /></>,
};

export function ObjectGlyph({
  object,
  color = "currentColor",
  silhouette = false,
  className = "w-10 h-10",
}: {
  object: ObjectId;
  color?: string;
  silhouette?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={silhouette ? "#1e293b" : "none"}
      stroke={silhouette ? "#1e293b" : color}
      strokeWidth={silhouette ? 2.6 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {OBJECT_PATHS[object]}
    </svg>
  );
}

/* Geometric shapes on a 100×100 viewbox */
export function shapePath(shape: ShapeKind): React.ReactNode {
  switch (shape) {
    case "circle": return <circle cx="50" cy="50" r="40" />;
    case "square": return <rect x="12" y="12" width="76" height="76" rx="8" />;
    case "triangle": return <path d="M50 10 92 86H8z" strokeLinejoin="round" />;
    case "diamond": return <path d="M50 6 90 50 50 94 10 50z" strokeLinejoin="round" />;
    case "hexagon": return <path d="M50 6 88 28v44L50 94 12 72V28z" strokeLinejoin="round" />;
    case "star": return <path d="M50 6l12.4 26.6 29 3.4-21.5 19.8 6 28.7L50 70l-25.9 14.5 6-28.7L8.6 36l29-3.4z" strokeLinejoin="round" />;
  }
}

export function ShapeGlyph({
  shape,
  color,
  rotation = 0,
  scale = 1,
  className = "w-full h-full",
}: {
  shape: ShapeKind;
  color: string;
  rotation?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g transform={`rotate(${rotation} 50 50) translate(50 50) scale(${scale}) translate(-50 -50)`} fill={color} stroke={color} strokeWidth="4">
        {shapePath(shape)}
      </g>
    </svg>
  );
}

/** Polyomino renderer for Rotate It */
export function Polyomino({
  cells,
  className = "w-24 h-24",
  color = "#5b4bff",
}: {
  cells: [number, number][];
  className?: string;
  color?: string;
}) {
  const rows = Math.max(...cells.map((c) => c[0])) + 1;
  const cols = Math.max(...cells.map((c) => c[1])) + 1;
  const dim = Math.max(rows, cols);
  const off = [(dim - rows) / 2, (dim - cols) / 2];
  return (
    <svg viewBox={`-0.15 -0.15 ${dim + 0.3} ${dim + 0.3}`} className={className} aria-hidden="true">
      {cells.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={c + off[1] + 0.04}
          y={r + off[0] + 0.04}
          width={0.92}
          height={0.92}
          rx={0.14}
          fill={color}
          fillOpacity={0.9}
        />
      ))}
    </svg>
  );
}
