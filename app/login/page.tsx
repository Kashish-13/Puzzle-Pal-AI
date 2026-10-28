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
    <main className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🧠</span>
            <span className="text-xl font-black tracking-tight text-white">
              PuzzlePal AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sign in to continue your thinking challenges
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-hidden text-slate-100 text-sm font-medium transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-slate-400 font-medium">
                Keep me signed in
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In →</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100">
                Reset Password
              </h2>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetMessage("");
                  setResetError("");
                }}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {resetMessage ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
                  {resetMessage}
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter your email address to receive a secure password reset link.
                </p>

                {resetError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
                    {resetError}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
