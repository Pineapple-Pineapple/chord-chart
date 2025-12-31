import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import SongViewClient from "./SongViewClient";
import { Song } from "@/types";
import { cache } from "react";
import { Metadata } from "next";

const getSong = cache(async (id: string): Promise<Song | null> => {
  const docRef = doc(db, "songs", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  return {
    id: docSnap.id,
    title: data.title || "",
    content: data.content || "",
    originalKey: data.originalKey || "C",
    authorId: data.authorId || "",
    authorName: data.authorName || null,
    createdAt: data.createdAt?.toMillis() || null,
    updatedAt: data.updatedAt?.toMillis() || null,
  };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const song = await getSong(id);

  if (!song) {
    return { title: "Song not found" };
  }

  return {
    title: song.title || "Untitled Song",
    description: `Original in key of ${song.originalKey}`
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const song = await getSong(id);

  if (!song) notFound();

  return <SongViewClient song={song} songId={song.id} />;
}

