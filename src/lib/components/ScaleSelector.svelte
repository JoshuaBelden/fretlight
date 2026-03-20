<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import { SCALE_LIST } from '$lib/music/scales.js';
	import { NOTE_NAMES } from '$lib/music/notes.js';
</script>

<div class="scale-selector">
	<div class="control-group">
		<label class="label" for="scale-root">Root Note</label>
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
		<label class="label" for="scale-type">Scale</label>
		<select
			id="scale-type"
			value={displayState.selectedScale ?? ''}
			onchange={(e) => {
				const v = (e.target as HTMLSelectElement).value;
				displayState.setScale(v || null);
			}}
		>
			<option value="">— select —</option>
			{#each SCALE_LIST as scale}
				<option value={scale.id}>{scale.name}</option>
			{/each}
		</select>
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

	select {
		width: 100%;
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
		color: var(--note-root-text);
		background: var(--note-root);
		border-color: var(--note-root);
	}
</style>
