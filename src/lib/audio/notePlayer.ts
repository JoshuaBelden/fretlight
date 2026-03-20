/**
 * Plays a note using the Web Audio API given a MIDI number.
 * Uses a plucked-string–style synthesis: triangle wave with a fast decay envelope.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	return audioCtx;
}

function midiToFrequency(midi: number): number {
	return 440 * Math.pow(2, (midi - 69) / 12);
}

export function playNote(midi: number, duration = 0.6): void {
	const ctx = getAudioContext();
	const now = ctx.currentTime;
	const freq = midiToFrequency(midi);

	const osc = ctx.createOscillator();
	osc.type = 'triangle';
	osc.frequency.setValueAtTime(freq, now);

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.4, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start(now);
	osc.stop(now + duration);
}
