import { Note, Interval } from 'tonal';
import type {
	TuningPreset,
	FretPosition,
	DisplayMode,
	DisplaySelection
} from '$lib/instruments/types.js';
import { getNoteAtFret, getPitchClass, getNoteChroma, notesMatch } from './notes.js';
import { getScaleNotes, isNoteInScale } from './scales.js';
import { getChordNotes, isNoteInChord } from './chords.js';
import { getIntervalById } from './intervals.js';

/**
 * Build the complete 2D array of fret positions for a given tuning.
 * Returns [stringIndex][fret] where null means the fret doesn't exist (banjo 5th string).
 *
 * @param tuning - The current tuning preset
 * @param fretCount - Total number of frets on the instrument
 * @param capoFret - Current capo position (0 = no capo)
 */
export function buildFretboardNotes(
	tuning: TuningPreset,
	fretCount: number,
	capoFret: number
): Array<Array<FretPosition | null>> {
	return tuning.strings.map((stringConfig, stringIndex) => {
		const positions: Array<FretPosition | null> = [];

		for (let fret = 0; fret <= fretCount; fret++) {
			// Banjo 5th string — skip frets before its startFret
			if (fret < stringConfig.startFret) {
				positions.push(null);
				continue;
			}

			// Use fret offset relative to where the string starts (banjo 5th string: starts at fret 5)
		const noteWithOctave = getNoteAtFret(stringConfig.openNote, fret - stringConfig.startFret);
			const n = Note.get(noteWithOctave);
			const notePc = n.pc ?? getPitchClass(noteWithOctave);
			const midi = n.midi ?? 0;

			positions.push({
				stringIndex,
				stringNumber: stringConfig.stringNumber,
				fret,
				note: notePc,
				noteWithOctave,
				midi,
				active: false,
				label: notePc,
				role: '',
				dimmed: fret > 0 && fret < capoFret
			});
		}

		return positions;
	});
}

/**
 * Apply the current display mode to mark which positions are active,
 * set their labels and roles.
 */
export function getActivePositions(
	positions: Array<Array<FretPosition | null>>,
	mode: DisplayMode,
	selection: DisplaySelection
): Array<Array<FretPosition | null>> {
	return positions.map((stringPositions) =>
		stringPositions.map((pos) => {
			if (pos === null) return null;

			switch (mode) {
				case 'all-notes':
					return { ...pos, active: true, label: pos.note, role: 'scale-tone' };

				case 'scale': {
					if (!selection.root || !selection.scale) {
						return { ...pos, active: false, label: '', role: '' };
					}
					const scaleNotes = getScaleNotes(selection.root, selection.scale);
					const inScale = isNoteInScale(pos.note, scaleNotes);
					const isRoot = notesMatch(pos.note, selection.root);
					return {
						...pos,
						active: inScale,
						label: inScale ? pos.note : '',
						role: isRoot ? 'root' : inScale ? 'scale-tone' : ''
					};
				}

				case 'chord': {
					if (!selection.root || !selection.chord) {
						return { ...pos, active: false, label: '', role: '' };
					}

					// If a specific voicing is selected, only show those exact string/fret positions
					if (selection.resolvedVoicing) {
						const voicingFret = selection.resolvedVoicing[pos.stringIndex];
						if (voicingFret === null || voicingFret === undefined) {
							return { ...pos, active: false, label: '', role: '' };
						}
						const isMatch = pos.fret === voicingFret;
						const isRoot = notesMatch(pos.note, selection.root);
						return {
							...pos,
							active: isMatch,
							label: isMatch ? pos.note : '',
							role: isRoot ? 'root' : isMatch ? 'chord-tone' : ''
						};
					}

					// Default: highlight all chord tones across the neck
					const chordNotes = getChordNotes(selection.root, selection.chord);
					const inChord = isNoteInChord(pos.note, chordNotes);
					const isRoot = notesMatch(pos.note, selection.root);
					return {
						...pos,
						active: inChord,
						label: inChord ? pos.note : '',
						role: isRoot ? 'root' : inChord ? 'chord-tone' : ''
					};
				}

				case 'interval': {
					const { intervalRoot, interval } = selection;
					if (!intervalRoot || !interval) {
						return { ...pos, active: false, label: '', role: '' };
					}

					const intervalDef = getIntervalById(interval);
					if (!intervalDef) return { ...pos, active: false, label: '', role: '' };

					// Check if this is the root position
					const isRootPos =
						pos.stringIndex === intervalRoot.stringIndex && pos.fret === intervalRoot.fret;

					// Calculate target note chroma from root
					const rootChroma = getNoteChroma(intervalRoot.note);
					const targetChroma = (rootChroma + intervalDef.semitones) % 12;
					const isTargetNote = getNoteChroma(pos.note) === targetChroma;
					const isRootNote = notesMatch(pos.note, intervalRoot.note);

					return {
						...pos,
						active: isRootPos || isTargetNote,
						label: isRootPos ? intervalRoot.note : isTargetNote ? intervalDef.shortLabel : '',
						role: isRootPos ? 'root' : isTargetNote ? 'interval' : ''
					};
				}

				default:
					return pos;
			}
		})
	);
}
