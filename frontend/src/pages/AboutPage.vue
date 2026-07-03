<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from "vue";
import { usePortfolio } from "@/composables/usePortfolio";
import { useAboutWidgets } from "@/composables/useAboutWidgets";
import { getImageUrl } from "@/api/portfolio";
import type { WakaChartItem, WakaLanguage } from "@/types/portfolio";
import FadeContent from "../component/FadeContent/FadeContent.vue";
import LogoLoop from "../component/LogoLoop/LogoLoop.vue";
import TiltedCard from "../component/TiltedCard/TiltedCard.vue";
import GradientText from "../component/GradientText/GradientText.vue";

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LineController,
    LinearScale,
    PointElement,
    CategoryScale,
    PieController,
    ArcElement,
    Filler,
    type ChartConfiguration,
} from "chart.js";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LineController,
    LinearScale,
    PointElement,
    CategoryScale,
    PieController,
    ArcElement,
    Filler,
);

const { profile, techStack, fetchAll, error } = usePortfolio();
const {
    nowPlaying,
    weather,
    wakaData,
    loadingNowPlaying,
    loadingWeather,
    loadingWaka,
    errorNowPlaying,
    errorWeather,
    errorWaka,
    fetchNowPlaying,
    fetchWeather,
    fetchWaka,
} = useAboutWidgets();

// ── Weather helpers ──────────────────────────────────────
function getWeatherDescription(code: number): string {
    if (code === 0) return "Clear sky";
    if (code <= 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code <= 49) return "Foggy";
    if (code <= 69) return "Rainy";
    if (code <= 79) return "Snowy";
    if (code <= 84) return "Rain showers";
    if (code <= 94) return "Thunderstorm";
    return "Thunderstorm";
}

function getWeatherEmoji(code: number): string {
    if (code === 0) return "☀️";
    if (code <= 2) return "⛅";
    if (code === 3) return "☁️";
    if (code <= 49) return "🌫️";
    if (code <= 69) return "🌧️";
    if (code <= 79) return "❄️";
    if (code <= 84) return "🌦️";
    if (code <= 94) return "⛈️";
    return "⛈️";
}

// ── Tech logos ───────────────────────────────────────────
const techLogos = computed(() =>
    techStack.value.map((item) => ({
        node: `<img width="48" height="48" src="${item.node}" />`,
        title: item.title,
        href: item.href,
    })),
);

// ── Chart ────────────────────────────────────────────────
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const pieCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: ChartJS | null = null;
let pieInstance: ChartJS | null = null;

function initChart() {
    if (!chartCanvas.value || !wakaData.value) return;
    const ctx = chartCanvas.value.getContext("2d");
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();

    const labels = wakaData.value.chart.map((item: WakaChartItem) =>
        new Date(item.range.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    );
    const values = wakaData.value.chart.map(
        (item: WakaChartItem) => parseFloat(item.grand_total.decimal) || 0,
    );

    chartInstance = new ChartJS(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Hours Coded",
                    data: values,
                    borderColor: "#fe640b",
                    backgroundColor: "rgba(254, 100, 11, 0.08)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: "#df8e1d",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1e1e2e",
                    titleColor: "#cdd6f4",
                    bodyColor: "#cdd6f4",
                    borderColor: "#313244",
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: { label: (ctx) => `${ctx.parsed.y} hours` },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#6c7086", font: { size: 10 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255,255,255,0.04)" },
                    ticks: {
                        color: "#6c7086",
                        font: { size: 10 },
                        callback: (v) => `${v}h`,
                    },
                },
            },
        },
    } as ChartConfiguration);
}

