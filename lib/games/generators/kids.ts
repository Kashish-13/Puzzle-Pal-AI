import type { ChallengeDifficulty } from "@/lib/types";
import type { Rng } from "../rng";
import type {
  BelongRound,
  ColorRound,
  CompareRound,
  MemoryMatchConfig,
  NumberHuntRound,
  ObjectChoiceRound,
  ObjectId,
  OddOneRound,
  PlacedItem,
  ShapeItem,
} from "../types";
import {
  ALL_OBJECTS,
  KID_COLORS,
  OBJECT_GROUPS,
  OBJECT_NAMES,
  SCENE_COLORS,
  SHADE_PAIRS,
  SHAPES,
  SILHOUETTE_OBJECTS,
} from "../objects";

type D = ChallengeDifficulty;
const LEVEL: Record<D, number> = { easy: 0, medium: 1, hard: 2, expert: 3 };

/* ---------------- Color Detective ---------------- */

const MIXES: { a: string; b: string; result: string }[] = [
  { a: "Red", b: "Yellow", result: "Orange" },
  { a: "Blue", b: "Yellow", result: "Green" },
  { a: "Red", b: "Blue", result: "Purple" },
  { a: "Red", b: "White", result: "Pink" },
];
const hexOf = (name: string) =>
  name === "White" ? "#ffffff" : KID_COLORS.find((c) => c.name === name)?.hex || "#000000";

export function colorDetective(rng: Rng, d: D): ColorRound[] {
  const lvl = LEVEL[d];
  const optionCount = [3, 4, 6, 6][lvl];
  const kinds: ColorRound["kind"][] = [
    ["name-to-swatch", "name-to-swatch", "name-to-swatch", "name-to-swatch", "name-to-swatch"],
    ["name-to-swatch", "swatch-to-name", "name-to-swatch", "swatch-to-name", "mix"],
    ["swatch-to-name", "mix", "name-to-swatch", "mix", "swatch-to-name"],
    ["stroop", "mix", "stroop", "swatch-to-name", "stroop"],
  ][lvl] as ColorRound["kind"][];

  return kinds.map((kind) => {
    if (kind === "mix") {
      const m = rng.pick(MIXES);
      const others = rng.sample(
        KID_COLORS.filter((c) => c.name !== m.result),
        Math.min(optionCount, 4) - 1
      );
      const opts = rng.shuffle([KID_COLORS.find((c) => c.name === m.result)!, ...others]);
      return {
        kind,
        prompt: "What color do you get when you mix these?",
        mix: [hexOf(m.a), hexOf(m.b)],
        options: opts.map((o) => ({ hex: o.hex, label: o.name })),
        answer: opts.findIndex((o) => o.name === m.result),
        hint: `Think about paint: ${m.a.toLowerCase()} and ${m.b.toLowerCase()} together make a new color.`,
        explanation: `${m.a} + ${m.b} makes ${m.result}.`,
      };
    }

    const opts = rng.sample(KID_COLORS, optionCount);
    const answer = rng.int(0, opts.length - 1);
    const target = opts[answer];

    if (kind === "stroop") {
      const ink = rng.pick(opts.filter((o) => o.name !== target.name));
      const inkIdx = opts.indexOf(ink);
      return {
        kind,
        prompt: "Tap the color of the ink — not the word!",
        word: target.name.toUpperCase(),
        ink: ink.hex,
        options: opts.map((o) => ({ label: o.name, hex: o.hex })),
        answer: inkIdx,
        hint: "Ignore what the word says. Look only at the color the letters are painted in.",
        explanation: `The word said ${target.name}, but the ink was ${ink.name}.`,
      };
    }
    if (kind === "swatch-to-name") {
      return {
        kind,
        prompt: "What is this color called?",
        swatch: target.hex,
        options: opts.map((o) => ({ label: o.name })),
        answer,
        hint: "Compare the swatch with things you know — like the sky, grass, or a banana.",
        explanation: `That color is ${target.name}.`,
      };
    }
    return {
      kind: "name-to-swatch",
      prompt: `Find the color ${target.name.toUpperCase()}`,
      word: target.name.toUpperCase(),
      options: opts.map((o) => ({ hex: o.hex, label: o.name })),
      answer,
      hint: `Look for the swatch that is ${target.name.toLowerCase()}.`,
      explanation: `${target.name} was the right swatch.`,
    };
  });
}

/* ---------------- What's Behind? & Shadow Guess ---------------- */

function groupOf(obj: ObjectId) {
  return OBJECT_GROUPS.find((g) => g.members.includes(obj));
}

function objectChoice(
  rng: Rng,
  pool: ObjectId[],
  count: number,
  similar: boolean
): { target: ObjectId; options: ObjectId[]; answer: number } {
  const target = rng.pick(pool);
  let distractorPool = pool.filter((o) => o !== target);
  if (similar) {
    const sameGroup = (groupOf(target)?.members || []).filter((o) => o !== target && pool.includes(o));
    distractorPool = [...sameGroup, ...rng.shuffle(distractorPool.filter((o) => !sameGroup.includes(o)))];
  } else {
    distractorPool = rng.shuffle(distractorPool);
  }
  const options = rng.shuffle([target, ...distractorPool.slice(0, count - 1)]);
  return { target, options, answer: options.indexOf(target) };
}

