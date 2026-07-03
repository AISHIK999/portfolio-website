<script setup lang="ts">
import { onMounted, computed } from "vue";
import { usePortfolio } from "@/composables/usePortfolio";
import FadeContent from "../component/FadeContent/FadeContent.vue";
import GradientText from "../component/GradientText/GradientText.vue";
import StarBorder from "../component/StarBorder/StarBorder.vue";
import CountUp from "../component/CountUp/CountUp.vue";
import ShinyText from "../component/ShinyText/ShinyText.vue";
import PageBackground from "../component/PageBackground.vue";

const { experience, fetchAll, error } = usePortfolio();

onMounted(fetchAll);

// Group experiences by company
const groupedExperience = computed(() => {
    const groups: Record<string, any[]> = {};

    experience.value?.forEach((exp: any) => {
        const key = exp.company;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(exp);
    });

    return Object.entries(groups)
        .map(([company, roles]) => ({
            company,
            roles: roles.sort(
                (a, b) =>
                    new Date(b.start_date).getTime() -
                    new Date(a.start_date).getTime(),
            ),
            startDate: roles[roles.length - 1].start_date,
            endDate: roles[0].end_date || "Present",
        }))
        .sort(
            (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
        );
});

const currentExperience = computed(() => {
    return (
        experience.value?.find((exp) => !exp.end_date) || experience.value?.[0]
    );
});

const totalYears = computed(() => {
    if (!experience.value || !experience.value.length) return 0;

    const startDates = experience.value.map((e) =>
        new Date(e.start_date).getTime(),
    );
    const first = new Date(Math.min(...startDates));
    const now = new Date();

    // Calculate total months to be more precise for "years"
    let months = (now.getFullYear() - first.getFullYear()) * 12;
    months -= first.getMonth();
    months += now.getMonth();

    const years = Math.max(0, Math.floor(months / 12));
    const fraction = (months % 12) / 12;

    return parseFloat((years + fraction).toFixed(1));
});

const totalCompanies = computed(() => {
    return new Set(experience.value?.map((e) => e.company)).size;
});
</script>

<template>
    <main
        class="min-h-screen relative px-4 md:px-8 pt-20 md:pt-16 pb-32 flex items-start justify-center"
    >
        <!-- Background Aurora -->
        <PageBackground :intensity="0.4" :opacity="20" />

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
                    EXPERIENCE
                </GradientText>
            </div>

            <div
                v-if="error"
                class="flex flex-col items-center justify-center py-20 gap-4"
            >
                <p class="body-font text-red">{{ error }}</p>
                <button
                    @click="fetchAll"
                    class="star-border-btn px-6 py-2 bg-peach/10 border border-peach/20 rounded-full text-peach"
                >
                    Retry
                </button>
            </div>

            <div v-else class="bento-grid">
                <!-- ════════════════════════════════
                     ROW 1 — Summary & Current Role
                     ════════════════════════════════ -->

                <!-- Summary Card -->
                <section class="bento-card summary-card">
                    <div class="summary-inner">
                        <p class="section-eyebrow text-center sm:text-left font-bold">CAREER STATS</p>

                        <div v-if="experience && experience.length" class="stats-container items-center sm:items-start">
                            <div class="stat-item items-center sm:items-start">
                                <CountUp
                                    :to="totalYears"
                                    :duration="2"
                                    class="stat-value highlight-font text-peach"
                                />
                                <span class="stat-label body-font text-center sm:text-left"
                                    >YEARS EXP</span
                                >
                            </div>
                            <div class="stat-item items-center sm:items-start">
                                <CountUp
                                    :to="totalCompanies"
                                    :duration="1.5"
                                    class="stat-value highlight-font text-yellow"
                                />
                                <span class="stat-label body-font text-center sm:text-left"
                                    >COMPANIES</span
                                >
                            </div>
                            <div class="stat-item items-center sm:items-start">
                                <CountUp
                                    :to="experience.length"
                                    :duration="1.5"
                                    class="stat-value highlight-font text-green"
                                />
                                <span class="stat-label body-font text-center sm:text-left">ROLES</span>
                            </div>
                        </div>

                        <div class="quote-box">
                            <p class="body-font italic text-overlay1 text-sm">
                                "The only way to do great work is to love what
                                you do."
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Current Role Highlight -->
                <section class="bento-card current-card">
                    <p class="section-eyebrow text-center sm:text-left font-bold mb-2 md:mb-4">CURRENT POSITION</p>
                    <div v-if="currentExperience" class="mt-2 md:mt-4">
                        <StarBorder
                            as="div"
                            color="var(--peach)"
                            speed="4s"
                            :thickness="2"
                            customClass="w-full !p-0 !rounded-2xl"
                        >
                            <div class="current-content p-5 sm:p-6 text-left">
                                <div class="flex items-center gap-4 mb-4">
                                    <div
                                        class="heading-font w-12 h-12 rounded-xl bg-peach/10 border border-peach/20 flex items-center justify-center text-xl font-bold text-peach"
                                    >
                                        {{
                                            currentExperience.company.charAt(0)
                                        }}
                                    </div>
                                    <div>
                                        <h2
                                            class="highlight-font text-xl font-bold text-text"
                                        >
                                            {{ currentExperience.role }}
                                        </h2>
                                        <ShinyText
                                            :text="currentExperience.company"
                                            :color="'var(--peach)'"
                                            :shineColor="'var(--yellow)'"
                                            class="highlight-font font-bold"
                                        />
                                    </div>
                                </div>
                                <p class="body-font text-xl text-subtext1">
                                    {{ currentExperience.description }}
                                </p>
                                <div
                                    class="mt-4 flex items-center gap-2 text-sm highlight-font text-overlay2"
                                >
                                    <i class="pi pi-calendar" />
                                    <span
                                        >{{ currentExperience.start_date }} —
                                        Present</span
                                    >
                                </div>
                            </div>
                        </StarBorder>
                    </div>
                    <div v-else class="animate-pulse flex flex-col gap-4">
                        <div class="h-10 w-1/2 bg-white/5 rounded-lg" />
                        <div class="h-32 w-full bg-white/5 rounded-xl" />
                    </div>
                </section>

                <!-- ════════════════════════════════
                     ROW 2 — Full Timeline
                     ════════════════════════════════ -->
                <section class="bento-card timeline-card">
                    <p class="section-eyebrow text-center sm:text-left font-bold mb-6 pb-3">CAREER TIMELINE</p>

                    <div class="timeline-container">
                        <div
                            v-for="(group, gIndex) in groupedExperience"
                            :key="group.company"
                            class="timeline-group"
                        >
                            <div class="company-block">
                                <div class="company-header">
                                    <div class="company-info">
                                        <h3
                                            class="highlight-font text-xl text-text font-bold"
                                        >
                                            {{ group.company }}
                                        </h3>
                                        <span
                                            class="body-font text-sm text-overlay1"
                                        >
                                            {{ group.startDate }} —
                                            {{ group.endDate }}
                                        </span>
                                    </div>
                                    <div class="company-line" />
                                </div>

                                <div class="roles-list pl-6">
                                    <div
                                        v-for="(role, rIndex) in group.roles"
                                        :key="role.id"
                                        class="role-item"
                                    >
                                        <div class="role-marker" />
                                        <div class="role-card">
                                            <div class="role-meta">
                                                <h4
                                                    class="highlight-font text-peach font-bold"
                                                >
                                                    {{ role.role }}
                                                </h4>
                                                <span
                                                    class="body-font text-overlay2 text-sm"
                                                >
                                                    {{ role.start_date }} —
                                                    {{
                                                        role.end_date ??
                                                        "Present"
                                                    }}
                                                </span>
                                            </div>
                                            <p
                                                class="body-font text-subtext0 mt-2 text-xl"
                                            >
                                                {{ role.description }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </FadeContent>
    </main>
</template>

<style scoped>
/* ── Bento Grid base (matches AboutPage.vue) ── */

/* ── Grid Placements ── */
.summary-card {
    grid-column: span 4;
}

.current-card {
    grid-column: span 8;
}

.timeline-card {
    grid-column: span 12;
}

/* ── Summary Card ── */
.summary-inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
}

.stats-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 2.5rem;
    line-height: 1;
}

