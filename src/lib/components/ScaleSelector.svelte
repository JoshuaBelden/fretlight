<script lang="ts">
	import { onDestroy } from 'svelte';
	import { displayState } from '$lib/stores/display.svelte.js';
	import { audioState } from '$lib/stores/audio.svelte.js';
	import { practiceState } from '$lib/stores/practice.svelte.js';
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
	import { SCALE_LIST } from '$lib/music/scales.js';
	import { NOTE_NAMES } from '$lib/music/notes.js';
	import { generateScaleRun } from '$lib/music/scale-run.js';
	import { Metronome } from '$lib/audio/metronome.js';

	const COMPLEXITY_LABELS = ['Straight', 'Simple', 'Moderate', 'Complex', 'Advanced'];

	// Metronome instance for practice mode
	let metronome: Metronome | null = null;

	function getMetronome(): Metronome {
		if (!metronome) {
			metronome = new Metronome(50, { beats: 4, subdivision: 4 });
			metronome.onBeat = () => {
				if (practiceState.isPlaying) {
					practiceState.advance();
				}
			};
		}
		return metronome;
	}

	function generateRun() {
		const root = displayState.selectedRoot;
		const scale = displayState.selectedScale;
		if (!root || !scale) return;

		const sequence = generateScaleRun(
			instrumentState.tuning,
			instrumentState.instrument.fretCount,
			instrumentState.capoFret,
			root,
			scale,
			practiceState.complexity,
			practiceState.variant
		);

		if (sequence.length > 0) {
			practiceState.activate(sequence, audioState.metronomeBpm);
		}
	}

	function startPractice() {
		generateRun();
	}

	async function beginRun() {
		practiceState.begin();
		const m = getMetronome();
		m.setBpm(50);
		audioState.setBpm(50);
		m.setTimeSignature({ beats: 4, subdivision: 4 });
		await m.start();
		audioState.setMetronomePlaying(true);
	}

	function stopRun() {
		practiceState.pause();
		metronome?.stop();
		audioState.setMetronomePlaying(false);
		audioState.setCurrentBeat(0);
	}

	async function resumeRun() {
		practiceState.resume();
		const m = getMetronome();
		m.setBpm(audioState.metronomeBpm);
		await m.start();
		audioState.setMetronomePlaying(true);
	}

	function newRun() {
		stopRun();
		practiceState.regenerate();
		generateRun();
	}

	function setComplexity(n: number) {
		const wasPlaying = practiceState.isPlaying;
		if (wasPlaying) stopRun();
		practiceState.setComplexity(n);
		generateRun();
		// Don't auto-resume — let user click Begin again
	}

	function exitPractice() {
		stopRun();
		audioState.setBpm(practiceState.previousBpm);
		practiceState.deactivate();
	}

	// Watch for root/scale changes — auto-stop practice
	let prevRoot = displayState.selectedRoot;
	let prevScale = displayState.selectedScale;

	$effect(() => {
		const root = displayState.selectedRoot;
		const scale = displayState.selectedScale;
		if (practiceState.isActive && (root !== prevRoot || scale !== prevScale)) {
			exitPractice();
		}
		prevRoot = root;
		prevScale = scale;
	});

	// Sync BPM changes from the NavMetronome slider to our practice metronome
	$effect(() => {
		const bpm = audioState.metronomeBpm;
		if (metronome && practiceState.isPlaying) {
			metronome.setBpm(bpm);
		}
	});

	// Watch for external metronome stop (user clicked NavMetronome stop)
	// Only react to true→false transitions, not the initial false state
	let prevMetronomePlaying = audioState.metronomeIsPlaying;
	$effect(() => {
		const playing = audioState.metronomeIsPlaying;
		if (prevMetronomePlaying && !playing && practiceState.isActive && practiceState.isPlaying) {
			// External stop — pause the run but keep position
			practiceState.pause();
		}
		prevMetronomePlaying = playing;
	});

	// Stop metronome when the run completes
	$effect(() => {
		if (practiceState.isActive && practiceState.isComplete && !practiceState.isPlaying) {
			metronome?.stop();
			audioState.setMetronomePlaying(false);
			audioState.setCurrentBeat(0);
		}
	});

	onDestroy(() => {
		if (metronome) {
			metronome.destroy();
			metronome = null;
		}
	});
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

	{#if displayState.selectedRoot && displayState.selectedScale}
		<div class="practice-section">
			{#if !practiceState.isActive}
				<button class="practice-btn" onclick={startPractice}>
					Practice Run
				</button>
			{:else}
				<div class="practice-controls">
					<div class="control-group">
						<span class="label">Complexity</span>
						<div class="complexity-grid">
							{#each [1, 2, 3, 4, 5] as level}
								<button
									class="complexity-btn"
									class:active={practiceState.complexity === level}
									onclick={() => setComplexity(level)}
									title={COMPLEXITY_LABELS[level - 1]}
								>{level}</button>
							{/each}
						</div>
						<span class="complexity-label">{COMPLEXITY_LABELS[practiceState.complexity - 1]}</span>
					</div>

					<div class="run-actions">
						{#if practiceState.isComplete && !practiceState.isPlaying}
							<button class="action-btn begin-btn" onclick={beginRun}>
								Restart
							</button>
						{:else if practiceState.isPlaying}
							{#if practiceState.countInRemaining > 0}
								<span class="count-in">{practiceState.countInRemaining}</span>
							{/if}
							<button class="action-btn stop-btn" onclick={stopRun}>
								Stop
							</button>
						{:else}
							<button class="action-btn begin-btn" onclick={practiceState.currentIndex > 0 ? resumeRun : beginRun}>
								{practiceState.currentIndex > 0 ? 'Continue' : 'Begin'}
							</button>
						{/if}
						<button class="action-btn new-btn" onclick={newRun}>
							New Run
						</button>
					</div>

					<div class="progress">
						<div class="step-nav">
							<button
								class="step-btn"
								onclick={() => practiceState.reset()}
								disabled={practiceState.currentIndex === 0}
								title="Rewind to start"
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
									<rect x="0" y="1" width="2" height="10" />
									<polygon points="12,1 4,6 12,11" />
								</svg>
							</button>
							<button
								class="step-btn"
								onclick={() => practiceState.back()}
								disabled={practiceState.currentIndex === 0}
								title="Previous note"
							>
								<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
									<polygon points="10,0 2,5 10,10" />
								</svg>
							</button>
							<span class="progress-text">
								{practiceState.currentIndex + 1} / {practiceState.totalNotes}
							</span>
							<button
								class="step-btn"
								onclick={() => practiceState.advance()}
								disabled={practiceState.isComplete}
								title="Next note"
							>
								<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
									<polygon points="0,0 8,5 0,10" />
								</svg>
							</button>
						</div>
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {((practiceState.currentIndex + 1) / Math.max(practiceState.totalNotes, 1)) * 100}%"
							></div>
						</div>
					</div>

					<button class="exit-btn" onclick={exitPractice}>
						Exit Practice
					</button>
				</div>
			{/if}
		</div>
	{/if}
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

	/* ── Practice Section ── */

	.practice-section {
		margin-top: var(--space-xs);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.practice-btn {
		width: 100%;
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--color-walnut-deep);
		background: var(--color-amber);
		border: 1px solid var(--color-amber);
		cursor: pointer;
		transition: all 0.15s;
	}

	.practice-btn:hover {
		background: var(--color-amber-light);
	}

	.practice-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.complexity-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 3px;
	}

	.complexity-btn {
		padding: 3px 2px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
		text-align: center;
	}

	.complexity-btn:hover {
		color: var(--color-text-primary);
	}

	.complexity-btn.active {
		color: #fff;
		background: var(--color-amber);
		border-color: var(--color-amber);
	}

	.complexity-label {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		text-align: center;
		font-style: italic;
	}

	.run-actions {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.action-btn {
		flex: 1;
		padding: 5px 8px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.12s;
		border: 1px solid var(--color-border);
	}

	.begin-btn {
		color: var(--color-walnut-deep);
		background: var(--color-amber);
		border-color: var(--color-amber);
	}

	.begin-btn:hover {
		background: var(--color-amber-light);
	}

	.stop-btn {
		color: var(--color-text-primary);
		background: var(--color-bg-surface);
		border-color: var(--color-border);
	}

	.stop-btn:hover {
		border-color: var(--color-border-light);
	}

	.new-btn {
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
	}

	.new-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}

	.count-in {
		font-family: var(--font-mono);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-amber);
		min-width: 20px;
		text-align: center;
	}

	.progress {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.step-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}

	.step-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.12s;
		padding: 0;
	}

	.step-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}

	.step-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.progress-text {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--color-text-muted);
		text-align: center;
		min-width: 50px;
	}

	.progress-bar {
		height: 3px;
		background: var(--color-bg-surface);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-amber);
		border-radius: 2px;
		transition: width 0.15s ease-out;
	}

	.exit-btn {
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.68rem;
		color: var(--color-text-muted);
		background: transparent;
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all 0.12s;
	}

	.exit-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-light);
	}
</style>
