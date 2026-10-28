import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

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
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col font-sans bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
