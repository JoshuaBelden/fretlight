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
	role: 'root' | 'scale-tone' | 'chord-tone' | 'interval' | 'run-current' | 'run-upcoming' | 'run-note' | '';
	/** True for frets before the capo (grayed out) */
	dimmed: boolean;
}

export interface DisplaySelection {
	root: string | null;
	scale: string | null;
	chord: string | null;
	interval: string | null;
	intervalRoot: { note: string; stringIndex: number; fret: number } | null;
	/** Index of the selected chord position, null = show all chord tones */
	chordPosition: number | null;
	/** Resolved absolute frets for the selected voicing, null = no voicing filter */
	resolvedVoicing: (number | null)[] | null;
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

export interface ChordShape {
	/** Display name, e.g. "E Shape", "A Shape" */
	name: string;
	/** Per-string fret offset from baseFret; null = muted/not played.
	 *  Index matches tuning.strings[] order (0 = topmost displayed string). */
	frets: (number | null)[];
	/** Which string (tuning.strings index) holds the root note */
	rootStringIndex: number;
	/** The root note's fret offset within the shape (relative to baseFret) */
	rootFretOffset: number;
}

export interface ResolvedPosition {
	/** Index of the shape that produced this position */
	shapeIndex: number;
	/** Shape name for display */
	shapeName: string;
	/** The lowest fret offset applied to the shape */
	baseFret: number;
	/** Absolute fret per string (null = muted) */
	actualFrets: (number | null)[];
}