export function whatsBehind(rng: Rng, d: D): ObjectChoiceRound[] {
  const lvl = LEVEL[d];
  const count = [3, 4, 6, 6][lvl];
  const previewMs = [2200, 1600, 1200, 850][lvl];
  return Array.from({ length: 5 }, () => {
    const { target, options, answer } = objectChoice(rng, ALL_OBJECTS, count, lvl >= 2);
    return {
      target,
      targetColor: rng.pick(SCENE_COLORS),
      options,
      answer,
      previewMs,
      hint: `It belongs to the "${groupOf(target)?.label || "everyday"}" group.`,
      explanation: `It was the ${OBJECT_NAMES[target].toLowerCase()}.`,
    };
  });
}

export function shadowGuess(rng: Rng, d: D): ObjectChoiceRound[] {
  const lvl = LEVEL[d];
  const count = [3, 4, 5, 6][lvl];
  return Array.from({ length: 5 }, () => {
    const { target, options, answer } = objectChoice(rng, SILHOUETTE_OBJECTS, count, lvl >= 2);
    return {
      target,
      targetColor: rng.pick(SCENE_COLORS),
      options,
      answer,
      hint: "Trace the outline with your eyes: is it round, pointy, tall, or wide?",
      explanation: `The shadow belonged to the ${OBJECT_NAMES[target].toLowerCase()}.`,
    };
  });
}

/* ---------------- Find the Odd One ---------------- */

export function oddOne(rng: Rng, d: D): OddOneRound[] {
  const lvl = LEVEL[d];
  const cols = [3, 3, 4, 5][lvl];
  const count = [6, 9, 16, 25][lvl];

  return Array.from({ length: 5 }, () => {
    const answer = rng.int(0, count - 1);
    let base: ShapeItem;
    let odd: ShapeItem;
    let hint: string;
    let explanation: string;

    if (lvl === 0) {
      const [a, b] = rng.sample(SHAPES, 2);
      const color = rng.pick(SCENE_COLORS);
      base = { shape: a, color };
      odd = { shape: b, color };
      hint = "Look at the outline of each shape.";
      explanation = `One was a ${b}; the rest were ${a}s.`;
    } else if (lvl === 1) {
      const shape = rng.pick(SHAPES);
      const [c1, c2] = rng.sample(KID_COLORS.map((c) => c.hex), 2);
      base = { shape, color: c1 };
      odd = { shape, color: c2 };
      hint = "Every shape is the same — check the colors.";
      explanation = "One shape had a different color.";
    } else if (lvl === 2) {
      const shape = rng.pick<ShapeItem["shape"]>(["triangle", "star", "diamond"]);
      const color = rng.pick(SCENE_COLORS);
      const bySize = rng.next() < 0.5;
      base = { shape, color, rotation: 0, scale: 1 };
      odd = bySize ? { shape, color, scale: 0.72 } : { shape, color, rotation: shape === "triangle" ? 180 : 45 };
      hint = bySize ? "Compare how big each shape is." : "Check which way each shape is pointing.";
      explanation = bySize ? "One shape was smaller." : "One shape was turned a different way.";
    } else {
      const shape = rng.pick<ShapeItem["shape"]>(["circle", "square", "hexagon", "triangle"]);
      const subtleShade = shape === "circle" || rng.next() < 0.5;
      const [c1, c2] = rng.pick(SHADE_PAIRS);
      base = { shape, color: c1 };
      odd = subtleShade ? { shape, color: c2 } : { shape, color: c1, rotation: 30 };
      hint = subtleShade ? "One shade is slightly lighter. Scan row by row." : "One shape is tilted just a little.";
      explanation = subtleShade ? "One shape was a slightly lighter shade." : "One shape was slightly rotated.";
    }

    const items = Array.from({ length: count }, (_, i) => (i === answer ? odd : base));
    return { cols, items, answer, hint, explanation };
  });
}

/* ---------------- Memory Match ---------------- */

export function memoryMatch(rng: Rng, d: D): MemoryMatchConfig[] {
  const pairs = [4, 6, 8, 10][LEVEL[d]];
  const objs = rng.sample(ALL_OBJECTS, pairs);
  const colors = rng.shuffle(SCENE_COLORS);
  const unique = objs.map((object, i) => ({ object, color: colors[i % colors.length] }));
  const cards = rng.shuffle([...unique, ...unique]);
  return [
    {
      cards,
      pairs,
      hint: "Work systematically: flip cards you haven't seen yet before guessing, and say the objects to yourself.",
    },
  ];
}

/* ---------------- Where Does It Belong? ---------------- */

