<script lang="ts">
	import type { FretPosition } from '$lib/instruments/types.js';
	import { instrumentState } from '$lib/stores/instrument.svelte.js';
	import { displayState } from '$lib/stores/display.svelte.js';
	import { buildFretboardNotes, getActivePositions } from '$lib/music/fretboard.js';
	import FretboardString from './FretboardString.svelte';
	import FretboardInlays from './FretboardInlays.svelte';

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

	// ── Fret position math ────────────────────────────────────

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

	function stringY(idx: number): number {
		const sc = instrumentState.instrument.stringCount;
		const spacing = STRING_AREA_H / (sc - 1);
		return TOP_PAD + idx * spacing;
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

	let activePositions = $derived(
		getActivePositions(allPositions, displayState.mode, displayState.selection)
	);

	let fretNumbers = $derived(
		[1, 3, 5, 7, 9, 12, 15, 17, 19, 21].filter(
			(f) => f <= instrumentState.instrument.fretCount
		)
	);

	// ── Click handler ─────────────────────────────────────────

	function handleNoteClick(pos: FretPosition) {
		if (displayState.mode === 'interval') {
			displayState.setIntervalRoot(pos.note, pos.stringIndex, pos.fret);
		}
	}

	let isInteractive = $derived(displayState.mode === 'interval');
</script>

<div class="fretboard-wrap">
	<svg
		viewBox="0 0 {VW} {VH}"
		xmlns="http://www.w3.org/2000/svg"
		class="fretboard-svg"
		aria-label="Guitar fretboard"
		role="img"
	>
		<defs>
			<linearGradient id="rosewood" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#4a1510" />
				<stop offset="40%" stop-color="#3d1008" />
				<stop offset="60%" stop-color="#3a0e06" />
				<stop offset="100%" stop-color="#4a1510" />
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
		</defs>

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
				font-family="var(--font-display)"
			>capo {instrumentState.capoFret}</text>
		{/if}

		<!-- ── Strings and notes ── -->
		{#each instrumentState.tuning.strings as stringConfig, idx}
			<FretboardString
				{stringConfig}
				positions={activePositions[idx] ?? []}
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
	</svg>
</div>

<style>
	.fretboard-wrap {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		border-radius: var(--radius-md);
	}

	.fretboard-svg {
		width: 100%;
		height: auto;
		min-width: 560px;
		display: block;
	}
</style>
