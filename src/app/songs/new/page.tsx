"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SongEditor from "@/components/SongEditor";
import { SongEditorData } from "@/types";

export default function NewSongPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/");
      else setUser(u);
    });
  }, [router]);

  const handleSave = async (data: SongEditorData) => {
    if (!user) return;
    await addDoc(collection(db, "songs"), {
      ...data,
      authorId: user.uid,
      authorName: user.displayName,
      createdAt: serverTimestamp(),
    });
    router.push("/");
  };

  if (!user) return null;
  return <SongEditor onSave={handleSave} />;
}
