import { Note, Interval } from 'tonal';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Get the note (with octave) at a given fret on a string with the given open note.
 * e.g. getNoteAtFret("E2", 5) → "A2"
 */
export function getNoteAtFret(openNote: string, fret: number): string {
	if (fret === 0) return openNote;
	const interval = Interval.fromSemitones(fret);
	const result = Note.transpose(openNote, interval);
	return result || openNote;
}

/**
 * Get just the pitch class (no octave) from a note string.
 * e.g. getPitchClass("C#4") → "C#"
 */
export function getPitchClass(noteWithOctave: string): string {
	const n = Note.get(noteWithOctave);
	return n.pc || noteWithOctave;
}

/**
 * Get the chroma number (0–11) of a note. C=0, C#=1, ... B=11.
 */
export function getNoteChroma(note: string): number {
	return Note.get(note).chroma ?? 0;
}

/**
 * Convert MIDI number to note name with octave.
 * e.g. midiToNote(69) → "A4"
 */
export function midiToNote(midi: number): string {
	return Note.fromMidi(midi) ?? 'A4';
}

/**
 * Compare notes enharmonically (ignores octave).
 * e.g. notesMatch("C#", "Db") → true
 */
export function notesMatch(a: string, b: string): boolean {
	return getNoteChroma(a) === getNoteChroma(b);
}

/**
 * Normalize a note name to its sharp equivalent for consistent display.
 * e.g. "Db" → "C#"
 */
export function toSharp(note: string): string {
	const chroma = getNoteChroma(note);
	return NOTE_NAMES[chroma];
}

/**
 * Convert a frequency (Hz) to the nearest note name and cents deviation.
 */
export function frequencyToNote(freq: number): { note: string; octave: number; cents: number; midi: number } {
	const midi = 12 * Math.log2(freq / 440) + 69;
	const midiRounded = Math.round(midi);
	const cents = Math.round((midi - midiRounded) * 100);
	const noteName = Note.fromMidi(midiRounded) ?? 'A4';
	const n = Note.get(noteName);
	return {
		note: n.pc ?? 'A',
		octave: n.oct ?? 4,
		cents,
		midi: midiRounded
	};
}
