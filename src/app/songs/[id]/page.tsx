import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import SongViewClient from "./SongViewClient";
import { Song } from "@/types";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();

  try {
    const docRef = doc(db, "songs", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) notFound();

    const data = docSnap.data();
    const songData: Song = {
      id: docSnap.id,
      title: data.title || "",
      content: data.content || "",
      originalKey: data.originalKey || "C",
      authorId: data.authorId || "",
      authorName: data.authorName || null,
      createdAt: data.createdAt?.toMillis() || null,
      updatedAt: data.updatedAt?.toMillis() || null,
    };

    return <SongViewClient song={songData} songId={id} />;
  } catch (error) {
    notFound();
  }
}
