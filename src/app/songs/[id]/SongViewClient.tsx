"use client";

import { useState, useEffect, useRef } from "react";
import { NOTES, CHORD_REGEX, SECTION_REGEX, transposeChord } from "@/lib/music_utils";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Song } from "@/types";

interface SongViewClientProps {
  song: Song;
  songId: string;
}

export default function SongViewClient({ song, songId }: SongViewClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [targetKey, setTargetKey] = useState(song.originalKey);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem(`song-key-${songId}`);
    if (savedKey && NOTES.includes(savedKey)) {
      setTargetKey(savedKey);
    }
  }, [songId]);

  const handleKeyChange = (newKey: string) => {
    setTargetKey(newKey);
    localStorage.setItem(`song-key-${songId}`, newKey);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth - 64;
        const contentWidth = contentRef.current.scrollWidth;
        setScale(contentWidth > containerWidth ? containerWidth / contentWidth : 1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [song, targetKey]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this song?")) return;
    await deleteDoc(doc(db, "songs", songId));
    localStorage.removeItem(`song-key-${songId}`);
    router.push("/");
  };

  const renderLine = (line: string) => {
    if (SECTION_REGEX.test(line)) {
      return (
        <div className="font-mono font-bold mt-4 mb-1 uppercase text-xs tracking-widest px-2 py-1 rounded w-fit border border-app-border bg-app-bg text-app-section">
          {line}
        </div>
      );
    }

    return (
      <div className="min-h-6 font-mono whitespace-pre">
        {line.split(CHORD_REGEX).map((part, i) => (
          part.match(CHORD_REGEX) ?
            <span key={i} className="font-bold px-1.5 py-0.5 rounded mx-0.5 bg-app-chord-bg text-app-chord-text">
              {transposeChord(part, song.originalKey, targetKey).slice(1, -1)}
            </span> : part
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-10">
      <title>{song.title}</title>
      <div ref={containerRef} className="p-8 md:p-12 rounded-xl border border-app-border bg-app-card shadow-inner overflow-hidden">
        <div className="mb-8 border-b border-app-border pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1 text-app-text">{song.title}</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold font-mono text-app-accent">Original Key: {song.originalKey}</p>
              {user?.uid === song.authorId && (
                <div className="flex gap-2">
                  <Link href={`/songs/${songId}/edit`} className="text-[10px] px-3 py-1 rounded font-bold uppercase bg-app-accent text-app-bg hover:opacity-80 transition-opacity">
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="text-[10px] px-3 py-1 rounded font-bold uppercase border border-app-border text-app-text hover:bg-red-500 hover:text-white transition-all">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <select
            className="p-2 border border-app-border rounded-lg font-bold bg-transparent text-app-accent font-mono text-sm outline-none"
            value={targetKey}
            onChange={(e) => handleKeyChange(e.target.value)}
          >
            {NOTES.map(n => <option key={n} value={n} className="bg-app-card text-app-text">{n}</option>)}
          </select>
        </div>

        <div className="w-full overflow-hidden">
          <div ref={contentRef} className="leading-[2.8rem] text-lg md:text-xl origin-top-left inline-block text-app-text" style={{ transform: `scale(${scale})` }}>
            {song.content.split("\n").map((line: string, i: number) => <div key={i}>{renderLine(line)}</div>)}
          </div>
        </div>
      </div>
    </main>
  );
}
