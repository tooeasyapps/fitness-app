"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, todayISO } from "@/lib/utils";
import { Trash2, Plus, Flame, Target, Scale, TrendingUp } from "lucide-react";

interface Checkin {
  id: number;
  clientId: number;
  weekDate: string;
  kjBurnt: number | null;
  calorieScore: number | null;
  weightKg: number | null;
  notes: string | null;
}

export function WeeklyCheckin({ clientId, clientName, color }: { clientId: number; clientName: string; color: "ver" | "val" }) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    weekDate: todayISO(),
    kjBurnt: "",
    calorieScore: "",
    weightKg: "",
    notes: "",
  });

  const colorClass = color === "ver" ? "bg-ver text-white" : "bg-val text-white";
  const accentText = color === "ver" ? "text-ver" : "text-val";

  useEffect(() => {
    loadCheckins();
  }, [clientId]);

  async function loadCheckins() {
    setLoading(true);
    const res = await fetch(`/api/checkins?clientId=${clientId}`);
    const data = await res.json();
    setCheckins(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        weekDate: form.weekDate,
        kjBurnt: form.kjBurnt ? parseInt(form.kjBurnt) : null,
        calorieScore: form.calorieScore ? parseInt(form.calorieScore) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        notes: form.notes || null,
      }),
    });
    setForm({ weekDate: todayISO(), kjBurnt: "", calorieScore: "", weightKg: "", notes: "" });
    setShowForm(false);
    loadCheckins();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this check-in?")) return;
    await fetch(`/api/checkins/${id}`, { method: "DELETE" });
    loadCheckins();
  }

  // Latest stats for summary cards
  const latest = checkins[0];
  const previous = checkins[1];

  function trend(current: number | null, prev: number | null) {
    if (current == null || prev == null) return null;
    const diff = current - prev;
    return { diff, up: diff > 0 };
  }

  const kjTrend = latest && previous ? trend(latest.kjBurnt, previous.kjBurnt) : null;
  const weightTrend = latest && previous ? trend(latest.weightKg, previous.weightKg) : null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {latest && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Last week kJ burnt</CardTitle>
              <Flame className={`h-5 w-5 ${accentText}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.kjBurnt?.toLocaleString() ?? "—"}</div>
              {kjTrend && (
                <p className="text-xs text-slate-500 mt-1">
                  {kjTrend.up ? "↑" : "↓"} {Math.abs(kjTrend.diff).toLocaleString()} from previous
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">Target: 11,500</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Calorie adherence</CardTitle>
              <Target className={`h-5 w-5 ${accentText}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.calorieScore ?? "—"}<span className="text-base text-slate-400 font-normal"> / 10</span></div>
              <p className="text-xs text-slate-500 mt-1">2000–2200 cal/day target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Weight</CardTitle>
              <Scale className={`h-5 w-5 ${accentText}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.weightKg ? `${latest.weightKg} kg` : "—"}</div>
              {weightTrend && (
                <p className="text-xs text-slate-500 mt-1">
                  {weightTrend.up ? "↑" : "↓"} {Math.abs(weightTrend.diff).toFixed(1)} kg from previous
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add new */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Check-in — {clientName}</CardTitle>
              <CardDescription>Log this week's kJ burnt, calorie adherence, and weight</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className={colorClass}>
                <Plus className="h-4 w-4" /> New Check-in
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekDate">Week ending</Label>
                  <Input
                    id="weekDate"
                    type="date"
                    value={form.weekDate}
                    onChange={(e) => setForm({ ...form, weekDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kjBurnt">Kilojoules burnt</Label>
                  <Input
                    id="kjBurnt"
                    type="number"
                    placeholder="e.g. 11500"
                    value={form.kjBurnt}
                    onChange={(e) => setForm({ ...form, kjBurnt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="calorieScore">Calorie adherence (0-10)</Label>
                  <Input
                    id="calorieScore"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="e.g. 8"
                    value={form.calorieScore}
                    onChange={(e) => setForm({ ...form, calorieScore: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 72.5"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Anything to remember about this week"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className={colorClass}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>{checkins.length} check-in{checkins.length === 1 ? "" : "s"} logged</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : checkins.length === 0 ? (
            <p className="text-sm text-slate-500">No check-ins yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-slate-600">
                    <th className="pb-2 pr-4">Week</th>
                    <th className="pb-2 pr-4">kJ Burnt</th>
                    <th className="pb-2 pr-4">Cal Score</th>
                    <th className="pb-2 pr-4">Weight</th>
                    <th className="pb-2 pr-4">Notes</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{formatDate(c.weekDate)}</td>
                      <td className="py-3 pr-4">
                        {c.kjBurnt ? (
                          <span className={c.kjBurnt >= 11500 ? "text-green-600 font-medium" : "text-slate-700"}>
                            {c.kjBurnt.toLocaleString()}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 pr-4">{c.calorieScore ?? "—"}</td>
                      <td className="py-3 pr-4">{c.weightKg ? `${c.weightKg} kg` : "—"}</td>
                      <td className="py-3 pr-4 text-slate-500 max-w-xs truncate">{c.notes || "—"}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
