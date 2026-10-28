"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (profile && !profile.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, profile, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // AuthProvider will trigger and useEffect will navigate appropriately
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment before trying again.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Unable to authenticate. Please check your credentials and retry.");
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage("Password reset email sent! Please check your inbox.");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/user-not-found") {
        setResetError("No account found with this email.");
      } else if (code === "auth/invalid-email") {
        setResetError("Invalid email address.");
      } else {
        setResetError("Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="text-sm text-slate-500 mt-1.5">Sign in to continue your thinking challenges.</p>

      {error && (
        <div role="alert" className="mt-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 animate-fade-up">
          <Icon name="alertCircle" className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
            placeholder="you@domain.com"
            required
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setShowResetModal(true);
              }}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 accent-brand-600"
          />
          <span className="text-sm text-slate-600">Keep me signed in</span>
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <Icon name="arrowRight" className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]">
          <div className="w-full max-w-sm panel p-6 shadow-lift animate-pop">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-ink">Reset password</h2>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetMessage("");
                  setResetError("");
                }}
                className="p-1 -mr-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100"
                aria-label="Close"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {resetMessage ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-2">
                  <Icon name="checkCircle" className="w-4 h-4 mt-0.5" />
                  {resetMessage}
                </div>
                <button type="button" onClick={() => setShowResetModal(false)} className="btn btn-secondary w-full">
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-sm text-slate-500">
                  Enter your email address to receive a secure password reset link.
                </p>

                {resetError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {resetError}
                  </div>
                )}

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="input"
                />

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowResetModal(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={resetLoading} className="btn btn-primary">
                    {resetLoading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
