"use client";

import { useState } from "react";
import { NOTES, CHORD_REGEX, SECTION_REGEX } from "@/lib/music_utils";

interface SongEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialKey?: string;
  onSave: (data: { title: string; content: string; originalKey: string }) => void;
  isUpdating?: boolean;
}

export default function SongEditor({
  initialTitle = "",
  initialContent = "",
  initialKey = "C",
  onSave,
  isUpdating
}: SongEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [originalKey, setOriginalKey] = useState(initialKey === 'B' ? 'H' : initialKey);

  const renderPreviewLine = (line: string) => {
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
            <span
              key={i}
              className="font-bold px-1.5 py-0.5 rounded mx-0.5 bg-app-chord-bg text-app-chord-text"
            >
              {part}
            </span> :
            part
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-app-text">
          {isUpdating ? "Edit Song" : "New Song"}
        </h1>

        <input
          className="w-full p-3 border border-app-border rounded-lg font-bold outline-none bg-app-card text-app-text focus:border-app-accent transition-colors"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <select
          className="w-full p-3 border border-app-border rounded-lg outline-none font-mono bg-app-card text-app-text focus:border-app-accent transition-colors"
          value={originalKey}
          onChange={e => setOriginalKey(e.target.value)}
        >
          {NOTES.map(n => (
            <option key={n} value={n} className="bg-app-card text-app-text">
              {n}
            </option>
          ))}
        </select>

        <textarea
          className="w-full h-125 p-4 border border-app-border rounded-lg font-mono text-sm outline-none bg-app-card text-app-text focus:border-app-accent transition-colors resize-none"
          placeholder="[Verse 1] (H) Lyrics..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <button
          onClick={() => onSave({ title, content, originalKey: originalKey === 'H' ? 'B' : originalKey })}
          className="w-full py-3 rounded-lg font-bold bg-app-accent text-app-bg transition-all hover:scale-[1.01] active:scale-95 shadow-lg"
        >
          {isUpdating ? "Update Song" : "Save Song"}
        </button>
      </div>

      <div className="p-8 rounded-xl border border-app-border bg-app-card overflow-y-auto max-h-200 shadow-inner">
        <h2 className="text-[10px] font-black mb-4 uppercase tracking-widest opacity-40 text-app-text">
          Live Preview
        </h2>
        <h3 className="text-3xl font-black mb-1 text-app-text">
          {title || "Untitled"}
        </h3>
        <p className="text-sm mb-6 font-bold font-mono tracking-tighter text-app-accent">
          Key: {originalKey}
        </p>

        <div className="leading-[2.8rem] text-app-text">
          {content.split("\n").map((line, i) => (
            <div key={i}>{renderPreviewLine(line)}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
