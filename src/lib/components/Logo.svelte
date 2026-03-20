<script lang="ts">
	let { size = 40 }: { size?: number } = $props();
</script>

<img src="/logo.png" alt="FretLight" width={size} height={size} class="logo" />

<style>
	.logo {
		object-fit: contain;
		display: block;
	}
</style>
