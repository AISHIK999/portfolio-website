<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePortfolio } from "@/composables/usePortfolio";
import { sendContact } from "@/api/portfolio";
import PageBackground from "../component/PageBackground.vue";
import FadeContent from "../component/FadeContent/FadeContent.vue";
import GradientText from "../component/GradientText/GradientText.vue";

const { profile, fetchAll } = usePortfolio();
onMounted(fetchAll);

const form = ref({ name: "", email: "", message: "" });
const status = ref<"success" | "error" | null>(null);
const loading = ref(false);

async function handleSubmit() {
    loading.value = true;
    try {
        await sendContact(form.value);
        status.value = "success";
        form.value = { name: "", email: "", message: "" };
    } catch {
        status.value = "error";
    } finally {
        loading.value = false;
    }
}

const socialLinks = computed(() =>
    [
        { icon: "pi pi-github", href: profile.value?.github, label: "GitHub" },
        {
            icon: "pi pi-linkedin",
            href: profile.value?.linkedin,
            label: "LinkedIn",
        },
    ].filter((link) => Boolean(link.href)),
);
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
                    CONNECT
                </GradientText>
            </div>

            <div class="bento-grid">
                <!-- ════════════════════════════════
                     CONTACT INFO & SOCIALS
                     ════════════════════════════════ -->
                <section class="bento-card info-card">
                    <p class="section-eyebrow mb-6">GET IN TOUCH</p>

                    <div class="info-content mb-8">
                        <h2
                            class="highlight-font text-2xl font-bold text-text mb-4"
                        >
                            Let's build something
                            <span class="text-peach">amazing</span>.
                        </h2>
                        <p class="body-font text-subtext1 text-lg">
                            Have a question, a project idea, or just want to
                            chat? I'm always open to new opportunities and
                            interesting conversations.
                        </p>
                    </div>

                    <div class="contact-methods flex flex-col gap-4 mb-8">
                        <div v-if="profile?.email" class="method-item">
                            <i class="pi pi-envelope text-peach" />
                            <div class="flex flex-col">
                                <span
                                    class="body-font text-xs text-overlay1 uppercase tracking-wider"
                                    >Email</span
                                >
                                <a
                                    :href="`mailto:${profile.email}`"
                                    class="highlight-font text-text hover:text-peach transition"
                                >
                                    {{ profile.email }}
                                </a>
                            </div>
                        </div>
                    </div>

                    <p class="section-eyebrow mb-4 pb-2">SOCIALS</p>
                    <div class="social-links-grid">
                        <a
                            v-for="link in socialLinks"
                            :key="link.label"
                            :href="link.href!"
                            target="_blank"
                            class="social-tile"
                            :title="link.label"
                        >
                            <i :class="link.icon" />
                            <span class="body-font text-xs">{{
                                link.label
                            }}</span>
                        </a>
                    </div>
                </section>

                <!-- ════════════════════════════════
                     MESSAGE FORM
                     ════════════════════════════════ -->
                <section class="bento-card form-card">
                    <p class="section-eyebrow mb-6">SEND A MESSAGE</p>

                    <form @submit.prevent="handleSubmit" class="connect-form">
                        <div class="form-group">
                            <label
                                class="body-font text-xs text-overlay1 uppercase tracking-wider mb-2 block"
                                >Name</label
                            >
                            <input
                                v-model="form.name"
                                type="text"
                                placeholder="A Skywalker"
                                required
                                class="form-input highlight-font"
                            />
                        </div>

                        <div class="form-group">
                            <label
                                class="body-font text-xs text-overlay1 uppercase tracking-wider mb-2 block"
                                >Email</label
                            >
                            <input
                                v-model="form.email"
                                type="email"
                                placeholder="ihatesand@tatooine.org"
                                required
                                class="form-input highlight-font"
                            />
                        </div>

                        <div class="form-group">
                            <label
                                class="body-font text-xs text-overlay1 uppercase tracking-wider mb-2 block"
                                >Message</label
                            >
                            <textarea
                                v-model="form.message"
                                placeholder="I don’t like sand. It’s coarse and rough irritating and it gets everywhere. "
                                rows="4"
                                required
                                class="form-input highlight-font resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            :disabled="loading"
                            class="submit-btn group"
                        >
                            <span
                                class="relative z-10 flex items-center justify-center gap-2"
                            >
                                {{
                                    loading ? "TRANSMITTING..." : "SEND MESSAGE"
                                }}
                                <i
                                    v-if="!loading"
                                    class="pi pi-send text-xs transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </span>
                        </button>
                    </form>

                    <div v-if="status" class="mt-6 status-msg" :class="status">
                        <div
                            v-if="status === 'success'"
                            class="flex items-center gap-3 text-green"
                        >
                            <i class="pi pi-check-circle" />
                            <span class="body-font"
                                >Message received! I'll get back to you
                                soon.</span
                            >
                        </div>
                        <div
                            v-if="status === 'error'"
                            class="flex items-center gap-3 text-red"
                        >
                            <i class="pi pi-exclamation-circle" />
                            <span class="body-font"
                                >Transmission failed. Please try again.</span
                            >
                        </div>
                    </div>
                </section>
            </div>
        </FadeContent>
    </main>
</template>

<style scoped>
/* ── Bento Grid ── */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;
    width: 100%;
}

.bento-card {
    background: rgba(24, 24, 37, 0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 2rem;
    transition: all 0.3s ease;
    overflow: hidden;
}

.bento-card:hover {
    border-color: rgba(254, 100, 11, 0.2);
    box-shadow: 0 0 32px rgba(254, 100, 11, 0.04);
}

.section-eyebrow {
    font-family: "Press Start 2P", system-ui;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--overlay0);
    line-height: 1;
}

/* ── Grid Placements ── */
.info-card {
    grid-column: span 5;
}
.form-card {
    grid-column: span 7;
}

/* ── Info Card ── */
.method-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
}

.social-links-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.social-tile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    color: var(--overlay2);
    transition: all 0.3s ease;
}

.social-tile:hover {
    background: rgba(254, 100, 11, 0.1);
    border-color: rgba(254, 100, 11, 0.2);
    color: var(--peach);
    transform: translateY(-2px);
}

/* ── Form ── */
.connect-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-input {
    width: 100%;
    background: rgba(17, 17, 27, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    color: var(--text);
    transition: all 0.3s ease;
    outline: none;
}

.form-input:focus {
    border-color: var(--peach);
    background: rgba(17, 17, 27, 0.6);
    box-shadow: 0 0 15px rgba(254, 100, 11, 0.1);
}

.form-input::placeholder {
    color: var(--overlay0);
    opacity: 0.5;
}

.submit-btn {
    position: relative;
    padding: 1rem;
    border-radius: 1rem;
    background: var(--peach);
    color: var(--mantle);
    font-family: "VT323", monospace;
    font-size: 1.25rem;
    font-weight: bold;
    letter-spacing: 0.05em;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
    background: var(--yellow);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(254, 100, 11, 0.2);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--surface2);
    color: var(--overlay0);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
    .info-card,
    .form-card {
        grid-column: span 12;
    }
}

@media (max-width: 480px) {
    .bento-card {
        padding: 1.25rem;
    }
    .social-links-grid {
        grid-template-columns: 1fr;
    }
}
</style>
