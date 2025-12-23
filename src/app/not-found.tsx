"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <main
      className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center"
      style={{ color: theme.text }}
    >
      <h1 className="text-9xl font-black opacity-10 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Song Not Found</h2>
      <p className="max-w-md opacity-60 mb-10">
        The chart you are looking for might have been deleted, or the link is incorrect.
      </p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full font-bold transition-transform hover:scale-105"
        style={{ backgroundColor: theme.accent, color: theme.bg }}
      >
        Return to Library
      </Link>
    </main>
  );
}
