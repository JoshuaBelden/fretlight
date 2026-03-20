export interface TimeSignature {
	beats: number;
	subdivision: number; // 4 = quarter notes, 8 = eighth notes
}

export const TIME_SIGNATURES: TimeSignature[] = [
	{ beats: 2, subdivision: 4 },
	{ beats: 3, subdivision: 4 },
	{ beats: 4, subdivision: 4 },
	{ beats: 6, subdivision: 8 }
];

class AudioState {
	// Metronome
	metronomeBpm = $state(120);
	metronomeIsPlaying = $state(false);
	metronomeTimeSignature = $state<TimeSignature>({ beats: 4, subdivision: 4 });
	metronomeCurrentBeat = $state(0); // 0-indexed, updated on each beat

	// Tuner
	tunerIsActive = $state(false);
	tunerDetectedNote = $state<string | null>(null);
	tunerDetectedOctave = $state<number | null>(null);
	tunerCentsDeviation = $state(0);
	tunerDetectedFrequency = $state<number | null>(null);

	setBpm(bpm: number) {
		this.metronomeBpm = Math.max(20, Math.min(300, Math.round(bpm)));
	}

	setTimeSignature(ts: TimeSignature) {
		this.metronomeTimeSignature = ts;
	}

	setMetronomePlaying(playing: boolean) {
		this.metronomeIsPlaying = playing;
	}

	setCurrentBeat(beat: number) {
		this.metronomeCurrentBeat = beat;
	}

	setTunerActive(active: boolean) {
		this.tunerIsActive = active;
	}

	updatePitch(note: string | null, octave: number | null, cents: number, freq: number | null) {
		this.tunerDetectedNote = note;
		this.tunerDetectedOctave = octave;
		this.tunerCentsDeviation = cents;
		this.tunerDetectedFrequency = freq;
	}
}

export const audioState = new AudioState();
