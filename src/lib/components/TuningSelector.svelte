<script lang="ts">
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
</script>

<div class="tuning-selector">
	<div class="control-group">
		<label class="label" for="tuning-select">Tuning</label>
		<select
			id="tuning-select"
			value={instrumentState.tuning.id}
			onchange={(e) => instrumentState.setTuning((e.target as HTMLSelectElement).value)}
		>
			{#each instrumentState.availableTunings as tuning}
				<option value={tuning.id}>{tuning.name}</option>
			{/each}
		</select>
	</div>

	<!-- Open string notes preview — drone string shown first, in lowercase -->
	<div class="string-preview">
		{#each [...instrumentState.tuning.strings].sort((a, b) => (b.startFret > 0 ? 1 : 0) - (a.startFret > 0 ? 1 : 0)) as s}
			{@const name = s.openNote.replace(/\d/, '')}
			<span class="string-note" class:drone={s.startFret > 0}>
				{s.startFret > 0 ? name.toLowerCase() : name}
			</span>
		{/each}
	</div>
</div>

<style>
	.tuning-selector {
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

	.string-preview {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		margin-top: 2px;
	}

	.string-note {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 1px 6px;
	}

	.string-note.drone {
		color: var(--color-amber);
		border-color: var(--color-amber-dim);
	}
</style>
