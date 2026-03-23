import type { TuningPreset, FretPosition } from '$lib/instruments/types.js';
import { buildFretboardNotes } from './fretboard.js';
import { getScaleNotes, isNoteInScale } from './scales.js';
import { notesMatch } from './notes.js';

/**
 * Simple seeded PRNG (mulberry32) for reproducible randomness.
 * Returns a function that produces numbers in [0, 1).
 */
function seededRandom(seed: number): () => number {
	let t = seed | 0;
	return () => {
		t = (t + 0x6d2b79f5) | 0;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Complexity level configuration.
 * Controls the forward/back step ranges and back-skip probability.
 */
interface ComplexityConfig {
	forwardMin: number;
	forwardMax: number;
	backMin: number;
	backMax: number;
	backSkipChance: number; // 0-1, chance of skipping extra notes on back step
}

const COMPLEXITY_CONFIGS: Record<number, ComplexityConfig> = {
	1: { forwardMin: 0, forwardMax: 0, backMin: 0, backMax: 0, backSkipChance: 0 },
	2: { forwardMin: 3, forwardMax: 4, backMin: 1, backMax: 1, backSkipChance: 0 },
	3: { forwardMin: 2, forwardMax: 4, backMin: 1, backMax: 2, backSkipChance: 0.1 },
	4: { forwardMin: 2, forwardMax: 5, backMin: 1, backMax: 3, backSkipChance: 0.25 },
	5: { forwardMin: 2, forwardMax: 5, backMin: 2, backMax: 3, backSkipChance: 0.4 }
};

function randInt(rng: () => number, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Select one position per MIDI pitch, preferring positions within the current fret window.
 * Shifts the window at root note boundaries to move down the neck.
 */
function selectPositions(
	scalePositions: FretPosition[],
	root: string,
	startFret: number
): FretPosition[] {
	// Group by MIDI value
	const byMidi = new Map<number, FretPosition[]>();
	for (const pos of scalePositions) {
		const group = byMidi.get(pos.midi) ?? [];
		group.push(pos);
		byMidi.set(pos.midi, group);
	}

	const sortedMidi = Array.from(byMidi.keys()).sort((a, b) => a - b);
	const result: FretPosition[] = [];
	let windowCenter = startFret; // start at the root note's fret

	for (const midi of sortedMidi) {
		const candidates = byMidi.get(midi)!;

		// Pick the candidate closest to the window center,
		// breaking ties by preferring the lowest string (highest stringIndex)
		let best = candidates[0];
		let bestDist = Math.abs(best.fret - windowCenter);
		for (let i = 1; i < candidates.length; i++) {
			const dist = Math.abs(candidates[i].fret - windowCenter);
			if (dist < bestDist || (dist === bestDist && candidates[i].stringIndex > best.stringIndex)) {
				best = candidates[i];
				bestDist = dist;
			}
		}

		result.push(best);

		// At root note boundaries, shift window toward the chosen position
		if (notesMatch(best.note, root)) {
			windowCenter = best.fret + 2;
		}
	}

	return result;
}

/**
 * Apply the back-and-forth pattern to a linear sequence of notes.
 * Complexity 1 returns the sequence unchanged.
 */
function applyPattern(
	linear: FretPosition[],
	complexity: number,
	rng: () => number
): FretPosition[] {
	const config = COMPLEXITY_CONFIGS[complexity] ?? COMPLEXITY_CONFIGS[3];

	// Complexity 1: straight run
	if (complexity === 1) {
		return [...linear];
	}

	const result: FretPosition[] = [];
	let cursor = 0;

	while (cursor < linear.length) {
		// Forward step
		const forwardCount = Math.min(
			randInt(rng, config.forwardMin, config.forwardMax),
			linear.length - cursor
		);

		for (let i = 0; i < forwardCount; i++) {
			result.push(linear[cursor + i]);
		}
		cursor += forwardCount;

		if (cursor >= linear.length) break;

		// Back step
		let backCount = randInt(rng, config.backMin, config.backMax);

		// Back-skip: jump further back occasionally
		if (rng() < config.backSkipChance) {
			backCount = Math.min(backCount + randInt(rng, 1, 2), cursor);
		}

		// Start back from cursor - 2 to avoid repeating the last forward note
		const backFrom = cursor - 2;
		if (backFrom < 0) continue;
		backCount = Math.min(backCount, backFrom + 1);

		for (let i = 0; i < backCount; i++) {
			result.push(linear[backFrom - i]);
		}
	}

	return result;
}

/**
 * Generate a scale run sequence for practice.
 *
 * @param tuning - Current tuning preset
 * @param fretCount - Number of frets on the instrument
 * @param capoFret - Current capo position (0 = no capo)
 * @param root - Root note pitch class (e.g. "C")
 * @param scaleName - Scale name (e.g. "major")
 * @param complexity - 1-5 controlling back-and-forth density
 * @param variant - Seed for randomized pattern (different values = different runs)
 * @returns Complete run sequence (ascending + descending)
 */
export function generateScaleRun(
	tuning: TuningPreset,
	fretCount: number,
	capoFret: number,
	root: string,
	scaleName: string,
	complexity: number = 3,
	variant: number = 0
): FretPosition[] {
	const rng = seededRandom(variant * 7919 + complexity * 31);
	const allPositions = buildFretboardNotes(tuning, fretCount, capoFret);
	const scaleNotes = getScaleNotes(root, scaleName);

	// Collect all scale positions across the fretboard
	const scalePositions: FretPosition[] = [];
	for (const stringPositions of allPositions) {
		for (const pos of stringPositions) {
			if (pos && isNoteInScale(pos.note, scaleNotes) && !pos.dimmed) {
				scalePositions.push(pos);
			}
		}
	}

	if (scalePositions.length === 0) return [];

	// Find the lowest root note within frets 0-5 (scanning from lowest-pitched string)
	// Strings are ordered top-to-bottom in display (stringIndex 0 = high E, 5 = low E)
	// So we scan from the highest stringIndex (lowest pitch) first
	let startMidi = Infinity;
	let startFret = 0;
	for (let si = allPositions.length - 1; si >= 0; si--) {
		for (let fret = 0; fret <= 5; fret++) {
			const pos = allPositions[si][fret];
			if (pos && notesMatch(pos.note, root) && isNoteInScale(pos.note, scaleNotes)) {
				if (pos.midi < startMidi) {
					startMidi = pos.midi;
					startFret = pos.fret;
				}
			}
		}
		if (startMidi < Infinity) break; // found on the lowest string, stop
	}

	// Find the highest root note on string 0 (high E) as the upper bound
	let endMidi = -Infinity;
	for (const pos of allPositions[0]) {
		if (pos && notesMatch(pos.note, root) && pos.midi > endMidi) {
			endMidi = pos.midi;
		}
	}

	if (startMidi === Infinity || endMidi === -Infinity) return [];

	// Filter to positions within the MIDI range
	const inRange = scalePositions.filter((p) => p.midi >= startMidi && p.midi <= endMidi);
	inRange.sort((a, b) => a.midi - b.midi);

	if (inRange.length === 0) return [];

	// Select one position per pitch, staying within a moving fret window
	let linear = selectPositions(inRange, root, startFret);

	// Truncate at the first root note on string 0 (high E) — don't continue past it
	const firstRootOnHighE = linear.findIndex(
		(p) => p.stringIndex === 0 && notesMatch(p.note, root)
	);
	if (firstRootOnHighE >= 0) {
		linear = linear.slice(0, firstRootOnHighE + 1);
	}

	if (linear.length === 0) return [];

	// Apply the back-and-forth pattern
	const ascending = applyPattern(linear, complexity, rng);

	// Create descending by reversing the ascending run
	const descending = [...ascending].reverse().slice(1); // skip duplicate of the peak note

	const full = [...ascending, ...descending];

	// Remove consecutive duplicates (same string + fret)
	return full.filter(
		(pos, i) =>
			i === 0 ||
			pos.stringIndex !== full[i - 1].stringIndex ||
			pos.fret !== full[i - 1].fret
	);
}
