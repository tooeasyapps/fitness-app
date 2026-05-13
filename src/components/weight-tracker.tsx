"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXERCISES, formatDate, todayISO, suggestNextWeight } from "@/lib/utils";
import { Plus, Trash2, TrendingUp, Dumbbell } from "lucide-react";

interface Lift {
  id: number;
  clientId: number;
  sessionDate: string;
  exerciseName: string;
  startingWeight: number | null;
  set1Weight: number | null; set1Reps: number | null;
  set2Weight: number | null; set2Reps: number | null;
  set3Weight: number | null; set3Reps: number | null;
  set4Weight: number | null; set4Reps: number | null;
  pbWeight: number | null;
  nextSessionTarget: number | null;
  notes: string | null;
}

const ALL_EXERCISES = [...EXERCISES.default, ...EXERCISES.alternatives];

export function WeightTracker({ clientId, clientName, color }: { clientId: number; clientName: string; color: "ver" | "val" }) {
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    sessionDate: todayISO(),
    exerciseName: ALL_EXERCISES[0],
    startingWeight: "",
    set1Weight: "", set1Reps: "",
    set2Weight: "", set2Reps: "",
    set3Weight: "", set3Reps: "",
    set4Weight: "", set4Reps: "",
    pbWeight: "",
    nextSessionTarget: "",
    notes: "",
  });

  const colorClass = color === "ver" ? "bg-ver text-white" : "bg-val text-white";
  const accentText = color === "ver" ? "text-ver" : "text-val";

  useEffect(() => {
    loadLifts();
  }, [clientId]);

  async function loadLifts() {
    setLoading(true);
    const res = await fetch(`/api/lifts?clientId=${clientId}`);
    const data = await res.json();
    setLifts(data);
    setLoading(false);
  }

  function resetForm() {
    setForm({
      sessionDate: todayISO(),
      exerciseName: ALL_EXERCISES[0],
      startingWeight: "",
      set1Weight: "", set1Reps: "",
      set2Weight: "", set2Reps: "",
      set3Weight: "", set3Reps: "",
      set4Weight: "", set4Reps: "",
      pbWeight: "",
      nextSessionTarget: "",
      notes: "",
    });
    setEditingId(null);
  }

  function openEdit(lift: Lift) {
    setForm({
      sessionDate: lift.sessionDate,
      exerciseName: lift.exerciseName,
      startingWeight: lift.startingWeight?.toString() ?? "",
      set1Weight: lift.set1Weight?.toString() ?? "", set1Reps: lift.set1Reps?.toString() ?? "",
      set2Weight: lift.set2Weight?.toString() ?? "", set2Reps: lift.set2Reps?.toString() ?? "",
      set3Weight: lift.set3Weight?.toString() ?? "", set3Reps: lift.set3Reps?.toString() ?? "",
      set4Weight: lift.set4Weight?.toString() ?? "", set4Reps: lift.set4Reps?.toString() ?? "",
      pbWeight: lift.pbWeight?.toString() ?? "",
      nextSessionTarget: lift.nextSessionTarget?.toString() ?? "",
      notes: lift.notes ?? "",
    });
    setEditingId(lift.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      clientId,
      sessionDate: form.sessionDate,
      exerciseName: form.exerciseName,
      startingWeight: form.startingWeight ? parseFloat(form.startingWeight) : null,
      set1Weight: form.set1Weight ? parseFloat(form.set1Weight) : null,
      set1Reps: form.set1Reps ? parseInt(form.set1Reps) : null,
      set2Weight: form.set2Weight ? parseFloat(form.set2Weight) : null,
      set2Reps: form.set2Reps ? parseInt(form.set2Reps) : null,
      set3Weight: form.set3Weight ? parseFloat(form.set3Weight) : null,
      set3Reps: form.set3Reps ? parseInt(form.set3Reps) : null,
      set4Weight: form.set4Weight ? parseFloat(form.set4Weight) : null,
      set4Reps: form.set4Reps ? parseInt(form.set4Reps) : null,
      pbWeight: form.pbWeight ? parseFloat(form.pbWeight) : null,
      nextSessionTarget: form.nextSessionTarget ? parseFloat(form.nextSessionTarget) : null,
      notes: form.notes || null,
    };
    if (editingId) {
      await fetch(`/api/lifts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/lifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    resetForm();
    setShowForm(false);
    loadLifts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this lift entry?")) return;
    await fetch(`/api/lifts/${id}`, { method: "DELETE" });
    loadLifts();
  }

  // Suggestion based on top working set
  const suggestion = useMemo(() => {
    const weights = [form.set4Weight, form.set3Weight, form.set2Weight, form.set1Weight];
    const reps = [form.set4Reps, form.set3Reps, form.set2Reps, form.set1Reps];
    for (let i = 0; i < weights.length; i++) {
      if (weights[i] && reps[i]) {
        return suggestNextWeight(parseFloat(weights[i]), parseInt(reps[i]));
      }
    }
    return null;
  }, [form.set1Weight, form.set1Reps, form.set2Weight, form.set2Reps, form.set3Weight, form.set3Reps, form.set4Weight, form.set4Reps]);

  // Group lifts by exercise - latest sessions per exercise for current PB tracking
  const byExercise = useMemo(() => {
    const map = new Map<string, Lift[]>();
    for (const lift of lifts) {
      if (!map.has(lift.exerciseName)) map.set(lift.exerciseName, []);
      map.get(lift.exerciseName)!.push(lift);
    }
    return map;
  }, [lifts]);

  return (
    <div className="space-y-6">
      {/* Add lift */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weight Tracker — {clientName}</CardTitle>
              <CardDescription>Log sets, weights, and reps from each strength session</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => { resetForm(); setShowForm(true); }} className={colorClass}>
                <Plus className="h-4 w-4" /> Log Lift
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionDate">Session date</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={form.sessionDate}
                    onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="exerciseName">Exercise</Label>
                  <select
                    id="exerciseName"
                    value={form.exerciseName}
                    onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <optgroup label="Default exercises">
                      {EXERCISES.default.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Alternative exercises">
                      {EXERCISES.alternatives.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <Label>Starting weight (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Warm-up working weight"
                  value={form.startingWeight}
                  onChange={(e) => setForm({ ...form, startingWeight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Working sets</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((n) => {
                    const wKey = `set${n}Weight` as keyof typeof form;
                    const rKey = `set${n}Reps` as keyof typeof form;
                    return (
                      <div key={n} className="rounded-md border p-3 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Set {n}</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="kg"
                            value={form[wKey] as string}
                            onChange={(e) => setForm({ ...form, [wKey]: e.target.value })}
                          />
                          <span className="self-center text-slate-400 text-sm">×</span>
                          <Input
                            type="number"
                            placeholder="reps"
                            value={form[rKey] as string}
                            onChange={(e) => setForm({ ...form, [rKey]: e.target.value })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pbWeight">PB (kg)</Label>
                  <Input
                    id="pbWeight"
                    type="number"
                    step="0.5"
                    placeholder="Personal best"
                    value={form.pbWeight}
                    onChange={(e) => setForm({ ...form, pbWeight: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nextSessionTarget">Next session target (kg)</Label>
                  <Input
                    id="nextSessionTarget"
                    type="number"
                    step="0.5"
                    placeholder={suggestion ? `Suggested: ${suggestion.weight}` : "Target for next time"}
                    value={form.nextSessionTarget}
                    onChange={(e) => setForm({ ...form, nextSessionTarget: e.target.value })}
                  />
                </div>
              </div>

              {suggestion && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Auto-suggested next weight: {suggestion.weight} kg</p>
                    <p className="text-xs text-amber-800">{suggestion.reasoning}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="How did it feel?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className={colorClass}>{editingId ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Lifts by exercise */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Grouped by exercise, most recent first</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : lifts.length === 0 ? (
            <p className="text-sm text-slate-500">No lifts logged yet. Click "Log Lift" to start.</p>
          ) : (
            <div className="space-y-6">
              {[...byExercise.entries()].map(([exerciseName, sessions]) => {
                const latestPB = Math.max(...sessions.map(s => s.pbWeight ?? 0));
                return (
                  <div key={exerciseName}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Dumbbell className={`h-4 w-4 ${accentText}`} />
                        {exerciseName}
                      </h3>
                      {latestPB > 0 && (
                        <span className={`text-xs font-semibold ${accentText}`}>
                          PB: {latestPB} kg
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b text-left text-slate-600">
                          <tr>
                            <th className="pb-2 pr-3">Date</th>
                            <th className="pb-2 pr-3">Start</th>
                            <th className="pb-2 pr-3">Set 1</th>
                            <th className="pb-2 pr-3">Set 2</th>
                            <th className="pb-2 pr-3">Set 3</th>
                            <th className="pb-2 pr-3">Set 4</th>
                            <th className="pb-2 pr-3">PB</th>
                            <th className="pb-2 pr-3">Next</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((s) => (
                            <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                              <td className="py-2 pr-3 font-medium whitespace-nowrap">{formatDate(s.sessionDate)}</td>
                              <td className="py-2 pr-3 text-slate-600">{s.startingWeight ?? "—"}</td>
                              <td className="py-2 pr-3">{s.set1Weight ? `${s.set1Weight}×${s.set1Reps ?? "?"}` : "—"}</td>
                              <td className="py-2 pr-3">{s.set2Weight ? `${s.set2Weight}×${s.set2Reps ?? "?"}` : "—"}</td>
                              <td className="py-2 pr-3">{s.set3Weight ? `${s.set3Weight}×${s.set3Reps ?? "?"}` : "—"}</td>
                              <td className="py-2 pr-3">{s.set4Weight ? `${s.set4Weight}×${s.set4Reps ?? "?"}` : "—"}</td>
                              <td className={`py-2 pr-3 font-semibold ${accentText}`}>{s.pbWeight ?? "—"}</td>
                              <td className="py-2 pr-3 text-slate-600">{s.nextSessionTarget ?? "—"}</td>
                              <td className="py-2">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                                    <Trash2 className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
