<script lang="ts">
	import { displayState, type ActiveView } from '$lib/stores/display.svelte.js';
	import Logo from './Logo.svelte';

	const tabs: { id: ActiveView; label: string; icon: string }[] = [
		{ id: 'fretboard', label: 'Fretboard', icon: '𝄞' },
		{ id: 'tuner', label: 'Tuner', icon: '♩' },
		{ id: 'metronome', label: 'Metronome', icon: '♩' }
	];
</script>

<nav class="nav">
	<div class="nav-brand">
		<Logo size={32} />
		<span class="nav-title">FretLight</span>
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
		height: var(--nav-height);
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

	.nav-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-amber);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	.nav-tabs {
		display: flex;
		gap: 2px;
	}

	.nav-tab {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-sm);
		font-family: var(--font-display);
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
		border-color: var(--color-border);
	}

	.tab-label {
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.nav-title {
			display: none;
		}

		.nav-tab {
			padding: var(--space-xs) var(--space-sm);
			font-size: 0.8rem;
		}
	}
</style>