function initPieChart() {
    if (!pieCanvas.value || !wakaData.value?.languages) return;
    const ctx = pieCanvas.value.getContext("2d");
    if (!ctx) return;
    if (pieInstance) pieInstance.destroy();

    const style = getComputedStyle(document.documentElement);
    const catppuccinColors = [
        style.getPropertyValue("--peach").trim(),
        style.getPropertyValue("--mauve").trim(),
        style.getPropertyValue("--blue").trim(),
        style.getPropertyValue("--green").trim(),
        style.getPropertyValue("--yellow").trim(),
        style.getPropertyValue("--lavender").trim(),
        style.getPropertyValue("--sapphire").trim(),
        style.getPropertyValue("--red").trim(),
        style.getPropertyValue("--teal").trim(),
        style.getPropertyValue("--maroon").trim(),
    ];

    const langs = wakaData.value.languages.slice(0, 10); // Top 10
    const labels = langs.map((l: WakaLanguage) => l.name);
    const values = langs.map((l: WakaLanguage) => l.percent);
    const colors = langs.map(
        (l: WakaLanguage, i: number) =>
            catppuccinColors[i % catppuccinColors.length],
    );
    const texts = langs.map((l: WakaLanguage) => l.text);

    pieInstance = new ChartJS(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    borderColor: "rgba(30, 30, 46, 0.8)",
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "#cdd6f4",
                        font: { size: 10, family: "Share Tech Mono" },
                        usePointStyle: true,
                        padding: 15,
                    },
                },
                tooltip: {
                    backgroundColor: "#1e1e2e",
                    titleColor: "#cdd6f4",
                    bodyColor: "#cdd6f4",
                    borderColor: "#313244",
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => {
                            const index = context.dataIndex;
                            return ` ${values[index]}% (${texts[index]})`;
                        },
                    },
                },
            },
        },
    } as ChartConfiguration);
}

function updateCharts() {
    nextTick(() => {
        initChart();
        initPieChart();
    });
}

onMounted(async () => {
    fetchAll();
    fetchNowPlaying();
    fetchWeather();
    await fetchWaka();
    updateCharts();
});

watch(wakaData, (newData) => {
    if (newData) {
        updateCharts();
    }
});

onUnmounted(() => {
    chartInstance?.destroy();
    pieInstance?.destroy();
    chartInstance = null;
    pieInstance = null;
});
</script>

