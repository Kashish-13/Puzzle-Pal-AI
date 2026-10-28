"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { updateUserProfile } from "@/lib/firestore";
import { UserType } from "@/lib/types";
import { Logo } from "@/components/Navbar";
import Icon, { IconName } from "@/components/Icon";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, updateProfileLocally } = useAuth();

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

      updateProfileLocally({
        userType: selectedType,
        ...(selectedType === "kids" ? { ageRange } : {}),
        ...(selectedType === "student" ? { academicLevel } : {}),
        interests: selectedInterests,
        onboardingCompleted: true,
        currentDifficulty: selectedType === "kids" ? "easy" : "medium",
      });

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
    { id: "kids_mystery", label: "Detective & Mystery", desc: "Finding footprints & clue tracking" },
    { id: "kids_brain_teaser", label: "Brain Teasers & Riddles", desc: "Tricky mind-benders & clever puzzles" },
    { id: "kids_pattern", label: "Patterns & Sequences", desc: "Shape transformations & secret color codes" },
    { id: "kids_math", label: "Fun Math Puzzles", desc: "Pizza fractions, animal legs & balance scales" },
    { id: "kids_creative", label: "Creative Thinking", desc: "Desert island shelters & wacky inventions" },
    { id: "kids_word", label: "Word Games", desc: "Secret ciphers, anagrams & word bridges" },
  ];

  const studentInterests = [
    { id: "logic", label: "Logic & Lateral Thinking", desc: "Multi-constraint systems & deduction" },
    { id: "business", label: "Business Decisions", desc: "Startup prioritization, unit economics & strategy" },
    { id: "technical", label: "Technical Challenges", desc: "Architecture bottlenecks & distributed systems" },
    { id: "data", label: "Data Reasoning", desc: "Metrics interpretation, Simpson's paradox & anomalies" },
    { id: "mystery", label: "Mystery & Deduction", desc: "Forensic clues & timeline elimination" },
    { id: "decision", label: "Crisis Decision Making", desc: "High-stakes mitigation & risk tradeoffs" },
    { id: "aptitude", label: "Light Aptitude", desc: "Placement reasoning, coding-decoding & sequences" },
    { id: "word", label: "Verbal Reasoning", desc: "Syllogistic logic & fallacy deconstruction" },
  ];

  const personaOptions: { type: UserType; title: string; flow: string; desc: string; icon: IconName }[] = [
    {
      type: "kids",
      title: "Kids",
      flow: "Play · Solve · Learn · Reward",
      desc: "Detective mysteries, patterns, creative inventions, and friendly math riddles with encouraging feedback.",
      icon: "smile",
    },
    {
      type: "student",
      title: "Students & professionals",
      flow: "Think · Solve · Analyze · Improve",
      desc: "Interview trade-offs, architecture puzzles, data anomalies, and logic for college students and early-career professionals.",
      icon: "graduationCap",
    },
  ];

  const howItWorks: { title: string; desc: string; icon: IconName }[] = [
    { title: "Challenge", desc: "Real-world scenario", icon: "fileText" },
    { title: "Reason", desc: "Explain your thinking", icon: "pen" },
    { title: "AI feedback", desc: "4-dimension score", icon: "message" },
    { title: "Level up", desc: "Earn XP & badges", icon: "trendingUp" },
  ];

  const steps = [
    { n: 1, label: "Choose your experience" },
    { n: 2, label: "Personalize" },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header + progress */}
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <span className="text-sm text-slate-500 tabular-nums">Step {step} of 2</span>
          </div>

          <ol className="mt-8 grid grid-cols-2 gap-3" aria-label="Onboarding progress">
            {steps.map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              return (
                <li key={s.n}>
                  <div className={`h-1 rounded-full transition-colors duration-300 ${done || active ? "bg-brand-600" : "bg-slate-200"}`} />
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span
                      className={`text-xs font-semibold tabular-nums ${active || done ? "text-brand-600" : "text-slate-400"}`}
                    >
                      {done ? <Icon name="check" className="w-3.5 h-3.5" /> : `0${s.n}`}
                    </span>
                    <span className={active ? "font-medium text-ink" : "text-slate-500"}>{s.label}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <div key={step} className="mt-10 page-enter">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {step === 1 ? "How would you like to learn?" : "Tailor your challenges"}
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
              {step === 1
                ? "PuzzlePal evaluates how you think — not just whether you got it right. Choose an experience; you can switch any time."
                : selectedType === "kids"
                ? "Tell us your age and pick the puzzle themes that spark your curiosity."
                : "Select your career stage and choose the analytical domains you want to sharpen."}
            </p>

            {error && (
              <div role="alert" className="mt-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <Icon name="alertCircle" className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Choose Persona */}
            {step === 1 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Experience">
                  {personaOptions.map((opt) => {
                    const isSelected = selectedType === opt.type;
                    const kids = opt.type === "kids";
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedType(opt.type)}
                        className={`option card-interactive overflow-hidden ${kids ? "rounded-3xl" : "rounded-2xl"} ${isSelected ? "option-selected" : ""}`}
                      >
                        {/* Visual */}
                        <div
                          className={`relative h-28 border-b ${
                            kids ? "bg-sky-50 border-sky-100" : "bg-slate-900 border-slate-800"
                          }`}
                          aria-hidden="true"
                        >
                          {kids ? (
                            <>
                              <span className="absolute left-6 top-6 w-12 h-12 rounded-full bg-sky-200/80" />
                              <span className="absolute left-20 top-12 w-8 h-8 rounded-lg bg-amber-200 rotate-12" />
                              <span className="absolute right-10 top-5 w-10 h-10 rounded-full bg-brand-200" />
                              <span className="absolute right-24 bottom-4 w-6 h-6 rounded-full bg-green-200" />
                            </>
                          ) : (
                            <svg viewBox="0 0 300 112" className="absolute inset-0 w-full h-full">
                              <polyline points="20,90 70,70 120,78 170,45 220,52 280,20" fill="none" stroke="#8b7dff" strokeWidth="2" />
                              {[[20, 90], [70, 70], [120, 78], [170, 45], [220, 52], [280, 20]].map(([x, y]) => (
                                <circle key={x} cx={x} cy={y} r="3.5" fill="#5b4bff" stroke="#c4bdff" />
                              ))}
                              <line x1="20" y1="100" x2="280" y2="100" stroke="#334155" />
                            </svg>
                          )}
                          <span
                            className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "bg-brand-600 border-brand-600 text-white" : "bg-white/90 border-slate-300"
                            }`}
                          >
                            {isSelected && <Icon name="check" className="w-3.5 h-3.5" />}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center gap-2">
                            <Icon name={opt.icon} className={`w-5 h-5 ${kids ? "text-sky-600" : "text-brand-600"}`} />
                            <h2 className="text-base font-semibold text-ink">{opt.title}</h2>
                          </div>
                          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{opt.desc}</p>
                          <p className={`mt-3 text-xs font-medium ${kids ? "text-sky-600" : "text-brand-600"}`}>{opt.flow}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!selectedType}
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                  >
                    <span>Continue</span>
                    <Icon name="arrowRight" className="w-4 h-4" />
                  </button>
                </div>

                {/* How it works */}
                <div className="mt-12 panel p-6">
                  <h2 className="text-sm font-semibold text-ink">How it works</h2>
                  <ol className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {howItWorks.map((item, idx) => (
                      <li key={item.title}>
                        <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                          <Icon name={item.icon} className="w-[18px] h-[18px]" />
                        </span>
                        <div className="mt-3 text-sm font-medium text-ink">
                          <span className="text-slate-400 tabular-nums mr-1">0{idx + 1}</span>
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* STEP 2: Preferences */}
            {step === 2 && (
              <div className="mt-8 space-y-8">
                {selectedType === "kids" ? (
                  <div>
                    <span className="label">Age range</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["8–10", "11–13", "14–16"].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setAgeRange(age)}
                          className={`option py-3 px-3 text-sm text-center font-medium ${
                            ageRange === age ? "option-selected text-brand-700" : "text-slate-700"
                          }`}
                        >
                          {age} years
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="label">Academic or career stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {["High School", "College / Undergrad", "Early Career"].map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setAcademicLevel(stage)}
                          className={`option py-3 px-3 text-sm text-center font-medium ${
                            academicLevel === stage ? "option-selected text-brand-700" : "text-slate-700"
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="label">
                    Favorite puzzle areas <span className="font-normal text-slate-500">— pick one or more</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedType === "kids" ? kidsInterests : studentInterests).map((item) => {
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleInterest(item.id)}
                          className={`option p-3.5 flex items-start gap-3 ${isSelected ? "option-selected" : ""}`}
                        >
                          <span
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "bg-brand-600 border-brand-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Icon name="check" className="w-3 h-3" />}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-ink">{item.label}</span>
                            <span className="block text-xs text-slate-500 mt-0.5">{item.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
                    <Icon name="arrowLeft" className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button type="button" onClick={handleFinish} disabled={saving} className="btn btn-primary btn-lg">
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Start solving</span>
                        <Icon name="arrowRight" className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
