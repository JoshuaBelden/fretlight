import type { ChordShape, ResolvedPosition, TuningPreset } from '$lib/instruments/types.js';
import { getNoteChroma } from './notes.js';

// ============================================================
// Chord Shape Definitions
// ============================================================
// String index follows tuning.strings[] order:
//   0 = high E (string 1), 5 = low E (string 6) for standard guitar
// frets[] values are offsets from baseFret; null = muted/not played
// rootStringIndex = which string holds the root
// rootFretOffset = root's fret offset within the shape

// --- Major ---
const MAJOR_SHAPES: ChordShape[] = [
	{
		name: 'E Shape',
		frets: [0, 0, 1, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A Shape',
		frets: [0, 2, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	},
	{
		name: 'D Shape',
		frets: [2, 3, 2, 0, null, null],
		rootStringIndex: 3,
		rootFretOffset: 0
	},
	{
		name: 'C Shape',
		frets: [0, 1, 0, 2, 3, null],
		rootStringIndex: 4,
		rootFretOffset: 3
	},
	{
		name: 'G Shape',
		frets: [3, 0, 0, 0, 2, 3],
		rootStringIndex: 5,
		rootFretOffset: 3
	}
];

// --- Minor ---
const MINOR_SHAPES: ChordShape[] = [
	{
		name: 'Em Shape',
		frets: [0, 0, 0, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'Am Shape',
		frets: [0, 1, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	},
	{
		name: 'Dm Shape',
		frets: [1, 3, 2, 0, null, null],
		rootStringIndex: 3,
		rootFretOffset: 0
	}
];

// --- Dominant 7th ---
const DOM7_SHAPES: ChordShape[] = [
	{
		name: 'E7 Shape',
		frets: [0, 0, 1, 0, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A7 Shape',
		frets: [0, 2, 0, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Major 7th ---
const MAJ7_SHAPES: ChordShape[] = [
	{
		name: 'E Maj7 Shape',
		frets: [0, 0, 1, 1, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A Maj7 Shape',
		frets: [0, 1, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Minor 7th ---
const MIN7_SHAPES: ChordShape[] = [
	{
		name: 'Em7 Shape',
		frets: [0, 0, 0, 0, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'Am7 Shape',
		frets: [0, 1, 0, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Diminished ---
const DIM_SHAPES: ChordShape[] = [
	{
		name: 'Dim Shape (6th str)',
		frets: [null, 1, 0, 1, 2, null],
		rootStringIndex: 4,
		rootFretOffset: 2
	},
	{
		name: 'Dim Shape (5th str)',
		frets: [1, 0, 1, 2, null, null],
		rootStringIndex: 3,
		rootFretOffset: 2
	}
];

// --- Augmented ---
const AUG_SHAPES: ChordShape[] = [
	{
		name: 'E Aug Shape',
		frets: [0, 1, 1, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A Aug Shape',
		frets: [0, 2, 2, 3, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Suspended 2nd ---
const SUS2_SHAPES: ChordShape[] = [
	{
		name: 'E Sus2 Shape',
		frets: [0, 0, 2, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A Sus2 Shape',
		frets: [0, 0, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Suspended 4th ---
const SUS4_SHAPES: ChordShape[] = [
	{
		name: 'E Sus4 Shape',
		frets: [0, 0, 2, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'A Sus4 Shape',
		frets: [0, 3, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Add 9 ---
const ADD9_SHAPES: ChordShape[] = [
	{
		name: 'Add9 Shape (6th str)',
		frets: [0, 0, 1, 2, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'Add9 Shape (5th str)',
		frets: [0, 3, 2, 2, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// --- Half-Diminished (m7b5) ---
const HALF_DIM_SHAPES: ChordShape[] = [
	{
		name: 'm7b5 Shape (6th str)',
		frets: [null, 0, 0, 1, 2, 0],
		rootStringIndex: 5,
		rootFretOffset: 0
	},
	{
		name: 'm7b5 Shape (5th str)',
		frets: [null, 1, 0, 1, 0, null],
		rootStringIndex: 4,
		rootFretOffset: 0
	}
];

// ============================================================
// Shape Lookup
// ============================================================

const SHAPE_MAP: Record<string, ChordShape[]> = {
	major: MAJOR_SHAPES,
	minor: MINOR_SHAPES,
	'dominant seventh': DOM7_SHAPES,
	'major seventh': MAJ7_SHAPES,
	'minor seventh': MIN7_SHAPES,
	diminished: DIM_SHAPES,
	augmented: AUG_SHAPES,
	'suspended second': SUS2_SHAPES,
	'suspended fourth': SUS4_SHAPES,
	'add #9': ADD9_SHAPES,
	'half-diminished': HALF_DIM_SHAPES
};

/**
 * Get the defined chord shapes for a given chord quality.
 * Returns an empty array for unrecognized qualities or non-guitar instruments.
 */
export function getChordShapes(chordQuality: string): ChordShape[] {
	return SHAPE_MAP[chordQuality] ?? [];
}

// ============================================================
// Position Resolution
// ============================================================

/**
 * Find all frets on a given string where a root note appears.
 */
function findRootFretsOnString(
	root: string,
	stringIndex: number,
	tuning: TuningPreset,
	fretCount: number
): number[] {
	const rootChroma = getNoteChroma(root);
	const stringConfig = tuning.strings[stringIndex];
	if (!stringConfig) return [];

	const openChroma = getNoteChroma(stringConfig.openNote);
	const frets: number[] = [];

	for (let fret = stringConfig.startFret; fret <= fretCount; fret++) {
		const semitones = fret - stringConfig.startFret;
		const chroma = (openChroma + semitones) % 12;
		if (chroma === rootChroma) {
			frets.push(fret);
		}
	}

	return frets;
}

/**
 * Resolve all valid chord positions for a given root note and chord quality.
 * Transposes each shape to every position where the root lands on the shape's root string.
 */
export function resolveChordPositions(
	root: string,
	chordQuality: string,
	tuning: TuningPreset,
	fretCount: number
): ResolvedPosition[] {
	const shapes = getChordShapes(chordQuality);
	if (shapes.length === 0) return [];

	const positions: ResolvedPosition[] = [];

	shapes.forEach((shape, shapeIndex) => {
		const rootFrets = findRootFretsOnString(root, shape.rootStringIndex, tuning, fretCount);

		for (const rootFret of rootFrets) {
			const baseFret = rootFret - shape.rootFretOffset;

			// Compute absolute frets for each string
			const actualFrets = shape.frets.map((offset) => {
				if (offset === null) return null;
				return offset + baseFret;
			});

			// Validate: all non-null frets must be >= 0 and <= fretCount
			const valid = actualFrets.every((f) => f === null || (f >= 0 && f <= fretCount));
			if (!valid) continue;

			positions.push({
				shapeIndex,
				shapeName: shape.name,
				baseFret,
				actualFrets
			});
		}
	});

	// Sort by baseFret ascending, then by shapeIndex
	positions.sort((a, b) => a.baseFret - b.baseFret || a.shapeIndex - b.shapeIndex);

	return positions;
}
