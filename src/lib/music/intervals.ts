import type { IntervalDefinition } from '$lib/instruments/types.js';

export const INTERVAL_LIST: IntervalDefinition[] = [
	{ id: 'm2', semitones: 1, label: 'Minor 2nd', shortLabel: 'm2' },
	{ id: 'M2', semitones: 2, label: 'Major 2nd', shortLabel: 'M2' },
	{ id: 'm3', semitones: 3, label: 'Minor 3rd', shortLabel: 'm3' },
	{ id: 'M3', semitones: 4, label: 'Major 3rd', shortLabel: 'M3' },
	{ id: 'P4', semitones: 5, label: 'Perfect 4th', shortLabel: 'P4' },
	{ id: 'TT', semitones: 6, label: 'Tritone', shortLabel: 'TT' },
	{ id: 'P5', semitones: 7, label: 'Perfect 5th', shortLabel: 'P5' },
	{ id: 'm6', semitones: 8, label: 'Minor 6th', shortLabel: 'm6' },
	{ id: 'M6', semitones: 9, label: 'Major 6th', shortLabel: 'M6' },
	{ id: 'm7', semitones: 10, label: 'Minor 7th', shortLabel: 'm7' },
	{ id: 'M7', semitones: 11, label: 'Major 7th', shortLabel: 'M7' },
	{ id: 'P8', semitones: 12, label: 'Octave', shortLabel: 'P8' }
];

export function getIntervalById(id: string): IntervalDefinition | undefined {
	return INTERVAL_LIST.find((i) => i.id === id);
}
