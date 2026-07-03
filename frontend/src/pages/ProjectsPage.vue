<script setup lang="ts">
import { onMounted, computed } from "vue";
import { usePortfolio } from "@/composables/usePortfolio";
import { getImageUrl } from "@/api/portfolio";
import FadeContent from "../component/FadeContent/FadeContent.vue";
import GradientText from "../component/GradientText/GradientText.vue";
import BorderGlow from "../component/BorderGlow/BorderGlow.vue";
import PageBackground from "../component/PageBackground.vue";

const { projects, fetchAll, error } = usePortfolio();

onMounted(fetchAll);

const sortedProjects = computed(() => {
    if (!projects.value) return [];
    return [...projects.value].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.order || 0) - (a.order || 0);
    });
});
</script>

<template>
    <main
        class="min-h-screen relative px-4 md:px-8 pt-20 md:pt-16 pb-32 flex items-start justify-center"
    >
        <!-- Background Aurora -->
        <PageBackground :intensity="0.3" :opacity="20" />

        <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            class="w-full max-w-6xl z-10"
        >
            <!-- ── PAGE LABEL ── -->
            <div class="mb-8 text-center">
                <GradientText
                    :colors="['#fe640b', '#d20f39', '#df8e1d', '#e64553']"
                    :animationSpeed="6"
                    :showBorder="false"
                    class="pl-1 pr-1 heading-font text-xl sm:text-2xl md:text-3xl tracking-widest"
                >
                    PROJECTS
                </GradientText>
            </div>

            <div
                v-if="error"
                class="flex flex-col items-center justify-center py-20 gap-4"
            >
                <p class="body-font text-red">{{ error }}</p>
                <button
                    @click="fetchAll"
                    class="icon-link w-auto px-6 rounded-full"
                >
                    Retry
                </button>
            </div>

            <div v-else class="projects-grid">
                <div
                    v-for="(project, index) in sortedProjects"
                    :key="project.id"
                    class="project-item h-full"
                >
                    <BorderGlow
                        :borderRadius="24"
                        glowColor="40 80 80"
                        backgroundColor="rgba(24, 24, 37)"
                        :glowIntensity="0.4"
                        class="h-full project-card-glow"
                    >
                        <div class="project-card-inner h-full flex flex-col">
                            <img
                                v-if="project.image"
                                :src="getImageUrl(project.image)!"
                                :alt="project.title"
                                class="project-thumb"
                                @error="
                                    (e: any) =>
                                        (e.target.style.display = 'none')
                                "
                            />
                            <div v-else class="project-thumb-placeholder" />

                            <div class="p-5 flex flex-col flex-1">
                                <div
                                    class="flex justify-between items-start mb-2"
                                >
                                    <h3
                                        class="highlight-font text-xl text-text font-bold"
                                    >
                                        {{ project.title }}
                                    </h3>
                                    <span
                                        v-if="project.featured"
                                        class="featured-tag"
                                        >FEATURED</span
                                    >
                                </div>
                                <p
                                    class="body-font text-subtext0 text-lg mb-4 description-scroll"
                                >
                                    {{ project.description }}
                                </p>

                                <div class="flex flex-wrap gap-1.5 mb-6">
                                    <span
                                        v-for="tech in project.tech_stack"
                                        :key="tech"
                                        class="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-overlay1"
                                    >
                                        {{ tech }}
                                    </span>
                                </div>

                                <div class="flex gap-3 mt-auto pt-4">
                                    <a
                                        v-if="project.github_url"
                                        :href="project.github_url"
                                        target="_blank"
                                        class="icon-link"
                                        title="GitHub"
                                    >
                                        <i class="pi pi-github" />
                                    </a>
                                    <a
                                        v-if="project.live_url"
                                        :href="project.live_url"
                                        target="_blank"
                                        class="icon-link"
                                        title="Live Demo"
                                    >
                                        <i class="pi pi-external-link" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </BorderGlow>
                </div>
            </div>
        </FadeContent>
    </main>
</template>

<style scoped>
.projects-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    width: 100%;
}

.project-card-glow {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

/*Can you change the code above such that the glow is a bit lesser*/

.project-card-glow:hover {
    transform: translateY(-8px);
}

.project-card-inner {
    background: transparent;
    border-radius: 1.5rem;
    overflow: hidden;
    height: 100%;
    min-height: 480px; /* Ensure enough height for all content */
}

.description-scroll {
    max-height: 6.5rem; /* roughly 4 lines at text-lg, adjust as needed */
    overflow-y: auto;
    padding-right: 4px; /* avoid text touching the scrollbar */
}

/* Optional: slim, theme-matching scrollbar instead of default browser bar */
.description-scroll::-webkit-scrollbar {
    width: 4px;
}

.description-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.description-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
}

.description-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}

.project-thumb {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.project-thumb-placeholder {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, var(--surface0), var(--surface1));
}

.featured-tag {
    font-family: "Press Start 2P", system-ui;
    font-size: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: rgba(254, 100, 11, 0.1);
    color: var(--peach);
    border: 1px solid rgba(254, 100, 11, 0.2);
    border-radius: 4px;
}

.icon-link {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--overlay2);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-link:hover {
    background: var(--peach);
    color: var(--mantle);
    transform: scale(1.1) rotate(5deg);
    border-color: var(--peach);
    box-shadow: 0 0 15px rgba(254, 100, 11, 0.3);
}

/* ── Responsive ── */
@media (max-width: 1200px) {
    .projects-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .projects-grid {
        grid-template-columns: 1fr;
    }

    .project-card-inner {
        min-height: auto;
    }
}
</style>
