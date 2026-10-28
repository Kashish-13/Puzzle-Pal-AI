import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-ink flex flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-slate-600 leading-relaxed">
        The page or challenge you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
