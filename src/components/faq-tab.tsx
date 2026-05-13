"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, Plus, Loader2, MessageCircleQuestion, Clock, Trash, MessageSquareText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FAQ {
  id: number;
  question: string;
  answer: string | null;
  askedBy: string | null;
  createdAt: string;
}

export function FAQTab({ clientName, color }: { clientName: string; color: "ver" | "val" }) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [error, setError] = useState("");
  
  // Answering state
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Deleting state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const colorClass = color === "ver" ? "bg-ver text-white" : "bg-val text-white";
  const accentText = color === "ver" ? "text-ver" : "text-val";
  const accentBgLight = color === "ver" ? "bg-red-50" : "bg-blue-50";
  const accentBorder = color === "ver" ? "border-ver/20" : "border-val/20";

  useEffect(() => {
    loadFaqs();
  }, []);

  async function loadFaqs() {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) {
      setError("Please enter a question");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.trim(),
          askedBy: clientName,
        }),
      });
      setNewQuestion("");
      setShowForm(false);
      await loadFaqs();
    } catch (e) {
      setError("Failed to submit question. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    setDeletingId(id);
    try {
      await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      await loadFaqs();
    } catch (e) {
      console.error(e);
      alert("Failed to delete question.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmitAnswer(id: number) {
    if (!answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText.trim() }),
      });
      setAnsweringId(null);
      setAnswerText("");
      await loadFaqs();
    } catch (e) {
      console.error(e);
      alert("Failed to submit answer.");
    } finally {
      setSubmittingAnswer(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 text-sm text-slate-700 space-y-2">
        <p className="font-semibold text-slate-900">App Guide:</p>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
          <li><strong>Check-in:</strong> For logging your weekly check-ins</li>
          <li><strong>Weights:</strong> For logging your lifts for the session</li>
          <li><strong>Cardio:</strong> Cardio guide</li>
          <li><strong>Strength:</strong> Strength session guide</li>
          <li><strong>Questions:</strong> For any general questions</li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
        <MessageCircleQuestion className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900 text-sm sm:text-base">Got a question?</h3>
          <p className="text-xs sm:text-sm text-amber-800 mt-1">
            Submit your questions below! I review and answer new questions weekly.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <HelpCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
                Questions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">Questions and answers</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className={`${colorClass} shrink-0 text-xs sm:text-sm`} size="sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Ask a Question
              </Button>
            )}
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="px-4 sm:px-6 border-b pb-6 mb-2">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="question" className="text-xs sm:text-sm">Your Question</Label>
                <Input
                  id="question"
                  placeholder="What's on your mind?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className={error ? "input-error" : ""}
                  autoFocus
                />
                {error && <p className="text-[10px] sm:text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className={colorClass} size="sm" disabled={saving}>
                  {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Submitting...</> : "Submit"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setError(""); setNewQuestion(""); }} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-sm">Loading FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <MessageCircleQuestion className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No questions have been asked yet.</p>
              <p className="text-xs mt-1">Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-lg border bg-white overflow-hidden shadow-sm relative group">
                  <div className={`p-3 sm:p-4 border-b ${accentBgLight} ${accentBorder} pr-12`}>
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                      Q: {faq.question}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-slate-500">
                      <span>{formatDate(faq.createdAt)}</span>
                      {faq.askedBy && (
                        <>
                          <span>•</span>
                          <span>Asked by {faq.askedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(faq.id)}
                    disabled={deletingId === faq.id}
                    className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    title="Delete question"
                  >
                    {deletingId === faq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </Button>

                  <div className="p-3 sm:p-4 bg-slate-50">
                    {answeringId === faq.id ? (
                      <div className="space-y-3">
                        <Input
                          autoFocus
                          placeholder="Type your answer here..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSubmitAnswer(faq.id)} 
                            size="sm" 
                            disabled={submittingAnswer || !answerText.trim()}
                            className={colorClass}
                          >
                            {submittingAnswer ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving...</> : "Save Answer"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswerText("");
                            }}
                            disabled={submittingAnswer}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : faq.answer ? (
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap">
                          <span className="font-semibold text-slate-900 mr-2">A:</span>
                          {faq.answer}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAnsweringId(faq.id);
                            setAnswerText(faq.answer || "");
                          }}
                          className="h-7 px-2 text-xs text-slate-400 hover:text-slate-600 shrink-0"
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 italic">
                          <Clock className="h-3.5 w-3.5" />
                          Pending answer...
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnsweringId(faq.id);
                            setAnswerText("");
                          }}
                          className="h-7 text-xs bg-white flex items-center gap-1.5"
                        >
                          <MessageSquareText className="h-3 w-3" /> Answer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
