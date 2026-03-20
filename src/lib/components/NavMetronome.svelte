<script lang="ts">
	import { onDestroy } from 'svelte';
	import { audioState } from '$lib/stores/audio.svelte.js';
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
			metronome.setTimeSignature({ beats: 4, subdivision: 4 });
			await metronome.start();
			audioState.setMetronomePlaying(true);
		}
	}

	function handleBpmInput(e: Event) {
		const val = Number((e.target as HTMLInputElement).value);
		audioState.setBpm(val);
		metronome.setBpm(audioState.metronomeBpm);
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

	onDestroy(() => {
		metronome.destroy();
		if (tapTimeout) clearTimeout(tapTimeout);
	});
</script>

<div class="nav-metronome">
	<button
		class="metro-btn play-btn"
		class:playing={audioState.metronomeIsPlaying}
		onclick={togglePlay}
		title={audioState.metronomeIsPlaying ? 'Stop' : 'Play'}
	>
		{#if audioState.metronomeIsPlaying}
			<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
				<rect x="1" y="1" width="10" height="10" rx="1" />
			</svg>
		{:else}
			<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
				<polygon points="2,0 12,6 2,12" />
			</svg>
		{/if}
	</button>

	<button class="metro-btn tap-btn" onclick={handleTap} title="Tap Tempo">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="3" />
			<line x1="12" y1="2" x2="12" y2="5" />
			<line x1="12" y1="19" x2="12" y2="22" />
			<line x1="2" y1="12" x2="5" y2="12" />
			<line x1="19" y1="12" x2="22" y2="12" />
		</svg>
	</button>

	<div class="bpm-control">
		<input
			type="range"
			min="20"
			max="300"
			step="1"
			value={audioState.metronomeBpm}
			oninput={handleBpmInput}
			class="bpm-slider"
			aria-label="Tempo"
		/>
		<span class="bpm-label">{audioState.metronomeBpm}</span>
	</div>

	<div class="beat-dots">
		{#each Array.from({ length: 4 }, (_, i) => i) as beatIdx}
			<div
				class="beat-dot"
				class:active={audioState.metronomeIsPlaying && audioState.metronomeCurrentBeat === beatIdx}
				class:accent={beatIdx === 0}
			></div>
		{/each}
	</div>
</div>

<style>
	.nav-metronome {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-left: auto;
	}

	.metro-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s;
		padding: 0;
		flex-shrink: 0;
	}

	.metro-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}

	.metro-btn:active {
		transform: scale(0.93);
	}

	.play-btn.playing {
		background: var(--color-amber);
		color: var(--color-walnut-deep);
		border-color: var(--color-amber);
	}

	.play-btn.playing:hover {
		background: var(--color-amber-light);
	}

	.bpm-control {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.bpm-slider {
		width: 80px;
		height: 4px;
		accent-color: var(--color-amber);
	}

	.bpm-label {
		font-size: 0.7rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
		min-width: 28px;
		text-align: right;
	}

	.beat-dots {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: 4px;
	}

	.beat-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		transition: background 0.05s, border-color 0.05s;
	}

	.beat-dot.accent {
		width: 10px;
		height: 10px;
		border-color: var(--color-border-light);
	}

	.beat-dot.active {
		background: var(--color-amber);
		border-color: var(--color-amber-light);
	}

	.beat-dot.accent.active {
		background: var(--color-amber-light);
		box-shadow: 0 0 4px var(--color-amber);
	}

	@media (max-width: 640px) {
		.nav-metronome {
			gap: 4px;
		}

		.metro-btn {
			width: 24px;
			height: 24px;
		}

		.bpm-slider {
			width: 40px;
		}

		.bpm-label {
			display: none;
		}

		.beat-dots {
			gap: 3px;
			margin-left: 2px;
		}

		.beat-dot {
			width: 6px;
			height: 6px;
		}

		.beat-dot.accent {
			width: 7px;
			height: 7px;
		}
	}
</style>
