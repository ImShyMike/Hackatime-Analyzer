<script lang="ts">
	import Dashboard from '$lib/components/Dashboard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { Toast } from 'flowbite-svelte';

	let userId = $state('');
	let lastUserId = $state<string | null>(null);
	let errorMessage = $state('');
	let fetching = $state(false);
	let fetchedStats = $state<UserStats>({});
	let fetchedSpans = $state<Span[]>([]);

	const hackatimeIdRegex = /\b[1-9]\d*\b/;
	const slackIdRegex = /\b[UW][A-Z0-9]{8,}\b/;
	const hasLetters = (str: string): boolean => /[a-zA-Z]/.test(str);

	async function fetchUrl(url: string) {
		const response = await fetch(`https://corsproxy.io/?${url}`);

		const data = await response.json();
		return data;
	}

	async function loadStatsData() {
		const data = await fetchUrl(
			`https://hackatime.hackclub.com/api/v1/users/${userId}/stats?features=a`
		);

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

		if (userId === lastUserId) {
			console.log('Data already fetched for this user.');
			return;
		}

		lastUserId = userId;

		if (!hackatimeIdRegex.test(userId) && !slackIdRegex.test(userId)) {
			errorMessage = `Invalid ${hasLetters(userId) ? 'Slack' : 'Hackatime'} account ID!`;
			setTimeout(() => {
				errorMessage = '';
			}, 3000);
			return;
		}

		fetching = true;
		fetchedStats = await loadStatsData();
		fetchedSpans = await loadSpansData();
		fetching = false;
	}
</script>

<main class="bg-ctp-base flex min-h-screen flex-col items-center justify-center pt-10">
	<h1 class="text-ctp-mauve mb-4 pt-6 text-5xl font-bold">Hackatime Analyzer</h1>
	<p class="text-ctp-text mt-2">Easily analyze hackatime data in your browser!</p>
	<form onsubmit={loadUserData} class="flex flex-row items-center">
		<input
			type="text"
			placeholder="Hackatime/Slack user ID"
			bind:value={userId}
			class="border-ctp-mauve bg-ctp-base text-ctp-text mt-4 mr-3 rounded border p-2"
		/>
		<button
			disabled={fetching}
			class="bg-ctp-mauve text-ctp-base hover:bg-ctp-mauve/80 mt-4 cursor-pointer rounded px-5 py-2"
		>
			<div class="flex items-center justify-center">
				{#if fetching}
					<svg class="mr-3 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>Loading...</span>
				{:else}
					<span>Analyze</span>
				{/if}
			</div>
		</button>
	</form>
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
	<Footer />
</main>
