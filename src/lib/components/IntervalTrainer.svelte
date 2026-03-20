<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import { INTERVAL_LIST } from '$lib/music/intervals.js';
</script>

<div class="interval-trainer">
	<div class="instruction">
		{#if displayState.intervalRoot}
			<span class="root-indicator">
				Root: <strong>{displayState.intervalRoot.note}</strong> (fret {displayState.intervalRoot.fret})
			</span>
			<button class="clear-btn" onclick={() => displayState.clearIntervalRoot()}>Clear</button>
		{:else}
			<span class="hint">Tap a note on the fretboard to set the root</span>
		{/if}
	</div>

	<div class="control-group">
		<span class="label">Interval</span>
		<div class="interval-grid">
			{#each INTERVAL_LIST as interval}
				<button
					class="interval-btn"
					class:active={displayState.selectedInterval === interval.id}
					onclick={() =>
						displayState.setInterval(
							displayState.selectedInterval === interval.id ? null : interval.id
						)}
					title={interval.label}
				>
					<span class="interval-short">{interval.shortLabel}</span>
					<span class="interval-semitones">{interval.semitones}st</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.interval-trainer {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.instruction {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		min-height: 28px;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.root-indicator {
		font-size: 0.85rem;
		color: var(--color-text-primary);
	}

	.root-indicator strong {
		color: var(--color-amber);
		font-weight: 700;
	}

	.clear-btn {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 2px 8px;
		background: var(--color-bg-surface);
		cursor: pointer;
		font-family: var(--font-body);
		transition: color 0.15s;
	}

	.clear-btn:hover {
		color: var(--color-text-primary);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.interval-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 3px;
	}

	.interval-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 2px;
		border-radius: var(--radius-sm);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
	}

	.interval-btn:hover {
		border-color: var(--color-border-light);
	}

	.interval-btn.active {
		background: rgba(126, 184, 218, 0.15);
		border-color: var(--note-interval);
	}

	.interval-short {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.interval-btn.active .interval-short {
		color: var(--note-interval);
	}

	.interval-semitones {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}
</style>