<template>
    <main
        class="min-h-screen relative px-4 md:px-8 pt-20 md:pt-16 pb-32 flex items-start justify-center"
    >
        <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            class="w-full max-w-6xl"
        >
            <!-- ── PAGE LABEL ── -->
            <div class="mb-8 text-center">
                <GradientText
                    :colors="['#fe640b', '#d20f39', '#df8e1d', '#e64553']"
                    :animationSpeed="6"
                    :showBorder="false"
                    class="pl-1 pr-1 heading-font text-xl sm:text-2xl md:text-3xl tracking-widest"
                >
                    ABOUT ME
                </GradientText>
            </div>

            <div class="bento-grid">
                <!-- ════════════════════════════════
                     ROW 1 — Identity: Avatar + Bio  (col 1-8)  |  Status (col 9-12)
                     ════════════════════════════════ -->

                <!-- Avatar + Bio card -->
                <section class="bento-card identity-card">
                    <div class="identity-inner">
                        <!-- Avatar -->
                        <div class="avatar-col" v-if="profile?.avatar">
                            <TiltedCard
                                :image-src="getImageUrl(profile.avatar)!"
                                alt-text="Profile photo"
                                caption-text="It's me!"
                                container-height="250px"
                                container-width="210px"
                                image-height="250px"
                                image-width="210px"
                                :rotate-amplitude="12"
                                :scale-on-hover="1.08"
                                :show-mobile-warning="false"
                                :show-tooltip="true"
                                :display-overlay-content="true"
                            >
                                <template #overlay>
                                    <div class="overlay-content highlight-font">
                                        AISHIK999
                                    </div>
                                </template>
                            </TiltedCard>
                        </div>
                        <!-- Avatar skeleton -->
                        <div v-else class="avatar-col avatar-skeleton" />

                        <!-- Bio -->
                        <div class="bio-col">
                            <p class="section-eyebrow">WHO AM I?</p>
                            <div
                                v-if="error"
                                class="flex flex-col items-center justify-center py-10 gap-2"
                            >
                                <p class="body-font text-red text-sm">
                                    {{ error }}
                                </p>
                                <button
                                    @click="fetchAll"
                                    class="text-xs underline text-peach"
                                >
                                    Retry
                                </button>
                            </div>
                            <div
                                v-else-if="profile"
                                class="bio-scroll hide-scrollbar"
                            >
                                <p class="bio-name highlight-font">
                                    {{ profile.name }}
                                    <span class="text-overlay1"> —</span>
                                </p>
                                <p class="bio-text body-font">
                                    {{ profile.bio }}
                                </p>
                            </div>
                            <div v-else class="bio-skeleton">
                                <div
                                    v-for="n in 5"
                                    :key="n"
                                    class="skel-line"
                                    :style="{ width: `${85 - n * 8}%` }"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Status / quick-facts card -->
                <section class="bento-card status-card">
                    <div class="status-inner">
                        <p class="section-eyebrow text-center">STATUS</p>

                        <div
                            v-if="profile?.tagline"
                            class="status-badge body-font"
                        >
                            <span class="status-dot" />
                            {{ profile.tagline }}
                        </div>

                        <!-- Location from weather -->
                        <div v-if="weather" class="status-row highlight-font">
                            <i class="pi pi-map-marker status-icon" />
                            <span>{{ weather.city }}</span>
                        </div>

                        <!-- Temp inline -->
                        <div v-if="weather" class="status-weather body-font">
                            <span class="weather-emoji">{{
                                getWeatherEmoji(weather.weathercode)
                            }}</span>
                            <span class="weather-temp"
                                >{{ weather.temperature }}°C</span
                            >
                            <span class="weather-desc">{{
                                getWeatherDescription(weather.weathercode)
                            }}</span>
                        </div>

                        <!-- Waka quick stat -->
                        <div v-if="wakaData" class="status-row highlight-font">
                            <i class="pi pi-code status-icon" />
                            <span>{{ wakaData.dailyAverage }}h / day</span>
                        </div>

                        <div
                            v-if="nowPlaying"
                            class="now-playing-mini body-font"
                        >
                            <img
                                v-if="nowPlaying?.album_art"
                                :src="nowPlaying.album_art"
                                :alt="nowPlaying.song"
                                class="np-mini-art"
                            />
                            <div class="np-mini-info">
                                <span class="np-mini-label">NOW PLAYING</span>
                                <span class="np-mini-song highlight-font">{{
                                    nowPlaying.song
                                }}</span>
                                <span class="np-mini-artist">{{
                                    nowPlaying.artist
                                }}</span>
                                <span
                                    v-if="nowPlaying.album"
                                    class="np-mini-album"
                                    >{{ nowPlaying.album }}</span
                                >
                            </div>
                            <div class="np-bars np-bars-mini">
                                <span /><span /><span /><span /><span />
                            </div>
                        </div>
                        <div
                            v-else-if="errorNowPlaying"
                            class="status-row body-font text-red text-[10px]"
                        >
                            <span>{{ errorNowPlaying }}</span>
                            <button
                                @click="() => fetchNowPlaying()"
                                class="underline ml-1"
                            >
                                Retry
                            </button>
                        </div>
                        <div v-else class="status-row body-font text-overlay0">
                            <i class="pi pi-volume-off status-icon" />
                            <span>No media playing</span>
                        </div>
                    </div>
                </section>

                <!-- ════════════════════════════════
                     ROW 2 — Tech Stack (full width)
                     ════════════════════════════════ -->
                <section class="bento-card tech-card">
                    <p class="section-eyebrow text-center mb-5">TECH STACK</p>
                    <LogoLoop
                        :logos="techLogos"
                        :speed="60"
                        direction="left"
                        :logoHeight="40"
                        :gap="32"
                        :pauseOnHover="true"
                        :scaleOnHover="true"
                        :fadeOut="true"
                        fadeOutColor="var(--color-background)"
                        ariaLabel="Technology stack"
                    />
                </section>

                <!-- ════════════════════════════════
                     ROW 3 — Waka Stats (3 cols)
                     ════════════════════════════════ -->
                <section class="bento-card stat-card stat-peach">
                    <div class="stat-top-bar stat-top-peach" />
                    <div v-if="loadingWaka" class="stat-skeleton">
                        <div class="skel-val" />
                        <div class="skel-label" />
                    </div>
                    <div
                        v-else-if="errorWaka"
                        class="flex flex-col items-center gap-2"
                    >
                        <p
                            class="text-[10px] text-red body-font text-center px-2"
                        >
                            {{ errorWaka }}
                        </p>
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-peach"
                        >
                            Retry
                        </button>
                    </div>
                    <template v-else-if="wakaData">
                        <span
                            class="stat-value highlight-font"
                            style="color: var(--peach)"
                        >
                            {{ wakaData.totalHours }} hrs
                        </span>
                        <span class="stat-label body-font">
                            spent programming<br />over
                            {{ wakaData.totalYears }} years
                        </span>
                    </template>
                    <div v-else class="flex flex-col items-center gap-2">
                        <span class="stat-value highlight-font text-overlay1"
                            >—</span
                        >
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-overlay1"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                <section class="bento-card stat-card stat-yellow">
                    <div class="stat-top-bar stat-top-yellow" />
                    <div v-if="loadingWaka" class="stat-skeleton">
                        <div class="skel-val" />
                        <div class="skel-label" />
                    </div>
                    <div
                        v-else-if="errorWaka"
                        class="flex flex-col items-center gap-2"
                    >
                        <p
                            class="text-[10px] text-red body-font text-center px-2"
                        >
                            {{ errorWaka }}
                        </p>
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-peach"
                        >
                            Retry
                        </button>
                    </div>
                    <template v-else-if="wakaData">
                        <span
                            class="stat-value highlight-font"
                            style="color: var(--yellow)"
                        >
                            {{ wakaData.dailyAverage }} hrs
                        </span>
                        <span class="stat-label body-font">
                            average<br />daily session
                        </span>
                    </template>
                    <div v-else class="flex flex-col items-center gap-2">
                        <span class="stat-value highlight-font text-overlay1"
                            >—</span
                        >
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-overlay1"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                <section class="bento-card stat-card stat-red">
                    <div class="stat-top-bar stat-top-red" />
                    <div v-if="loadingWaka" class="stat-skeleton">
                        <div class="skel-val" />
                        <div class="skel-label" />
                    </div>
                    <div
                        v-else-if="errorWaka"
                        class="flex flex-col items-center gap-2"
                    >
                        <p
                            class="text-[10px] text-red body-font text-center px-2"
                        >
                            {{ errorWaka }}
                        </p>
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-peach"
                        >
                            Retry
                        </button>
                    </div>
                    <template v-else-if="wakaData">
                        <span
                            class="stat-value highlight-font"
                            style="color: var(--maroon)"
                        >
                            {{ wakaData.pythonTime }} hrs
                        </span>
                        <span class="stat-label body-font">
                            spent in<br />Python
                        </span>
                    </template>
                    <div v-else class="flex flex-col items-center gap-2">
                        <span class="stat-value highlight-font text-overlay1"
                            >—</span
                        >
                        <button
                            @click="() => fetchWaka()"
                            class="text-[10px] underline text-overlay1"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                <section class="bento-card chart-card">
                    <div
                        class="chart-header flex flex-col items-center justify-center gap-2"
                    >
                        <p class="section-eyebrow text-center">
                            CODING ACTIVITY · ANALYTICS
                        </p>
                        <span class="wakatime-badge highlight-font w-fit"
                            >WakaTime</span
                        >
                    </div>
                    <div class="chart-grid">
                        <!-- Left: Line Chart -->
                        <div class="chart-col">
                            <p class="chart-sub-label body-font">
                                Last 7 Days (Hours)
                            </p>
                            <div class="chart-canvas-wrap">
                                <canvas ref="chartCanvas" />
                                <div
                                    v-if="loadingWaka && !wakaData"
                                    class="chart-loading body-font"
                                >
                                    Fetching...
                                </div>
                            </div>
                        </div>

                        <!-- Right: Pie Chart -->
                        <div class="chart-col">
                            <p class="chart-sub-label body-font">
                                Top 10 Languages (All Time)
                            </p>
                            <div class="chart-canvas-wrap">
                                <canvas ref="pieCanvas" />
                                <div
                                    v-if="loadingWaka && !wakaData"
                                    class="chart-loading body-font"
                                >
                                    Fetching...
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="chart-footer body-font">
                        "Consistency is the key to mastery."
                    </p>
                </section>
            </div>
        </FadeContent>
    </main>
