"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, UserProfile } from "./firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileLocally: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfileLocally: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    // If locally cached profile exists, load it immediately to eliminate delay/flicker
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`puzzlepal_profile_${firebaseUser.uid}`);
        if (cached) {
          setProfile(JSON.parse(cached));
        }
      } catch {}
    }

    try {
      const p = await getUserProfile(firebaseUser.uid, firebaseUser.email);
      setProfile(p);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`puzzlepal_profile_${firebaseUser.uid}`, JSON.stringify(p));
        } catch {}
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  const updateProfileLocally = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const base: UserProfile = prev || {
        uid: user?.uid || "",
        email: user?.email || "user@puzzlepal.ai",
        fullName: user?.email?.split("@")[0] || "Puzzle Solver",
        userType: "student",
        onboardingCompleted: true,
        xp: 0,
        level: 1,
        reasoningScore: 0,
        challengesSolved: 0,
        currentStreak: 0,
        currentDifficulty: "medium",
        totalHints: 0,
        badges: [],
        lastCompletedDate: null,
        aiInsight: "Ready to solve your first challenge!",
      };
      const updated = { ...base, ...updates };
      if (typeof window !== "undefined" && base.uid) {
        try {
          localStorage.setItem(`puzzlepal_profile_${base.uid}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const logout = async () => {
    if (user && typeof window !== "undefined") {
      try {
        localStorage.removeItem(`puzzlepal_profile_${user.uid}`);
      } catch {}
    }
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        updateProfileLocally,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
