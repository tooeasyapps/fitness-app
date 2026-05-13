"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXERCISES, formatDate, todayISO, suggestNextWeight } from "@/lib/utils";
import { Plus, Trash2, TrendingUp, Dumbbell, Trophy, ChevronDown, Loader2 } from "lucide-react";

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

interface FormErrors {
  sessionDate?: string;
  exerciseName?: string;
  sets?: string;
  pbWeight?: string;
}

const ALL_EXERCISES = [...EXERCISES.default, ...EXERCISES.alternatives];

export function WeightTracker({ clientId, clientName, color }: { clientId: number; clientName: string; color: "ver" | "val" }) {
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [pbOpen, setPbOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
  const accentBg = color === "ver" ? "bg-ver" : "bg-val";

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
    setErrors({});
    setSubmitted(false);
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
    setErrors({});
    setSubmitted(false);
  }

  function validateForm(): FormErrors {
    const errs: FormErrors = {};
    if (!form.sessionDate) errs.sessionDate = "Date is required";
    if (!form.exerciseName) errs.exerciseName = "Select an exercise";
    // At least one set should have data
    const hasSet = [1, 2, 3, 4].some((n) => {
      const w = form[`set${n}Weight` as keyof typeof form];
      return w !== "";
    });
    if (!hasSet && !form.startingWeight) {
      errs.sets = "Log at least one set or starting weight";
    }
    if (!form.pbWeight) errs.pbWeight = "Required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
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
      await loadLifts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/lifts/${id}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      await loadLifts();
    } finally {
      setDeletingId(null);
    }
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

  // Group lifts by exercise
  const byExercise = useMemo(() => {
    const map = new Map<string, Lift[]>();
    for (const lift of lifts) {
      if (!map.has(lift.exerciseName)) map.set(lift.exerciseName, []);
      map.get(lift.exerciseName)!.push(lift);
    }
    return map;
  }, [lifts]);

  // Compute current PBs per exercise
  const currentPBs = useMemo(() => {
    const pbs: { exercise: string; pb: number; date: string }[] = [];
    for (const [exercise, sessions] of byExercise.entries()) {
      let bestPB = 0;
      let bestDate = "";
      for (const s of sessions) {
        if (s.pbWeight && s.pbWeight > bestPB) {
          bestPB = s.pbWeight;
          bestDate = s.sessionDate;
        }
      }
      if (bestPB > 0) {
        pbs.push({ exercise, pb: bestPB, date: bestDate });
      }
    }
    return pbs.sort((a, b) => a.exercise.localeCompare(b.exercise));
  }, [byExercise]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current PBs Accordion */}
      {currentPBs.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => setPbOpen(!pbOpen)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`${accentBg} p-1.5 sm:p-2 rounded-lg shrink-0`}>
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">Current PBs — {clientName}</h3>
                <p className="text-xs text-slate-500">{currentPBs.length} exercise{currentPBs.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${pbOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              pbOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t px-4 sm:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {currentPBs.map(({ exercise, pb, date }) => (
                  <div
                    key={exercise}
                    className="flex items-center justify-between rounded-lg border p-2.5 sm:p-3 bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{exercise}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">{formatDate(date)}</p>
                    </div>
                    <span className={`text-base sm:text-lg font-bold ${accentText} ml-2 shrink-0`}>
                      {pb} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add lift */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg truncate">Weights — {clientName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Log sets, weights & reps</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => { resetForm(); setShowForm(true); }} className={`${colorClass} shrink-0 text-xs sm:text-sm`} size="sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Log
              </Button>
            )}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
              {/* Date on its own row to prevent overflow */}
              <div>
                <Label htmlFor="sessionDate" className="text-xs sm:text-sm">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                  className={`max-w-[200px] ${errors.sessionDate ? "input-error" : ""}`}
                />
                {errors.sessionDate && <p className="text-xs text-red-500 mt-1">{errors.sessionDate}</p>}
              </div>
              <div>
                <Label htmlFor="exerciseName" className="text-xs sm:text-sm">Exercise <span className="text-red-500">*</span></Label>
                <select
                  id="exerciseName"
                  value={form.exerciseName}
                  onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.exerciseName ? "input-error" : ""}`}
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
                {errors.exerciseName && <p className="text-xs text-red-500 mt-1">{errors.exerciseName}</p>}
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Starting weight (kg)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="Warm-up weight"
                  value={form.startingWeight}
                  onChange={(e) => setForm({ ...form, startingWeight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Working sets</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((n) => {
                    const wKey = `set${n}Weight` as keyof typeof form;
                    const rKey = `set${n}Reps` as keyof typeof form;
                    return (
                      <div key={n} className="rounded-md border p-2 sm:p-3 bg-slate-50">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mb-1 sm:mb-2">Set {n}</p>
                        <div className="flex gap-1 sm:gap-2 items-center">
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            placeholder="kg"
                            className="text-xs sm:text-sm h-8 sm:h-10 px-2"
                            value={form[wKey] as string}
                            onChange={(e) => setForm({ ...form, [wKey]: e.target.value })}
                          />
                          <span className="text-slate-400 text-xs shrink-0">×</span>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="reps"
                            className="text-xs sm:text-sm h-8 sm:h-10 px-2"
                            value={form[rKey] as string}
                            onChange={(e) => setForm({ ...form, [rKey]: e.target.value })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.sets && <p className="text-xs text-red-500 mt-1">{errors.sets}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pbWeight" className="text-xs sm:text-sm">Session PB (kg) <span className="text-red-500">*</span></Label>
                  <Input
                    id="pbWeight"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder="Session PB"
                    value={form.pbWeight}
                    onChange={(e) => setForm({ ...form, pbWeight: e.target.value })}
                    className={errors.pbWeight ? "input-error" : ""}
                  />
                  {errors.pbWeight && <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">{errors.pbWeight}</p>}
                </div>
                <div>
                  <Label htmlFor="nextSessionTarget" className="text-xs sm:text-sm">Next target (kg)</Label>
                  <Input
                    id="nextSessionTarget"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder={suggestion ? `${suggestion.weight}` : "Target"}
                    value={form.nextSessionTarget}
                    onChange={(e) => setForm({ ...form, nextSessionTarget: e.target.value })}
                  />
                </div>
              </div>

              {suggestion && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 sm:p-3 flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-amber-900 truncate">Suggested: {suggestion.weight} kg</p>
                    <p className="text-[10px] sm:text-xs text-amber-800">{suggestion.reasoning}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-xs sm:text-sm">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="How did it feel?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className={colorClass} size="sm" disabled={saving}>
                  {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : editingId ? "Update" : "Save"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false); }} disabled={saving}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Lifts by exercise */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-lg">Session History</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Grouped by exercise, most recent first</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : lifts.length === 0 ? (
            <p className="text-sm text-slate-500">No lifts logged yet. Click &quot;Log&quot; to start.</p>
          ) : (
            <div className="space-y-6">
              {[...byExercise.entries()].map(([exerciseName, sessions]) => {
                const latestPB = Math.max(...sessions.map(s => s.pbWeight ?? 0));
                return (
                  <div key={exerciseName}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs sm:text-base min-w-0">
                        <Dumbbell className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${accentText} shrink-0`} />
                        <span className="truncate">{exerciseName}</span>
                      </h3>
                      {latestPB > 0 && (
                        <span className={`text-[10px] sm:text-xs font-semibold ${accentText} shrink-0`}>
                          PB: {latestPB} kg
                        </span>
                      )}
                    </div>
                    {/* Mobile card layout */}
                    <div className="block sm:hidden space-y-2">
                      {sessions.map((s) => (
                        <div key={s.id} className="rounded-lg border p-2.5 bg-slate-50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium">{formatDate(s.sessionDate)}</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={() => openEdit(s)}>Edit</Button>
                              {confirmDeleteId === s.id ? (
                                <>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)} className="h-6 text-[10px] px-1.5" disabled={deletingId === s.id}>
                                    {deletingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Del"}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-6 text-[10px] px-1.5" disabled={deletingId === s.id}>✕</Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setConfirmDeleteId(s.id)}>
                                  <Trash2 className="h-3 w-3 text-slate-400" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[10px]">
                            {s.set1Weight && <div><span className="text-slate-400">S1</span> {s.set1Weight}×{s.set1Reps ?? "?"}</div>}
                            {s.set2Weight && <div><span className="text-slate-400">S2</span> {s.set2Weight}×{s.set2Reps ?? "?"}</div>}
                            {s.set3Weight && <div><span className="text-slate-400">S3</span> {s.set3Weight}×{s.set3Reps ?? "?"}</div>}
                            {s.set4Weight && <div><span className="text-slate-400">S4</span> {s.set4Weight}×{s.set4Reps ?? "?"}</div>}
                          </div>
                          <div className="flex gap-3 mt-1 text-[10px]">
                            {s.pbWeight && <span><span className="text-slate-400">PB:</span> <span className={`font-semibold ${accentText}`}>{s.pbWeight}</span></span>}
                            {s.nextSessionTarget && <span><span className="text-slate-400">Next:</span> {s.nextSessionTarget}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table layout */}
                    <div className="hidden sm:block overflow-x-auto">
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
                                  {confirmDeleteId === s.id ? (
                                    <>
                                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)} className="h-7 text-xs px-2" disabled={deletingId === s.id}>
                                        {deletingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs px-2" disabled={deletingId === s.id}>Cancel</Button>
                                    </>
                                  ) : (
                                    <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(s.id)}>
                                      <Trash2 className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  )}
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
