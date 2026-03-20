import { Scale } from 'tonal';
import type { ScaleDefinition } from '$lib/instruments/types.js';
import { notesMatch, getPitchClass } from './notes.js';

export const SCALE_LIST: ScaleDefinition[] = [
	{ id: 'major', name: 'Major' },
	{ id: 'natural minor', name: 'Natural Minor' },
	{ id: 'harmonic minor', name: 'Harmonic Minor' },
	{ id: 'melodic minor', name: 'Melodic Minor' },
	{ id: 'major pentatonic', name: 'Major Pentatonic' },
	{ id: 'minor pentatonic', name: 'Minor Pentatonic' },
	{ id: 'blues', name: 'Blues' },
	{ id: 'dorian', name: 'Dorian' },
	{ id: 'phrygian', name: 'Phrygian' },
	{ id: 'lydian', name: 'Lydian' },
	{ id: 'mixolydian', name: 'Mixolydian' },
	{ id: 'locrian', name: 'Locrian' }
];

/**
 * Get the pitch-class notes of a scale.
 * e.g. getScaleNotes("C", "major") → ["C", "D", "E", "F", "G", "A", "B"]
 */
export function getScaleNotes(root: string, scaleName: string): string[] {
	const scale = Scale.get(`${root} ${scaleName}`);
	return scale.notes.map(getPitchClass);
}

/**
 * Check if a note is in a given scale (by chroma).
 */
export function isNoteInScale(note: string, scaleNotes: string[]): boolean {
	return scaleNotes.some((sn) => notesMatch(sn, note));
}
