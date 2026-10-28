"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { updateUserProfile } from "@/lib/firestore";
import { UserType } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<UserType | null>(
    profile?.userType || null
  );

  // Kids specific
  const [ageRange, setAgeRange] = useState<string>(
    profile?.ageRange || "11-13"
  );
  // Student specific
  const [academicLevel, setAcademicLevel] = useState<string>(
    profile?.academicLevel || "College / Undergrad"
  );

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (!selectedType) {
      setError("Please select who will be using PuzzlePal.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    if (!user || !selectedType) return;
    try {
      setSaving(true);
      setError("");

      await updateUserProfile(user.uid, {
        userType: selectedType,
        ...(selectedType === "kids" ? { ageRange } : {}),
        ...(selectedType === "student" ? { academicLevel } : {}),
        interests: selectedInterests,
        onboardingCompleted: true,
        currentDifficulty: selectedType === "kids" ? "easy" : "medium",
      });

      await refreshProfile();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding choices:", err);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const kidsInterests = [
    { id: "kids_mystery", label: "🔍 Detective & Mystery", desc: "Finding footprints & clue tracking" },
    { id: "kids_brain_teaser", label: "⚡ Brain Teasers & Riddles", desc: "Tricky mind-benders & clever puzzles" },
    { id: "kids_pattern", label: "🌀 Patterns & Sequences", desc: "Shape transformations & secret color codes" },
    { id: "kids_math", label: "🔢 Fun Math Puzzles", desc: "Pizza fractions, animal legs & balance scales" },
    { id: "kids_creative", label: "💡 Creative Thinking", desc: "Desert island shelters & wacky inventions" },
    { id: "kids_word", label: "🔤 Word Games", desc: "Secret ciphers, anagrams & word bridges" },
  ];

  const studentInterests = [
    { id: "logic", label: "🧩 Logic & Lateral Thinking", desc: "Multi-constraint systems & deduction" },
    { id: "business", label: "📈 Business Decisions", desc: "Startup prioritization, unit economics & strategy" },
    { id: "technical", label: "💻 Technical Challenges", desc: "Architecture bottlenecks & distributed systems" },
    { id: "data", label: "📊 Data Reasoning", desc: "Metrics interpretation, Simpson's paradox & anomalies" },
    { id: "mystery", label: "🔍 Mystery & Deduction", desc: "Forensic clues & timeline elimination" },
    { id: "decision", label: "🎯 Crisis Decision Making", desc: "High-stakes mitigation & risk tradeoffs" },
    { id: "aptitude", label: "🔢 Light Aptitude", desc: "Placement reasoning, coding-decoding & sequences" },
    { id: "word", label: "🔤 Verbal Reasoning", desc: "Syllogistic logic & fallacy deconstruction" },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 py-12 font-sans">
        <div className="w-full max-w-2xl bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl">🧠</span>
              <span className="text-xl font-black tracking-tight text-white">
                PuzzlePal AI
              </span>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className={`w-8 h-1.5 rounded-full transition-all ${
                  step === 1 ? "bg-indigo-500" : "bg-slate-700"
                }`}
              />
              <span
                className={`w-8 h-1.5 rounded-full transition-all ${
                  step === 2 ? "bg-indigo-500" : "bg-slate-700"
                }`}
              />
            </div>

            <h1 className="text-2xl font-black text-slate-100">
              {step === 1 ? "Welcome to PuzzlePal AI" : "Tailor Your Challenge Experience"}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium max-w-md mx-auto leading-relaxed">
              {step === 1
                ? "The interactive learning platform that evaluates how you think — not just whether you got it right or wrong."
                : selectedType === "kids"
                ? "Tell us your age and pick what puzzle themes spark your curiosity!"
                : "Select your career stage and choose the analytical domains you want to sharpen."}
            </p>
          </div>

          {/* Educational Concept Pill on Step 1 */}
          {step === 1 && (
            <div className="mb-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                How It Works:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-lg block">🧩</span>
                  <span className="font-bold text-slate-200 block mt-0.5">1. Challenge</span>
                  <span className="text-[10px] text-slate-500">Real-world scenario</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-lg block">✏️</span>
                  <span className="font-bold text-slate-200 block mt-0.5">2. Reason</span>
                  <span className="text-[10px] text-slate-500">Explain your thinking</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-lg block">🤖</span>
                  <span className="font-bold text-slate-200 block mt-0.5">3. AI Feedback</span>
                  <span className="text-[10px] text-slate-500">4-dimension score</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-lg block">🏆</span>
                  <span className="font-bold text-slate-200 block mt-0.5">4. Level Up</span>
                  <span className="text-[10px] text-slate-500">Earn XP & badges</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Choose Persona */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* KIDS CHOICE */}
                <button
                  type="button"
                  onClick={() => setSelectedType("kids")}
                  className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    selectedType === "kids"
                      ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950"
                  }`}
                >
                  <div className="text-4xl mb-3">🧒</div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      KIDS EXPERIENCE
                    </h2>
                    {selectedType === "kids" && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Selected ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-300 mb-2">
                    PLAY → SOLVE → LEARN → REWARD
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed for young minds. Fun detective mysteries, colorful patterns, creative inventions, and friendly math riddles with positive, encouraging feedback!
                  </p>
                </button>

                {/* STUDENTS CHOICE */}
                <button
                  type="button"
                  onClick={() => setSelectedType("student")}
                  className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    selectedType === "student"
                      ? "border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-400/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950"
                  }`}
                >
                  <div className="text-4xl mb-3">🎓</div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      STUDENTS & PROS
                    </h2>
                    {selectedType === "student" && (
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                        Selected ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-indigo-300 mb-2">
                    THINK → SOLVE → ANALYZE → IMPROVE
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed for college students, developers, and young professionals. Tackle interview trade-offs, architecture puzzles, data anomalies, and logic.
                  </p>
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedType}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Category-specific Level */}
              {selectedType === "kids" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Select Your Age Range
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["8–10", "11–13", "14–16"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setAgeRange(age)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          ageRange === age
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {age} Years
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Academic or Career Stage
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["High School", "College / Undergrad", "Early Career"].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setAcademicLevel(stage)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          academicLevel === stage
                            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Choose Your Favorite Puzzle Areas{" "}
                  <span className="text-slate-500 font-normal">(Pick 1 or more)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(selectedType === "kids" ? kidsInterests : studentInterests).map((item) => {
                    const isSelected = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? selectedType === "kids"
                              ? "bg-amber-500/15 border-amber-400/80 text-amber-200 ring-1 ring-amber-400/40"
                              : "bg-indigo-500/15 border-indigo-400/80 text-indigo-200 ring-1 ring-indigo-400/40"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <span>✓</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <span>Save & Start Thinking →</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
