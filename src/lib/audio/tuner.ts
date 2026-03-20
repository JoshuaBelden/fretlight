import { frequencyToNote } from '$lib/music/notes.js';

type PitchCallback = (data: {
	note: string | null;
	octave: number | null;
	cents: number;
	frequency: number | null;
}) => void;

/**
 * Chromatic tuner using Web Audio API + YIN-inspired autocorrelation.
 *
 * Uses McLeod Pitch Method (MPM) / normalized square difference function
 * for reliable detection down to ~80Hz (guitar low E).
 *
 * fftSize: 4096 at 44100Hz = ~93ms buffer, sufficient for 2+ cycles at 82Hz
 */
export class PitchDetector {
	private audioCtx: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private stream: MediaStream | null = null;
	private rafId: number | null = null;
	private buffer: Float32Array<ArrayBuffer> | null = null;
	private smoothingBuffer: (number | null)[] = [];

	isActive = false;
	onPitch: PitchCallback = () => {};

	private readonly SMOOTHING_SIZE = 5;
	private readonly MIN_FREQ = 60; // Hz
	private readonly MAX_FREQ = 2000; // Hz

	async start(): Promise<void> {
		if (this.isActive) return;

		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false
			}
		});

		this.audioCtx = new AudioContext();
		if (this.audioCtx.state === 'suspended') {
			await this.audioCtx.resume();
		}

		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.fftSize = 4096;
		this.analyser.smoothingTimeConstant = 0.0;
		this.buffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;

		const source = this.audioCtx.createMediaStreamSource(this.stream);
		source.connect(this.analyser);

		this.isActive = true;
		this.smoothingBuffer = [];
		this.detect();
	}

	stop(): void {
		if (!this.isActive) return;
		this.isActive = false;

		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}

		this.stream?.getTracks().forEach((t) => t.stop());
		this.stream = null;

		this.analyser?.disconnect();
		this.audioCtx?.close();
		this.audioCtx = null;
		this.analyser = null;

		this.onPitch({ note: null, octave: null, cents: 0, frequency: null });
	}

	private detect(): void {
		if (!this.isActive || !this.analyser || !this.buffer) return;

		this.analyser.getFloatTimeDomainData(this.buffer);
		const freq = this.autoCorrelate(this.buffer, this.audioCtx!.sampleRate);

		if (freq !== null && freq > this.MIN_FREQ && freq < this.MAX_FREQ) {
			this.smoothingBuffer.push(freq);
			if (this.smoothingBuffer.length > this.SMOOTHING_SIZE) {
				this.smoothingBuffer.shift();
			}
			const smoothed = this.medianFreq(this.smoothingBuffer.filter((f) => f !== null) as number[]);
			if (smoothed) {
				const result = frequencyToNote(smoothed);
				this.onPitch({
					note: result.note,
					octave: result.octave,
					cents: result.cents,
					frequency: smoothed
				});
			}
		} else {
			this.smoothingBuffer.push(null);
			if (this.smoothingBuffer.length > this.SMOOTHING_SIZE) {
				this.smoothingBuffer.shift();
			}
			const hasRecent = this.smoothingBuffer.some((f) => f !== null);
			if (!hasRecent) {
				this.onPitch({ note: null, octave: null, cents: 0, frequency: null });
			}
		}

		this.rafId = requestAnimationFrame(() => this.detect());
	}

	/**
	 * Autocorrelation-based pitch detection.
	 * Returns frequency in Hz or null if no clear pitch detected.
	 */
	private autoCorrelate(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number | null {
		const bufLen = buffer.length;

		// Check if there's enough signal (not silence)
		let rms = 0;
		for (let i = 0; i < bufLen; i++) rms += buffer[i] * buffer[i];
		rms = Math.sqrt(rms / bufLen);
		if (rms < 0.01) return null;

		// Find the first zero-crossing going downward (trim leading silence)
		let r1 = 0;
		let r2 = bufLen - 1;
		const THRESHOLD = 0.2;
		for (let i = 0; i < bufLen / 2; i++) {
			if (Math.abs(buffer[i]) < THRESHOLD) {
				r1 = i;
				break;
			}
		}
		for (let i = 1; i < bufLen / 2; i++) {
			if (Math.abs(buffer[bufLen - i]) < THRESHOLD) {
				r2 = bufLen - i;
				break;
			}
		}

		const trimmed = buffer.slice(r1, r2);
		const trimLen = trimmed.length;

		// Autocorrelation
		const c: number[] = new Array(trimLen).fill(0);
		for (let i = 0; i < trimLen; i++) {
			for (let j = 0; j < trimLen - i; j++) {
				c[i] += trimmed[j] * trimmed[j + i];
			}
		}

		// Find first dip below zero
		let d = 0;
		while (d < trimLen && c[d] > c[d + 1]) d++;

		// Find the maximum after the dip
		let maxVal = -1;
		let maxPos = -1;
		for (let i = d; i < trimLen; i++) {
			if (c[i] > maxVal) {
				maxVal = c[i];
				maxPos = i;
			}
		}

		if (maxPos === -1 || maxVal < c[0] * 0.5) return null;

		// Parabolic interpolation for sub-sample accuracy
		const x1 = c[maxPos - 1] ?? 0;
		const x2 = c[maxPos];
		const x3 = c[maxPos + 1] ?? 0;
		const a = (x1 + x3 - 2 * x2) / 2;
		const b = (x3 - x1) / 2;
		const refined = a !== 0 ? maxPos - b / (2 * a) : maxPos;

		return sampleRate / refined;
	}

	private medianFreq(freqs: number[]): number | null {
		if (freqs.length === 0) return null;
		const sorted = [...freqs].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}

	destroy(): void {
		this.stop();
	}
}