.stat-label {
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: var(--overlay1);
    text-transform: uppercase;
}

.quote-box {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ── Current Role ── */

.current-content {
    background: transparent !important;
    border: none !important;
}

/* ── Timeline ── */
.timeline-container {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.company-block {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.company-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.company-info {
    flex-shrink: 0;
}

.company-line {
    flex-grow: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(254, 100, 11, 0.3), transparent);
}

.roles-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border-left: 2px solid rgba(255, 255, 255, 0.05);
}

.role-item {
    position: relative;
    padding-left: 1.5rem;
}

.role-marker {
    position: absolute;
    left: -0.4rem;
    top: 0.5rem;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: var(--surface2);
    border: 2px solid var(--mantle);
    transition: all 0.3s ease;
}

.role-item:hover .role-marker {
    background: var(--peach);
    box-shadow: 0 0 10px var(--peach);
}

.role-card {
    background: rgba(17, 17, 27, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    padding: 1.25rem;
    transition: all 0.3s ease;
}

.role-card:hover {
    background: rgba(17, 17, 27, 0.6);
    border-color: rgba(254, 100, 11, 0.1);
    transform: translateX(4px);
}

.role-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.5rem;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
    .summary-card,
    .current-card {
        grid-column: span 12;
    }
}

@media (max-width: 768px) {
    .role-meta {
        flex-direction: column;
    }

    .stat-value {
        font-size: 2rem;
    }

    .bento-card {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .bento-card {
        padding: 0.75rem;
    }
}
</style>
