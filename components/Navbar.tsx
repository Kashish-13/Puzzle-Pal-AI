"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getLevelTitle } from "@/lib/firestore";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isKids = profile?.userType === "kids";
  const levelTitle = getLevelTitle(profile?.level ?? 1, profile?.userType);

  // Differentiated navigation links tailored to cognitive journey
  const navLinks = isKids
    ? [
        { label: "Home", href: "/dashboard", icon: "🏠" },
        { label: "Puzzles", href: "/challenge", icon: "🧩" },
        { label: "Trophies", href: "/profile#trophies", icon: "🏆" },
        { label: "Profile", href: "/profile", icon: "👤" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "Challenges", href: "/challenge", icon: "🧠" },
        { label: "History", href: "/history", icon: "📜" },
        { label: "Profile", href: "/profile", icon: "👤" },
      ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <span className={`text-2xl transition-transform group-hover:scale-110 ${isKids ? "animate-bounce" : ""}`}>
              {isKids ? "🧩" : "🧠"}
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent flex items-center gap-1.5">
                <span>PuzzlePal</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-md font-bold uppercase ${
                  isKids
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono"
                }`}>
                  {isKids ? "Kids" : "AI"}
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5 hidden sm:inline">
                {isKids ? "Think. Play. Solve!" : "Interactive Problem Solving"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href.includes("#") && pathname === link.href.split("#")[0]);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                      isActive
                        ? isKids
                          ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-xs"
                          : "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <span className="text-xs opacity-75">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Stats & Action Pill */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Persona / Mode Badge (Preserved & Styled) */}
              <Link
                href="/onboarding"
                title="Switch between Kids and Student learning modes"
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                  isKids
                    ? "bg-amber-500/10 border-amber-400/40 text-amber-300 hover:bg-amber-500/20"
                    : "bg-indigo-500/10 border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/20"
                }`}
              >
                <span>{isKids ? "🧒 Kids Explorer" : "🎓 Student Mode"}</span>
                <span className="text-slate-500 text-[10px]">⇄</span>
              </Link>

              {/* Progress & Quick Stats Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isKids ? "⭐" : "🎯"}</span>
                  <span>Lvl {profile?.level ?? 1}</span>
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span>⚡</span>
                  <span>{profile?.xp ?? 0} XP</span>
                </span>
                {profile?.currentStreak ? (
                  <>
                    <span className="text-slate-700">|</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      <span>🔥</span>
                      <span>{profile.currentStreak}d</span>
                    </span>
                  </>
                ) : null}
              </div>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                  {isKids ? "🚀" : "🧑‍💻"}
                </span>
                <span className="max-w-[120px] truncate">
                  {profile?.fullName || user.email?.split("@")[0]}
                </span>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-400 font-bold">
              ⚡ {profile?.xp ?? 0} XP
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 focus:outline-hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#090d16] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {user ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{isKids ? "🧒" : "🎓"}</span>
                    <span>{profile?.fullName || user.email}</span>
                  </div>
                  <div className="text-xs text-indigo-400 font-mono mt-0.5">
                    {levelTitle} (Lvl {profile?.level ?? 1}) • {profile?.xp ?? 0} XP
                  </div>
                </div>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileOpen(false)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                    isKids
                      ? "bg-amber-500/10 border-amber-400/40 text-amber-300"
                      : "bg-indigo-500/10 border-indigo-400/40 text-indigo-300"
                  }`}
                >
                  {isKids ? "🧒 Kids" : "🎓 Student"} ⇄
                </Link>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold text-slate-300 bg-slate-900 rounded-xl border border-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
