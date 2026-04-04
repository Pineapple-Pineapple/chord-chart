# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Run ESLint
```

No test suite is configured.

## Environment

Requires a `.env.local` with Firebase config variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Architecture

**Next.js 16 App Router** with Firebase backend (Firestore + Google Auth).

**Data flow:** Server components fetch from Firestore directly and pass data to client components. Example: `app/page.tsx` (server) fetches all songs and passes them to `LibraryClient.tsx` (client). `app/songs/[id]/page.tsx` (server) fetches a song and passes it to `SongViewClient.tsx` (client).

**Song content format:** Plain text where chords are wrapped in parentheses — e.g. `(C)`, `(Am)`, `(F#m7)`, `(G/B)`. Sections are marked with `[brackets]` on their own line. The `CHORD_REGEX` and `SECTION_REGEX` in `src/lib/music_utils.ts` are used across the app to parse this format.

**Note system:** Uses `H` instead of `B` for the note B (European convention). The `NOTES` array in `music_utils.ts` goes `..., 'A#', 'H'`. The editor/storage layer normalizes `B` → `H` on input and `H` → `B` on save.

**Theming:** CSS custom properties (`--bg`, `--card`, `--accent`, etc.) are set per-theme via `[data-theme='...']` selectors in `globals.css`. Tailwind classes like `bg-app-bg`, `text-app-text` map to these via `@theme` aliases. `ThemeContext` sets the `data-theme` attribute on `<html>` and persists to `localStorage`.

**Auth:** Google sign-in via Firebase Auth. Only the song's `authorId` can edit/delete it — this check happens client-side in `SongViewClient`.

**Song view features:** Transposition (per-song key stored in `localStorage`), show/hide chords, zoom (font size stored in `localStorage`), cell mode (sections laid out in a grid with chords above lyrics), and auto-scroll with speed control.
