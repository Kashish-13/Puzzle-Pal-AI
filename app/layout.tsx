import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "PuzzlePal AI — Think. Reason. Solve.",
  description:
    "AI-powered challenges designed to test how you think — not just what you know. Advanced reasoning for ambitious minds.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-ink antialiased selection:bg-brand-100 selection:text-brand-800">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
