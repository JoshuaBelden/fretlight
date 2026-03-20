<script lang="ts">
	import { displayState } from '$lib/stores/display.svelte.js';
	import Navigation from '$lib/components/Navigation.svelte';
	import Fretboard from '$lib/components/Fretboard.svelte';
	import TuningSelector from '$lib/components/TuningSelector.svelte';
	import CapoControl from '$lib/components/CapoControl.svelte';
	import DisplayModePanel from '$lib/components/DisplayModePanel.svelte';
	import ScaleSelector from '$lib/components/ScaleSelector.svelte';
	import ChordSelector from '$lib/components/ChordSelector.svelte';
	import IntervalTrainer from '$lib/components/IntervalTrainer.svelte';
	import Metronome from '$lib/components/Metronome.svelte';
	import Tuner from '$lib/components/Tuner.svelte';
</script>

<div class="page">
	<Navigation />

	{#if displayState.activeView === 'fretboard'}
		<div class="fretboard-layout">
			<!-- Sidebar -->
			<aside class="sidebar wood-texture">
				<div class="sidebar-content">
					<section class="sidebar-section">
						<TuningSelector />
					</section>

					<div class="divider"></div>

					<section class="sidebar-section">
						<CapoControl />
					</section>

					<div class="divider"></div>

					<section class="sidebar-section">
						<DisplayModePanel />
					</section>

					{#if displayState.mode === 'scale'}
						<div class="divider"></div>
						<section class="sidebar-section">
							<ScaleSelector />
						</section>
					{:else if displayState.mode === 'chord'}
						<div class="divider"></div>
						<section class="sidebar-section">
							<ChordSelector />
						</section>
					{:else if displayState.mode === 'interval'}
						<div class="divider"></div>
						<section class="sidebar-section">
							<IntervalTrainer />
						</section>
					{/if}
				</div>
			</aside>

			<!-- Main fretboard area -->
			<main class="fretboard-main">
				<div class="fretboard-container">
					<Fretboard />
				</div>

				<!-- Mode hint -->
				{#if displayState.mode === 'all-notes'}
					<p class="hint">Showing all notes · Switch modes in the panel to highlight scales, chords, or intervals</p>
				{:else if displayState.mode === 'interval' && !displayState.intervalRoot}
					<p class="hint">Tap any note on the fretboard to set the root, then select an interval</p>
				{/if}
			</main>
		</div>

	{:else if displayState.activeView === 'tuner'}
		<div class="tool-view">
			<Tuner />
		</div>

	{:else if displayState.activeView === 'metronome'}
		<div class="tool-view">
			<Metronome />
		</div>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	/* ── Fretboard layout ── */
	.fretboard-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}

	/* Sidebar */
	.sidebar {
		width: var(--sidebar-width);
		flex-shrink: 0;
		border-right: 1px solid var(--color-border);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.sidebar-content {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.sidebar-section {
		padding: var(--space-md) 0;
	}

	.divider {
		height: 1px;
		background: var(--color-border);
		margin: 0 calc(-1 * var(--space-md));
	}

	/* Main fretboard area */
	.fretboard-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: var(--space-xl) var(--space-lg);
		overflow: hidden;
		gap: var(--space-md);
		min-width: 0;
	}

	.fretboard-container {
		width: 100%;
	}

	.hint {
		text-align: center;
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Tool views (Tuner / Metronome) */
	.tool-view {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-lg);
	}

	/* ── Responsive ── */

	/* iPad portrait and larger */
	@media (min-width: 640px) and (max-width: 1024px) {
		.sidebar {
			width: 260px;
		}

		.fretboard-main {
			padding: var(--space-lg) var(--space-md);
		}
	}

	/* Large desktop */
	@media (min-width: 1200px) {
		.sidebar {
			width: var(--sidebar-width-lg);
		}
	}

	/* Mobile — stack vertically */
	@media (max-width: 639px) {
		.fretboard-layout {
			flex-direction: column;
			overflow-y: auto;
		}

		.sidebar {
			width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--color-border);
			overflow-y: visible;
		}

		.sidebar-content {
			padding: var(--space-sm) var(--space-md);
		}

		.fretboard-main {
			padding: var(--space-md) var(--space-sm);
			overflow: visible;
			flex: none;
		}
	}
</style>
