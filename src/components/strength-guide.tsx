"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Info, Repeat, Target } from "lucide-react";

const EXERCISES = {
  legs: [
    ["Leg Press", "Heavy loading without balance demands", "Quads, glutes, hamstrings"],
    ["Barbell Back Squat", "King of leg exercises", "Quads, glutes, hamstrings, core"],
    ["Goblet Squat", "Beginner-friendly squat variation", "Quads, glutes, core"],
    ["Romanian Deadlift (RDL)", "Best hamstring/glute builder", "Hamstrings, glutes, lower back"],
    ["Walking Lunges", "Unilateral — fixes side imbalances", "Quads, glutes, hamstrings"],
    ["Bulgarian Split Squat", "Single-leg strength and stability", "Quads, glutes, hamstrings"],
  ],
  chest: [
    ["Flat Barbell Bench Press", "The standard — max chest recruitment", "Chest, front delts, triceps"],
    ["Dumbbell Bench Press", "Greater range of motion than barbell", "Chest, front delts, triceps"],
    ["Incline Dumbbell Press", "Targets upper chest more", "Upper chest, front delts, triceps"],
    ["Push-Ups (weighted/elevated)", "Bodyweight — scale with bands/vest", "Chest, front delts, triceps, core"],
  ],
  back: [
    ["Seated Cable Row", "Stable, consistent tension — great default", "Lats, rhomboids, traps, biceps"],
    ["Lat Pulldown", "Machine-based, easy to scale", "Lats, biceps, rear delts"],
    ["Barbell Bent-Over Row", "Heavy compound pull — full back", "Lats, rhomboids, traps, biceps"],
    ["Dumbbell Row (single arm)", "Easy to learn, isolates each side", "Lats, rhomboids, biceps"],
    ["Pull-Ups / Assisted Pull-Ups", "Bodyweight pull — scale with band/machine", "Lats, biceps, core"],
  ],
  shoulders: [
    ["Dumbbell Shoulder Press", "Solid all-rounder, easier on joints", "Front/side delts, triceps"],
    ["Overhead Press (barbell)", "Best overall shoulder builder", "All three delt heads, triceps, core"],
    ["Arnold Press", "Rotational press — hits all delt heads", "All three delt heads, triceps"],
    ["Landmine Press", "Shoulder-friendly angle", "Front delts, triceps, core"],
  ],
};

const PRESETS = [
  {
    name: "Preset A — Default",
    color: "border-ver bg-ver-light",
    accent: "text-ver",
    subtitle: "Our default session",
    exercises: [
      ["LEG 1", "Leg Press"],
      ["CHEST", "Flat Barbell Bench Press"],
      ["BACK", "Seated Cable Row or Lat Pulldown"],
      ["SHOULDERS", "Dumbbell Shoulder Press"],
      ["LEG 2 (optional)", "Walking Lunges or RDL"],
    ],
  },
  {
    name: "Preset B — Barbell",
    color: "border-green-500 bg-green-50",
    accent: "text-green-700",
    subtitle: "Barbell focus",
    exercises: [
      ["LEG 1", "Barbell Back Squat"],
      ["CHEST", "Flat Barbell Bench Press"],
      ["BACK", "Barbell Bent-Over Row"],
      ["SHOULDERS", "Overhead Press"],
      ["LEG 2 (optional)", "Romanian Deadlift"],
    ],
  },
  {
    name: "Preset C — Dumbbell",
    color: "border-purple-500 bg-purple-50",
    accent: "text-purple-700",
    subtitle: "Beginner-friendly",
    exercises: [
      ["LEG 1", "Goblet Squat"],
      ["CHEST", "Dumbbell Bench Press"],
      ["BACK", "Dumbbell Row"],
      ["SHOULDERS", "Arnold Press"],
      ["LEG 2 (optional)", "Bulgarian Split Squat"],
    ],
  },
];

