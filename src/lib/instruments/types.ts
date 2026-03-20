// ============================================================
// Core Types for FretLight
// ============================================================

export interface StringConfig {
	/** String number (follows instrument convention, e.g. 1=high E for guitar) */
	stringNumber: number;
	/** Open string note with octave, e.g. "E4" */
	openNote: string;
	/** Fret where this string physically starts. 0 for normal strings, 5 for banjo 5th string */
	startFret: number;
}

export interface TuningPreset {
	id: string;
	name: string;
	instrumentId: string;
	/** Strings ordered top-to-bottom as displayed on the fretboard */
	strings: StringConfig[];
}

export interface InstrumentConfig {
	id: string;
	name: string;
	stringCount: number;
	fretCount: number;
	defaultTuningId: string;
	/** Frets that get a single dot inlay */
	inlayFrets: number[];
	/** Frets that get double dot inlays */
	doubleInlayFrets: number[];
}

export type DisplayMode = 'all-notes' | 'scale' | 'chord' | 'interval';

export interface FretPosition {
	/** Index of the string in the tuning.strings array (0 = topmost string) */
	stringIndex: number;
	/** String number from instrument convention */
	stringNumber: number;
	fret: number;
	/** Pitch class only, e.g. "C#" */
	note: string;
	/** Note with octave, e.g. "C#4" */
	noteWithOctave: string;
	midi: number;
	/** Whether this note is highlighted in the current display mode */
	active: boolean;
	/** Text label to display on the note circle */
	label: string;
	/** Visual role for color coding */
	role: 'root' | 'scale-tone' | 'chord-tone' | 'interval' | '';
	/** True for frets before the capo (grayed out) */
	dimmed: boolean;
}

export interface DisplaySelection {
	root: string | null;
	scale: string | null;
	chord: string | null;
	interval: string | null;
	intervalRoot: { note: string; stringIndex: number; fret: number } | null;
}

export interface IntervalDefinition {
	id: string;
	semitones: number;
	label: string;
	shortLabel: string;
}

export interface ScaleDefinition {
	id: string;
	name: string;
}

export interface ChordTypeDefinition {
	id: string;
	name: string;
	symbol: string;
}
