"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (profile && !profile.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, profile, authLoading, router]);

  // Compute password strength
  const getPasswordStrength = (pass: string): { label: string; color: string; score: number } => {
    if (!pass) return { label: "", color: "bg-slate-700", score: 0 };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { label: "Weak", color: "bg-rose-500", score: 1 };
      case 2:
        return { label: "Fair", color: "bg-amber-500", score: 2 };
      case 3:
        return { label: "Good", color: "bg-emerald-500", score: 3 };
      case 4:
      default:
        return { label: "Strong", color: "bg-indigo-500", score: 4 };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Set display name in Firebase Auth
      try {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim(),
        });
      } catch {
        // Non-blocking
      }

      // Initialize Firestore profile document (UID as doc ID)
      try {
        await createUserProfile(
          userCredential.user.uid,
          userCredential.user.email || email.trim(),
          fullName.trim()
        );
        await refreshProfile();
      } catch (profileErr) {
        console.warn("Could not save initial Firestore profile:", profileErr);
      }

      // Direct new user to personalizing their onboarding experience
      router.push("/onboarding");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters with letters and numbers.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to create account. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🧠</span>
            <span className="text-xl font-black tracking-tight text-white">
              PuzzlePal AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Join the AI-powered reasoning & puzzle platform
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-hidden text-slate-100 text-sm font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-hidden text-slate-100 text-sm font-medium transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              {password && (
                <span className="text-[11px] font-semibold text-slate-400">
                  Strength:{" "}
                  <span
                    className={
                      passwordStrength.score >= 3
                        ? "text-emerald-400"
                        : passwordStrength.score === 2
                        ? "text-amber-400"
                        : "text-rose-400"
                    }
                  >
                    {passwordStrength.label}
                  </span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-hidden text-slate-100 text-sm font-medium transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {password && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step <= passwordStrength.score
                        ? passwordStrength.color
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-hidden text-slate-100 text-sm font-medium transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                tabIndex={-1}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account →</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
