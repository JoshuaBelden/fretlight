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
		<span class="label">Chord Type</span>
		<div class="chord-type-grid">
			{#each CHORD_TYPE_LIST as ct}
				<button
					class="chord-btn"
					class:active={displayState.selectedChord === ct.id}
					onclick={() => displayState.setChord(displayState.selectedChord === ct.id ? null : ct.id)}
				>{ct.name}</button>
			{/each}
		</div>
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

	.chord-type-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3px;
	}

	.chord-btn {
		padding: 4px 6px;
		border-radius: var(--radius-sm);
		font-family: var(--font-display);
		font-size: 0.72rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
		text-align: center;
	}

	.chord-btn:hover {
		color: var(--color-text-primary);
	}

	.chord-btn.active {
		color: #fff;
		background: var(--color-amber);
		border-color: var(--color-amber);
	}
</style>
