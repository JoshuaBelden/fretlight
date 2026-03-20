<script lang="ts">
	let {
		inlayFrets,
		doubleInlayFrets,
		noteCenterX,
		topY,
		bottomY,
		rotated = false
	}: {
		inlayFrets: number[];
		doubleInlayFrets: number[];
		noteCenterX: (fret: number) => number;
		topY: number;
		bottomY: number;
		rotated?: boolean;
	} = $props();

	let midY = $derived((topY + bottomY) / 2);
	let quarterY = $derived(topY + (bottomY - topY) * 0.25);
	let threeQuarterY = $derived(topY + (bottomY - topY) * 0.75);
</script>

{#if rotated}
	<!-- Single dot inlays (rotated: cx=midX, cy=fretCenter) -->
	{#each inlayFrets as fret}
		<circle cx={midY} cy={noteCenterX(fret)} r="5" fill="var(--inlay-color)" />
	{/each}
	<!-- Double dot inlays (rotated) -->
	{#each doubleInlayFrets as fret}
		<circle cx={quarterY} cy={noteCenterX(fret)} r="5" fill="var(--inlay-color)" />
		<circle cx={threeQuarterY} cy={noteCenterX(fret)} r="5" fill="var(--inlay-color)" />
	{/each}
{:else}
	<!-- Single dot inlays -->
	{#each inlayFrets as fret}
		<circle cx={noteCenterX(fret)} cy={midY} r="5" fill="var(--inlay-color)" />
	{/each}
	<!-- Double dot inlays (at fret 12) -->
	{#each doubleInlayFrets as fret}
		<circle cx={noteCenterX(fret)} cy={quarterY} r="5" fill="var(--inlay-color)" />
		<circle cx={noteCenterX(fret)} cy={threeQuarterY} r="5" fill="var(--inlay-color)" />
	{/each}
{/if}