export function whereBelongs(rng: Rng, d: D): BelongRound[] {
  const binCount = [2, 3, 4, 4][LEVEL[d]];
  return Array.from({ length: 5 }, () => {
    const groups = rng.sample(OBJECT_GROUPS, binCount);
    const answer = rng.int(0, groups.length - 1);
    const group = groups[answer];
    const object = rng.pick(group.members);
    const bins = groups.map((g) => {
      const iconPool = g.members.filter((m) => m !== object);
      return { id: g.id, label: g.label, icon: rng.pick(iconPool.length ? iconPool : g.members) };
    });
    return {
      object,
      color: rng.pick(SCENE_COLORS),
      bins,
      answer,
      hint: `Where would you usually find a ${OBJECT_NAMES[object].toLowerCase()}?`,
      explanation: `A ${OBJECT_NAMES[object].toLowerCase()} belongs with ${group.label.toLowerCase()}.`,
    };
  });
}

/* ---------------- What Changed? (grid layout) ---------------- */

export function whatChanged(rng: Rng, d: D): CompareRound[] {
  const lvl = LEVEL[d];
  const [cols, rows] = ([[3, 2], [3, 3], [4, 3], [4, 4]] as [number, number][])[lvl];
  const changeKinds = (["missing", "color", "swap", "size"] as const);

  return Array.from({ length: 4 }, (_, roundIdx) => {
    const n = cols * rows;
    const objs = rng.sample(ALL_OBJECTS, n);
    const left: PlacedItem[] = objs.map((object, i) => ({
      id: `o${i}`,
      x: ((i % cols) + 0.5) * (100 / cols),
      y: (Math.floor(i / cols) + 0.5) * (100 / rows),
      kind: { type: "object", object },
      color: rng.pick(SCENE_COLORS),
      size: 15,
      rotation: 0,
    }));
    const right = left.map((it) => ({ ...it }));
    const changeCount = lvl === 3 ? 2 : 1;
    const changedIdx = rng.sample(Array.from({ length: n }, (_, i) => i), changeCount);
    const kind = lvl === 3 ? rng.pick(changeKinds) : changeKinds[Math.min(lvl, 3) === 0 ? 0 : (roundIdx + lvl) % 3];
    const removed = new Set<number>();

    for (const idx of changedIdx) {
      const it = right[idx];
      if (kind === "missing") removed.add(idx);
      else if (kind === "color") it.color = rng.pick(SCENE_COLORS.filter((c) => c !== it.color));
      else if (kind === "swap") {
        const unused = ALL_OBJECTS.filter((o) => !objs.includes(o));
        it.kind = { type: "object", object: rng.pick(unused) };
      } else it.size = it.size * 0.6;
    }

    const describe = {
      missing: "Something disappeared from the right picture.",
      color: "Something changed color.",
      swap: "One object was swapped for a different one.",
      size: "Something got smaller.",
    }[kind];

    return {
      left,
      right: right.filter((_, i) => !removed.has(i)),
      changedIds: changedIdx.map((i) => left[i].id),
      layout: "grid",
      hint: `${describe} Check one row at a time.`,
      explanation: describe,
    };
  });
}

/* ---------------- Number Hunt ---------------- */

const CONFUSABLE: Record<string, string[]> = {
  "6": ["9", "8", "5", "0"],
  "9": ["6", "8", "0", "3"],
  "8": ["3", "0", "6", "9"],
  "3": ["8", "5", "2", "9"],
  "1": ["7", "4", "2", "1"],
  "7": ["1", "4", "2", "9"],
  "5": ["3", "6", "2", "8"],
  "2": ["5", "7", "3", "1"],
};

export function numberHunt(rng: Rng, d: D): NumberHuntRound[] {
  const lvl = LEVEL[d];
  const cols = [3, 4, 5, 5][lvl];
  const n = cols * cols;

  return Array.from({ length: 5 }, () => {
    let target: string;
    let pool: string[];

    if (lvl <= 1) {
      target = String(rng.int(1, 9));
      const confusables = CONFUSABLE[target] || [];
      const digits = "0123456789".split("").filter((x) => x !== target);
      pool = lvl === 1 ? [...confusables.filter((c) => c !== target), ...digits] : digits;
    } else {
      const a = rng.int(1, 9);
      const b = rng.int(0, 9);
      target = `${a}${b}`;
      const variants = new Set<string>([`${b}${a}`, `${a}${a}`, `${b}${b}`, `${a}${(b + 1) % 10}`, `${(a % 9) + 1}${b}`]);
      variants.delete(target);
      pool = [...variants].filter((v) => !v.startsWith("0"));
      while (pool.length < 8) {
        const v = String(rng.int(10, 99));
        if (v !== target && !pool.includes(v)) pool.push(v);
      }
    }

    const targetCount = lvl === 3 ? rng.int(2, 3) : 1;
    const targets = rng.sample(Array.from({ length: n }, (_, i) => i), targetCount).sort((x, y) => x - y);
    const cells = Array.from({ length: n }, (_, i) => (targets.includes(i) ? target : rng.pick(pool)));

    return {
      cols,
      cells,
      target,
      targets,
      hint:
        targetCount > 1
          ? `There are ${targetCount} of them. Scan each row from left to right.`
          : "Scan row by row, left to right, like reading a book.",
      explanation: targetCount > 1 ? `${target} appeared ${targetCount} times.` : `${target} was hiding in the grid.`,
    };
  });
}
