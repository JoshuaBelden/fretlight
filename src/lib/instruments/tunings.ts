import type { TuningPreset } from './types.js';

// ============================================================
// Guitar Tunings
// ============================================================

export const GUITAR_STANDARD: TuningPreset = {
	id: 'guitar-standard',
	name: 'Standard',
	instrumentId: 'guitar',
	strings: [
		{ stringNumber: 1, openNote: 'E4', startFret: 0 },
		{ stringNumber: 2, openNote: 'B3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'A2', startFret: 0 },
		{ stringNumber: 6, openNote: 'E2', startFret: 0 }
	]
};

export const GUITAR_DROP_D: TuningPreset = {
	id: 'guitar-drop-d',
	name: 'Drop D',
	instrumentId: 'guitar',
	strings: [
		{ stringNumber: 1, openNote: 'E4', startFret: 0 },
		{ stringNumber: 2, openNote: 'B3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'A2', startFret: 0 },
		{ stringNumber: 6, openNote: 'D2', startFret: 0 }
	]
};

export const GUITAR_DADGAD: TuningPreset = {
	id: 'guitar-dadgad',
	name: 'DADGAD',
	instrumentId: 'guitar',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'A3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'A2', startFret: 0 },
		{ stringNumber: 6, openNote: 'D2', startFret: 0 }
	]
};

export const GUITAR_OPEN_G: TuningPreset = {
	id: 'guitar-open-g',
	name: 'Open G',
	instrumentId: 'guitar',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'B3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'G2', startFret: 0 },
		{ stringNumber: 6, openNote: 'D2', startFret: 0 }
	]
};

export const GUITAR_OPEN_E: TuningPreset = {
	id: 'guitar-open-e',
	name: 'Open E',
	instrumentId: 'guitar',
	strings: [
		{ stringNumber: 1, openNote: 'E4', startFret: 0 },
		{ stringNumber: 2, openNote: 'B3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G#3', startFret: 0 },
		{ stringNumber: 4, openNote: 'E3', startFret: 0 },
		{ stringNumber: 5, openNote: 'B2', startFret: 0 },
		{ stringNumber: 6, openNote: 'E2', startFret: 0 }
	]
};

// ============================================================
// Banjo Tunings (strings ordered top-to-bottom visually)
// String 5 (drone G string) is shown at the top, then 1–4
// ============================================================

// Banjo string ordering: top-to-bottom visually is 1, 2, 3, 4, then 5 (drone) at the bottom.
// The 5th string is a short drone peg that starts at fret 5.

export const BANJO_OPEN_G: TuningPreset = {
	id: 'banjo-open-g',
	name: 'Open G',
	instrumentId: 'banjo',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'B3', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'G4', startFret: 5 } // short drone string at bottom
	]
};

export const BANJO_OPEN_D: TuningPreset = {
	id: 'banjo-open-d',
	name: 'Open D',
	instrumentId: 'banjo',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'A3', startFret: 0 },
		{ stringNumber: 3, openNote: 'F#3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'F#4', startFret: 5 }
	]
};

export const BANJO_DOUBLE_C: TuningPreset = {
	id: 'banjo-double-c',
	name: 'Double C',
	instrumentId: 'banjo',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'C4', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'C3', startFret: 0 },
		{ stringNumber: 5, openNote: 'G4', startFret: 5 }
	]
};

export const BANJO_SAWMILL: TuningPreset = {
	id: 'banjo-sawmill',
	name: 'Sawmill)',
	instrumentId: 'banjo',
	strings: [
		{ stringNumber: 1, openNote: 'D4', startFret: 0 },
		{ stringNumber: 2, openNote: 'C4', startFret: 0 },
		{ stringNumber: 3, openNote: 'G3', startFret: 0 },
		{ stringNumber: 4, openNote: 'D3', startFret: 0 },
		{ stringNumber: 5, openNote: 'G4', startFret: 5 }
	]
};

// ============================================================
// All tunings grouped
// ============================================================

export const GUITAR_TUNINGS: TuningPreset[] = [
	GUITAR_STANDARD,
	GUITAR_DROP_D,
	GUITAR_DADGAD,
	GUITAR_OPEN_G,
	GUITAR_OPEN_E
];

export const BANJO_TUNINGS: TuningPreset[] = [
	BANJO_OPEN_G,
	BANJO_OPEN_D,
	BANJO_DOUBLE_C,
	BANJO_SAWMILL
];

export const ALL_TUNINGS: TuningPreset[] = [...GUITAR_TUNINGS, ...BANJO_TUNINGS];

export function getTuningsForInstrument(instrumentId: string): TuningPreset[] {
	return ALL_TUNINGS.filter((t) => t.instrumentId === instrumentId);
}

export function getTuningById(id: string): TuningPreset | undefined {
	return ALL_TUNINGS.find((t) => t.id === id);
}
