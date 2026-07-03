<script setup lang="ts">
import { h, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ClickSpark from "./component/ClickSpark/ClickSpark.vue";
import { usePortfolio } from "@/composables/usePortfolio";
import { getImageUrl } from "@/api/portfolio";

const { profile, fetchAll } = usePortfolio();

onMounted(() => {
    fetchAll();
});

const route = useRoute();
const dockItems = [
    { icon: () => h("i", { class: "pi pi-home" }), label: "Home", path: "/" },
    {
        icon: () => h("i", { class: "pi pi-user" }),
        label: "About",
        path: "/about",
    },
    {
        icon: () => h("i", { class: "pi pi-briefcase" }),
        label: "Experience",
        path: "/experience",
    },
    {
        icon: () => h("i", { class: "pi pi-folder" }),
        label: "Projects",
        path: "/projects",
    },
    {
        icon: () => h("i", { class: "pi pi-envelope" }),
        label: "Connect",
        path: "/connect",
    },
];
</script>

<template>
    <ClickSpark
        spark-color="#fe640b"
        :spark-size="12"
        :spark-radius="25"
        :spark-count="12"
        :duration="600"
        easing="ease-out"
        :extra-scale="1.2"
        class="click-spark min-h-screen w-full"
    >
        <div
            class="min-h-screen bg-background text-foreground relative pb-28 md:pb-0"
        >
            <RouterView />

            <!-- Global Dock Navigation -->
            <nav
                class="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4"
                aria-label="Main navigation"
            >
                <div
                    class="relative flex items-center justify-center w-full max-w-6xl"
                >
                    <div class="dock-shell">
                        <div class="dock-inner">
                            <RouterLink
                                v-for="item in dockItems"
                                :key="item.label"
                                :to="item.path"
                                custom
                                v-slot="{ navigate, isActive }"
                            >
                                <button
                                    class="dock-item"
                                    :class="{ 'dock-item--active': isActive }"
                                    :aria-label="item.label"
                                    :aria-current="
                                        isActive ? 'page' : undefined
                                    "
                                    @click="navigate"
                                >
                                    <span class="dock-icon"
                                        ><component :is="item.icon"
                                    /></span>
                                    <span class="dock-label">{{
                                        item.label
                                    }}</span>
                                    <span
                                        v-if="isActive"
                                        class="dock-pip"
                                        aria-hidden="true"
                                    />
                                </button>
                            </RouterLink>
                        </div>
                    </div>

                    <!-- Resume Button Extension -->
                    <a
                        v-if="profile?.resume"
                        :href="getImageUrl(profile.resume) ?? undefined"
                        download
                        class="resume-extension dock-shell"
                        title="Download Resume"
                    >
                        <div class="dock-inner">
                            <div class="dock-item">
                                <span class="dock-icon"
                                    ><i class="pi pi-file-pdf"
                                /></span>
                                <span class="dock-label">Resume</span>
                            </div>
                        </div>
                    </a>
                </div>
            </nav>
        </div>
    </ClickSpark>
</template>

<style scoped>
/* ── Resume Extension ── */
.resume-extension {
    position: absolute;
    right: 0;
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
    text-decoration: none;
}

@media (max-width: 768px) {
    .resume-extension {
        position: fixed;
        top: 20px;
        right: 20px;
        bottom: auto;
    }
}

/* ── Dock Shell ── */
.dock-shell {
    padding: 6px;
    border-radius: 24px;
    background: rgba(24, 24, 37, 0.7);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ── Dock Inner Row ── */
.dock-inner {
    display: flex;
    align-items: center;
    gap: 2px;
}

/* ── Individual Dock Item ── */
.dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition:
        background 0.2s ease,
        transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    outline: none;
    -webkit-tap-highlight-color: transparent;
}

.dock-item:hover {
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-4px) scale(1.08);
}

.dock-item:hover .dock-label {
    opacity: 1;
    transform: translateY(0);
    pointer-events: none;
}

.dock-item:active {
    transform: translateY(-2px) scale(1.02);
}

.dock-item:focus-visible {
    box-shadow: 0 0 0 2px var(--lavender);
}

/* ── Active State ── */
.dock-item--active {
    background: rgba(254, 100, 11, 0.12);
}

.dock-item--active .dock-icon {
    color: var(--peach);
}

.dock-item--active:hover {
    background: rgba(254, 100, 11, 0.18);
}

/* ── Icon ── */
.dock-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    color: var(--overlay2);
    transition: color 0.2s ease;
    line-height: 1;
}

.dock-item:hover .dock-icon {
    color: var(--text);
}

/* ── Tooltip Label ── */
.dock-label {
    position: absolute;
    bottom: calc(100% + 10px);
    font-family: "VT323", monospace;
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    color: var(--text);
    background: rgba(17, 17, 27, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 3px 10px;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ── Active Pip Indicator ── */
.dock-pip {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--peach);
    box-shadow: 0 0 6px var(--peach);
}

/* ── Mobile: slightly smaller ── */
@media (max-width: 480px) {
    .dock-item {
        width: 48px;
        height: 48px;
        border-radius: 15px;
    }

    .dock-icon {
        font-size: 1rem;
    }

    .dock-label {
        display: none; /* hide tooltips on mobile — no hover */
    }
}
</style>
