"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getLevelTitle } from "@/lib/firestore";
import Icon from "./Icon";

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span
        className={`w-8 h-8 rounded-[10px] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${
          inverted ? "bg-white text-brand-600" : "bg-brand-600 text-white"
        }`}
      >
        <Icon name="puzzle" className="w-[18px] h-[18px]" />
      </span>
      <span className={`text-[15px] font-semibold tracking-tight ${inverted ? "text-white" : "text-ink"}`}>
        PuzzlePal <span className={inverted ? "text-white/60" : "text-brand-600"}>AI</span>
      </span>
    </span>
  );
}

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
  const displayName = profile?.fullName || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  // Differentiated navigation links tailored to cognitive journey
  const navLinks = isKids
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Puzzles", href: "/challenge" },
        { label: "Trophies", href: "/profile#trophies" },
        { label: "Profile", href: "/profile" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Challenges", href: "/challenge" },
        { label: "History", href: "/history" },
        { label: "Profile", href: "/profile" },
      ];

  const isLinkActive = (href: string) =>
    !href.includes("#") && (pathname === href || (href === "/challenge" && pathname.startsWith("/challenge")));

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Primary Navigation */}
        <div className="flex items-center gap-8">
          <Link href={user ? "/dashboard" : "/"} aria-label="PuzzlePal AI home" className="shrink-0">
            <Logo />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-slate-600 hover:text-ink hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Mode switch & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/onboarding"
                title="Switch between Kids and Student learning modes"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isKids ? "bg-sky-50 text-sky-600" : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <Icon name={isKids ? "smile" : "graduationCap"} className="w-3.5 h-3.5" />
                </span>
                {isKids ? "Kids" : "Student"}
                <Icon name="arrowLeftRight" className="w-3 h-3 text-slate-400" />
              </Link>

              <div className="flex items-center gap-1 pl-3 border-l border-slate-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </span>
                  <span className="max-w-[120px] truncate font-medium">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-ghost px-2"
                  title="Sign out"
                >
                  <Icon name="logOut" className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-sm btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <Icon name={mobileOpen ? "x" : "menu"} className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-fade-up">
          {user ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-brand-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {profile?.fullName || user.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {levelTitle} · Level {profile?.level ?? 1} · {profile?.xp ?? 0} XP
                    </div>
                  </div>
                </div>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm btn-secondary shrink-0"
                >
                  <Icon name="arrowLeftRight" className="w-3.5 h-3.5" />
                  {isKids ? "Kids" : "Student"}
                </Link>
              </div>

              <nav className="space-y-0.5 border-t border-slate-100 pt-3">
                {navLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Icon name="logOut" className="w-4 h-4 text-slate-400" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn btn-primary">
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
