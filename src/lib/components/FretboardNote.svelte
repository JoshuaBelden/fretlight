<script lang="ts">
	import type { FretPosition } from '$lib/instruments/types.js';

	let {
		pos,
		cx,
		cy,
		radius = 11,
		interactive = false,
		onclick
	}: {
		pos: FretPosition;
		cx: number;
		cy: number;
		radius?: number;
		interactive?: boolean;
		onclick?: (pos: FretPosition) => void;
	} = $props();

	type RoleKey = 'root' | 'scale-tone' | 'chord-tone' | 'interval' | '';

	const ROLE_COLORS: Record<RoleKey, { fill: string; text: string }> = {
		root: { fill: 'var(--note-root)', text: 'var(--note-root-text)' },
		'scale-tone': { fill: 'var(--note-scale-tone)', text: 'var(--note-scale-text)' },
		'chord-tone': { fill: 'var(--note-chord-tone)', text: 'var(--note-chord-text)' },
		interval: { fill: 'var(--note-interval)', text: 'var(--note-interval-text)' },
		'': { fill: 'var(--note-inactive)', text: 'var(--note-inactive-text)' }
	};

	let colors = $derived(ROLE_COLORS[pos.role as RoleKey] ?? ROLE_COLORS['']);
	let opacity = $derived(pos.dimmed ? 0.25 : 1);
	let fontSize = $derived(pos.label.length > 2 ? 8 : pos.label.length === 2 ? 9 : 10);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<g
	class="fret-note"
	class:interactive
	style="opacity: {opacity}"
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : -1}
	aria-label={interactive ? `Note ${pos.note} at fret ${pos.fret}` : undefined}
	onclick={() => onclick?.(pos)}
	onkeydown={(e) => e.key === 'Enter' && onclick?.(pos)}
>
	<circle {cx} {cy} r={radius} fill={colors.fill} />
	{#if pos.label}
		<text
			x={cx}
			y={cy + 0.5}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size={fontSize}
			font-weight="600"
			font-family="var(--font-body)"
			fill={colors.text}
			pointer-events="none"
		>{pos.label}</text>
	{/if}
</g>

<style>
	.fret-note {
		cursor: default;
	}
	.fret-note.interactive {
		cursor: pointer;
	}
	.fret-note.interactive:hover circle {
		filter: brightness(1.2);
	}
</style>
