import type { ObjectId, ShapeKind } from "./types";

export const OBJECT_NAMES: Record<ObjectId, string> = {
  sun: "Sun", moon: "Moon", star: "Star", cloud: "Cloud",
  tree: "Tree", leaf: "Leaf", flower: "Flower",
  book: "Book", pencil: "Pencil", ruler: "Ruler",
  apple: "Apple", cup: "Cup", egg: "Egg",
  fish: "Fish", anchor: "Anchor", wave: "Wave",
  note: "Music note", bell: "Bell", drum: "Drum",
  house: "House", key: "Key", heart: "Heart",
  car: "Car", bike: "Bike", umbrella: "Umbrella",
};

export const ALL_OBJECTS = Object.keys(OBJECT_NAMES) as ObjectId[];

/** Objects with a clear, closed outline that reads well as a silhouette */
export const SILHOUETTE_OBJECTS: ObjectId[] = [
  "sun", "moon", "star", "cloud", "tree", "leaf", "apple", "cup", "egg",
  "fish", "bell", "house", "heart", "car", "umbrella", "drum", "book", "key",
];

export const OBJECT_GROUPS: { id: string; label: string; members: ObjectId[] }[] = [
  { id: "sky", label: "Sky & weather", members: ["sun", "moon", "star", "cloud", "umbrella"] },
  { id: "nature", label: "Nature", members: ["tree", "leaf", "flower"] },
  { id: "school", label: "School", members: ["book", "pencil", "ruler"] },
  { id: "food", label: "Food & drink", members: ["apple", "cup", "egg"] },
  { id: "sea", label: "Sea", members: ["fish", "anchor", "wave"] },
  { id: "music", label: "Music", members: ["note", "bell", "drum"] },
  { id: "home", label: "Home", members: ["house", "key"] },
  { id: "travel", label: "Travel", members: ["car", "bike"] },
];

export const KID_COLORS: { name: string; hex: string }[] = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#f97316" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Brown", hex: "#92400e" },
];

/** Base color + a lighter/darker shade for subtle "odd one" differences */
export const SHADE_PAIRS: [string, string][] = [
  ["#3b82f6", "#60a5fa"],
  ["#22c55e", "#4ade80"],
  ["#8b5cf6", "#a78bfa"],
  ["#f97316", "#fb923c"],
  ["#ec4899", "#f472b6"],
  ["#5b4bff", "#7c70ff"],
];

export const SCENE_COLORS = ["#5b4bff", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#0ea5e9", "#ef4444"];

export const SHAPES: ShapeKind[] = ["circle", "square", "triangle", "diamond", "hexagon", "star"];
