<script lang="ts">
	let { width = 200 }: { width?: number } = $props();
</script>

<img src="/logo.png" alt="FretLight" width={width} class="logo" />

<style>
	.logo {
		object-fit: contain;
		display: block;
		height: auto;
	}
</style>