</template>

<style scoped>
/* Row 1: Identity 8-col + Status 4-col */
.identity-card {
    grid-column: span 8;
    min-height: 260px;
}
.status-card {
    grid-column: span 4;
}

/* Row 2: Tech stack full width */
.tech-card {
    grid-column: span 12;
    padding: 1.5rem 1.75rem;
}

/* Row 3: Music 7-col + Weather 5-col */
.music-card {
    grid-column: span 7;
}
.weather-card {
    grid-column: span 5;
}

/* Row 4: 3 stat cards equal */
.stat-card {
    grid-column: span 4;
}

/* Row 5: Chart full width */
.chart-card {
    grid-column: span 12;
}

/* ════════════════════════════════════════════
   IDENTITY CARD
   ════════════════════════════════════════════ */
.identity-inner {
    display: flex;
    gap: 1.5rem;
    height: 100%;
    align-items: flex-start;
}

.avatar-col {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.avatar-skeleton {
    width: 210px;
    height: 250px;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    animation: pulse 1.8s ease-in-out infinite;
}

.bio-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-self: stretch;
}

.bio-scroll {
    flex: 1;
    overflow-y: auto;
    max-height: 250px;
    padding: 1rem 1rem 1rem 1.25rem;
    border-left: 2px solid rgba(254, 100, 11, 0.4);
    background: rgba(17, 17, 27, 0.4);
    border-radius: 0 0.75rem 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.bio-name {
    font-size: 0.9rem;
    color: var(--peach);
    letter-spacing: 0.05em;
    line-height: 1.4;
}

.bio-text {
    font-size: 1.25rem;
    color: var(--subtext1);
    line-height: 1.55;
}

.bio-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem;
}

