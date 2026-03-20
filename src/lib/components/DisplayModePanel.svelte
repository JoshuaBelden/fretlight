<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import type { DisplayMode } from '$lib/instruments/types.js';

	const modes: { id: DisplayMode; label: string; desc: string }[] = [
		{ id: 'all-notes', label: 'All Notes', desc: 'Show every note on the neck' },
		{ id: 'scale', label: 'Scale', desc: 'Highlight a scale across the neck' },
		{ id: 'chord', label: 'Chord', desc: 'Show all chord tones' },
		{ id: 'interval', label: 'Intervals', desc: 'Click a root, see an interval' }
	];
</script>

<div class="mode-panel">
	<span class="label">Display Mode</span>
	<div class="mode-buttons">
		{#each modes as mode}
			<button
				class="mode-btn"
				class:active={displayState.mode === mode.id}
				onclick={() => displayState.setMode(mode.id)}
				title={mode.desc}
			>
				{mode.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.mode-panel {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mode-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
	}

	.mode-btn {
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-family: var(--font-display);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
		text-align: center;
	}

	.mode-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}

	.mode-btn.active {
		color: var(--color-amber);
		background: var(--color-bg-raised);
		border-color: var(--color-amber);
	}
</style>
