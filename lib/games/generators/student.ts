import type { ChallengeDifficulty } from "@/lib/types";
import type { Rng } from "../rng";
import type {
  CodeRound,
  CompareRound,
  EscapeBoard,
  EscapeTile,
  MemoryGridRound,
  PlacedItem,
  RotateRound,
  SequenceRound,
  TileBoard,
} from "../types";
import { ALL_OBJECTS, SCENE_COLORS, SHADE_PAIRS, SHAPES } from "../objects";

type D = ChallengeDifficulty;
const LEVEL: Record<D, number> = { easy: 0, medium: 1, hard: 2, expert: 3 };

/* ================= Crack the Code ================= */

type SeqRule = { terms: (string | number)[]; next: string | number; wrong: (string | number)[]; hint: string; explanation: string };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function seqRule(rng: Rng, kind: string): SeqRule {
  switch (kind) {
    case "arith": {
      const a = rng.int(1, 20), dlt = rng.int(2, 9);
      const t = [0, 1, 2, 3, 4].map((i) => a + dlt * i);
      const next = a + dlt * 5;
      return { terms: t, next, wrong: [next + dlt, next - 1, next + 1], hint: "Look at the gap between neighbouring numbers.", explanation: `Each term adds ${dlt}.` };
    }
    case "geo": {
      const a = rng.int(1, 4), r = rng.int(2, 3);
      const t = [0, 1, 2, 3].map((i) => a * r ** i);
      const next = a * r ** 4;
      return { terms: t, next, wrong: [t[3] + (t[3] - t[2]), next * r, next - r], hint: "The gaps keep growing — try dividing instead of subtracting.", explanation: `Each term is multiplied by ${r}.` };
    }
    case "alt": {
      const a = rng.int(1, 10), p = rng.int(2, 6), q = rng.int(7, 12);
      const t = [a];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? p : q));
      const next = t[5] + q;
      return { terms: t, next, wrong: [t[5] + p, next + 1, t[5] + p + q], hint: "The differences alternate between two values.", explanation: `The steps alternate +${p}, +${q}.` };
    }
    case "incdiff": {
      const a = rng.int(1, 10), s = rng.int(1, 3);
      const t = [a];
      for (let i = 1; i < 5; i++) t.push(t[i - 1] + s * i);
      const next = t[4] + s * 5;
      return { terms: t, next, wrong: [t[4] + s * 4, next + s, next - 1], hint: "Write down the differences — they form their own pattern.", explanation: `The differences grow by ${s} each time.` };
    }
    case "squares": {
      const c = rng.int(-2, 3), start = rng.int(1, 3);
      const t = [0, 1, 2, 3, 4].map((i) => (start + i) ** 2 + c);
      const n = start + 5;
      const next = n ** 2 + c;
      return { terms: t, next, wrong: [next + 1, (n - 1) ** 2 + c + 2 * n, next - 2], hint: "Compare each term with a square number.", explanation: c === 0 ? "They are consecutive squares." : `Each term is a square number ${c > 0 ? "plus" : "minus"} ${Math.abs(c)}.` };
    }
    case "fib": {
      const a = rng.int(1, 4), b = rng.int(2, 6);
      const t = [a, b];
      for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      const next = t[5] + t[4];
      return { terms: t, next, wrong: [t[5] * 2, next - t[3] + 1, next + 1], hint: "Try combining the two previous terms.", explanation: "Each term is the sum of the two before it." };
    }
    case "twostep": {
      // start ≥ 2 so "×2 then −1" can't collapse into a constant sequence
      const a = rng.int(2, 4), m = rng.int(2, 3), k = rng.pick([-1, 1, 2]);
      const t = [a];
      for (let i = 1; i < 5; i++) t.push(t[i - 1] * m + k);
      const next = t[4] * m + k;
      return { terms: t, next, wrong: [t[4] * m, t[4] * m - k, next + m], hint: "There are two operations per step — a multiply, then an add.", explanation: `Each term is ×${m} then ${k >= 0 ? "+" : "−"}${Math.abs(k)}.` };
    }
    case "letters": {
      const start = rng.int(0, 8), s = rng.int(2, 4);
      const t = [0, 1, 2, 3].map((i) => LETTERS[start + s * i]);
      const next = LETTERS[start + s * 4];
      const alt = (o: number) => LETTERS[Math.min(25, start + s * 4 + o)];
      return { terms: t, next, wrong: [alt(1), alt(-1), alt(s)], hint: "Count how many letters are skipped each time.", explanation: `Each letter moves ${s} places forward in the alphabet.` };
    }
    case "interleave": {
      const a = rng.int(1, 5), p = rng.int(2, 4), b = rng.int(20, 30), q = rng.int(2, 5);
      const t: number[] = [];
      for (let i = 0; i < 6; i++) t.push(i % 2 === 0 ? a + p * (i / 2) : b - q * ((i - 1) / 2));
      const next = a + p * 3;
      return { terms: t, next, wrong: [b - q * 3, t[5] - q, next + p], hint: "Read every second term — there may be two sequences woven together.", explanation: `Two sequences alternate: +${p} on odd positions, −${q} on even ones.` };
    }
    case "letterGrow":
    default: {
      const start = rng.int(0, 4);
      const idx = [0, 1, 3, 6, 10].map((x) => start + x);
      const t = idx.slice(0, 4).map((i) => LETTERS[i]);
      const next = LETTERS[idx[4]];
      return { terms: t, next, wrong: [LETTERS[idx[3] + 3], LETTERS[idx[3] + 5], LETTERS[idx[3] + 2]], hint: "The jumps between letters get one bigger each time.", explanation: "The letter jumps grow: +1, +2, +3, +4." };
    }
  }
}

