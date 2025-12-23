import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import SongViewClient from "./SongViewClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();

  try {
    const docRef = doc(db, "songs", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) notFound();

    const data = docSnap.data();
    const songData = {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toMillis() || null,
      updatedAt: data.updatedAt?.toMillis() || null,
    };

    return <SongViewClient song={songData} songId={id} />;
  } catch (error) {
    notFound();
  }
}
