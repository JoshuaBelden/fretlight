<script lang="ts">
	let {
		inlayFrets,
		doubleInlayFrets,
		noteCenterX,
		topY,
		bottomY
	}: {
		inlayFrets: number[];
		doubleInlayFrets: number[];
		noteCenterX: (fret: number) => number;
		topY: number;
		bottomY: number;
	} = $props();

	let midY = $derived((topY + bottomY) / 2);
	let quarterY = $derived(topY + (bottomY - topY) * 0.25);
	let threeQuarterY = $derived(topY + (bottomY - topY) * 0.75);
</script>

<!-- Single dot inlays -->
{#each inlayFrets as fret}
	<circle
		cx={noteCenterX(fret)}
		cy={midY}
		r="5"
		fill="var(--inlay-color)"
	/>
{/each}

<!-- Double dot inlays (at fret 12) -->
{#each doubleInlayFrets as fret}
	<circle cx={noteCenterX(fret)} cy={quarterY} r="5" fill="var(--inlay-color)" />
	<circle cx={noteCenterX(fret)} cy={threeQuarterY} r="5" fill="var(--inlay-color)" />
{/each}
