export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];

export function transposeChord(chord: string, fromKey: string, toKey: string): string {
  const match = chord.match(/^\((?=[A-G|H])([A-G|H][b#]?)(.*)\)$/);
  if (!match) return chord;

  const [_, note, quality] = match;

  const normalize = (n: string) => {
    let normalized = n.replace('Bb', 'A#').replace('Eb', 'D#').replace('Ab', 'G#').replace('Db', 'C#').replace('Gb', 'F#');
    return normalized === 'H' ? 'B' : normalized;
  };

  const noteIdx = NOTES.indexOf(normalize(note));
  const fromIdx = NOTES.indexOf(normalize(fromKey));
  const toIdx = NOTES.indexOf(normalize(toKey));

  if (noteIdx === -1 || fromIdx === -1 || toIdx === -1) return chord;

  const diff = toIdx - fromIdx;
  let newIdx = (noteIdx + diff) % 12;
  if (newIdx < 0) newIdx += 12;

  const resultNote = NOTES[newIdx];

  return `(${resultNote}${quality})`;
}

export const CHORD_REGEX = /(\([A-G|H][b#]?[m]?[0-9]?\))/g;
export const SECTION_REGEX = /^(\[.*\])/;
