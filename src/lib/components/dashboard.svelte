<script lang="ts">
    let { stats, spans } = $props();

    import { BarChart, Tooltip } from "layerchart";
    import { PeriodType } from '@layerstack/utils';

    import { scaleTime } from "d3-scale";

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    function groupSpansByDay(spans: Span[]): Day[] {
        const days: { [key: string]: Day } = {};

        spans.forEach(span => {
            const dateKey = span.start_time.toISOString().split('T')[0];

            if (!days[dateKey]) {
                days[dateKey] = { 
                    date: new Date(dateKey), 
                    sessions: [] 
                };
            }
            days[dateKey].sessions.push(span);
        });

        // newest to oldest
        return Object.values(days).sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    const groupedSpans = $derived(groupSpansByDay(spans));

    const flatSpans = $derived(
        groupedSpans.flatMap(day => 
            day.sessions.map(span => ({
                start_time: span.start_time,
                end_time: span.end_time,
                duration: span.duration,
                day: day.date,
                formatted_duration: formatDuration(span.duration)
            }))
        )
    );
</script>

<div class="m-4 p-4 bg-ctp-surface0 rounded-lg shadow-md w-[75%]">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-ctp-lavender">Hackatime Stats</h2>
        <p><span class="text-ctp-mauve">Username:</span> {stats.username || ""} - ID {stats.user_id || ""}</p>
        <p class="mt-1"><span class="text-ctp-mauve">Total Time:</span> {stats.human_readable_total || ""}</p>
        <p class="mt-1 mb-3"><span class="text-ctp-mauve">Daily Average:</span> {stats.human_readable_daily_average || ""}</p>
    </div>

    <div class="bg-ctp-surface1 rounded p-1">
        <h3 class="text-lg font-bold text-ctp-lavender">Daily Activity</h3>
        <div class="h-[300px] p-4 border rounded-sm">
            <BarChart
                data={flatSpans}
                debug={true}
                x={["start_time", "end_time"]}
                xScale={scaleTime()}
                xNice={false}
                grid={{ y: true, bandAlign: "between" }}
                orientation="horizontal"
                y="day"
                cRange={[
                    "var(--color-success)",
                    "var(--color-danger)",
                    "var(--color-warning)",
                    "var(--color-info)",
                    "var(--color-secondary)",
                ]}
                c="day"
                props={{
                    xAxis: {
                        format: PeriodType.TimeOnly,
                    },
                    tooltip: {
                        context: { mode: "bounds" },
                    },
                }}
            />
            {#snippet tooltip({ context })}
            <Tooltip.Root>
                {#snippet children({ data })}
                <Tooltip.Header>{data.formatted_duration}</Tooltip.Header>
                <Tooltip.List>
                    <Tooltip.Item label="Start" value={data.start_time} format={PeriodType.TimeOnly} />
                    <Tooltip.Item label="End" value={data.end_time} format={PeriodType.TimeOnly} />
                </Tooltip.List>
                {/snippet}
            </Tooltip.Root>
            {/snippet}
        </div>
    </div>
</div>
