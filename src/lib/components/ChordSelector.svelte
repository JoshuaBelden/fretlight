<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import { CHORD_TYPE_LIST } from '$lib/music/chords.js';
	import { NOTE_NAMES } from '$lib/music/notes.js';
</script>

<div class="chord-selector">
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
		<label class="label" for="chord-type">Chord Type</label>
		<select
			id="chord-type"
			value={displayState.selectedChord ?? ''}
			onchange={(e) => {
				const v = (e.target as HTMLSelectElement).value;
				displayState.setChord(v || null);
			}}
		>
			<option value="">— select —</option>
			{#each CHORD_TYPE_LIST as ct}
				<option value={ct.id}>{ct.name} ({ct.symbol || 'maj'})</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.chord-selector {
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
