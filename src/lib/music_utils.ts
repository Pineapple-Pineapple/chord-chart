export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];

export function transposeChord(chord: string, fromKey: string, toKey: string): string {
  const match = chord.match(/^\((?=[A-GH])([A-GH][b#]?)([^/)]*)(?:\/([A-GH][b#]?))?\)$/);
  if (!match) return chord;

  const [, root, quality, bass] = match;

  const normalize = (n: string) => {
    let normalized = n
      .replace('Bb', 'A#')
      .replace('Eb', 'D#')
      .replace('Ab', 'G#')
      .replace('Db', 'C#')
      .replace('Gb', 'F#');
    return normalized === 'B' ? 'H' : normalized;
  };

  const shift = (note: string) => {
    const noteIdx = NOTES.indexOf(normalize(note));
    const fromIdx = NOTES.indexOf(normalize(fromKey));
    const toIdx = NOTES.indexOf(normalize(toKey));
    if (noteIdx === -1 || fromIdx === -1 || toIdx === -1) return note;

    let newIdx = (noteIdx + (toIdx - fromIdx)) % 12;
    if (newIdx < 0) newIdx += 12;
    return NOTES[newIdx];
  };

  const newRoot = shift(root);
  const newBass = bass ? `/${shift(bass)}` : '';

  return `(${newRoot}${quality}${newBass})`;
}

export const CHORD_REGEX = /(\([A-GH][b#]?(?:m|maj|dim|aug)?[0-9]*(?:sus[24]?)?(?:add[0-9]+)?(?:\/[A-GH][b#]?)?\))/g;
export const SECTION_REGEX = /^(\[.*\])/;
