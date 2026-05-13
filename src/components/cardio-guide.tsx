"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, Dumbbell, Heart, AlertTriangle, Clock } from "lucide-react";

const ZONES = [
  { name: "Low end", bpm: "135–140 bpm", feels: "Steady, can hold a short conversation", best: "Long sessions (45–90 min)", color: "from-blue-50 to-blue-100 border-blue-200" },
  { name: "Mid", bpm: "140–150 bpm", feels: "Working, breathing harder, short replies", best: "Most sessions (30–60 min)", color: "from-amber-50 to-amber-100 border-amber-200" },
  { name: "High end", bpm: "150–170 bpm", feels: "Hard, can only get out a word or two", best: "Shorter sessions (≤ 30 min)", color: "from-red-50 to-red-100 border-red-200" },
];

const ACTIVITIES = [
  { name: "Brisk walking on incline", note: "Treadmill at 5–8% incline is gold for beginners" },
  { name: "Jogging or running", note: "Outdoors or treadmill" },
  { name: "Cycling", note: "Stationary bike or outdoor" },
  { name: "Rowing machine", note: "Great full-body option" },
  { name: "Elliptical / stair climber", note: "Low impact, easy on the joints" },
  { name: "Swimming", note: "Full body, low impact" },
  { name: "Hiking", note: "Counts if heart rate stays up" },
  { name: "Group classes", note: "Spin, boxing, HIIT, dance" },
];

export function CardioGuide() {
  return (
    <div className="space-y-6">
      {/* Weekly targets */}
      <Card className="border-ver/30 bg-gradient-to-br from-ver-light to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ver">
            <Flame className="h-5 w-5" /> Weekly Minimum Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-4 border">
              <Flame className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-ver">11,500</p>
              <p className="text-sm text-slate-600">kJ burned per week</p>
            </div>
            <div className="rounded-lg bg-white p-4 border">
              <Dumbbell className="h-6 w-6 text-ver mb-2" />
              <p className="text-2xl font-bold text-ver">1</p>
              <p className="text-sm text-slate-600">strength session</p>
            </div>
            <div className="rounded-lg bg-white p-4 border">
              <Clock className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-ver">2.5 hrs</p>
              <p className="text-sm text-slate-600">cardio minimum</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-700">
            <strong>11,500 kJ is the anchor.</strong> Hit it consistently — the strength session plus 2.5 hours of cardio is the floor. Want faster progress? Add more.
          </p>
        </CardContent>
      </Card>

      {/* Heart rate zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" /> Heart Rate Zones
          </CardTitle>
          <CardDescription>
            Do anything that raises heart rate above <strong>135 bpm</strong>. Tweak intensity up to <strong>170 bpm</strong> based on how you feel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ZONES.map((z) => (
              <div key={z.name} className={`rounded-lg border bg-gradient-to-br p-4 ${z.color}`}>
                <h3 className="font-semibold text-slate-800">{z.name}</h3>
                <p className="text-lg font-bold text-slate-900 mt-1">{z.bpm}</p>
                <p className="text-xs text-slate-600 mt-2"><strong>Feels:</strong> {z.feels}</p>
                <p className="text-xs text-slate-600 mt-1"><strong>Best for:</strong> {z.best}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              <strong>Match intensity to duration.</strong> Lower heart rate → sustainable, go longer. Higher heart rate → keep it short. Want more burn? Push intensity OR add time — never both in the same week.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle>What Counts as Cardio</CardTitle>
          <CardDescription>Anything that gets heart rate above 135 bpm and keeps it there</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACTIVITIES.map((a) => (
              <div key={a.name} className="rounded-md border bg-slate-50 p-3">
                <p className="font-medium text-slate-800">{a.name}</p>
                <p className="text-xs text-slate-600 mt-1">{a.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Splitting the time */}
      <Card>
        <CardHeader>
          <CardTitle>Splitting the 2.5 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>3 sessions × 50 min</strong> — easiest to recover from</li>
            <li>• <strong>5 sessions × 30 min</strong> — good if you prefer shorter daily efforts</li>
            <li>• <strong>2 long (60 min) + 1 short (30 min)</strong> — mix it up</li>
          </ul>
        </CardContent>
      </Card>

      {/* Make it stick */}
      <Card>
        <CardHeader>
          <CardTitle>Make It Stick</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>Pick activities you actually like</strong> — you'll skip ones you hate</li>
            <li>• <strong>Track your heart rate</strong> — watch, phone strap, or gym machine</li>
            <li>• <strong>Warm up 5 min, cool down 5 min</strong> — doesn't count toward the 2.5 hours but prevents injury</li>
            <li>• <strong>Hydrate</strong> — big glass before, sips during, refill after</li>
            <li>• <strong>Eat something an hour before</strong> — fruit or toast is plenty</li>
            <li>• <strong>Consistency beats intensity</strong> — three solid weeks at the low end beats one heroic week</li>
          </ul>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" /> When to Stop and Rest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-red-900">
            <li>• Feel dizzy, lightheaded, nauseous, or vision goes spotty → <strong>stop immediately</strong></li>
            <li>• Sit or lie down, sip water, let your heart rate come back down</li>
            <li>• If something feels off, take a rest. One missed session is nothing — pushing through a warning sign can set you back weeks</li>
            <li>• <strong>There is no shame in cutting a session short. Rest is part of training.</strong></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
