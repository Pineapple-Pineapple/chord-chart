import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { CHORD_REGEX, SECTION_REGEX } from "@/lib/music_utils";

export default async function LibraryPage() {
  let songs: any[] = [];

  try {
    const q = query(collection(db, "songs"), orderBy("title", "asc"));
    const querySnapshot = await getDocs(q);
    songs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching library:", error);
  }

  const renderPreviewLine = (line: string) => {
    if (SECTION_REGEX.test(line)) {
      return (
        <div className="text-[14px] font-bold uppercase tracking-tighter text-app-section mb-1">
          {line}
        </div>
      );
    }
    return (
      <div className="min-h-[1.2rem] overflow-hidden whitespace-nowrap">
        {line.split(CHORD_REGEX).map((part, i) => (
          part.match(CHORD_REGEX) ? (
            <span key={i} className="text-[12px] font-bold text-app-chord-bg mr-1">
              {part}
            </span>
          ) : (
            <span key={i} className="text-[14px]">{part}</span>
          )
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-app-text">Library</h1>
          <p className="text-app-text/50 font-medium uppercase text-[10px] tracking-[0.2em]">
            {songs.length} Charts Available
          </p>
        </div>

        <Link
          href="/create"
          className="bg-app-accent text-app-bg px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
        >
          + New Song
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <Link key={song.id} href={`/songs/${song.id}`}>
            <div className="group p-6 rounded-2xl border border-app-border bg-app-card hover:border-app-accent transition-all duration-300 h-80 flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-app-accent text-app-bg uppercase">
                    {song.originalKey}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-app-text group-hover:text-app-accent transition-colors truncate">
                  {song.title}
                </h2>
                <p className="text-xs text-app-text/40 mt-1 font-mono">{song.authorName || "Unknown Artist"}</p>
              </div>

              <div className="flex-1 overflow-hidden relative pointer-events-none select-none">
                <div className="font-mono text-[10px] leading-tight text-app-text scale-95 origin-top-left">
                  {song.content.split("\n").slice(0, 8).map((line: string, i: number) => (
                    <div key={i}>{renderPreviewLine(line)}</div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-app-card via-app-card/80 to-transparent" />
              </div>

              <div className="mt-4 pt-4 border-t border-app-border/50">
                <span className="text-[10px] uppercase font-bold text-app-text/30 tracking-widest group-hover:text-app-accent transition-colors">
                  View Chart →
                </span>
              </div>
            </div>
          </Link>
        ))}

        {songs.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-app-border rounded-3xl text-app-text/30 font-bold uppercase tracking-widest text-sm">
            No songs found in the library
          </div>
        )}
      </div>
    </main>
  );
}
