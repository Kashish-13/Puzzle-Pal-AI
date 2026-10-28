"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import Icon from "@/components/Icon";

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
        return { label: "Strong", color: "bg-brand-500", score: 4 };
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
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="text-sm text-slate-500 mt-1.5">Start practicing structured reasoning — free.</p>

      {error && (
        <div role="alert" className="mt-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 animate-fade-up">
          <Icon name="alertCircle" className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        <div>
          <label htmlFor="fullName" className="label">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Morgan"
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            required
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            {password && (
              <span className="text-xs text-slate-500">
                Strength:{" "}
                <span
                  className={`font-medium ${
                    passwordStrength.score >= 3
                      ? "text-green-600"
                      : passwordStrength.score === 2
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="input pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-ink text-xs font-medium"
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
                  className={`h-1 rounded-full transition-colors duration-300 ${
                    step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className="input pr-16"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-ink text-xs font-medium"
              tabIndex={-1}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <Icon name="arrowRight" className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
