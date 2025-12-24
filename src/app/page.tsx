import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import LibraryClient from "./LibraryClient";
import { Song } from "@/types";

export const revalidate = 0;

export default async function LibraryPage() {
  let songs: Song[] = [];

  try {
    const q = query(collection(db, "songs"), orderBy("title", "asc"));
    const querySnapshot = await getDocs(q);

    songs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        content: data.content || "",
        originalKey: data.originalKey || "C",
        authorId: data.authorId || "",
        authorName: data.authorName || null,
        createdAt: data.createdAt?.toMillis() || null,
        updatedAt: data.updatedAt?.toMillis() || null,
      } as Song;
    });
  } catch (error) {
    console.error("Error fetching library:", error);
  }

  return <LibraryClient initialSongs={songs} />;
}
