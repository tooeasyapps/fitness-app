"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, todayISO } from "@/lib/utils";
import { Trash2, Plus, Flame, Target, Scale, Loader2 } from "lucide-react";

interface Checkin {
  id: number;
  clientId: number;
  weekDate: string;
  kjBurnt: number | null;
  calorieScore: number | null;
  weightKg: number | null;
  notes: string | null;
}

interface FormErrors {
  weekDate?: string;
  kjBurnt?: string;
  calorieScore?: string;
  weightKg?: string;
}

export function WeeklyCheckin({ clientId, clientName, color }: { clientId: number; clientName: string; color: "ver" | "val" }) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
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

  function validateForm(): FormErrors {
    const errs: FormErrors = {};
    if (!form.weekDate) errs.weekDate = "Required";
    if (!form.kjBurnt) {
      errs.kjBurnt = "Required";
    } else {
      const kj = parseInt(form.kjBurnt);
      if (kj < 0) errs.kjBurnt = "Cannot be negative";
    }
    if (!form.calorieScore) {
      errs.calorieScore = "Required";
    } else {
      const score = parseInt(form.calorieScore);
      if (score < 0 || score > 10) errs.calorieScore = "Must be 0–10";
    }
    if (!form.weightKg) {
      errs.weightKg = "Required";
    } else {
      const w = parseFloat(form.weightKg);
      if (w <= 0 || w > 500) errs.weightKg = "Invalid weight";
    }
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
      setSubmitted(false);
      setErrors({});
      await loadCheckins();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/checkins/${id}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      await loadCheckins();
    } finally {
      setDeletingId(null);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setSubmitted(false);
    setErrors({});
    setForm({ weekDate: todayISO(), kjBurnt: "", calorieScore: "", weightKg: "", notes: "" });
  }

  // Revalidate on change if already submitted
  function updateForm(updates: Partial<typeof form>) {
    const next = { ...form, ...updates };
    setForm(next);
    if (submitted) {
      const errs: FormErrors = {};
      if (!next.weekDate) errs.weekDate = "Required";
      if (!next.kjBurnt) {
        errs.kjBurnt = "Required";
      } else if (parseInt(next.kjBurnt) < 0) {
        errs.kjBurnt = "Cannot be negative";
      }
      if (!next.calorieScore) {
        errs.calorieScore = "Required";
      } else {
        const score = parseInt(next.calorieScore);
        if (score < 0 || score > 10) errs.calorieScore = "Must be 0–10";
      }
      if (!next.weightKg) {
        errs.weightKg = "Required";
      } else {
        const w = parseFloat(next.weightKg);
        if (w <= 0 || w > 500) errs.weightKg = "Invalid weight";
      }
      setErrors(errs);
    }
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
              <Flame className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText} shrink-0`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-2xl font-bold truncate">{latest.kjBurnt?.toLocaleString() ?? "—"}</div>
              {kjTrend && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                  {kjTrend.up ? "↑" : "↓"} {Math.abs(kjTrend.diff).toLocaleString()}
                </p>
              )}
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Target: 11,500</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Cal score</CardTitle>
              <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText} shrink-0`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-2xl font-bold">{latest.calorieScore ?? "—"}<span className="text-xs sm:text-base text-slate-400 font-normal">/10</span></div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">2000–2200 cal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">Weight</CardTitle>
              <Scale className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText} shrink-0`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-2xl font-bold truncate">{latest.weightKg ?? "—"}<span className="text-xs sm:text-base text-slate-400 font-normal"> kg</span></div>
              {weightTrend && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
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
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg truncate">Check-in — {clientName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Log kJ, calorie adherence & weight</CardDescription>
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
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
              {/* Date on its own row on mobile */}
              <div>
                <Label htmlFor="weekDate" className="text-xs sm:text-sm">Week ending <span className="text-red-500">*</span></Label>
                <Input
                  id="weekDate"
                  type="date"
                  value={form.weekDate}
                  onChange={(e) => updateForm({ weekDate: e.target.value })}
                  className={`max-w-[200px] ${errors.weekDate ? "input-error" : ""}`}
                />
                {errors.weekDate && <p className="text-xs text-red-500 mt-1">{errors.weekDate}</p>}
              </div>
              {/* 3-col metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="kjBurnt" className="text-xs sm:text-sm">kJ burnt <span className="text-red-500">*</span></Label>
                  <Input
                    id="kjBurnt"
                    type="number"
                    inputMode="numeric"
                    placeholder="11500"
                    value={form.kjBurnt}
                    onChange={(e) => updateForm({ kjBurnt: e.target.value })}
                    className={`text-sm ${errors.kjBurnt ? "input-error" : ""}`}
                  />
                  {errors.kjBurnt && <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">{errors.kjBurnt}</p>}
                </div>
                <div>
                  <Label htmlFor="calorieScore" className="text-xs sm:text-sm">Cal score <span className="text-red-500">*</span></Label>
                  <Input
                    id="calorieScore"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="10"
                    placeholder="0–10"
                    value={form.calorieScore}
                    onChange={(e) => updateForm({ calorieScore: e.target.value })}
                    className={`text-sm ${errors.calorieScore ? "input-error" : ""}`}
                  />
                  {errors.calorieScore && <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">{errors.calorieScore}</p>}
                </div>
                <div>
                  <Label htmlFor="weightKg" className="text-xs sm:text-sm">Weight kg <span className="text-red-500">*</span></Label>
                  <Input
                    id="weightKg"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="72.5"
                    value={form.weightKg}
                    onChange={(e) => updateForm({ weightKg: e.target.value })}
                    className={`text-sm ${errors.weightKg ? "input-error" : ""}`}
                  />
                  {errors.weightKg && <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">{errors.weightKg}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-xs sm:text-sm">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Anything to remember"
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className={colorClass} size="sm" disabled={saving}>
                  {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : "Save"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={saving}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-lg">History</CardTitle>
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
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)} className="h-7 text-xs px-2" disabled={deletingId === c.id}>
                              {deletingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs px-2" disabled={deletingId === c.id}>Cancel</Button>
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
                    {c.notes && <p className="text-xs text-slate-500 mt-1.5 italic truncate">{c.notes}</p>}
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
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)} className="h-7 text-xs px-2" disabled={deletingId === c.id}>
                                {deletingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs px-2" disabled={deletingId === c.id}>
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