.skel-line {
    height: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    animation: pulse 1.8s ease-in-out infinite;
}

/* ════════════════════════════════════════════
   STATUS CARD
   ════════════════════════════════════════════ */
.status-inner {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    height: 100%;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    background: rgba(64, 160, 43, 0.1);
    color: var(--green);
    border: 1px solid rgba(64, 160, 43, 0.2);
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 700;
    align-self: flex-start;
}

.status-dot {
    width: 0.45rem;
    height: 0.45rem;
    background: var(--green);
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse-dot 2s ease-in-out infinite;
}

.status-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: var(--subtext0);
    letter-spacing: 0.03em;
}

.status-icon {
    color: var(--overlay1);
    font-size: 0.75rem;
    flex-shrink: 0;
}

.status-weather {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.05rem;
    color: var(--subtext0);
}

.weather-emoji {
    font-size: 1.3rem;
    line-height: 1;
}
.weather-temp {
    color: var(--peach);
    font-size: 1.1rem;
    font-weight: 700;
    font-family: "Share Tech Mono", monospace;
}
.weather-desc {
    color: var(--overlay2);
}

/* Mini now-playing inside status card */
.now-playing-mini {
    margin-top: auto;
    padding: 0.75rem;
    background: rgba(223, 142, 29, 0.06);
    border: 1px solid rgba(223, 142, 29, 0.12);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.np-mini-art {
    width: 44px;
    height: 44px;
    border-radius: 0.5rem;
    object-fit: cover;
    flex-shrink: 0;
}

.np-mini-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.np-mini-label {
    font-size: 0.55rem;
    letter-spacing: 0.15em;
    color: var(--yellow);
    font-family: "Press Start 2P", system-ui;
    text-transform: uppercase;
    margin-bottom: 0.15rem;
}

.np-mini-song {
    font-size: 0.85rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: "Share Tech Mono", monospace;
    line-height: 1.2;
}

.np-mini-artist {
    font-size: 0.8rem;
    color: var(--subtext0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.np-mini-album {
    font-size: 0.75rem;
    color: var(--overlay1);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.np-bars-mini {
    height: 16px;
    gap: 2px;
}

.np-bars-mini span {
    width: 2px;
    background: var(--yellow);
}

/* ════════════════════════════════════════════
   STAT CARDS
   ════════════════════════════════════════════ */
.stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.5rem;
    min-height: 140px;
    padding: 1.5rem;
}

.stat-value {
    font-size: 1.9rem;
    font-family: "Share Tech Mono", monospace;
    line-height: 1;
}

.stat-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--subtext0);
    font-family: "Share Tech Mono", monospace;
    line-height: 1.5;
}

.stat-skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.skel-val {
    height: 2rem;
    width: 6rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    animation: pulse 1.8s ease-in-out infinite;
}
.skel-label {
    height: 0.75rem;
    width: 8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    animation: pulse 1.8s ease-in-out infinite 0.2s;
}

/* ════════════════════════════════════════════
   CHART CARD
   ════════════════════════════════════════════ */
.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
}

