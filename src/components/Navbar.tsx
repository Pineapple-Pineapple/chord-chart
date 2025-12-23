"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { THEME_NAMES } from "@/lib/themes";

export default function Navbar() {
  const { currentTheme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <nav className="sticky top-0 z-50 p-4 border-b border-app-border bg-app-sidebar transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3 sm:gap-8 flex-1 min-w-0">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tighter shrink-0 text-app-accent hover:opacity-80 transition-opacity"
          >
            PINECHORD
          </Link>

          <select
            className="text-[10px] sm:text-xs p-1.5 rounded-md border border-app-border bg-app-card text-app-text cursor-pointer outline-none shrink-0"
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {THEME_NAMES.map((tName) => (
              <option
                key={tName}
                value={tName}
                className="bg-app-card text-app-text"
              >
                {tName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden xs:inline text-[10px] font-bold opacity-50 uppercase tracking-widest text-app-text">
                {user.displayName?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="text-[10px] sm:text-xs font-bold uppercase text-app-text opacity-70 hover:opacity-100 hover:text-red-500 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
              className="text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full border border-app-accent text-app-accent hover:bg-app-accent hover:text-app-bg transition-all uppercase"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
