"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CHORD_REGEX, SECTION_REGEX } from "@/lib/music_utils";

export default function LibraryClient({ initialSongs }: { initialSongs: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return initialSongs;

    const query = searchQuery.toLowerCase();

    const scored = initialSongs.reduce((acc: any[], song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const contentMatch = song.content.toLowerCase().includes(query);

      if (titleMatch || contentMatch) {
        const score = titleMatch ? 2 : 1;
        acc.push({ ...song, searchScore: score });
      }
      return acc;
    }, []);

    return scored.sort((a, b) => {
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, initialSongs]);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-app-text">Library</h1>
          <p className="text-app-text/50 font-medium uppercase text-[10px] tracking-[0.2em]">
            {filteredSongs.length} Charts Found
          </p>
        </div>

        <div className="flex flex-1 max-w-md gap-4">
          <input
            type="text"
            placeholder="Search titles or lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-app-border bg-app-card text-app-text outline-none focus:border-app-accent transition-colors"
          />
          <Link
            href="/create"
            className="bg-app-accent text-app-bg px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform whitespace-nowrap"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  );
}

function SongCard({ song }: { song: any }) {
  const renderPreviewLine = (line: string) => {
    if (SECTION_REGEX.test(line)) {
      return <div className="text-[9px] font-bold uppercase text-app-section mb-1">{line}</div>;
    }
    return (
      <div className="min-h-[1.2rem] overflow-hidden whitespace-nowrap">
        {line.split(CHORD_REGEX).map((part, i) => (
          part.match(CHORD_REGEX)
            ? <span key={i} className="font-bold text-app-chord-bg mr-1">{part}</span>
            : <span key={i} className="opacity-40">{part}</span>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/songs/${song.id}`}>
      <div className="group p-6 rounded-2xl border border-app-border bg-app-card hover:border-app-accent transition-all h-80 flex flex-col">
        <div className="mb-4">
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-app-accent text-app-bg uppercase">
            {song.originalKey}
          </span>
          <h2 className="text-xl font-bold text-app-text group-hover:text-app-accent transition-colors truncate mt-2">
            {song.title}
          </h2>
          <p className="text-xs opacity-50">
            Added on {new Date(song.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex-1 overflow-hidden relative pointer-events-none select-none">
          <div className="font-mono text-[10px] leading-tight text-app-text scale-95 origin-top-left">
            {song.content.split("\n").slice(0, 6).map((line: string, i: number) => (
              <div key={i}>{renderPreviewLine(line)}</div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-app-card to-transparent" />
        </div>

        <div className="mt-4 pt-4 border-t border-app-border/50 text-[10px] uppercase font-bold text-app-text/30 tracking-widest">
          View Chart →
        </div>
      </div>
    </Link>
  );
}