export function crackCode(rng: Rng, d: D): SequenceRound[] {
  const pools = [
    ["arith", "geo", "arith", "letters"],
    ["alt", "incdiff", "geo", "letters", "arith"],
    ["squares", "fib", "twostep", "incdiff", "alt"],
    ["interleave", "twostep", "fib", "squares", "letterGrow"],
  ][LEVEL[d]];
  const kinds = rng.shuffle([...pools, ...pools]).slice(0, 5);
  return kinds.map((k) => {
    const r = seqRule(rng, k);
    const nextStr = String(r.next);
    const wrong = [...new Set(r.wrong.map(String))].filter((w) => w !== nextStr);
    let filler = 2;
    while (wrong.length < 3) {
      const cand = typeof r.next === "number" ? String(r.next + filler * (filler % 2 ? 1 : -1)) : LETTERS[(LETTERS.indexOf(nextStr) + filler) % 26];
      if (cand !== nextStr && !wrong.includes(cand)) wrong.push(cand);
      filler++;
    }
    const options = rng.shuffle([nextStr, ...wrong.slice(0, 3)]);
    return { terms: r.terms.map(String), options, answer: options.indexOf(nextStr), hint: r.hint, explanation: r.explanation };
  });
}

/* ================= Grid helpers ================= */

function neighbors(i: number, size: number): number[] {
  const r = Math.floor(i / size), c = i % size;
  const out: number[] = [];
  if (r > 0) out.push(i - size);
  if (r < size - 1) out.push(i + size);
  if (c > 0) out.push(i - 1);
  if (c < size - 1) out.push(i + 1);
  return out;
}

function bfs(size: number, blocked: Set<number>, start: number, end: number): number {
  const dist = new Map<number, number>([[start, 0]]);
  const q = [start];
  while (q.length) {
    const cur = q.shift()!;
    if (cur === end) return dist.get(cur)!;
    for (const n of neighbors(cur, size)) {
      if (!blocked.has(n) && !dist.has(n)) {
        dist.set(n, dist.get(cur)! + 1);
        q.push(n);
      }
    }
  }
  return -1;
}

/* ================= Tile Path ================= */