.wakatime-badge {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.7rem;
    padding: 0.25rem 0.7rem;
    background: rgba(254, 100, 11, 0.1);
    color: var(--peach);
    border: 1px solid rgba(254, 100, 11, 0.25);
    border-radius: 0.5rem;
    letter-spacing: 0.05em;
}

.chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.chart-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
}

.chart-sub-label {
    font-size: 0.75rem;
    color: var(--overlay1);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
}

.chart-canvas-wrap {
    position: relative;
    height: 240px;
    width: 100%;
}

.chart-canvas-wrap canvas {
    width: 100% !important;
    height: 100% !important;
}

@media (max-width: 768px) {
    .chart-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }
}

@media (min-width: 1024px) {
    .chart-canvas-wrap {
        height: 280px;
    }
}

.chart-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--subtext0);
    font-size: 1rem;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
}

.chart-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
    font-size: 1.25rem;
    color: var(--overlay0);
    font-style: italic;
    font-family: "VT323", monospace;
}

/* ════════════════════════════════════════════
   RESPONSIVE — collapse to single column stack
   ════════════════════════════════════════════ */
@media (max-width: 1024px) {
    .stat-card {
        grid-column: span 4;
    }
}

@media (max-width: 768px) {
    .identity-card {
        grid-column: span 12;
    }
    .status-card {
        grid-column: span 12;
    }

    .identity-inner {
        flex-direction: column;
        align-items: center;
    }

    .avatar-col {
        justify-content: center;
        width: 100%;
    }
    .bio-scroll {
        max-height: 180px;
    }

    .stat-card {
        grid-column: span 12;
    }
}

@media (max-width: 480px) {
    .bento-grid {
        gap: 0.875rem;
    }
    .bento-card {
        padding: 1.25rem;
        border-radius: 1.25rem;
    }
    .stat-value {
        font-size: 1.5rem;
    }
}

/* ════════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════════ */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
}

@keyframes pulse-dot {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(0.8);
    }
}
</style>
