<script lang="ts">
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
</script>

<div class="capo-control">
	<div class="capo-header">
		<span class="label">Capo</span>
		<span class="capo-value" class:active={instrumentState.capoFret > 0}>
			{#if instrumentState.capoFret === 0}
				Off
			{:else}
				Fret {instrumentState.capoFret}
			{/if}
		</span>
	</div>

	<input
		type="range"
		min="0"
		max="12"
		step="1"
		value={instrumentState.capoFret}
		oninput={(e) => instrumentState.setCapo(Number((e.target as HTMLInputElement).value))}
		aria-label="Capo position"
	/>

	<div class="capo-marks">
		{#each [0, 3, 5, 7, 9, 12] as mark}
			<span class="mark" style="left: {(mark / 12) * 100}%">{mark === 0 ? '' : mark}</span>
		{/each}
	</div>
</div>

<style>
	.capo-control {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.capo-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.capo-value {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		transition: color 0.15s;
	}

	.capo-value.active {
		color: var(--color-amber);
	}

	.capo-marks {
		position: relative;
		height: 14px;
		margin-top: -4px;
	}

	.mark {
		position: absolute;
		transform: translateX(-50%);
		font-size: 0.65rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}
</style>
