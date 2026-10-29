"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import StatsCard from "@/components/StatsCard";
import Icon, { CategoryIcon } from "@/components/Icon";
import AchievementGrid from "@/components/AchievementGrid";
import RecentActivityList from "@/components/RecentActivityList";
import SectionHeader from "@/components/SectionHeader";
import { CATEGORY_TONE, TONES } from "@/components/tokens";
import { useAuth } from "@/lib/auth";
import {
  getUserCategoryStrengths,
  updateUserProfile,
  getLevelTitle,
  AVAILABLE_BADGES,
  getChallengeHistory,
} from "@/lib/firestore";
import { CategoryStrength, ChallengeHistoryRecord, UserType } from "@/lib/types";
import { GAMES, KIDS_GAMES, STUDENT_GAMES } from "@/lib/games/catalog";

export default function ProfilePage() {
  const { user, profile, refreshProfile, updateProfileLocally, logout } = useAuth();
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

      updateProfileLocally({
        ...(editFullName.trim() ? { fullName: editFullName.trim() } : {}),
        userType: editUserType,
        ...(editUserType === "kids" ? { ageRange: editAgeRange } : {}),
        ...(editUserType === "student" ? { academicLevel: editAcademicLevel } : {}),
        interests: editInterests,
        currentDifficulty: editUserType === "kids" ? "easy" : "medium",
      });

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

  const interestOptions = (editUserType === "kids" ? KIDS_GAMES : STUDENT_GAMES).map((id) => ({ id, label: GAMES[id].name }));

  // Recent activity (read-only, same source as the dashboard)
  const [recent, setRecent] = useState<ChallengeHistoryRecord[]>([]);
  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getChallengeHistory(user.uid)
      .then((history) => {
        if (!ignore) setRecent(history.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load recent activity:", err));
    return () => {
      ignore = true;
    };
  }, [user]);

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "";
  const unlockedBadges = profile?.badges || [];
  const unlockedPct = Math.round((unlockedBadges.length / AVAILABLE_BADGES.length) * 100);
  const radius = isKids ? "rounded-3xl" : "rounded-2xl";

  return (
    <ProtectedRoute>
      <div className={`min-h-screen text-ink flex flex-col canvas ${isKids ? "canvas-kids" : ""}`}>
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10 page-enter">
          {/* Header */}
          <div className="space-y-4">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
              <Link href="/dashboard" className="hover:text-ink transition-colors">
                {isKids ? "Home" : "Dashboard"}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">Profile</span>
            </nav>

            {/* Profile hero: identity, mode, actions and level progress */}
            <section
              className={`relative overflow-hidden ${radius} text-white ${
                isKids ? "bg-gradient-to-br from-brand-600 via-brand-500 to-sky-500" : "bg-gradient-to-br from-brand-700 via-brand-600 to-blue-600"
              }`}
            >
              <div className="absolute -top-24 left-1/3 w-72 h-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full bg-blue-400/30 blur-3xl" aria-hidden="true" />
              <div
                className="absolute inset-y-0 left-0 w-1/2 opacity-30 bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,#000,transparent)]"
                aria-hidden="true"
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 sm:p-8 lg:p-10">
                <div className="lg:col-span-3 flex flex-col justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 p-1 ring-1 ring-white/30 backdrop-blur shrink-0">
                      <span className="w-full h-full rounded-xl bg-white text-brand-700 text-2xl sm:text-3xl font-semibold flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(15,23,42,0.5)]">
                        {displayName.charAt(0).toUpperCase() || "?"}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Your profile</p>
                      <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight truncate">{displayName}</h1>
                      <p className="mt-1 text-sm text-white/80">
                        {levelTitle} · {isKids ? `Age ${profile?.ageRange || "8–13"}` : profile?.academicLevel || "Student / Pro"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium ring-1 ring-white/20 hover:bg-white/25 transition-colors"
                      title="Switch between Kids and Student learning modes"
                    >
                      <Icon name={isKids ? "smile" : "graduationCap"} className="w-3.5 h-3.5" />
                      {isKids ? "Kids mode" : "Student mode"}
                      <Icon name="arrowLeftRight" className="w-3 h-3 text-white/70" />
                    </Link>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium ring-1 ring-white/20">
                      <Icon name="activity" className="w-3.5 h-3.5" />
                      Adaptive <span className="capitalize">{difficulty}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium ring-1 ring-white/20">
                      <Icon name="award" className="w-3.5 h-3.5" />
                      {unlockedBadges.length} {isKids ? "trophies" : "achievements"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/history" className="btn bg-white text-brand-700 hover:bg-brand-50 hover:-translate-y-px shadow-lift">
                      Review progress
                      <Icon name="arrowRight" className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => (isEditing ? setIsEditing(false) : handleStartEditing())}
                      className="btn bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20"
                    >
                      <Icon name="pen" className="w-4 h-4" />
                      {isEditing ? "Cancel editing" : "Edit profile"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 flex items-center">
                  <div className="w-full rounded-2xl bg-white/95 text-ink ring-1 ring-white/60 p-5 sm:p-6 shadow-[0_24px_48px_-16px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Level {level}</p>
                        <p className="mt-0.5 text-lg font-semibold text-ink">{levelTitle}</p>
                      </div>
                      <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(245,158,11,0.7)]">
                        <Icon name="trophy" className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="mt-5">
                      <ProgressBar xp={xp} level={level} levelTitle={undefined} userType={userType} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {(saveSuccess || saveError) && (
            <div className="-mt-4 space-y-3">
              {saveSuccess && (
                <div role="status" className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2 animate-fade-up">
                  <Icon name="checkCircle" className="w-4 h-4" />
                  <span>Profile updated.</span>
                </div>
              )}
              {saveError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <Icon name="alertCircle" className="w-4 h-4" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          )}

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className={`panel-tint ${radius} p-6 sm:p-8 space-y-6 animate-fade-up`}>
              <SectionHeader title="Edit profile" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="editFullName" className="label">
                    Full name
                  </label>
                  <input
                    id="editFullName"
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Your full name"
                    className="input"
                  />
                </div>

                <div>
                  <span className="label">Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["kids", "student"] as UserType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditUserType(type)}
                        className={`option py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-2 ${
                          editUserType === type ? "option-selected text-brand-700" : "text-slate-700"
                        }`}
                      >
                        <Icon name={type === "kids" ? "smile" : "graduationCap"} className="w-4 h-4" />
                        {type === "kids" ? "Kids" : "Student"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {editUserType === "kids" ? (
                <div>
                  <span className="label">Age range</span>
                  <div className="grid grid-cols-3 gap-2">
                    {["8–10", "11–13", "14–16"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setEditAgeRange(age)}
                        className={`option py-2.5 px-3 text-sm text-center font-medium ${
                          editAgeRange === age ? "option-selected text-brand-700" : "text-slate-700"
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
                        onClick={() => setEditAcademicLevel(stage)}
                        className={`option py-2.5 px-3 text-sm text-center font-medium ${
                          editAcademicLevel === stage ? "option-selected text-brand-700" : "text-slate-700"
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="label">Favorite games</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {interestOptions.map((opt) => {
                    const isSelected = editInterests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleInterest(opt.id)}
                        className={`option py-2.5 px-3 text-sm flex items-center justify-between gap-2 ${
                          isSelected ? "option-selected text-ink" : "text-slate-700"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Icon name="check" className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}

          {/* Metrics */}
          <section>
            <SectionHeader title={isKids ? "Your numbers" : "Statistics"} />
            <StatsCard
              playful={isKids}
              items={[
                { label: "Level", value: level, subtext: levelTitle, icon: "layers", tone: "brand" },
                { label: "XP", value: xp, subtext: "Lifetime experience", icon: "zap", tone: "amber" },
                { label: "Streak", value: `${currentStreak}d`, subtext: "Consecutive days", icon: "flame", tone: isKids ? "sky" : "blue" },
                { label: isKids ? "Puzzles solved" : "Solved", value: challengesSolved, subtext: "All time", icon: "checkCircle", tone: "green" },
                {
                  label: isKids ? "Star score" : "Avg. score",
                  value: reasoningScore > 0 ? reasoningScore.toFixed(1) : "—",
                  subtext: "Out of 10",
                  icon: "activity",
                  tone: "brand",
                },
              ]}
            />
          </section>

          {/* Achievements (supports #trophies link from Kids navbar) */}
          <section id="trophies" className="scroll-mt-24">
            <div className={`panel-tint ${radius} p-5 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between`}>
              <div className="flex items-center gap-4">
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    isKids
                      ? "bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_8px_18px_-8px_rgba(245,158,11,0.7)]"
                      : "bg-gradient-to-br from-brand-500 to-brand-600 shadow-[0_8px_18px_-8px_rgba(91,75,255,0.7)]"
                  }`}
                >
                  <Icon name="award" className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-ink">{isKids ? "Trophies" : "Achievements"}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    <span className="font-medium text-ink">{unlockedBadges.length} of {AVAILABLE_BADGES.length}</span>{" "}
                    {isKids ? "trophies" : "achievements"} unlocked
                  </p>
                </div>
              </div>
              <div className="sm:w-64">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full origin-left animate-grow ${isKids ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-brand-500 to-blue-500"}`}
                    style={{ width: `${unlockedPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 sm:text-right">{unlockedPct}% complete</p>
              </div>
            </div>
            <AchievementGrid unlocked={unlockedBadges} isKids={isKids} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category strengths */}
            <div>
              <SectionHeader title={isKids ? "Puzzle strengths" : "Reasoning by category"} />
              <div className={`panel ${radius} p-5`}>
                {loadingStrengths ? (
                  <div className="space-y-4" aria-busy="true">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="skeleton h-3 w-1/3" />
                        <div className="skeleton h-1.5 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {strengths.map((cs) => {
                      const pct = Math.round((cs.averageScore / 10) * 100);
                      const tone = TONES[CATEGORY_TONE[cs.category] || "brand"];
                      return (
                        <div key={cs.category}>
                          <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                            <span className="flex items-center gap-2 text-slate-700 min-w-0">
                              <CategoryIcon category={cs.category} className={`w-3.5 h-3.5 ${tone.text}`} />
                              <span className="truncate">{cs.displayName}</span>
                            </span>
                            <span className="text-xs text-slate-500 tabular-nums shrink-0">
                              {cs.count > 0 ? (
                                <>
                                  <span className="font-medium text-ink">{cs.averageScore}</span>/10 · {cs.count} solved
                                </>
                              ) : (
                                "Not attempted"
                              )}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full origin-left animate-grow ${isKids ? tone.solid : pct >= 80 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-brand-500 to-blue-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <SectionHeader
                title="Recent activity"
                action={recent.length > 0 ? { href: "/history", label: "View history" } : undefined}
              />
              <RecentActivityList records={recent} />
            </div>
          </section>

          {/* Account details */}
          <section className={`panel ${radius} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="relative pl-3 text-base font-semibold tracking-tight text-ink before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-brand-500 before:to-blue-500">
                Account details
              </h2>
              <button type="button" onClick={() => logout()} className="btn btn-sm btn-ghost">
                <Icon name="logOut" className="w-4 h-4" />
                Sign out
              </button>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 min-w-0">
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Email</dt>
                <dd className="mt-1 text-slate-700 break-all">{user?.email || "—"}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 min-w-0">
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Account ID</dt>
                <dd className="mt-1 text-slate-700 font-mono text-xs sm:text-sm break-all">{user?.uid || "—"}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Storage</dt>
                <dd className="mt-1 text-slate-700">Firebase Firestore (protected)</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">AI engine</dt>
                <dd className="mt-1 text-slate-700">OpenAI server API with fallback</dd>
              </div>
            </dl>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
