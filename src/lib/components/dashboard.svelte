<script lang="ts">
    let { stats, spans } = $props();

    import Span from "../../routes/+page.svelte";
    
    interface Day {
        date: Date;
        sessions: Span[];
    }

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
</script>

<div class="m-4 p-4 bg-ctp-surface0 rounded-lg shadow-md w-[75%]">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-ctp-lavender">Hackatime Stats</h2>
        <p><span class="text-ctp-mauve">Username:</span> {stats.username || ""} - ID {stats.user_id || ""}</p>
        <p class="mt-1"><span class="text-ctp-mauve">Total Time:</span> {stats.human_readable_total || ""}</p>
        <p class="mt-1 mb-3"><span class="text-ctp-mauve">Daily Average:</span> {stats.human_readable_daily_average || ""}</p>
    </div>
</div>