export function tilePath(rng: Rng, d: D): TileBoard[] {
  const lvl = LEVEL[d];
  const size = [5, 6, 7, 8][lvl];
  const density = [0.22, 0.27, 0.3, 0.32][lvl];
  const slack = [null, 4, 2, 0][lvl];

  return Array.from({ length: 3 }, () => {
    const start = 0, end = size * size - 1;
    for (let attempt = 0; attempt < 300; attempt++) {
      const blocked = new Set<number>();
      for (let i = 0; i < size * size; i++) {
        if (i !== start && i !== end && rng.next() < density) blocked.add(i);
      }
      const shortest = bfs(size, blocked, start, end);
      // Require a path that isn't trivially the open border
      if (shortest > 0 && (shortest > 2 * (size - 1) || attempt > 200)) {
        return {
          size,
          blocked: [...blocked],
          start,
          end,
          shortest,
          moveLimit: slack === null ? null : shortest + slack,
          hint: `The shortest route takes ${shortest} moves. Look for the gaps in each wall before committing.`,
        };
      }
    }
    return { size, blocked: [], start, end, shortest: 2 * (size - 1), moveLimit: null, hint: "Head toward E." };
  });
}

/* ================= Memory Grid ================= */

export function memoryGrid(rng: Rng, d: D): MemoryGridRound[] {
  const lvl = LEVEL[d];
  const size = [3, 4, 5, 6][lvl];
  const count = [3, 5, 7, 9][lvl];
  const previewMs = [1800, 1500, 1250, 1000][lvl];
  return Array.from({ length: 4 }, (_, r) => {
    const extra = r >= 2 ? 1 : 0; // later rounds get one more cell
    const cells = rng.sample(Array.from({ length: size * size }, (_, i) => i), count + extra).sort((a, b) => a - b);
    return {
      size,
      cells,
      previewMs,
      hint: "Chunk the pattern: group nearby cells into a shape (an L, a line, a corner) instead of memorizing them one by one.",
    };
  });
}

/* ================= Rotate It ================= */

type Cell = [number, number];

