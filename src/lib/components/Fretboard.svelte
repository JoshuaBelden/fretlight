<script lang="ts">
	import type { FretPosition, ResolvedPosition } from '$lib/instruments/types.js';
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
	import { displayState } from '$lib/stores/display.svelte.js';
	import { practiceState } from '$lib/stores/practice.svelte.js';
	import { buildFretboardNotes, getActivePositions } from '$lib/music/fretboard.js';
	import { resolveChordPositions } from '$lib/music/chord-shapes.js';
	import FretboardString from './FretboardString.svelte';
	import FretboardInlays from './FretboardInlays.svelte';
	import { playNote } from '$lib/audio/notePlayer.js';

	// ── Layout constants ──────────────────────────────────────
	const VW = 1200;
	const VH = 260;
	const LEFT_PAD = 52;   // open string note space
	const RIGHT_PAD = 18;
	const TOP_PAD = 28;    // fret number label space
	const BOTTOM_PAD = 16;
	const FRET_AREA_W = VW - LEFT_PAD - RIGHT_PAD;
	const STRING_AREA_H = VH - TOP_PAD - BOTTOM_PAD;
	const NOTE_RADIUS = 11;

	// ── Fret position math (used for both orientations) ───────
	// In horizontal mode: these return X coordinates
	// In rotated mode: these same values are used as Y coordinates

	function fretWireX(fret: number): number {
		if (fret === 0) return LEFT_PAD;
		const fc = instrumentState.instrument.fretCount;
		const maxOff = 1 - Math.pow(2, -fc / 12);
		const off = 1 - Math.pow(2, -fret / 12);
		return LEFT_PAD + (off / maxOff) * FRET_AREA_W;
	}

	function noteCenterX(fret: number): number {
		if (fret === 0) return LEFT_PAD / 2;
		return (fretWireX(fret - 1) + fretWireX(fret)) / 2;
	}

	// stringY: in horizontal = Y; in rotated = X (same formula, axis swapped by caller)
	function stringY(idx: number, reverse = false): number {
		const sc = instrumentState.instrument.stringCount;
		const spacing = STRING_AREA_H / (sc - 1);
		const i = reverse ? sc - 1 - idx : idx;
		return TOP_PAD + i * spacing;
	}

	function stringStrokeWidth(idx: number): number {
		const sc = instrumentState.instrument.stringCount;
		return 0.8 + (idx / (sc - 1)) * 2.2;
	}

	// ── Reactive data ─────────────────────────────────────────

	let allPositions = $derived(
		buildFretboardNotes(
			instrumentState.tuning,
			instrumentState.instrument.fretCount,
			instrumentState.capoFret
		)
	);

	// Resolve available chord positions for the current root + chord type
	let chordPositions: ResolvedPosition[] = $derived(
		displayState.mode === 'chord' && displayState.selectedRoot && displayState.selectedChord
			? resolveChordPositions(
					displayState.selectedRoot,
					displayState.selectedChord,
					instrumentState.tuning,
					instrumentState.instrument.fretCount
				)
			: []
	);

	// Build effective selection with resolved voicing data
	// chordPosition stores a shapeIndex, so find the first resolved position matching it
	let effectiveSelection = $derived.by(() => {
		const base = displayState.selection;
		if (base.chordPosition !== null && base.chordPosition !== undefined) {
			const match = chordPositions.find((p) => p.shapeIndex === base.chordPosition);
			if (match) {
				return {
					...base,
					resolvedVoicing: match.actualFrets
				};
			}
		}
		return base;
	});

	let activePositions = $derived(
		getActivePositions(allPositions, displayState.mode, effectiveSelection)
	);

	// Practice overlay: show only notes in the run, highlight current + next
	let displayPositions = $derived.by(() => {
		if (!practiceState.isActive) {
			return activePositions;
		}

		// Build a set of positions that appear in the run sequence
		const runPositions = new Set<string>();
		for (const pos of practiceState.runSequence) {
			runPositions.add(`${pos.stringIndex}:${pos.fret}`);
		}

		const current = practiceState.currentPosition;
		const next = practiceState.nextPosition;

		return activePositions.map((stringPositions) =>
			stringPositions.map((pos) => {
				if (!pos) return null;
				const key = `${pos.stringIndex}:${pos.fret}`;
				const inRun = runPositions.has(key);
				if (!inRun) {
					return { ...pos, active: false, role: '', label: '' } as typeof pos;
				}
				const isCurrent =
					current && pos.stringIndex === current.stringIndex && pos.fret === current.fret;
				const isNext =
					next && pos.stringIndex === next.stringIndex && pos.fret === next.fret;
				return {
					...pos,
					active: true,
					role: isCurrent ? 'run-current' : isNext ? 'run-upcoming' : 'run-note',
					label: pos.note
				} as typeof pos;
			})
		);
	});

	// Arrow between current and next practice note
	let practiceArrow = $derived.by(() => {
		if (!practiceState.isActive) return null;
		const cur = practiceState.currentPosition;
		const nxt = practiceState.nextPosition;
		if (!cur || !nxt) return null;

		const isRotated = displayState.fretboardRotated;
		const cx = cur.fret === 0 ? LEFT_PAD / 2 : noteCenterX(cur.fret);
		const cy = stringY(cur.stringIndex, isRotated);
		const nx = nxt.fret === 0 ? LEFT_PAD / 2 : noteCenterX(nxt.fret);
		const ny = stringY(nxt.stringIndex, isRotated);

		// Shorten the line so it doesn't overlap the note circles
		const dx = nx - cx;
		const dy = ny - cy;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < NOTE_RADIUS * 2.5) return null; // too close, skip arrow
		const ux = dx / dist;
		const uy = dy / dist;
		const gap = NOTE_RADIUS + 3;
		return {
			x1: cx + ux * gap,
			y1: cy + uy * gap,
			x2: nx - ux * gap,
			y2: ny - uy * gap
		};
	});

	let fretNumbers = $derived(
		[1, 3, 5, 7, 9, 12, 15, 17, 19, 21].filter(
			(f) => f <= instrumentState.instrument.fretCount
		)
	);

	let rotated = $derived(displayState.fretboardRotated);

	// ── Click handler ─────────────────────────────────────────

	function handleNoteClick(pos: FretPosition) {
		playNote(pos.midi);
		if (displayState.mode === 'interval') {
			displayState.setIntervalRoot(pos.note, pos.stringIndex, pos.fret);
		}
	}

	let isInteractive = true;
