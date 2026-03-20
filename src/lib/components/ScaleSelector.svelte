<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import { SCALE_LIST } from '$lib/music/scales.js';
	import { NOTE_NAMES } from '$lib/music/notes.js';
</script>

<div class="scale-selector">
	<div class="control-group">
		<span class="label">Root Note</span>
		<div class="note-grid">
			{#each NOTE_NAMES as note}
				<button
					class="note-btn"
					class:active={displayState.selectedRoot === note}
					onclick={() => displayState.setRoot(displayState.selectedRoot === note ? null : note)}
				>{note}</button>
			{/each}
		</div>
	</div>

	<div class="control-group">
		<span class="label">Scale</span>
		<div class="scale-type-grid">
			{#each SCALE_LIST as scale}
				<button
					class="scale-btn"
					class:active={displayState.selectedScale === scale.id}
					onclick={() => displayState.setScale(displayState.selectedScale === scale.id ? null : scale.id)}
				>{scale.name}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.scale-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.note-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 3px;
	}

	.note-btn {
		padding: 4px 2px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
		text-align: center;
	}

	.note-btn:hover {
		color: var(--color-text-primary);
	}

	.note-btn.active {
		color: #fff;
		background: var(--color-amber);
		border-color: var(--color-amber);
	}

	.scale-type-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3px;
	}

	.scale-btn {
		padding: 4px 6px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.72rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
		text-align: center;
	}

	.scale-btn:hover {
		color: var(--color-text-primary);
	}

	.scale-btn.active {
		color: #fff;
		background: var(--color-amber);
		border-color: var(--color-amber);
	}
</style>
