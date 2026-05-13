"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, todayISO } from "@/lib/utils";
import { Trash2, Plus, Flame, Target, Scale } from "lucide-react";

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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
    await fetch(`/api/checkins/${id}`, { method: "DELETE" });
    setConfirmDeleteId(null);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Summary cards */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">kJ burnt</CardTitle>
              <Flame className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{latest.kjBurnt?.toLocaleString() ?? "—"}</div>
              {kjTrend && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  {kjTrend.up ? "↑" : "↓"} {Math.abs(kjTrend.diff).toLocaleString()}
                </p>
              )}
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Target: 11,500</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Cal score</CardTitle>
              <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{latest.calorieScore ?? "—"}<span className="text-sm sm:text-base text-slate-400 font-normal"> / 10</span></div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">2000–2200 cal/day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Weight</CardTitle>
              <Scale className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{latest.weightKg ? `${latest.weightKg}` : "—"}<span className="text-sm sm:text-base text-slate-400 font-normal"> kg</span></div>
              {weightTrend && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                  {weightTrend.up ? "↑" : "↓"} {Math.abs(weightTrend.diff).toFixed(1)} kg
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add new */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">Weekly Check-in — {clientName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Log kJ burnt, calorie adherence, and weight</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className={`${colorClass} shrink-0 text-xs sm:text-sm`} size="sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> New
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                  <Label htmlFor="kjBurnt">kJ burnt</Label>
                  <Input
                    id="kjBurnt"
                    type="number"
                    placeholder="e.g. 11500"
                    value={form.kjBurnt}
                    onChange={(e) => setForm({ ...form, kjBurnt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="calorieScore">Cal score (0-10)</Label>
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
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">History</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{checkins.length} check-in{checkins.length === 1 ? "" : "s"} logged</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : checkins.length === 0 ? (
            <p className="text-sm text-slate-500">No check-ins yet. Add one to get started.</p>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="block sm:hidden space-y-2">
                {checkins.map((c) => (
                  <div key={c.id} className="rounded-lg border p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{formatDate(c.weekDate)}</span>
                      <div>
                        {confirmDeleteId === c.id ? (
                          <div className="flex gap-1">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)} className="h-7 text-xs px-2">Delete</Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs px-2">Cancel</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDeleteId(c.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">kJ</span>
                        <span className={c.kjBurnt && c.kjBurnt >= 11500 ? "text-green-600 font-medium" : ""}>
                          {c.kjBurnt?.toLocaleString() ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cal</span>
                        {c.calorieScore ?? "—"}
                      </div>
                      <div>
                        <span className="text-slate-500 block">Weight</span>
                        {c.weightKg ? `${c.weightKg} kg` : "—"}
                      </div>
                    </div>
                    {c.notes && <p className="text-xs text-slate-500 mt-1.5 italic">{c.notes}</p>}
                  </div>
                ))}
              </div>
              {/* Desktop table layout */}
              <div className="hidden sm:block overflow-x-auto">
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
                          {confirmDeleteId === c.id ? (
                            <div className="flex items-center gap-1">
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)} className="h-7 text-xs px-2">
                                Delete
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs px-2">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(c.id)}>
                              <Trash2 className="h-4 w-4 text-slate-400" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
