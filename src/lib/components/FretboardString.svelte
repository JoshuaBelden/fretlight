<script lang="ts">
	import type { FretPosition, StringConfig } from '$lib/instruments/types.js';
	import FretboardNote from './FretboardNote.svelte';

	let {
		stringConfig,
		positions,
		y,
		strokeWidth,
		nutX,
		endX,
		noteCenterX,
		fretWireX,
		noteRadius,
		interactive,
		onNoteClick,
		rotated = false
	}: {
		stringConfig: StringConfig;
		positions: Array<FretPosition | null>;
		y: number;
		strokeWidth: number;
		nutX: number;
		endX: number;
		noteCenterX: (fret: number) => number;
		fretWireX: (fret: number) => number;
		noteRadius: number;
		interactive: boolean;
		onNoteClick: (pos: FretPosition) => void;
		rotated?: boolean;
	} = $props();

	// For banjo 5th string: the string only starts at startFret
	let stringStartX = $derived(
		stringConfig.startFret > 0 ? fretWireX(stringConfig.startFret) : nutX
	);

	// Open string note position — left of nut (horizontal) or above nut (rotated)
	let openNoteX = $derived(nutX / 2);
</script>

{#if rotated}
	<!-- String line (vertical) -->
	<line
		x1={y}
		y1={stringStartX}
		x2={y}
		y2={endX}
		stroke="var(--string-color)"
		stroke-width={strokeWidth}
	/>

	<!-- Banjo 5th string: tuning peg indicator -->
	{#if stringConfig.startFret > 0}
		<circle
			cx={y}
			cy={fretWireX(stringConfig.startFret) - 1}
			r="5"
			fill="var(--fret-metal)"
			stroke="var(--color-bg)"
			stroke-width="1"
		/>
	{/if}

	<!-- Notes along this string -->
	{#each positions as pos, fret}
		{#if pos !== null && pos.active}
			{@const cy = fret === 0 ? openNoteX : noteCenterX(fret)}
			<FretboardNote
				{pos}
				cx={y}
				{cy}
				radius={noteRadius}
				{interactive}
				onclick={interactive ? onNoteClick : undefined}
			/>
		{/if}
	{/each}
{:else}
	<!-- String line (horizontal) -->
	<line
		x1={stringStartX}
		y1={y}
		x2={endX}
		y2={y}
		stroke="var(--string-color)"
		stroke-width={strokeWidth}
	/>

	<!-- Banjo 5th string: tuning peg indicator at startFret -->
	{#if stringConfig.startFret > 0}
		<circle
			cx={fretWireX(stringConfig.startFret) - 1}
			cy={y}
			r="5"
			fill="var(--fret-metal)"
			stroke="var(--color-bg)"
			stroke-width="1"
		/>
	{/if}

	<!-- Notes along this string -->
	{#each positions as pos, fret}
		{#if pos !== null && pos.active}
			{@const cx = fret === 0 ? openNoteX : noteCenterX(fret)}
			<FretboardNote
				{pos}
				{cx}
				cy={y}
				radius={noteRadius}
				{interactive}
				onclick={interactive ? onNoteClick : undefined}
			/>
		{/if}
	{/each}
{/if}