</script>

<div class="fretboard-wrap" class:rotated>
	<svg
		viewBox={rotated ? `0 0 ${VH} ${VW}` : `0 0 ${VW} ${VH}`}
		xmlns="http://www.w3.org/2000/svg"
		class="fretboard-svg"
		aria-label="Guitar fretboard"
		role="img"
	>
		<defs>
			<linearGradient id="rosewood" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#2d1a08" />
				<stop offset="40%" stop-color="#221208" />
				<stop offset="60%" stop-color="#1e1006" />
				<stop offset="100%" stop-color="#2d1a08" />
			</linearGradient>
			<!-- Subtle wood grain overlay -->
			<filter id="grain" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.9 0.1" numOctaves="4" result="noise" />
				<feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
				<feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend" />
				<feComponentTransfer in="blend">
					<feFuncA type="linear" slope="0.06" />
				</feComponentTransfer>
				<feComposite in="SourceGraphic" operator="over" />
			</filter>
			<marker id="arrow-tip" viewBox="0 0 10 10" refX="8" refY="5"
				markerWidth="6" markerHeight="6" orient="auto-start-reverse">
				<path d="M 0 1 L 8 5 L 0 9 z" fill="var(--note-run-current)" opacity="0.7" />
			</marker>
		</defs>

		{#if rotated}
			<!-- ── Fretboard body (rotated) ── -->
			<rect
				x={TOP_PAD - 6}
				y={LEFT_PAD}
				width={STRING_AREA_H + 12}
				height={FRET_AREA_W}
				fill="url(#rosewood)"
				rx="3"
			/>

			<!-- ── Fret number labels (left side) ── -->
			{#each fretNumbers as fretNum}
				<text
					x={TOP_PAD - 10}
					y={noteCenterX(fretNum)}
					text-anchor="end"
					dominant-baseline="middle"
					font-size="10"
					fill="var(--color-text-muted)"
					font-family="var(--font-mono)"
				>{fretNum}</text>
			{/each}

			<!-- ── Dot inlays (rotated) ── -->
			<FretboardInlays
				inlayFrets={instrumentState.instrument.inlayFrets}
				doubleInlayFrets={instrumentState.instrument.doubleInlayFrets}
				{noteCenterX}
				topY={TOP_PAD - 6}
				bottomY={TOP_PAD + STRING_AREA_H + 6}
				rotated={true}
			/>

			<!-- ── Nut (horizontal bar at top) ── -->
			<rect
				x={TOP_PAD - 6}
				y={LEFT_PAD - 5}
				width={STRING_AREA_H + 12}
				height="8"
				fill="var(--nut-color)"
				rx="2"
			/>

			<!-- ── Fret wires (horizontal) ── -->
			{#each Array.from({ length: instrumentState.instrument.fretCount }, (_, i) => i + 1) as fret}
				<line
					x1={TOP_PAD - 6}
					y1={fretWireX(fret)}
					x2={TOP_PAD + STRING_AREA_H + 6}
					y2={fretWireX(fret)}
					stroke="var(--fret-metal)"
					stroke-width={fret === 12 ? 2 : 1.2}
				/>
			{/each}

			<!-- ── Capo indicator (rotated) ── -->
			{#if instrumentState.capoFret > 0}
				<rect
					x={TOP_PAD - 6}
					y={fretWireX(instrumentState.capoFret - 1) + 3}
					width={STRING_AREA_H + 12}
					height={fretWireX(instrumentState.capoFret) - fretWireX(instrumentState.capoFret - 1) - 6}
					fill="rgba(193, 125, 60, 0.15)"
					stroke="var(--color-amber)"
					stroke-width="1.5"
					rx="3"
				/>
				<text
					x={TOP_PAD + STRING_AREA_H + 18}
					y={(fretWireX(instrumentState.capoFret - 1) + fretWireX(instrumentState.capoFret)) / 2}
					text-anchor="start"
					dominant-baseline="middle"
					font-size="9"
					fill="var(--color-amber)"
					font-family="var(--font-body)"
				>capo {instrumentState.capoFret}</text>
			{/if}

			<!-- ── Strings and notes (rotated) ── -->
			{#each instrumentState.tuning.strings as stringConfig, idx}
				<FretboardString
					{stringConfig}
					positions={displayPositions[idx] ?? []}
					y={stringY(idx, true)}
					strokeWidth={stringStrokeWidth(idx)}
					nutX={LEFT_PAD}
					endX={VW - RIGHT_PAD}
					{noteCenterX}
					{fretWireX}
					noteRadius={NOTE_RADIUS}
					interactive={isInteractive}
					onNoteClick={handleNoteClick}
					rotated={true}
				/>
			{/each}

			<!-- ── Practice arrow (rotated) ── -->
			{#if practiceArrow}
				<line
					x1={practiceArrow.y1}
					y1={practiceArrow.x1}
					x2={practiceArrow.y2}
					y2={practiceArrow.x2}
					stroke="var(--note-run-current)"
					stroke-width="2"
					stroke-opacity="0.6"
					marker-end="url(#arrow-tip)"
				/>
			{/if}

		{:else}
			<!-- ── Fretboard body ── -->
			<rect
				x={LEFT_PAD}
				y={TOP_PAD - 6}
				width={FRET_AREA_W}
				height={STRING_AREA_H + 12}
				fill="url(#rosewood)"
				rx="3"
			/>

			<!-- ── Fret number labels ── -->
			{#each fretNumbers as fretNum}
				<text
					x={noteCenterX(fretNum)}
					y={TOP_PAD - 10}
					text-anchor="middle"
					font-size="10"
					fill="var(--color-text-muted)"
					font-family="var(--font-mono)"
				>{fretNum}</text>
			{/each}

			<!-- ── Dot inlays ── -->
			<FretboardInlays
				inlayFrets={instrumentState.instrument.inlayFrets}
				doubleInlayFrets={instrumentState.instrument.doubleInlayFrets}
				{noteCenterX}
				topY={TOP_PAD - 6}
				bottomY={TOP_PAD + STRING_AREA_H + 6}
			/>

			<!-- ── Nut ── -->
			<rect
				x={LEFT_PAD - 5}
				y={TOP_PAD - 6}
				width="8"
				height={STRING_AREA_H + 12}
				fill="var(--nut-color)"
				rx="2"
			/>

			<!-- ── Fret wires ── -->
			{#each Array.from({ length: instrumentState.instrument.fretCount }, (_, i) => i + 1) as fret}
				<line
					x1={fretWireX(fret)}
					y1={TOP_PAD - 6}
					x2={fretWireX(fret)}
					y2={TOP_PAD + STRING_AREA_H + 6}
					stroke="var(--fret-metal)"
					stroke-width={fret === 12 ? 2 : 1.2}
				/>
			{/each}

			<!-- ── Capo indicator ── -->
			{#if instrumentState.capoFret > 0}
				<rect
					x={fretWireX(instrumentState.capoFret - 1) + 3}
					y={TOP_PAD - 6}
					width={fretWireX(instrumentState.capoFret) - fretWireX(instrumentState.capoFret - 1) - 6}
					height={STRING_AREA_H + 12}
					fill="rgba(193, 125, 60, 0.15)"
					stroke="var(--color-amber)"
					stroke-width="1.5"
					rx="3"
				/>
				<text
					x={(fretWireX(instrumentState.capoFret - 1) + fretWireX(instrumentState.capoFret)) / 2}
					y={TOP_PAD + STRING_AREA_H + 18}
					text-anchor="middle"
					font-size="9"
					fill="var(--color-amber)"
					font-family="var(--font-body)"
				>capo {instrumentState.capoFret}</text>
			{/if}

			<!-- ── Strings and notes ── -->
			{#each instrumentState.tuning.strings as stringConfig, idx}
				<FretboardString
					{stringConfig}
					positions={displayPositions[idx] ?? []}
					y={stringY(idx)}
					strokeWidth={stringStrokeWidth(idx)}
					nutX={LEFT_PAD}
					endX={VW - RIGHT_PAD}
					{noteCenterX}
					{fretWireX}
					noteRadius={NOTE_RADIUS}
					interactive={isInteractive}
					onNoteClick={handleNoteClick}
				/>
			{/each}

			<!-- ── Practice arrow ── -->
			{#if practiceArrow}
				<line
					x1={practiceArrow.x1}
					y1={practiceArrow.y1}
					x2={practiceArrow.x2}
					y2={practiceArrow.y2}
					stroke="var(--note-run-current)"
					stroke-width="2"
					stroke-opacity="0.6"
					marker-end="url(#arrow-tip)"
				/>
			{/if}
		{/if}
	</svg>
</div>

<style>
	.fretboard-wrap {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		border-radius: var(--radius-md);
	}

	.fretboard-wrap.rotated {
		overflow-x: hidden;
		overflow-y: auto;
		width: auto;
		flex: 1;
	}

	.fretboard-svg {
		width: 1600px;
		height: auto;
		min-width: 1600px;
		display: block;
	}

	.fretboard-wrap.rotated .fretboard-svg {
		width: auto;
		height: 1600px;
		min-width: unset;
		min-height: 560px;
		margin: 0 auto;
	}
</style>
