import type { TimeSignature } from '$lib/stores/audio.svelte.js';

/**
 * Precise metronome using Web Audio API lookahead scheduling.
 * Based on the Chris Wilson "A Tale of Two Clocks" pattern.
 *
 * - AudioContext clock drives the actual sound scheduling (high precision)
 * - setInterval loop runs every ~25ms to schedule upcoming beats
 * - A 100ms lookahead window ensures smooth playback without jitter
 */
export class Metronome {
	private audioCtx: AudioContext | null = null;
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private nextBeatTime = 0;
	private currentBeat = 0;

	bpm: number;
	timeSignature: TimeSignature;
	isPlaying = false;

	onBeat: (beat: number) => void = () => {};

	/** Lookahead in seconds */
	private readonly LOOKAHEAD = 0.1;
	/** Scheduler interval in ms */
	private readonly INTERVAL = 25;

	constructor(bpm = 120, timeSignature: TimeSignature = { beats: 4, subdivision: 4 }) {
		this.bpm = bpm;
		this.timeSignature = timeSignature;
	}

	private get beatInterval(): number {
		// seconds per beat, adjusted for subdivision
		const beatsPerMinute = this.bpm * (this.timeSignature.subdivision / 4);
		return 60.0 / beatsPerMinute;
	}

	private scheduleClick(time: number, isAccent: boolean) {
		if (!this.audioCtx) return;

		const osc = this.audioCtx.createOscillator();
		const gain = this.audioCtx.createGain();

		osc.connect(gain);
		gain.connect(this.audioCtx.destination);

		osc.frequency.value = isAccent ? 1000 : 660;
		osc.type = 'sine';

		gain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, time);
		gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

		osc.start(time);
		osc.stop(time + 0.05);
	}

	private scheduler() {
		if (!this.audioCtx) return;
		const now = this.audioCtx.currentTime;

		while (this.nextBeatTime < now + this.LOOKAHEAD) {
			const isAccent = this.currentBeat === 0;
			this.scheduleClick(this.nextBeatTime, isAccent);

			// Fire UI callback slightly before the beat
			const beatCopy = this.currentBeat;
			const delay = Math.max(0, (this.nextBeatTime - now) * 1000 - 8);
			setTimeout(() => this.onBeat(beatCopy), delay);

			this.nextBeatTime += this.beatInterval;
			this.currentBeat = (this.currentBeat + 1) % this.timeSignature.beats;
		}
	}

	async start() {
		if (this.isPlaying) return;

		// Create AudioContext on user gesture (satisfies autoplay policy)
		if (!this.audioCtx) {
			this.audioCtx = new AudioContext();
		}
		if (this.audioCtx.state === 'suspended') {
			await this.audioCtx.resume();
		}

		this.isPlaying = true;
		this.currentBeat = 0;
		this.nextBeatTime = this.audioCtx.currentTime + 0.05;
		this.intervalId = setInterval(() => this.scheduler(), this.INTERVAL);
	}

	stop() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	setBpm(bpm: number) {
		this.bpm = Math.max(20, Math.min(300, Math.round(bpm)));
	}

	setTimeSignature(ts: TimeSignature) {
		this.timeSignature = ts;
		this.currentBeat = 0;
	}

	tapTempo(tapTimes: number[]): number {
		if (tapTimes.length < 2) return this.bpm;
		const intervals = [];
		for (let i = 1; i < tapTimes.length; i++) {
			intervals.push(tapTimes[i] - tapTimes[i - 1]);
		}
		const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		return Math.round(60000 / avg);
	}

	destroy() {
		this.stop();
		this.audioCtx?.close();
		this.audioCtx = null;
	}
}
