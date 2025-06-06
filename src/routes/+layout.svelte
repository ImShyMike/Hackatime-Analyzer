<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex flex-col min-h-screen bg-ctp-base">
	<div class="flex-grow">
		{@render children()}
	</div>
	<Footer />
</div>
