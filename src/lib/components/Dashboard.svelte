<script lang="ts">
  let { stats, spans } = $props();

  let filterMode = $state("Last 7 days");
  let isOpen = $state(false);
  let seriesData = $state<number[]>([]);
  let categories = $state<string[]>([]);
  let isDataLoaded = $state(false);
  let options = $state<ApexOptions>({
    chart: {
      height: "400px",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false
      },
      toolbar: {
        show: true
      }
    },
    tooltip: {
      enabled: true,
      x: {
        show: true
      },
      y: {
        formatter: (value: number) => formatDuration(value || 0)
      },
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif"
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 6
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0
      }
    },
    series: [
      {
        name: "Time Spent",
        data: [] as number[],
        color: "#a6e3a1"
      }
    ],
    xaxis: {
      categories: [] as string[],
      labels: {
        show: true,
        style: {
          colors: "#74c7ec"
        }
      },
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: true
      }
    },
    yaxis: {
      show: false
    }
  });

  import { Chart, A, Button, Dropdown, DropdownItem } from "flowbite-svelte";
  import { ChevronRightOutline, ChevronDownOutline } from "flowbite-svelte-icons";
  import { type ApexOptions } from "apexcharts";

  const filterOptions = [
    "Yesterday",
    "Today",
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "All time"
  ];

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemainder = Math.floor(seconds % 60);
    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${secondsRemainder}s`;
  }

  function groupSpansByDay(spans: Span[]): Day[] {
    const days: { [key: string]: Day } = {};

    if (spans.length === 0) return [];

    let minDate = new Date(spans[0].start_time);
    let maxDate = new Date(spans[0].start_time);

    spans.forEach((span) => {
      if (span.start_time < minDate) minDate = new Date(span.start_time);
      if (span.start_time > maxDate) maxDate = new Date(span.start_time);
    });

    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      days[dateKey] = {
        date: new Date(currentDate),
        sessions: []
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    spans.forEach((span) => {
      const dateKey = span.start_time.toISOString().split("T")[0];
      if (days[dateKey]) {
        days[dateKey].sessions.push(span);
      } else {
        days[dateKey] = {
          date: new Date(span.start_time),
          sessions: [span]
        };
      }
    });

    // newest to oldest
    return Object.values(days).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  function groupSpansByHour(spans: Span[]): Hour[] {
    const hours: { [key: string]: Hour } = {};

    let referenceDate: Date;
    if (spans.length > 0) {
      referenceDate = new Date(spans[0].start_time);
    } else {
      referenceDate = new Date();
    }

    referenceDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );

    for (let hour = 0; hour < 24; hour++) {
      const currentTime = new Date(referenceDate);
      currentTime.setHours(hour);

      const hourKey = `${currentTime.toISOString().split("T")[0]} ${hour}`;
      hours[hourKey] = {
        hour: new Date(currentTime),
        sessions: []
      };
    }

    spans.forEach((span) => {
      const hourOfDay = span.start_time.getHours();
      const dateKey = span.start_time.toISOString().split("T")[0];
      const hourKey = `${dateKey} ${hourOfDay}`;

      if (hours[hourKey]) {
        hours[hourKey].sessions.push(span);
      }
    });

    return Object.values(hours).sort((a, b) => b.hour.getHours() - a.hour.getHours());
  }

  function filterSpansByMode(mode: string, allSpans: Span[]): Span[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (mode) {
      case "Today":
        return allSpans.filter((span) => span.start_time >= today);

      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dayAfter = new Date(yesterday);
        dayAfter.setDate(dayAfter.getDate() + 1);
        return allSpans.filter(
          (span) => span.start_time >= yesterday && span.start_time < dayAfter
        );
      }

      case "Last 7 days": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return allSpans.filter((span) => span.start_time >= sevenDaysAgo);
      }

      case "Last 30 days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return allSpans.filter((span) => span.start_time >= thirtyDaysAgo);
      }

      case "Last 90 days": {
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return allSpans.filter((span) => span.start_time >= ninetyDaysAgo);
      }

      case "All time":
      default:
        return allSpans;
    }
  }

  function groupSpans(spans: Span[]): Day[] | Hour[] {
    if (isHourFilter()) {
      return groupSpansByHour(spans);
    } else {
      return groupSpansByDay(spans);
    }
  }

  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }

  function formatHour(hour: Date): string {
    const hours = hour.getHours().toString().padStart(2, "0");
    const minutes = hour.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  export function calculateData(currentFilter: string) {
    if (!spans || spans.length === 0) {
      console.log("No spans data available");
      return;
    }

    isDataLoaded = true;

    const filteredSpans = filterSpansByMode(currentFilter, spans);
    const filteredGroupedDays = groupSpans(filteredSpans);
    const sortedDays = [...filteredGroupedDays].reverse();

    const newSeriesData: number[] = [];
    const newCategories: string[] = [];

    sortedDays.forEach((day) => {
      const totalSeconds = day.sessions.reduce((total, span) => {
        const startTime = span.start_time.getTime();
        const endTime = span.end_time ? span.end_time.getTime() : new Date().getTime();
        const durationSeconds = Math.floor((endTime - startTime) / 1000);
        return total + durationSeconds;
      }, 0);

      const formattedDate = "hour" in day ? formatHour(day.hour) : formatDate(day.date);
      newSeriesData.push(totalSeconds);
      newCategories.push(formattedDate);
    });

    seriesData = newSeriesData;
    categories = newCategories;

    options = {
      chart: {
        height: "400px",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false
        },
        toolbar: {
          show: true
        }
      },
      tooltip: {
        enabled: true,
        x: {
          show: true
        },
        y: {
          formatter: (value) => formatDuration(value || 0)
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 6
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0
        }
      },
      series: [
        {
          name: "Time Spent",
          data: newSeriesData,
          color: "#a6e3a1"
        }
      ],
      xaxis: {
        categories: newCategories,
        labels: {
          show: true,
          style: {
            colors: "#74c7ec"
          }
        },
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        }
      },
      yaxis: {
        show: false
      }
    };
  }

  let spanDataLoaded = false;
  let prevSpansLength = 0;

  $effect(() => {
    if (spans && spans.length > 0) {
      if (spans.length !== prevSpansLength) {
        prevSpansLength = spans.length;
        spanDataLoaded = false;
      }

      if (!spanDataLoaded) {
        spanDataLoaded = true;
        calculateData(filterMode);
      }
    }
  });

  function handleFilterChange(newFilter: string) {
    filterMode = newFilter;
    isOpen = false;
    calculateData(newFilter);
  }

  function isHourFilter(): boolean {
    return filterMode === "Today" || filterMode === "Yesterday";
  }
</script>

<div class="bg-ctp-surface0 mt-6 w-[75%] rounded p-4">
  <div class="flex justify-between">
    <h3 class="text-ctp-lavender pb-2 text-2xl font-bold">
      {stats.username || ""} - ID {stats.user_id || ""}
    </h3>
    <div
      class="text-ctp-blue-500 dark:text-ctp-blue-500 flex items-center px-2.5 py-0.5 text-center text-base font-semibold"
    >
      {isHourFilter() ? "Hourly" : "Daily"} Data
    </div>
  </div>
  <div class="flex justify-between">
    <div>
      <h5 class="text-3xl leading-none font-bold text-gray-900 dark:text-white">
        {formatDuration(seriesData.reduce((sum, current) => sum + current, 0)) || ""}
      </h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">{filterMode}</p>
    </div>
  </div>
  {#if isDataLoaded && seriesData.length > 0}
    <Chart {options} />
  {:else}
    <div class="flex h-[400px] items-center justify-center">
      <p class="ml-2 text-gray-500">Loading chart data...</p>
    </div>
  {/if}
  <div
    class="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between pt-5">
      <Button
        class="inline-flex cursor-pointer items-center bg-transparent py-0 text-center text-sm font-medium text-gray-500 hover:bg-transparent hover:text-gray-900 focus:ring-transparent dark:bg-transparent dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white dark:focus:ring-transparent"
        >{filterMode}<ChevronDownOutline class="m-2.5 ms-1.5 w-2.5" /></Button
      >
      <Dropdown bind:isOpen class="w-40" offset={10}>
        {#each filterOptions as option}
          <DropdownItem
            class="hover:bg-ctp-surface1 w-[100%] pl-3 text-left"
            onclick={() => handleFilterChange(option)}>{option}</DropdownItem
          >
        {/each}
      </Dropdown>
      <A
        href="https://hackatime.hackclub.com"
        target="_blank"
        class="hover:text-primary-700 dark:hover:text-primary-500 rounded-lg px-3 py-2 text-sm font-semibold uppercase hover:bg-gray-100 hover:no-underline dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
      >
        Hackatime
        <ChevronRightOutline class="ms-1.5 h-2.5 w-2.5" />
      </A>
    </div>
  </div>
</div>
