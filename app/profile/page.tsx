"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import StatsCard from "@/components/StatsCard";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/lib/auth";
import {
  getUserCategoryStrengths,
  updateUserProfile,
  getLevelTitle,
  AVAILABLE_BADGES,
} from "@/lib/firestore";
import { CategoryStrength, UserType } from "@/lib/types";

export default function ProfilePage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const [strengths, setStrengths] = useState<CategoryStrength[]>([]);
  const [loadingStrengths, setLoadingStrengths] = useState<boolean>(true);

  // Edit profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(profile?.fullName || "");
  const [editUserType, setEditUserType] = useState<UserType>(profile?.userType || "student");
  const [editAgeRange, setEditAgeRange] = useState(profile?.ageRange || "11-13");
  const [editAcademicLevel, setEditAcademicLevel] = useState(profile?.academicLevel || "College / Undergrad");
  const [editInterests, setEditInterests] = useState<string[]>(profile?.interests || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleStartEditing = () => {
    setEditFullName(profile?.fullName || "");
    setEditUserType(profile?.userType || "student");
    setEditAgeRange(profile?.ageRange || "11-13");
    setEditAcademicLevel(profile?.academicLevel || "College / Undergrad");
    setEditInterests(profile?.interests || []);
    setIsEditing(true);
  };

  useEffect(() => {
    let ignore = false;

    async function loadStrengths() {
      if (!user) return;
      try {
        setLoadingStrengths(true);
        const data = await getUserCategoryStrengths(user.uid, profile?.userType);
        if (!ignore) {
          setStrengths(data);
        }
      } catch (err) {
        console.error("Failed to load category strengths:", err);
      } finally {
        if (!ignore) {
          setLoadingStrengths(false);
        }
      }
    }

    loadStrengths();

    return () => {
      ignore = true;
    };
  }, [user, profile?.userType]);

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const reasoningScore = profile?.reasoningScore ?? 0;
  const challengesSolved = profile?.challengesSolved ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const difficulty = profile?.currentDifficulty ?? "medium";
  const userType = profile?.userType || "student";
  const isKids = userType === "kids";
  const levelTitle = getLevelTitle(level, userType);

  const toggleInterest = (id: string) => {
    setEditInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess(false);

      await updateUserProfile(user.uid, {
        ...(editFullName.trim() ? { fullName: editFullName.trim() } : {}),
        userType: editUserType,
        ...(editUserType === "kids" ? { ageRange: editAgeRange } : {}),
        ...(editUserType === "student" ? { academicLevel: editAcademicLevel } : {}),
        interests: editInterests,
      });

      await refreshProfile();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const interestOptions = editUserType === "kids"
    ? [
        { id: "kids_mystery", label: "🔍 Detective & Mystery" },
        { id: "kids_brain_teaser", label: "⚡ Brain Teasers & Riddles" },
        { id: "kids_pattern", label: "🌀 Patterns & Sequences" },
        { id: "kids_math", label: "🔢 Fun Math Puzzles" },
        { id: "kids_creative", label: "💡 Creative Thinking" },
        { id: "kids_word", label: "🔤 Word Games" },
      ]
    : [
        { id: "logic", label: "🧩 Logic & Lateral Thinking" },
        { id: "business", label: "📈 Business Decisions" },
        { id: "technical", label: "💻 Technical Challenges" },
        { id: "data", label: "📊 Data Reasoning" },
        { id: "mystery", label: "🔍 Mystery & Deduction" },
        { id: "decision", label: "🎯 Decision Making" },
        { id: "aptitude", label: "🔢 Light Aptitude" },
        { id: "word", label: "🔤 Verbal Reasoning" },
      ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-200">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-indigo-400">Profile & Settings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {profile?.fullName || "Your Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage your analytical identity, review badges, and customize your puzzle experience.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (isEditing ? setIsEditing(false) : handleStartEditing())}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                {isEditing ? "Cancel Editing" : "Edit Profile ✏️"}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:border-rose-800/80 hover:bg-rose-950/40 text-xs font-semibold text-slate-400 hover:text-rose-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>Profile updated successfully in Firestore!</span>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{saveError}</span>
            </div>
          )}

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="rounded-2xl border border-indigo-500/50 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>✏️</span>
                <span>Edit Profile Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    User Persona Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditUserType("kids")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        editUserType === "kids"
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🧒 Kids Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUserType("student")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        editUserType === "student"
                          ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🎓 Student Mode
                    </button>
                  </div>
                </div>
              </div>

              {editUserType === "kids" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Age Range
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["8–10", "11–13", "14–16"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setEditAgeRange(age)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          editAgeRange === age
                            ? "bg-amber-500/20 border-amber-400 text-amber-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {age} Years
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Academic / Career Stage
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["High School", "College / Undergrad", "Early Career"].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setEditAcademicLevel(stage)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          editAcademicLevel === stage
                            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests multi-select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Favorite Categories / Focus Areas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interestOptions.map((opt) => {
                    const isSelected = editInterests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {opt.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Account Overview Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-3xl shrink-0">
                {isKids ? "🧒" : "🎓"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{profile?.fullName || user?.email?.split("@")[0]}</span>
                  <span className="text-xs font-normal text-slate-400">({user?.email})</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                  <span className="text-indigo-400 font-semibold">{levelTitle}</span>
                  <span>•</span>
                  <span>{isKids ? `Age: ${profile?.ageRange || "8–13"}` : profile?.academicLevel || "Student / Pro"}</span>
                  <span>•</span>
                  <span>Adaptive: <span className="uppercase font-bold text-slate-300">{difficulty}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isKids
                  ? "bg-amber-500/10 border-amber-400/40 text-amber-300"
                  : "bg-indigo-500/10 border-indigo-400/40 text-indigo-300"
              }`}>
                {isKids ? "🧒 Kids Mode Active" : "🎓 Student Mode Active"}
              </span>
            </div>
          </div>

          {/* 4 Primary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label={isKids ? "Average Star Score" : "Reasoning Score"}
              value={reasoningScore > 0 ? `${reasoningScore.toFixed(1)} / 10` : "—"}
              subtext="Average score"
              icon={isKids ? "⭐" : "🧠"}
            />
            <StatsCard
              label="Total Experience"
              value={`${xp} XP`}
              subtext={`Level ${level} Progress`}
              icon="⚡"
            />
            <StatsCard
              label="Completions"
              value={`${challengesSolved}`}
              subtext="Total puzzles solved"
              icon="🎯"
            />
            <StatsCard
              label="Active Streak"
              value={`${currentStreak} Days`}
              subtext="Consecutive days active"
              icon="🔥"
            />
          </div>

          {/* Level Progress */}
          <ProgressBar xp={xp} level={level} levelTitle={levelTitle} userType={userType} />

          {/* Trophies & Badges Collection */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <span>{isKids ? "Your Trophy Case 🏆" : "Reasoning Badges & Accomplishments 🎖️"}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({(profile?.badges || []).length} / {AVAILABLE_BADGES.length} Unlocked)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Milestone badges earned through deductive accuracy, active streaks, and cognitive exploration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AVAILABLE_BADGES.map((b) => {
                const isUnlocked = (profile?.badges || []).includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isUnlocked
                        ? "bg-slate-950/90 border-indigo-500/40 text-slate-100 shadow-xs"
                        : "bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-50"
                    }`}
                  >
                    <div className="text-3xl mb-1.5">{b.icon}</div>
                    <div className="text-xs font-bold text-slate-200">{b.name}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {b.description}
                    </p>
                    <div className="mt-2.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isUnlocked
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isUnlocked ? "Unlocked ✓" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Category Strengths Matrix */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Category Competency Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Calculated dynamically from your completed challenge reasoning scores.
            </p>

            {loadingStrengths ? (
              <LoadingState message="Loading performance metrics..." size="md" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {strengths.map((cs) => {
                  const pct = Math.round((cs.averageScore / 10) * 100);
                  return (
                    <div
                      key={cs.category}
                      className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-2">
                          <span className="text-lg">{cs.icon}</span>
                          <span>{cs.displayName}</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {cs.count > 0 ? (
                            <>
                              <span className="font-bold text-slate-100">{cs.averageScore}</span>
                              /10 ({cs.count} solved)
                            </>
                          ) : (
                            <span className="text-slate-600">Unattempted</span>
                          )}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 80
                              ? "bg-emerald-500"
                              : pct >= 60
                              ? "bg-indigo-500"
                              : pct > 0
                              ? "bg-amber-500"
                              : "bg-slate-800"
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Telemetry & Security Footprint */}
          <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 text-xs text-slate-400 space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Account Security & Telemetry
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500">Firebase UID:</span>{" "}
                <span className="text-slate-300">{user?.uid || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Auth Email:</span>{" "}
                <span className="text-slate-300">{user?.email || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Storage Engine:</span>{" "}
                <span className="text-slate-300">Firebase Firestore (Protected)</span>
              </div>
              <div>
                <span className="text-slate-500">AI Engine:</span>{" "}
                <span className="text-slate-300">OpenAI Server API + Fallback</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
