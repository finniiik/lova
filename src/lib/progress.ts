import { WORDS } from "@/data/words";

export type Phase = "home" | "select" | "learn" | "quiz" | "done";

export type Progress = {
  unlocked: boolean;
  day: number;
  learned: number[];
  review: number[];
  pool: number[] | null;
  chosen: number[] | null;
  phase: Phase;
  lastDayDate: string | null;
  streak: number;
};

const KEY = "love-vocab-progress-v1";

export const emptyProgress = (): Progress => ({
  unlocked: false,
  day: 1,
  learned: [],
  review: [],
  pool: null,
  chosen: null,
  phase: "home",
  lastDayDate: null,
  streak: 0,
});

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export const TOTAL = WORDS.length;
export const TOTAL_DAYS = Math.ceil(TOTAL / 5);
export const PASSWORD = "ilysm";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

export function makePool(learned: number[]): number[] {
  const rest = WORDS.filter((w) => !learned.includes(w.id)).map((w) => w.id);
  return shuffle(rest).slice(0, Math.min(10, rest.length));
}

export function byId(id: number) {
  return WORDS.find((w) => w.id === id)!;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
