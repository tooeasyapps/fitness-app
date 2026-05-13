import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EXERCISES = {
  default: [
    "Leg Press",
    "Flat Barbell Bench Press",
    "Seated Cable Row",
    "Lat Pulldown",
    "Dumbbell Shoulder Press",
    "Walking Lunges",
    "Romanian Deadlift (RDL)",
  ],
  alternatives: [
    "Barbell Back Squat",
    "Goblet Squat",
    "Bulgarian Split Squat",
    "Dumbbell Bench Press",
    "Incline Dumbbell Press",
    "Barbell Bent-Over Row",
    "Dumbbell Row (single arm)",
    "Overhead Press (barbell)",
    "Arnold Press",
  ],
};

/** Suggest next session weight based on last session performance */
export function suggestNextWeight(
  lastWeight: number | null,
  lastReps: number | null,
  targetRepRange: [number, number] = [6, 10]
): { weight: number; reasoning: string } | null {
  if (!lastWeight || !lastReps) return null;
  const [min, max] = targetRepRange;

  if (lastReps >= max) {
    const next = Math.round(lastWeight * 1.05 * 2) / 2; // round to 0.5
    return { weight: next, reasoning: `Hit ${lastReps} reps — try ${next}kg (+5%)` };
  }
  if (lastReps >= Math.floor((min + max) / 2)) {
    return { weight: lastWeight, reasoning: `Stay at ${lastWeight}kg — push for more reps` };
  }
  if (lastReps < min) {
    const next = Math.round(lastWeight * 0.95 * 2) / 2;
    return { weight: next, reasoning: `Drop to ${next}kg — rebuild form` };
  }
  return { weight: lastWeight, reasoning: "Keep at the same weight" };
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