function ExerciseTable({ title, items }: { title: string; items: string[][] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map(([name, why, muscles]) => (
            <div key={name} className="rounded-md border bg-slate-50 p-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4">
                <div className="font-semibold text-slate-800 md:w-1/3">{name}</div>
                <div className="text-sm text-slate-700 md:w-1/3">{why}</div>
                <div className="text-xs text-slate-500 md:w-1/3 md:text-right">{muscles}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StrengthGuide() {
  return (
    <div className="space-y-6">
      {/* Top note */}
      <Card className="border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Info className="h-5 w-5" /> Read This First
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900">
            <strong>Preset workouts are at the bottom of this page.</strong> Whether you pick a preset or build your own, <strong>stick with it for the whole session.</strong> Minimise decisions during the workout so you can focus your energy on the sets. Decide before you start — then just lift.
          </p>
        </CardContent>
      </Card>

      {/* Structure */}
      <Card className="border-ver/30 bg-gradient-to-br from-ver-light to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ver">
            <Dumbbell className="h-5 w-5" /> Session Structure — 1× Per Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>5 exercises per session:</strong> 2 legs, 1 chest, 1 back, 1 shoulders</li>
            <li>• <strong>Order:</strong> leg → chest → back → shoulders → second leg at the end</li>
            <li>• <strong>1 warm-up set + 3–4 working sets</strong> per exercise</li>
            <li>• <strong>Beginner reps:</strong> 6–10 &nbsp;|&nbsp; <strong>Intermediate reps:</strong> 8–12</li>
            <li>• Every working set should be a challenge. If the last 2 reps aren&apos;t hard, go heavier.</li>
          </ul>
        </CardContent>
      </Card>

      {/* How to do each exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-slate-600" /> How to Run Each Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-700">
            <p><strong>Warm-up set —</strong> Light weight, 10–12 reps. Get the movement pattern right and blood into the muscle. Not tiring.</p>
            <p><strong>Working sets (3–4) —</strong> Pick a weight where the last 2 reps are genuinely hard. If you get under 6 reps, drop the weight 5–10%. If you get 10 or above, increase the weight 5–10%.</p>
            <p><strong>Rest —</strong> 90 seconds for legs, 60–90 seconds for upper body. Use a timer.</p>
          </div>
        </CardContent>
      </Card>

      {/* Exercise pool */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Exercise Pool</h2>
        <ExerciseTable title="🦵  Legs (pick 2)" items={EXERCISES.legs} />
        <ExerciseTable title="💪  Chest (pick 1)" items={EXERCISES.chest} />
        <ExerciseTable title="🔙  Back (pick 1)" items={EXERCISES.back} />
        <ExerciseTable title="🏋️  Shoulders (pick 1)" items={EXERCISES.shoulders} />
      </div>

      {/* Presets */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-ver" /> Preset Workouts
          </h2>
          <p className="text-sm text-slate-600">Pick one and stick to it. Rotate weekly if you want variety.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESETS.map((p) => (
            <div key={p.name} className={`rounded-lg border-2 ${p.color} p-4`}>
              <h3 className={`font-bold ${p.accent}`}>{p.name}</h3>
              <p className="text-xs text-slate-600 italic mb-3">{p.subtitle}</p>
              <ul className="space-y-2">
                {p.exercises.map(([tag, name]) => (
                  <li key={tag} className="text-sm">
                    <span className={`text-xs font-bold ${p.accent} block`}>{tag}</span>
                    <span className="text-slate-700">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders */}
      <Card className="border-ver/30 bg-ver-light/50">
        <CardHeader>
          <CardTitle className="text-ver">Quick Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Warm up 5–10 min before — light cardio or dynamic stretching</li>
            <li>• Log your weights. If you hit the top of your rep range on all sets, go up next week</li>
            <li>• Control the weight down (2–3 sec), push or pull up with intent</li>
            <li>• Don&apos;t rush between exercises — rest properly, then go hard</li>
            <li>• Decide your workout before walking in. Once you start, just lift.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