function normalize(cells: Cell[]): Cell[] {
  const minR = Math.min(...cells.map((c) => c[0]));
  const minC = Math.min(...cells.map((c) => c[1]));
  return cells.map(([r, c]) => [r - minR, c - minC] as Cell).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
const rotate = (cells: Cell[]): Cell[] => normalize(cells.map(([r, c]) => [c, -r] as Cell));
const mirror = (cells: Cell[]): Cell[] => normalize(cells.map(([r, c]) => [r, -c] as Cell));
const key = (cells: Cell[]) => normalize(cells).map((c) => c.join(",")).join("|");
function rotations(cells: Cell[]): Cell[][] {
  const out: Cell[][] = [normalize(cells)];
  for (let i = 0; i < 3; i++) out.push(rotate(out[out.length - 1]));
  return out;
}
const canonical = (cells: Cell[]) => rotations(cells).map(key).sort()[0];

function polyomino(rng: Rng, n: number): Cell[] {
  const cells: Cell[] = [[0, 0]];
  const has = (r: number, c: number) => cells.some(([a, b]) => a === r && b === c);
  while (cells.length < n) {
    const [r, c] = rng.pick(cells);
    const [dr, dc] = rng.pick<Cell>([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    if (!has(r + dr, c + dc)) cells.push([r + dr, c + dc]);
  }
  return normalize(cells);
}

export function rotateIt(rng: Rng, d: D): RotateRound[] {
  const lvl = LEVEL[d];
  const n = [4, 5, 6, 7][lvl];
  const mirrorCount = [0, 1, 2, 3][lvl];

  return Array.from({ length: 5 }, () => {
    let target: Cell[] = polyomino(rng, n);
    // Need a chiral shape so mirror images are genuinely different
    for (let i = 0; i < 100 && canonical(mirror(target)) === canonical(target); i++) target = polyomino(rng, n);

    const rots = rotations(target);
    const correct = rots[rng.int(1, 3)];
    const mirRots = rotations(mirror(target));
    const used = new Set<string>([key(correct)]);
    const distractors: Cell[][] = [];

    for (const m of rng.shuffle(mirRots)) {
      if (distractors.length >= mirrorCount) break;
      if (!used.has(key(m))) {
        used.add(key(m));
        distractors.push(m);
      }
    }
    const banned = new Set([canonical(target), canonical(mirror(target))]);
    let guard = 0;
    while (distractors.length < 3 && guard++ < 500) {
      const other = rotations(polyomino(rng, n))[rng.int(0, 3)];
      if (!banned.has(canonical(other)) && !used.has(key(other))) {
        used.add(key(other));
        banned.add(canonical(other));
        distractors.push(other);
      }
    }
    const options = rng.shuffle([correct, ...distractors]);
    return {
      target,
      options,
      answer: options.findIndex((o) => key(o) === key(correct)),
      allowPreviewRotate: lvl <= 1,
      hint: mirrorCount > 0
        ? "Pick one distinctive corner of the target and track where it goes as you turn the shape. Mirror images flip that corner to the other side."
        : "Mentally turn the target a quarter turn at a time and compare.",
      explanation: "The correct option is the target rotated; the traps were mirror images or different shapes.",
    };
  });
}

/* ================= Escape Grid ================= */

export interface EscState { pos: number; key: boolean; gate: boolean }

export function solveEscape(size: number, tiles: EscapeTile[], start: number): number {
  const id = (s: EscState) => `${s.pos}|${s.key ? 1 : 0}|${s.gate ? 1 : 0}`;
  const startState: EscState = { pos: start, key: false, gate: false };
  const dist = new Map<string, number>([[id(startState), 0]]);
  const q: EscState[] = [startState];
  while (q.length) {
    const cur = q.shift()!;
    const dcur = dist.get(id(cur))!;
    for (const n of neighbors(cur.pos, size)) {
      const next = escapeStep(tiles, cur, n);
      if (!next) continue;
      if (tiles[n] === "exit") return dcur + 1;
      const k = id(next);
      if (!dist.has(k)) {
        dist.set(k, dcur + 1);
        q.push(next);
      }
    }
  }
  return -1;
}

/** Applies one move; returns null if blocked. Shared by solver and UI. */
export function escapeStep(tiles: EscapeTile[], s: EscState, to: number): EscState | null {
  const t = tiles[to];
  if (t === "wall") return null;
  if (t === "door" && !s.key) return null;
  if (t === "gate" && !s.gate) return null;
  return {
    pos: to,
    key: s.key || t === "key",
    gate: t === "switch" ? !s.gate : s.gate,
  };
}

export function escapeGrid(rng: Rng, d: D): EscapeBoard[] {
  const lvl = LEVEL[d];
  const size = [6, 7, 8, 9][lvl];
  const slack = [null, null, 4, 2][lvl];

  return Array.from({ length: 2 }, () => {
    for (let attempt = 0; attempt < 400; attempt++) {
      const n = size;
      const at = (r: number, c: number) => r * n + c;
      const tiles: EscapeTile[] = Array(n * n).fill("floor");
      const start = 0;
      const exit = at(n - 1, n - 1);
      tiles[exit] = "exit";
      const fixed = new Set<number>([start, exit]);

      if (lvl >= 1) {
        tiles[at(n - 2, n - 1)] = "door";
        tiles[at(n - 2, n - 2)] = "wall";
        tiles[at(n - 1, n - 2)] = "wall";
        [at(n - 2, n - 1), at(n - 2, n - 2), at(n - 1, n - 2)].forEach((i) => fixed.add(i));
      }
      if (lvl >= 2) {
        tiles[at(n - 3, n - 1)] = "gate";
        fixed.add(at(n - 3, n - 1));
      }

      const density = [0.24, 0.24, 0.22, 0.22][lvl];
      for (let i = 0; i < n * n; i++) {
        if (!fixed.has(i) && rng.next() < density) tiles[i] = "wall";
      }
      const free = () => {
        const opts = tiles.map((t, i) => (t === "floor" && i !== start ? i : -1)).filter((i) => i >= 0);
        return rng.pick(opts);
      };
      if (lvl >= 1) tiles[free()] = "key";
      if (lvl >= 2) tiles[free()] = "switch";

      const optimal = solveEscape(n, tiles, start);
      if (optimal > 0 && optimal >= n) {
        return {
          size: n,
          tiles,
          start,
          optimal,
          moveLimit: slack === null ? null : optimal + slack,
          hint:
            lvl === 0
              ? "Trace backwards from the exit to find which corridor actually connects."
              : lvl === 1
              ? "The exit is behind a locked door. Plan a route that picks up the key first."
              : "Order matters: you need the key for the door and the gate open. Each step on the switch toggles the gate.",
        };
      }
    }
    // Fallback: open board
    const tiles: EscapeTile[] = Array(size * size).fill("floor");
    tiles[size * size - 1] = "exit";
    return { size, tiles, start: 0, optimal: 2 * (size - 1), moveLimit: null, hint: "Head for the exit." };
  });
}

/* ================= SudoCode ================= */

type Op = "+" | "-" | "*";
type Stmt =
  | { t: "set"; v: string; a: string | number; op?: Op; b?: string | number; note?: string }
  | { t: "repeat"; n: number; body: Stmt[] }
  | { t: "if"; v: string; cmp: ">" | "<"; k: number; body: Stmt[] }
  | { t: "out"; v: string };

function run(prog: Stmt[]): number {
  const env: Record<string, number> = {};
  const val = (x: string | number) => (typeof x === "number" ? x : env[x] ?? 0);
  let output = NaN;
  const exec = (stmts: Stmt[]) => {
    for (const s of stmts) {
      if (s.t === "set") {
        const a = val(s.a);
        env[s.v] = s.op === undefined ? a : s.op === "+" ? a + val(s.b!) : s.op === "-" ? a - val(s.b!) : a * val(s.b!);
      } else if (s.t === "repeat") {
        for (let i = 0; i < s.n; i++) exec(s.body);
      } else if (s.t === "if") {
        const v = env[s.v] ?? 0;
        if (s.cmp === ">" ? v > s.k : v < s.k) exec(s.body);
      } else output = env[s.v] ?? 0;
    }
  };
  exec(prog);
  return output;
}

function stmtText(s: Stmt): string {
  if (s.t === "set") return s.op === undefined ? `${s.v} = ${s.a}` : `${s.v} = ${s.a} ${s.op} ${s.b}`;
  if (s.t === "repeat") return `repeat ${s.n} times:`;
  if (s.t === "if") return `if ${s.v} ${s.cmp} ${s.k}:`;
  return `output ${s.v}`;
}

function render(prog: Stmt[], withNotes = false, depth = 0): string[] {
  const pad = "    ".repeat(depth);
  return prog.flatMap((s) => {
    const line = pad + stmtText(s) + (withNotes && s.t === "set" && s.note ? `    # ${s.note}` : "");
    if (s.t === "repeat" || s.t === "if") return [line, ...render(s.body, withNotes, depth + 1)];
    return [line];
  });
}

function opNote(op: Op, b: number): string {
  if (op === "*") return b === 2 ? "double it" : b === 3 ? "triple it" : `multiply by ${b}`;
  return op === "+" ? `add ${b}` : `subtract ${b}`;
}

function randomOp(rng: Rng, v: string): Stmt {
  const op = rng.pick<Op>(["+", "+", "-", "*"]);
  const b = op === "*" ? rng.int(2, 3) : rng.int(1, 9);
  return { t: "set", v, a: v, op, b, note: opNote(op, b) };
}

function makeProgram(rng: Rng, lvl: number): Stmt[] {
  if (lvl === 0) {
    return [{ t: "set", v: "x", a: rng.int(2, 9) }, randomOp(rng, "x"), randomOp(rng, "x"), { t: "out", v: "x" }];
  }
  if (lvl === 1) {
    return [
      { t: "set", v: "x", a: rng.int(2, 6) },
      { t: "set", v: "y", a: rng.int(1, 5) },
      { t: "set", v: "x", a: "x", op: "+", b: "y", note: "add y to x" },
      randomOp(rng, "x"),
      { t: "out", v: "x" },
    ];
  }
  if (lvl === 2) {
    return [
      { t: "set", v: "x", a: rng.int(1, 4) },
      { t: "repeat", n: rng.int(2, 4), body: [randomOp(rng, "x")] },
      randomOp(rng, "x"),
      { t: "out", v: "x" },
    ];
  }
  const k = rng.int(8, 15);
  return [
    { t: "set", v: "x", a: rng.int(1, 3) },
    {
      t: "repeat",
      n: rng.int(3, 4),
      body: [
        { t: "set", v: "x", a: "x", op: "*", b: 2, note: "double it" },
        { t: "if", v: "x", cmp: ">", k, body: [{ t: "set", v: "x", a: "x", op: "-", b: rng.int(3, 7), note: "reduce it" }] },
      ],
    },
    { t: "out", v: "x" },
  ];
}

function numberOptions(rng: Rng, correct: number, extras: number[]): { options: string[]; answer: number } {
  const set = new Set<number>(extras.filter((e) => e !== correct && Number.isFinite(e)));
  let k = 1;
  while (set.size < 3) {
    const cand = correct + (k % 2 ? k : -k);
    if (cand !== correct) set.add(cand);
    k++;
  }
  const opts = rng.shuffle([correct, ...[...set].slice(0, 3)]);
  return { options: opts.map(String), answer: opts.indexOf(correct) };
}

function predictRound(rng: Rng, lvl: number): CodeRound {
  const prog = makeProgram(rng, lvl);
  const correct = run(prog);
  const extras: number[] = [];
  // Off-by-one loop and "skipped a line" distractors
  const loop = prog.find((s) => s.t === "repeat") as Extract<Stmt, { t: "repeat" }> | undefined;
  if (loop) {
    extras.push(run(prog.map((s) => (s === loop ? { ...loop, n: loop.n - 1 } : s))));
    extras.push(run(prog.map((s) => (s === loop ? { ...loop, n: loop.n + 1 } : s))));
  }
  const setIdx = prog.findIndex((s, i) => i > 0 && s.t === "set");
  if (setIdx > 0) extras.push(run(prog.filter((_, i) => i !== setIdx)));
  const { options, answer } = numberOptions(rng, correct, extras);
  return {
    kind: "predict",
    lines: render(prog),
    prompt: "What does this program output?",
    options,
    answer,
    hint: loop ? "Write the value of x after every pass through the loop." : "Track the value of each variable line by line.",
    explanation: `Tracing each line gives ${correct}.`,
  };
}

function missingRound(rng: Rng, lvl: number): CodeRound {
  for (let tries = 0; tries < 50; tries++) {
    const prog = makeProgram(rng, Math.min(lvl, 2));
    const target = run(prog);
    const top = prog.map((s, i) => ({ s, i })).filter(({ s, i }) => s.t === "set" && i > 0 && s.op !== undefined);
    if (!top.length) continue;
    const { s: missing, i: idx } = rng.pick(top);
    const correctText = stmtText(missing);
    const candidates = new Map<string, number>();
    for (let k = 0; k < 20 && candidates.size < 3; k++) {
      const alt = randomOp(rng, (missing as Extract<Stmt, { t: "set" }>).v);
      const txt = stmtText(alt);
      if (txt === correctText || candidates.has(txt)) continue;
      const out = run(prog.map((s, i) => (i === idx ? alt : s)));
      if (out !== target) candidates.set(txt, out);
    }
    if (candidates.size < 3) continue;
    const options = rng.shuffle([correctText, ...candidates.keys()]);
    const lines = render(prog.map((s, i) => (i === idx ? ({ t: "set", v: "__", a: 0 } as Stmt) : s))).map((l) =>
      l.includes("__ = 0") ? l.replace("__ = 0", "______") : l
    );
    return {
      kind: "missing",
      lines,
      blankLine: lines.findIndex((l) => l.includes("______")),
      prompt: `The program outputs ${target}. Which line fills the blank?`,
      options,
      answer: options.indexOf(correctText),
      hint: "Work forwards to the blank and backwards from the output, then see which step connects them.",
      explanation: `Only "${correctText}" produces ${target}.`,
    };
  }
  return predictRound(rng, lvl);
}

function bugRound(rng: Rng, lvl: number): CodeRound {
  for (let tries = 0; tries < 50; tries++) {
    const prog = makeProgram(rng, Math.min(lvl, 2));
    const target = run(prog);
    const flat = (stmts: Stmt[]): Extract<Stmt, { t: "set" }>[] =>
      stmts.flatMap((s) => (s.t === "set" ? [s] : s.t === "repeat" || s.t === "if" ? flat(s.body) : []));
    const candidates = flat(prog).filter((s) => s.op !== undefined && s.note);
    if (!candidates.length) continue;
    const victim = rng.pick(candidates);
    const original = { ...victim };
    // Mutate the code but keep the comment describing the intent
    if (typeof victim.b === "number" && rng.next() < 0.5) victim.b = victim.b + (victim.op === "*" ? 1 : rng.pick([1, 2]));
    else victim.op = victim.op === "+" ? "-" : victim.op === "-" ? "+" : "+";
    const out = run(prog);
    if (out === target) {
      Object.assign(victim, original);
      continue;
    }
    const lines = render(prog, true);
    const bugLine = lines.findIndex((l) => l.trim().startsWith(stmtText(victim)) && l.includes(`# ${victim.note}`));
    if (bugLine < 0) {
      Object.assign(victim, original);
      continue;
    }
    return {
      kind: "bug",
      lines,
      prompt: `This program should output ${target}, but it outputs ${out}. Tap the line whose code doesn't match its comment.`,
      options: [],
      answer: bugLine,
      hint: "Read each comment, then check the code on that line actually does what the comment says.",
      explanation: `The comment says "${victim.note}", but the code does something else.`,
    };
  }
  return predictRound(rng, lvl);
}

function arrangeRound(rng: Rng, lvl: number): CodeRound {
  for (let tries = 0; tries < 60; tries++) {
    const start: Stmt = { t: "set", v: "x", a: rng.int(2, 5) };
    const count = lvl >= 3 ? 4 : 3;
    const blocks: Stmt[] = [];
    const ops: Op[] = rng.shuffle<Op>(["*", "+", "-", lvl >= 3 ? "*" : "+"]).slice(0, count);
    for (const op of ops) {
      const b = op === "*" ? rng.int(2, 3) : rng.int(1, 6);
      blocks.push({ t: "set", v: "x", a: "x", op, b });
    }
    const target = run([start, ...blocks, { t: "out", v: "x" }]);
    // Order must matter: at least one other permutation gives a different result
    const shuffled = rng.shuffle(blocks.map((_, i) => i));
    const altOut = run([start, ...shuffled.map((i) => blocks[i]), { t: "out", v: "x" }]);
    if (shuffled.every((v, i) => v === i) || altOut === target) continue;
    return {
      kind: "arrange",
      lines: [stmtText(start), "…", "output x"],
      prompt: `Put the blocks in an order that makes the program output ${target}.`,
      options: shuffled.map((i) => stmtText(blocks[i])),
      // correct order expressed as indices into options
      answer: blocks.map((_, bi) => shuffled.indexOf(bi)),
      hint: "Multiplication amplifies whatever came before it — decide whether each addition should happen before or after the multiply.",
      explanation: `One valid order is: ${blocks.map(stmtText).join(" → ")}.`,
    };
  }
  return predictRound(rng, lvl);
}

/** Runs an arrange answer to check it — any order that reaches the target is accepted. */
export function runArrange(startLine: string, blockLines: string[]): number {
  const parse = (line: string): Stmt => {
    const m = line.match(/^(\w+) = (\w+)(?: ([+\-*]) (\w+))?$/);
    if (!m) return { t: "out", v: "x" };
    const num = (x: string) => (/^-?\d+$/.test(x) ? Number(x) : x);
    return m[3]
      ? { t: "set", v: m[1], a: num(m[2]), op: m[3] as Op, b: num(m[4]) }
      : { t: "set", v: m[1], a: num(m[2]) };
  };
  return run([parse(startLine), ...blockLines.map(parse), { t: "out", v: "x" }]);
}

export function sudocode(rng: Rng, d: D): CodeRound[] {
  const lvl = LEVEL[d];
  const plan: CodeRound["kind"][] = [
    ["predict", "predict", "missing", "predict", "missing"],
    ["predict", "missing", "bug", "predict", "arrange"],
    ["predict", "bug", "missing", "arrange", "predict"],
    ["predict", "bug", "arrange", "missing", "bug"],
  ][lvl] as CodeRound["kind"][];
  return plan.map((k) =>
    k === "predict" ? predictRound(rng, lvl) : k === "missing" ? missingRound(rng, lvl) : k === "bug" ? bugRound(rng, lvl) : arrangeRound(rng, lvl)
  );
}

/* ================= Spot the Change (free scenes) ================= */

export function spotChange(rng: Rng, d: D): CompareRound[] {
  const lvl = LEVEL[d];
  const count = [8, 12, 15, 18][lvl];
  const diffs = [2, 3, 3, 4][lvl];

  return Array.from({ length: 2 }, (_, round) => {
    const left: PlacedItem[] = [];
    let guard = 0;
    while (left.length < count && guard++ < 2000) {
      const x = rng.int(10, 90), y = rng.int(10, 90);
      if (left.some((it) => Math.hypot(it.x - x, it.y - y) < 17)) continue;
      const useShape = rng.next() < 0.55;
      left.push({
        id: `s${round}-${left.length}`,
        x,
        y,
        kind: useShape ? { type: "shape", shape: rng.pick(SHAPES) } : { type: "object", object: rng.pick(ALL_OBJECTS) },
        color: rng.pick(SCENE_COLORS),
        size: rng.int(10, 14),
        rotation: 0,
      });
    }
    const right = left.map((it) => ({ ...it, kind: { ...it.kind } as PlacedItem["kind"] }));
    const changed = rng.sample(right.map((_, i) => i), diffs);
    const kinds = lvl <= 1 ? ["color", "move", "remove", "size"] : ["shade", "rotate", "move", "size", "color"];
    const removed = new Set<number>();

    for (const idx of changed) {
      const it = right[idx];
      const kind = rng.pick(kinds);
      if (kind === "remove") removed.add(idx);
      else if (kind === "color") it.color = rng.pick(SCENE_COLORS.filter((c) => c !== it.color));
      else if (kind === "shade") {
        const pair = SHADE_PAIRS.find((p) => p.includes(it.color));
        it.color = pair ? (pair[0] === it.color ? pair[1] : pair[0]) : rng.pick(SCENE_COLORS.filter((c) => c !== it.color));
      } else if (kind === "rotate") {
        const isRound = it.kind.type === "shape" && (it.kind.shape === "circle" || it.kind.shape === "hexagon");
        if (isRound) it.color = rng.pick(SCENE_COLORS.filter((c) => c !== it.color));
        else it.rotation = rng.pick([45, 90, 180]);
      } else if (kind === "size") it.size = lvl <= 1 ? it.size * 0.6 : it.size * 0.78;
      else {
        const dist = lvl <= 1 ? 12 : 7;
        it.x = Math.max(8, Math.min(92, it.x + rng.pick([-dist, dist])));
        it.y = Math.max(8, Math.min(92, it.y + rng.pick([-dist, dist])));
      }
    }

    return {
      left,
      right: right.filter((_, i) => !removed.has(i)),
      changedIds: changed.map((i) => left[i].id),
      layout: "scene",
      hint: `There are ${diffs} differences. Split the scene into quadrants and compare one quadrant at a time.`,
      explanation: "Differences included changes in color, position, size, rotation, or missing objects.",
    };
  });
}
