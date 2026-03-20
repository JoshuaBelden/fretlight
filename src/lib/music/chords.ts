import { Chord } from 'tonal';
import type { ChordTypeDefinition } from '$lib/instruments/types.js';
import { notesMatch, getPitchClass } from './notes.js';

export const CHORD_TYPE_LIST: ChordTypeDefinition[] = [
	{ id: 'major', name: 'Major', symbol: '' },
	{ id: 'minor', name: 'Minor', symbol: 'm' },
	{ id: 'dominant seventh', name: 'Dominant 7th', symbol: '7' },
	{ id: 'major seventh', name: 'Major 7th', symbol: 'maj7' },
	{ id: 'minor seventh', name: 'Minor 7th', symbol: 'm7' },
	{ id: 'diminished', name: 'Diminished', symbol: 'dim' },
	{ id: 'augmented', name: 'Augmented', symbol: 'aug' },
	{ id: 'suspended second', name: 'Sus2', symbol: 'sus2' },
	{ id: 'suspended fourth', name: 'Sus4', symbol: 'sus4' },
	{ id: 'add #9', name: 'Add9', symbol: 'add9' },
	{ id: 'half-diminished', name: 'Half-Dim', symbol: 'm7b5' }
];

/**
 * Get the pitch-class notes of a chord.
 * e.g. getChordNotes("C", "major") → ["C", "E", "G"]
 */
export function getChordNotes(root: string, chordType: string): string[] {
	const chord = Chord.get(`${root} ${chordType}`);
	return chord.notes.map(getPitchClass);
}

/**
 * Check if a note is in a given chord (by chroma).
 */
export function isNoteInChord(note: string, chordNotes: string[]): boolean {
	return chordNotes.some((cn) => notesMatch(cn, note));
}
