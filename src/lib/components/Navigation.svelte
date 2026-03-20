<script lang="ts">
	import { displayState, type ActiveView } from '$lib/stores/display.svelte.js';
	import { instrumentState, ALL_INSTRUMENTS } from '$lib/stores/instrument.svelte.js';
	import Logo from './Logo.svelte';

	const tabs: { id: ActiveView; label: string }[] = [
		{ id: 'fretboard', label: 'Fretboard' },
		{ id: 'tuner', label: 'Tuner' },
		{ id: 'metronome', label: 'Metronome' }
	];

	let instrumentOpen = $state(false);

	function toggleInstrument() {
		instrumentOpen = !instrumentOpen;
	}

	function selectInstrument(id: string) {
		instrumentState.setInstrument(id);
		instrumentOpen = false;
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as Element;
		if (!target.closest('.instrument-picker')) {
			instrumentOpen = false;
		}
	}
</script>

<svelte:window onclick={handleOutsideClick} />

<nav class="nav">
	<div class="nav-brand">
		<Logo width={200} />
	</div>

	<div class="instrument-picker">
		<button class="instrument-btn" onclick={toggleInstrument}>
			<span class="instrument-label">{instrumentState.instrument.name}</span>
			<span class="instrument-chevron" class:open={instrumentOpen}>&#9662;</span>
		</button>
		{#if instrumentOpen}
			<div class="instrument-dropdown">
				{#each ALL_INSTRUMENTS as instr}
					<button
						class="instrument-option"
						class:active={instrumentState.instrument.id === instr.id}
						onclick={() => selectInstrument(instr.id)}
					>
						{instr.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="nav-tabs">
		{#each tabs as tab}
			<button
				class="nav-tab"
				class:active={displayState.activeView === tab.id}
				onclick={() => displayState.setView(tab.id)}
			>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>
</nav>

<style>
	.nav {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: 0 var(--space-md);
		min-height: var(--nav-height);
		padding-top: var(--space-xs);
		padding-bottom: var(--space-xs);
		background: var(--color-bg-raised);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
		z-index: 10;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-right: var(--space-sm);
	}

	.nav-tabs {
		display: flex;
		gap: 2px;
	}

	.nav-tab {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		transition: color 0.15s, background 0.15s;
		background: none;
		border: 1px solid transparent;
		cursor: pointer;
	}

	.nav-tab:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-hover);
	}

	.nav-tab.active {
		color: var(--color-amber);
		background: var(--color-bg-surface);
		border-color: var(--color-amber);
	}

	.tab-label {
		font-weight: 500;
	}

	/* Instrument picker */
	.instrument-picker {
		position: relative;
	}

	.instrument-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.instrument-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}

	.instrument-chevron {
		font-size: 0.75rem;
		transition: transform 0.15s;
		display: inline-block;
	}

	.instrument-chevron.open {
		transform: rotate(180deg);
	}

	.instrument-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		min-width: 140px;
		z-index: 100;
		overflow: hidden;
	}

	.instrument-option {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.1s, color 0.1s;
	}

	.instrument-option:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.instrument-option.active {
		color: var(--color-blue);
	}

	@media (max-width: 640px) {
		.nav-tab {
			padding: var(--space-xs) var(--space-sm);
			font-size: 0.8rem;
		}
		.instrument-label {
			display: none;
		}
	}
</style>
