"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center text-app-text">
      <h1 className="text-9xl font-black opacity-10 mb-4 select-none">
        404
      </h1>
      <h2 className="text-3xl font-bold mb-6">
        Song Not Found
      </h2>
      <p className="max-w-md opacity-60 mb-10">
        The chart you are looking for might have been deleted, or the link is incorrect.
      </p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 bg-app-accent text-app-bg shadow-lg shadow-app-accent/20"
      >
        Return to Library
      </Link>
    </main>
  );
}
