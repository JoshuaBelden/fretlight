import type { DisplayMode, DisplaySelection } from '$lib/instruments/types.js';

export type ActiveView = 'fretboard' | 'tuner' | 'metronome';

class DisplayState {
	mode = $state<DisplayMode>('all-notes');
	activeView = $state<ActiveView>('fretboard');

	// Scale selection
	selectedRoot = $state<string | null>('C');
	selectedScale = $state<string | null>('major');

	// Chord selection
	selectedChord = $state<string | null>('major');

	// Fretboard orientation (persisted to localStorage)
	fretboardRotated = $state(false);

	constructor() {
		try {
			this.fretboardRotated = localStorage.getItem('fretboardRotated') === 'true';
		} catch {}
	}

	// Interval selection
	selectedInterval = $state<string | null>(null);
	intervalRoot = $state<{ note: string; stringIndex: number; fret: number } | null>(null);

	get selection(): DisplaySelection {
		return {
			root: this.selectedRoot,
			scale: this.selectedScale,
			chord: this.selectedChord,
			interval: this.selectedInterval,
			intervalRoot: this.intervalRoot
		};
	}

	setMode(mode: DisplayMode) {
		this.mode = mode;
		// Reset mode-specific selections when switching
		if (mode !== 'scale') {
			// keep scale selection when returning to scale mode
		}
		if (mode !== 'interval') {
			this.intervalRoot = null;
		}
	}

	setView(view: ActiveView) {
		this.activeView = view;
	}

	setRoot(root: string | null) {
		this.selectedRoot = root;
	}

	setScale(scale: string | null) {
		this.selectedScale = scale;
	}

	setChord(chord: string | null) {
		this.selectedChord = chord;
	}

	setInterval(interval: string | null) {
		this.selectedInterval = interval;
		this.intervalRoot = null; // reset root when interval changes
	}

	setIntervalRoot(note: string, stringIndex: number, fret: number) {
		this.intervalRoot = { note, stringIndex, fret };
	}

	toggleRotation() {
		this.fretboardRotated = !this.fretboardRotated;
		try {
			localStorage.setItem('fretboardRotated', String(this.fretboardRotated));
		} catch {}
	}

	clearIntervalRoot() {
		this.intervalRoot = null;
	}
}

export const displayState = new DisplayState();
