<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from "vue";
import { usePortfolio } from "@/composables/usePortfolio";
import { getImageUrl } from "@/api/portfolio";
import Aurora from "../component/Aurora/Aurora.vue";
import FadeContent from "../component/FadeContent/FadeContent.vue";
import RotatingText from "../component/RotatingText/RotatingText.vue";
const { profile, fetchAll, error } = usePortfolio();

const timeOpts = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
} as const;

const dateOpts = {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
} as const;

function formatTime() {
    return new Date().toLocaleTimeString("en-US", timeOpts);
}

function formatDate() {
    return new Date().toLocaleDateString("en-US", dateOpts);
}

const currentTime = ref("");
const currentDate = ref("");

let clockInterval: ReturnType<typeof setInterval> | null = null;

function updateClock() {
    currentTime.value = formatTime();
    currentDate.value = formatDate();
}

onMounted(() => {
    fetchAll();
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval);
});

const socialLinks = computed(() =>
    [
        { icon: "pi pi-github", href: profile.value?.github, label: "GitHub" },
        {
            icon: "pi pi-linkedin",
            href: profile.value?.linkedin,
            label: "LinkedIn",
        },
        {
            icon: "pi pi-envelope",
            href: profile.value?.email
                ? `mailto:${profile.value.email}`
                : undefined,
            label: "Email",
        },
        {
            icon: "pi pi-file-pdf",
            href: profile.value?.resume
                ? getImageUrl(profile.value.resume)
                : undefined,
            label: "Resume",
            download: true,
        },
    ].filter((link): link is typeof link & { href: string } =>
        Boolean(link.href),
    ),
);
</script>

<template>
    <main
        class="relative h-dvh text-text overflow-hidden overscroll-none p-4 md:p-8 flex items-center justify-center"
    >
        <!-- Background Aurora -->
        <div
            class="aurora-container fixed inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        >
            <Aurora
                :color-stops="['#d20f39', '#df8e1d', '#40a02b']"
                :amplitude="0.5"
                :blend="0.5"
                :speed="0.2"
                :intensity="0.8"
                class="w-full h-full opacity-30"
            />
        </div>

        <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            class="w-full max-w-6xl z-10"
        >
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <!-- Identity Card -->
                <section class="identity-card md:col-span-8">
                    <div
                        v-if="error"
                        class="flex flex-col items-center justify-center h-full gap-4"
                    >
                        <p class="body-font text-red">{{ error }}</p>
                        <button @click="fetchAll" class="social-link">
                            Retry
                        </button>
                    </div>
                    <div
                        v-else-if="profile"
                        class="flex flex-col gap-5 md:gap-6"
                    >
                        <div>
                            <h1 class="identity-name heading-font">
                                {{ profile.name }}
                            </h1>
                            <div class="identity-role body-font">
                                <span>I'm a</span>
                                <RotatingText
                                    v-if="profile.roles?.length"
                                    :texts="profile.roles"
                                    :rotationInterval="3000"
                                    :staggerDuration="0.05"
                                    mainClassName="text-peach"
                                />
                            </div>
                        </div>

                        <!-- Social Links -->
                        <div class="flex flex-wrap gap-3">
                            <a
                                v-for="link in socialLinks"
                                :key="link.label"
                                :href="link.href"
                                :target="link.download ? undefined : '_blank'"
                                :rel="
                                    link.download
                                        ? undefined
                                        : 'noopener noreferrer'
                                "
                                :download="link.download || undefined"
                                class="social-link"
                                :title="link.label"
                                :aria-label="link.label"
                            >
                                <i
                                    :class="[link.icon, 'text-lg']"
                                    aria-hidden="true"
                                />
                                <span class="social-link-label body-font">{{
                                    link.label
                                }}</span>
                            </a>
                        </div>
                    </div>

                    <!-- Skeleton while loading -->
                    <div v-else class="flex flex-col gap-4 animate-pulse">
                        <div class="h-16 w-3/4 bg-white/5 rounded-xl" />
                        <div class="h-8 w-1/2 bg-white/5 rounded-xl" />
                        <div class="mt-8 flex gap-3">
                            <div
                                v-for="n in 4"
                                :key="n"
                                class="h-12 w-12 bg-white/5 rounded-full"
                            />
                        </div>
                    </div>
                </section>

                <!-- Time & Status Card -->
                <section class="time-card md:col-span-4">
                    <span class="time-label body-font">Local Time</span>
                    <div class="time-display highlight-font">
                        {{ currentTime }}
                    </div>
                    <div class="time-date body-font">{{ currentDate }}</div>

                    <div v-if="profile?.tagline" class="status-badge body-font">
                        <span class="status-dot" aria-hidden="true" />
                        {{ profile.tagline }}
                    </div>
                </section>
            </div>
        </FadeContent>
    </main>
</template>

<style scoped>
/* ── Cards shared base ── */
.identity-card,
.time-card {
    background: rgba(24, 24, 37, 0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 2.5rem;
    transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.identity-card:hover,
.time-card:hover {
    border-color: rgba(254, 100, 11, 0.2);
    box-shadow: 0 0 32px rgba(254, 100, 11, 0.04);
}

/* ── Identity ── */
.identity-card {
    min-height: 350px;
    overflow: hidden;
}

.identity-name {
    font-size: clamp(1.75rem, 5vw, 4.5rem);
    line-height: 1.1; /* was 0.9 – gives space between wrapped lines */
    letter-spacing: -0.02em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    word-break: break-word;
    overflow-wrap: break-word;
}

.identity-role {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: clamp(1.1rem, 2.5vw, 1.75rem);
    color: var(--overlay2);
    font-weight: 500;
    flex-wrap: wrap;
}

/* ── Social Links ── */
.social-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    color: var(--overlay2);
    text-decoration: none;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.social-link:hover {
    background: rgba(254, 100, 11, 0.1);
    border-color: rgba(254, 100, 11, 0.3);
    color: var(--peach);
    transform: translateY(-2px);
}

.social-link-label {
    font-size: 0.9rem;
    letter-spacing: 0.03em;
}

/* ── Time Card ── */
.time-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.25rem;
}

.time-label {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 0.8rem;
    color: var(--overlay0);
    font-weight: 700;
    line-height: 1;
}

.time-display {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--text);
}

.time-date {
    color: var(--overlay1);
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1;
}

/* ── Status Badge ── */
.status-badge {
    margin-top: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    background: rgba(64, 160, 43, 0.1);
    color: var(--green);
    border: 1px solid rgba(64, 160, 43, 0.2);
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1;
}

.status-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: var(--green);
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(0.85);
    }
}

/* ── Mobile adjustments ── */
@media (max-width: 768px) {
    .identity-card,
    .time-card {
        padding: 1.5rem;
    }

    .identity-card {
        min-height: auto;
    }

    .time-card {
        min-height: auto;
    }
}
</style>
