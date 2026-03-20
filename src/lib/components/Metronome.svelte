<script lang="ts">
	import { onDestroy } from 'svelte';
	import { audioState, TIME_SIGNATURES } from '$lib/stores/audio.svelte.js';
	import { Metronome } from '$lib/audio/metronome.js';

	const metronome = new Metronome(audioState.metronomeBpm, audioState.metronomeTimeSignature);

	metronome.onBeat = (beat: number) => {
		audioState.setCurrentBeat(beat);
	};

	let tapTimes: number[] = [];
	let tapTimeout: ReturnType<typeof setTimeout> | null = null;

	async function togglePlay() {
		if (metronome.isPlaying) {
			metronome.stop();
			audioState.setMetronomePlaying(false);
			audioState.setCurrentBeat(0);
		} else {
			metronome.setBpm(audioState.metronomeBpm);
			metronome.setTimeSignature(audioState.metronomeTimeSignature);
			await metronome.start();
			audioState.setMetronomePlaying(true);
		}
	}

	function handleBpmInput(e: Event) {
		const val = Number((e.target as HTMLInputElement).value);
		audioState.setBpm(val);
		metronome.setBpm(audioState.metronomeBpm);
	}

	function handleBpmNumber(e: Event) {
		const val = Number((e.target as HTMLInputElement).value);
		audioState.setBpm(val);
		metronome.setBpm(audioState.metronomeBpm);
	}

	function handleTimeSignature(e: Event) {
		const idx = Number((e.target as HTMLSelectElement).value);
		const ts = TIME_SIGNATURES[idx];
		if (ts) {
			audioState.setTimeSignature(ts);
			metronome.setTimeSignature(ts);
		}
	}

	function handleTap() {
		const now = Date.now();
		tapTimes.push(now);
		if (tapTimes.length > 6) tapTimes = tapTimes.slice(-6);

		if (tapTimeout) clearTimeout(tapTimeout);
		tapTimeout = setTimeout(() => { tapTimes = []; }, 3000);

		if (tapTimes.length >= 2) {
			const bpm = metronome.tapTempo(tapTimes);
			audioState.setBpm(bpm);
			metronome.setBpm(bpm);
		}
	}

	let selectedTsIndex = $derived(
		TIME_SIGNATURES.findIndex(
			(ts) =>
				ts.beats === audioState.metronomeTimeSignature.beats &&
				ts.subdivision === audioState.metronomeTimeSignature.subdivision
		)
	);

	onDestroy(() => {
		metronome.destroy();
		if (tapTimeout) clearTimeout(tapTimeout);
	});
</script>

<div class="metronome">
	<div class="metronome-header">
		<h2>Metronome</h2>
	</div>

	<!-- Beat visualizer -->
	<div class="beat-display">
		{#each Array.from({ length: audioState.metronomeTimeSignature.beats }, (_, i) => i) as beatIdx}
			<div
				class="beat-dot"
				class:active={audioState.metronomeIsPlaying && audioState.metronomeCurrentBeat === beatIdx}
				class:accent={beatIdx === 0}
			></div>
		{/each}
	</div>

	<!-- BPM control -->
	<div class="bpm-section">
		<label class="label" for="bpm-slider">Tempo</label>
		<div class="bpm-row">
			<input
				id="bpm-slider"
				type="range"
				min="20"
				max="300"
				step="1"
				value={audioState.metronomeBpm}
				oninput={handleBpmInput}
				class="bpm-slider"
			/>
			<input
				type="number"
				min="20"
				max="300"
				value={audioState.metronomeBpm}
				oninput={handleBpmNumber}
				class="bpm-number"
				aria-label="BPM value"
			/>
			<span class="bpm-unit">BPM</span>
		</div>
	</div>

	<!-- Time signature -->
	<div class="ts-section">
		<label class="label" for="time-sig">Time Signature</label>
		<select
			id="time-sig"
			value={selectedTsIndex >= 0 ? selectedTsIndex : 2}
			onchange={handleTimeSignature}
		>
			{#each TIME_SIGNATURES as ts, idx}
				<option value={idx}>{ts.beats}/{ts.subdivision}</option>
			{/each}
		</select>
	</div>

	<!-- Controls -->
	<div class="controls">
		<button class="play-btn" class:playing={audioState.metronomeIsPlaying} onclick={togglePlay}>
			{audioState.metronomeIsPlaying ? '■ Stop' : '▶ Start'}
		</button>
		<button class="tap-btn" onclick={handleTap}>
			Tap Tempo
		</button>
	</div>

	{#if audioState.metronomeIsPlaying}
		<p class="tempo-label">
			{audioState.metronomeBpm} BPM · {audioState.metronomeTimeSignature.beats}/{audioState.metronomeTimeSignature.subdivision}
		</p>
	{/if}
</div>

<style>
	.metronome {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-width: 480px;
		margin: 0 auto;
		padding: var(--space-xl);
	}

	.metronome-header h2 {
		font-size: 1.5rem;
		color: var(--color-amber);
	}

	/* Beat visualizer */
	.beat-display {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
		align-items: center;
		padding: var(--space-xl) 0;
	}

	.beat-dot {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--color-bg-surface);
		border: 2px solid var(--color-border);
		transition: background 0.05s, border-color 0.05s, transform 0.05s;
	}

	.beat-dot.accent {
		width: 36px;
		height: 36px;
		border-color: var(--color-border-light);
	}

	.beat-dot.active {
		background: var(--color-amber);
		border-color: var(--color-amber-light);
		transform: scale(1.1);
	}

	.beat-dot.accent.active {
		background: var(--color-amber-light);
		box-shadow: var(--shadow-amber);
	}

	/* BPM */
	.bpm-section,
	.ts-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.bpm-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.bpm-slider {
		flex: 1;
	}

	.bpm-number {
		width: 64px;
		text-align: center;
	}

	.bpm-unit {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		white-space: nowrap;
	}

	select {
		width: 120px;
	}

	/* Controls */
	.controls {
		display: flex;
		gap: var(--space-sm);
	}

	.play-btn {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		background: var(--color-amber);
		color: var(--color-walnut-deep);
		border: none;
		cursor: pointer;
		transition: background 0.15s, transform 0.1s;
	}

	.play-btn:hover {
		background: var(--color-amber-light);
	}

	.play-btn:active {
		transform: scale(0.97);
	}

	.play-btn.playing {
		background: var(--color-walnut-light);
		color: var(--color-cream);
	}

	.tap-btn {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: 0.9rem;
		background: var(--color-bg-surface);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.1s;
	}

	.tap-btn:active {
		background: var(--color-bg-hover);
		transform: scale(0.96);
	}

	.tempo-label {
		text-align: center;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}
</style>
