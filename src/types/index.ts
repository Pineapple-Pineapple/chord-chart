export interface Song {
  id: string;
  title: string;
  content: string;
  originalKey: string;
  authorId: string;
  authorName: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface SongWithScore extends Song {
  searchScore?: number;
}

export interface SongEditorData {
  title: string;
  content: string;
  originalKey: string;
}

export interface SongEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialKey?: string;
  onSave: (data: SongEditorData) => void;
  isUpdating?: boolean;
}

export interface ThemeContextType {
  currentTheme: string;
  setTheme: (name: string) => void;
}
