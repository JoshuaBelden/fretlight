<script lang="ts">
	import { onDestroy } from 'svelte';
	import { audioState } from '$lib/stores/audio.svelte.js';
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
	import { PitchDetector } from '$lib/audio/tuner.js';
	import { playNote } from '$lib/audio/notePlayer.js';

	const detector = new PitchDetector();

	detector.onPitch = ({ note, octave, cents, frequency }) => {
		audioState.updatePitch(note, octave, cents, frequency);
	};

	let errorMsg = $state<string | null>(null);

	async function toggleTuner() {
		if (detector.isActive) {
			detector.stop();
			audioState.setTunerActive(false);
		} else {
			errorMsg = null;
			try {
				await detector.start();
				audioState.setTunerActive(true);
			} catch (err) {
				const e = err as Error;
				if (e.name === 'NotAllowedError') {
					errorMsg = 'Microphone access denied. Please allow microphone access and try again.';
				} else {
					errorMsg = 'Could not access microphone: ' + e.message;
				}
			}
		}
	}

	// Meter position: map -50..+50 cents to 0..100%
	let meterPercent = $derived(
		Math.max(0, Math.min(100, ((audioState.tunerCentsDeviation + 50) / 100) * 100))
	);

	// Color: green when in tune (|cents| < 5), yellow (5-15), red (>15)
	let tuneColor = $derived.by(() => {
		const abs = Math.abs(audioState.tunerCentsDeviation);
		if (!audioState.tunerDetectedNote) return 'var(--color-text-muted)';
		if (abs <= 5) return '#5cb85c';
		if (abs <= 15) return '#f0ad4e';
		return '#d9534f';
	});

	// Which target string is closest to the detected pitch?
	let closestString = $derived.by(() => {
		if (!audioState.tunerDetectedNote || !audioState.tunerDetectedOctave) return null;
		const detectedMidi =
			audioState.tunerDetectedNote && audioState.tunerDetectedOctave !== null
				? noteToMidi(audioState.tunerDetectedNote, audioState.tunerDetectedOctave)
				: null;
		if (detectedMidi === null) return null;

		let closest = null;
		let minDiff = Infinity;
		for (const s of instrumentState.tuning.strings) {
			const midi = openNoteMidi(s.openNote);
			const diff = Math.abs(detectedMidi - midi);
			if (diff < minDiff) {
				minDiff = diff;
				closest = s;
			}
		}
		return closest;
	});

	// Strings reversed so low E is first
	let stringsLowToHigh = $derived([...instrumentState.tuning.strings].reverse());

	function noteToMidi(note: string, octave: number): number {
		const chromaMap: Record<string, number> = {
			C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
			'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
		};
		return (octave + 1) * 12 + (chromaMap[note] ?? 9);
	}

	function openNoteMidi(openNote: string): number {
		const match = openNote.match(/^([A-G][#b]?)(\d)$/);
		if (!match) return 0;
		return noteToMidi(match[1], parseInt(match[2]));
	}

	function openNoteName(openNote: string): string {
		return openNote.replace(/\d/, '');
	}

	function playOpenString(openNote: string) {
		const midi = openNoteMidi(openNote);
		if (midi > 0) playNote(midi);
	}

	onDestroy(() => detector.destroy());
</script>

<div class="tuner">
	<div class="tuner-header">
		<h2>Chromatic Tuner</h2>
	</div>

	<!-- Main display -->
	<div class="note-display">
		{#if audioState.tunerDetectedNote}
			<span class="detected-note" style="color: {tuneColor}">
				{audioState.tunerDetectedNote}
			</span>
			<span class="detected-octave">{audioState.tunerDetectedOctave}</span>
			{#if audioState.tunerDetectedFrequency}
				<span class="detected-freq">
					{audioState.tunerDetectedFrequency.toFixed(1)} Hz
				</span>
			{/if}
		{:else if audioState.tunerIsActive}
			<span class="waiting">Listening…</span>
		{:else}
			<span class="waiting">—</span>
		{/if}
	</div>

	<!-- Cents meter -->
	<div class="meter-container">
		<div class="meter-labels">
			<span>-50</span>
			<span>-25</span>
			<span class="center-label">0</span>
			<span>+25</span>
			<span>+50</span>
		</div>
		<div class="meter-track">
			<div class="meter-center-mark"></div>
			{#if audioState.tunerDetectedNote}
				<div
					class="meter-indicator"
					style="left: {meterPercent}%; background: {tuneColor}"
				></div>
			{/if}
		</div>
		{#if audioState.tunerDetectedNote}
			<p class="cents-label" style="color: {tuneColor}">
				{audioState.tunerCentsDeviation > 0 ? '+' : ''}{audioState.tunerCentsDeviation} cents
			</p>
		{/if}
	</div>

	<!-- Target strings for current tuning -->
	<div class="target-strings">
		<span class="label">Target Notes — {instrumentState.tuning.name}</span>
		<div class="string-list">
			{#each stringsLowToHigh as s}
				{@const isClosest = closestString === s}
				<button
					class="target-string"
					class:closest={isClosest && !!audioState.tunerDetectedNote}
					onclick={() => playOpenString(s.openNote)}
				>
					<span class="string-note-name">{openNoteName(s.openNote)}</span>
					{#if s.startFret > 0}
						<span class="drone-badge">drone</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}

	<!-- Toggle button -->
	<button
		class="tuner-btn"
		class:active={audioState.tunerIsActive}
		onclick={toggleTuner}
	>
		{audioState.tunerIsActive ? 'Stop Listening' : 'Start Listening'}
	</button>
</div>

<style>
	.tuner {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-width: 440px;
		margin: 0 auto;
		padding: var(--space-xl);
	}

	.tuner-header h2 {
		font-size: 1.5rem;
		color: var(--color-amber);
	}

	/* Note display */
	.note-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-xl) 0;
		min-height: 100px;
	}

	.detected-note {
		font-family: var(--font-body);
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		transition: color 0.15s;
	}

	.detected-octave {
		font-family: var(--font-mono);
		font-size: 1.5rem;
		color: var(--color-text-muted);
		align-self: flex-start;
		margin-top: 8px;
	}

	.detected-freq {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		align-self: flex-end;
		margin-bottom: 8px;
	}

	.waiting {
		font-family: var(--font-body);
		font-size: 2rem;
		color: var(--color-text-muted);
	}

	/* Cents meter */
	.meter-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
		align-items: center;
	}

	.meter-labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.center-label {
		color: var(--color-amber);
	}

	.meter-track {
		position: relative;
		width: 100%;
		height: 6px;
		background: var(--color-bg-surface);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
	}

	.meter-center-mark {
		position: absolute;
		left: 50%;
		top: -4px;
		width: 2px;
		height: 14px;
		background: var(--color-amber);
		border-radius: 1px;
		transform: translateX(-50%);
	}

	.meter-indicator {
		position: absolute;
		top: -5px;
		width: 10px;
		height: 16px;
		border-radius: 3px;
		transform: translateX(-50%);
		transition: left 0.08s ease-out, background 0.15s;
	}

	.cents-label {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		transition: color 0.15s;
	}

	/* Target strings */
	.target-strings {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.string-list {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.target-string {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		font-family: inherit;
	}

	.target-string:hover {
		border-color: var(--color-amber);
	}

	.target-string.closest {
		border-color: var(--color-amber);
		background: var(--color-amber-dim);
	}

	.string-note-name {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.drone-badge {
		font-size: 0.6rem;
		color: var(--color-amber);
		background: var(--color-amber-dim);
		border-radius: 2px;
		padding: 1px 3px;
	}

	/* Error */
	.error-msg {
		font-size: 0.85rem;
		color: #d9534f;
		background: rgba(217, 83, 79, 0.1);
		border: 1px solid rgba(217, 83, 79, 0.3);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
	}

	/* Button */
	.tuner-btn {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		background: var(--color-amber);
		color: var(--color-walnut-deep);
		border: none;
		cursor: pointer;
		transition: background 0.15s;
		width: 100%;
	}

	.tuner-btn:hover {
		background: var(--color-amber-light);
	}

	.tuner-btn.active {
		background: var(--color-walnut-light);
		color: var(--color-cream);
	}

	.tuner-btn.active:hover {
		background: var(--color-walnut);
	}
</style>
