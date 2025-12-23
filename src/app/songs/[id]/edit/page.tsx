"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import SongEditor from "@/components/SongEditor";
import { SongEditorData } from "@/types";

interface SongData {
  title: string;
  content: string;
  originalKey: string;
  authorId: string;
}

export default function EditSongPage() {
  const [user, setUser] = useState<User | null>(null);
  const [song, setSong] = useState<SongData | null>(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "songs", id as string));
      if (snap.exists() && snap.data().authorId === u.uid) {
        const data = snap.data();
        setSong({
          title: data.title || "",
          content: data.content || "",
          originalKey: data.originalKey || "C",
          authorId: data.authorId || "",
        });
      } else {
        router.push("/");
      }
    });
  }, [id, router]);

  const handleUpdate = async (data: SongEditorData) => {
    await updateDoc(doc(db, "songs", id as string), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    router.push(`/songs/${id}`);
  };

  if (!song) return <div className="p-20 text-center">Loading...</div>;

  return (
    <SongEditor
      initialTitle={song.title}
      initialContent={song.content}
      initialKey={song.originalKey}
      onSave={handleUpdate}
      isUpdating
    />
  );
}
