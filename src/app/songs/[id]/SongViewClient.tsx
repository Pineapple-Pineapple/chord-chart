"use client";

import { useState, useEffect, useRef } from "react";
import { NOTES, CHORD_REGEX, SECTION_REGEX, transposeChord } from "@/lib/music_utils";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Song } from "@/types";

interface SongViewClientProps {
  song: Song;
  songId: string;
}

function autoColumns(fontSize: number): number {
  if (fontSize >= 1.4) return 1;
  if (fontSize >= 0.9) return 2;
  return 3;
}

function parseSections(content: string) {
  const lines = content.split("\n");
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (SECTION_REGEX.test(line)) {
      if (current) sections.push(current);
      current = { title: line, lines: [] };
    } else {
      if (!current) current = { title: "", lines: [] };
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}


export default function SongViewClient({ song, songId }: SongViewClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [targetKey, setTargetKey] = useState(song.originalKey);
  const [showChords, setShowChords] = useState(true);
  const [fontSize, setFontSize] = useState(1);
  const [cellMode, setCellMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [cellColumns, setCellColumns] = useState<number | null>(null);
  const [cellSpans, setCellSpans] = useState<Record<number, number>>({});
  const animFrameRef = useRef<number>(0);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem(`song-key-${songId}`);
    if (savedKey && NOTES.includes(savedKey)) setTargetKey(savedKey);
    const savedSize = localStorage.getItem(`song-size-${songId}`);
    if (savedSize) setFontSize(Number(savedSize));
  }, [songId]);

  const handleKeyChange = (newKey: string) => {
    setTargetKey(newKey);
    localStorage.setItem(`song-key-${songId}`, newKey);
  };

  const handleZoom = (dir: 1 | -1) => {
    setFontSize((prev) => {
      const next = Math.round((prev + dir * 0.1) * 10) / 10;
      const clamped = Math.max(0.6, Math.min(2.0, next));
      localStorage.setItem(`song-size-${songId}`, String(clamped));
      return clamped;
    });
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "songs", songId, "cellLayouts", user.uid))
      .then(snap => { if (snap.exists()) setCellSpans(snap.data().layouts ?? {}); })
      .catch(() => {});
  }, [user, songId]);

  useEffect(() => {
    if (!autoScroll) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime: number | null = null;
    const pixelsPerSecond = scrollSpeed * 20;

    const step = (time: number) => {
      if (lastTime !== null) {
        const delta = (time - lastTime) / 1000;
        window.scrollBy(0, pixelsPerSecond * delta);
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
          setAutoScroll(false);
          return;
        }
      }
      lastTime = time;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [autoScroll, scrollSpeed]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this song?")) return;
    await deleteDoc(doc(db, "songs", songId));
    localStorage.removeItem(`song-key-${songId}`);
    localStorage.removeItem(`song-size-${songId}`);
    router.push("/");
  };

  const saveCellLayout = async (spans: Record<number, number>) => {
    const u = userRef.current;
    if (!u) return;
    await setDoc(doc(db, "songs", songId, "cellLayouts", u.uid), {
      layouts: spans,
      updatedAt: serverTimestamp(),
    });
  };

  const handleResizeStart = (e: React.PointerEvent, si: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const originalSpan = cellSpans[si] ?? 1;
    let latestSpan = originalSpan;

    const onMove = (me: PointerEvent) => {
      const delta = me.clientX - startX;
      const newSpan = Math.max(1, Math.min(activeColumns, originalSpan + Math.round(delta / 80)));
      if (newSpan !== latestSpan) {
        latestSpan = newSpan;
        setCellSpans(prev => ({ ...prev, [si]: newSpan }));
      }
    };

    const onEnd = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      setCellSpans(prev => {
        const next = { ...prev, [si]: latestSpan };
        saveCellLayout(next);
        return next;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
  };

  const renderLine = (line: string) => {
    if (SECTION_REGEX.test(line)) {
      return (
        <div className="font-mono font-bold mt-4 mb-1 uppercase text-xs tracking-widest px-2 py-1 rounded w-fit border border-app-border bg-app-bg text-app-section">
          {line}
        </div>
      );
    }

    const hasLyrics = line.replace(CHORD_REGEX, "").trim().length > 0;
    if (!showChords && !hasLyrics) return null;

    return (
      <div className="min-h-6 font-mono whitespace-pre leading-8">
        {line.split(CHORD_REGEX).map((part, i) => {
          if (part.match(CHORD_REGEX)) {
            return showChords ? (
              <span key={i} className="font-bold px-1.5 rounded bg-app-chord-bg text-app-chord-text">
                {transposeChord(part, song.originalKey, targetKey).slice(1, -1)}
              </span>
            ) : null;
          }
          return part;
        })}
      </div>
    );
  };


  const sections = parseSections(song.content);
  const nonEmptySections = sections.filter(
    (s) => s.title || s.lines.some((l) => l.trim())
  );
  const activeColumns = cellColumns ?? autoColumns(fontSize);

  return (
    <>
      {/* Sticky controls bar */}
      <div className="print:hidden sticky top-0 z-40 border-b border-app-border bg-app-sidebar/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex flex-wrap items-center gap-2">
          {/* Key selector */}
          <select
            suppressHydrationWarning
            className="h-10 px-2 border border-app-border rounded-lg font-bold bg-transparent text-app-accent font-mono text-xs outline-none cursor-pointer"
            value={targetKey}
            onChange={(e) => handleKeyChange(e.target.value)}
          >
            {NOTES.map((n) => (
              <option key={n} value={n} className="bg-app-card text-app-text">
                {n}
              </option>
            ))}
          </select>

          <div className="w-px h-5 bg-app-border" />

          {/* Show/Hide Chords */}
          <button
            onClick={() => setShowChords(!showChords)}
            className={`h-10 px-3 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
              !showChords
                ? "bg-app-accent text-app-bg"
                : "border border-app-border text-app-text hover:bg-app-accent/10"
            }`}
          >
            {showChords ? "Hide Chords" : "Show Chords"}
          </button>

          <div className="w-px h-5 bg-app-border" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoom(-1)}
              className="w-10 h-10 rounded-lg border border-app-border text-app-text hover:bg-app-accent/10 font-bold text-base cursor-pointer flex items-center justify-center"
            >
              −
            </button>
            <span suppressHydrationWarning className="text-xs font-mono text-app-text w-10 text-center select-none">
              {Math.round(fontSize * 100)}%
            </span>
            <button
              onClick={() => handleZoom(1)}
              className="w-10 h-10 rounded-lg border border-app-border text-app-text hover:bg-app-accent/10 font-bold text-base cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div className="w-px h-5 bg-app-border" />

          {/* Cell mode */}
          <button
            onClick={() => setCellMode(!cellMode)}
            className={`h-10 px-3 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
              cellMode
                ? "bg-app-accent text-app-bg"
                : "border border-app-border text-app-text hover:bg-app-accent/10"
            }`}
          >
            Cells
          </button>

          {cellMode && (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => {
                const isAutoActive = cellColumns === null && autoColumns(fontSize) === n;
                const isManualActive = cellColumns === n;
                return (
                  <button
                    key={n}
                    onClick={() => setCellColumns(cellColumns === n ? null : n)}
                    title={isAutoActive ? `${n} col (auto)` : `${n} col`}
                    className={`w-10 h-10 rounded-lg font-bold font-mono text-xs cursor-pointer transition-all ${
                      isManualActive
                        ? "bg-app-accent text-app-bg"
                        : isAutoActive
                        ? "border-2 border-app-accent text-app-accent bg-app-accent/10"
                        : "border border-app-border text-app-text hover:bg-app-accent/10"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          )}

          <div className="w-px h-5 bg-app-border" />

          {/* Auto scroll */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`h-10 px-3 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
                autoScroll
                  ? "bg-app-accent text-app-bg"
                  : "border border-app-border text-app-text hover:bg-app-accent/10"
              }`}
            >
              {autoScroll ? "⏸" : "▶"} Scroll
            </button>
            <button
              onClick={() => setScrollSpeed(s => Math.max(0.25, s - 0.25))}
              className="w-10 h-10 rounded-lg border border-app-border text-app-text hover:bg-app-accent/10 font-bold text-base cursor-pointer flex items-center justify-center"
            >
              −
            </button>
            <span className="text-xs font-mono text-app-text w-10 text-center select-none">{scrollSpeed}</span>
            <button
              onClick={() => setScrollSpeed(s => Math.min(10, s + 0.25))}
              className="w-10 h-10 rounded-lg border border-app-border text-app-text hover:bg-app-accent/10 font-bold text-base cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Song header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black mb-1 text-app-text">{song.title}</h1>
            <p className="text-xs opacity-50">
              Key of <span className="font-bold font-mono">{song.originalKey}</span>
              {song.updatedAt && (
                <> · Updated {new Date(song.updatedAt).toLocaleDateString('en-US')}</>
              )}
            </p>
          </div>
          {user?.uid === song.authorId && (
            <div className="print:hidden flex gap-2 shrink-0">
              <Link
                href={`/songs/${songId}/edit`}
                className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase bg-app-accent text-app-bg hover:opacity-80 transition-opacity"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase border border-app-border text-app-text hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Song content */}
        {cellMode ? (
          <div
            className="cell-grid grid gap-4"
            style={{
              fontSize: `${fontSize}rem`,
              gridTemplateColumns: `repeat(${activeColumns}, minmax(0, 1fr))`,
            }}
          >
            {nonEmptySections.map((section, si) => (
              <div
                key={si}
                className="cell-card relative p-4 rounded-xl border border-app-border bg-app-card"
                style={{ gridColumn: `span ${Math.min(cellSpans[si] ?? 1, activeColumns)}` }}
              >
                {section.title && (
                  <div className="font-mono font-bold mb-3 uppercase text-xs tracking-widest px-2 py-1 rounded w-fit border border-app-border bg-app-bg text-app-section">
                    {section.title}
                  </div>
                )}
                <div className="text-app-text overflow-x-auto">
                  {section.lines.map((line, li) => (
                    <div key={li}>{renderLine(line)}</div>
                  ))}
                </div>
                <div
                  className="print:hidden absolute right-0 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center opacity-20 hover:opacity-70 active:opacity-100 transition-opacity select-none touch-none"
                  onPointerDown={(e) => handleResizeStart(e, si)}
                >
                  <div className="h-8 w-0.5 rounded-full bg-app-text" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-6 md:p-10 rounded-xl border border-app-border bg-app-card overflow-x-auto"
            style={{ fontSize: `${fontSize}rem` }}
          >
            <div className="text-app-text">
              {song.content.split("\n").map((line: string, i: number) => (
                <div key={i}>{renderLine(line)}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
