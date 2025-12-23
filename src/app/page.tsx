import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import LibraryClient from "./LibraryClient";

export const revalidate = 30;

export default async function LibraryPage() {
  let songs: any[] = [];

  try {
    const q = query(collection(db, "songs"), orderBy("title", "asc"));
    const querySnapshot = await getDocs(q);

    songs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || null,
        updatedAt: data.updatedAt?.toMillis() || null,
      };
    });
  } catch (error) {
    console.error("Error fetching library:", error);
  }

  return <LibraryClient initialSongs={songs} />;
}
