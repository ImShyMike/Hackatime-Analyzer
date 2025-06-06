<script lang="ts">
	import Dashboard from '../lib/components/Dashboard.svelte';
	import { Toast } from 'flowbite-svelte';

	let userId = $state('');
	let errorMessage = $state('');
	let fetching = $state(false);
	let fetchedStats = $state<UserStats>({});
	let fetchedSpans = $state<Span[]>([]);

	async function fetchUrl(url: string) {
		const response = await fetch(`https://corsproxy.io/?${url}`);

		if (!response.ok) {
			console.error('Failed to fetch data:', response.statusText);
			errorMessage = `User does not exist!`;
			setTimeout(() => {
				errorMessage = '';
			}, 3000);
			return;
		}

		const data = await response.json();
		return data;
	}

	async function loadStatsData() {
		const data = await fetchUrl(
			`https://hackatime.hackclub.com/api/v1/users/${userId}/stats?features=a`
		);

		console.log('Fetched stats data:', data);

		if (!data) return;

		if (!data.data || data.data.length === 0) {
			console.error('No stats found for the user.');
			return;
		}

		return data.data;
	}

	async function loadSpansData() {
		const data = await fetchUrl(
			`https://hackatime.hackclub.com/api/v1/users/${userId}/heartbeats/spans`
		);

		console.log('Fetched spans data:', data);

		if (!data) return;

		if (!data.spans || data.spans.length === 0) {
			console.error('No spans found for the user.');
			return;
		}

		return data.spans.map((span: any) => ({
			start_time: new Date(span.start_time * 1000),
			end_time: new Date(span.end_time * 1000),
			duration: span.duration
		}));
	}

	async function loadUserData() {
		if (!userId) {
			console.error('User ID is required.');
			return;
		}

		fetching = true;
		fetchedStats = await loadStatsData();
		fetchedSpans = await loadSpansData();
		fetching = false;
	}
</script>

<main class="bg-ctp-base flex flex-col items-center justify-center pt-10">
	<h1 class="text-ctp-mauve mb-4 text-5xl font-bold">Hackatime Analyzer</h1>
	<p class="text-ctp-text mt-2">Easily analyze hackatime data in your browser!</p>
	<input
		type="text"
		placeholder="Hackatime/Slack user ID"
		bind:value={userId}
		class="border-ctp-mauve bg-ctp-base text-ctp-text mt-4 rounded border p-2"
	/>
	<button
		disabled={fetching}
		onclick={() => loadUserData()}
		class="bg-ctp-mauve text-ctp-base hover:bg-ctp-mauve/80 mt-4 cursor-pointer rounded px-4 py-2"
		>Analyze</button
	>
	{#if Object.keys(fetchedStats).length > 0}
		<Dashboard stats={fetchedStats} spans={fetchedSpans} />
	{/if}
	{#if errorMessage}
		<div class="fixed top-5 right-5 z-50">
			<Toast dismissable={false} class="bg-ctp-crust border-ctp-red rounded-lg border-2 shadow-lg">
				<div class="mr-3 text-sm font-normal">
					<span class="text-ctp-red mb-1 block font-semibold">Error</span>
					<p class="text-ctp-text">{errorMessage}</p>
				</div>
			</Toast>
		</div>
	{/if}
</main>
