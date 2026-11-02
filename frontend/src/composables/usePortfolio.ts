import { computed, ref } from "vue";
import {
    getExperience,
    getProfile,
    getProjects,
    getTechStack,
} from "@/api/portfolio";
import type {
    Experience,
    Profile,
    Project,
    TechStack,
} from "@/types/portfolio";

// ── Singleton state (module-level) ──────────────────────────────────────────
// Created once when the module is first imported and shared across every
// component that calls usePortfolio(). Navigating away and back does NOT reset
// them, so each resource is fetched only once per session.

const profile = ref<Profile | null>(null);
const experience = ref<Experience[]>([]);
const projects = ref<Project[]>([]);
const techStack = ref<TechStack[]>([]);

// Per-resource load flags. Tracks "request finished" rather than "array is
// non-empty", because an empty experience/project list is a valid response.
const profileLoaded = ref(false);
const experienceLoaded = ref(false);
const projectsLoaded = ref(false);
const techStackLoaded = ref(false);

// Per-resource loading/error state so one failing endpoint doesn't blank
// unrelated pages.
const loadingProfile = ref(false);
const loadingExperience = ref(false);
const loadingProjects = ref(false);
const loadingTechStack = ref(false);

const errorProfile = ref<string | null>(null);
const errorExperience = ref<string | null>(null);
const errorProjects = ref<string | null>(null);
const errorTechStack = ref<string | null>(null);

// In-flight promises. If two components ask for the same resource at the same
// time (e.g. App.vue + the current route), they share one network request.
let profilePromise: Promise<void> | null = null;
let experiencePromise: Promise<void> | null = null;
let projectsPromise: Promise<void> | null = null;
let techStackPromise: Promise<void> | null = null;

function errorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

// ── Fetchers ────────────────────────────────────────────────────────────────

async function fetchProfile(force = false): Promise<void> {
    if (profilePromise) return profilePromise;
    if (profileLoaded.value && !force) return;

    loadingProfile.value = true;
    errorProfile.value = null;
    profilePromise = (async () => {
        try {
            profile.value = (await getProfile()).data;
            profileLoaded.value = true;
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            errorProfile.value = errorMessage(err, "Failed to load profile");
        } finally {
            loadingProfile.value = false;
            profilePromise = null;
        }
    })();

    return profilePromise;
}

async function fetchExperience(force = false): Promise<void> {
    if (experiencePromise) return experiencePromise;
    if (experienceLoaded.value && !force) return;

    loadingExperience.value = true;
    errorExperience.value = null;
    experiencePromise = (async () => {
        try {
            experience.value = (await getExperience()).data;
            experienceLoaded.value = true;
        } catch (err) {
            console.error("Failed to fetch experience:", err);
            errorExperience.value = errorMessage(
                err,
                "Failed to load experience",
            );
        } finally {
            loadingExperience.value = false;
            experiencePromise = null;
        }
    })();

    return experiencePromise;
}

async function fetchProjects(force = false): Promise<void> {
    if (projectsPromise) return projectsPromise;
    if (projectsLoaded.value && !force) return;

    loadingProjects.value = true;
    errorProjects.value = null;
    projectsPromise = (async () => {
        try {
            projects.value = (await getProjects()).data;
            projectsLoaded.value = true;
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            errorProjects.value = errorMessage(err, "Failed to load projects");
        } finally {
            loadingProjects.value = false;
            projectsPromise = null;
        }
    })();

    return projectsPromise;
}

async function fetchTechStack(force = false): Promise<void> {
    if (techStackPromise) return techStackPromise;
    if (techStackLoaded.value && !force) return;

    loadingTechStack.value = true;
    errorTechStack.value = null;
    techStackPromise = (async () => {
        try {
            techStack.value = (await getTechStack()).data;
            techStackLoaded.value = true;
        } catch (err) {
            console.error("Failed to fetch tech stack:", err);
            errorTechStack.value = errorMessage(
                err,
                "Failed to load tech stack",
            );
        } finally {
            loadingTechStack.value = false;
            techStackPromise = null;
        }
    })();

    return techStackPromise;
}

/**
 * Fetch every resource. Only use this when a page genuinely needs all of them.
 * Prefer the per-resource fetchers so first paint only waits on what it shows.
 */
async function fetchAll(force = false): Promise<void> {
    await Promise.allSettled([
        fetchProfile(force),
        fetchExperience(force),
        fetchProjects(force),
        fetchTechStack(force),
    ]);
}

// ── Aggregate state (kept for convenience/backwards compatibility) ──────────
const loading = computed(
    () =>
        loadingProfile.value ||
        loadingExperience.value ||
        loadingProjects.value ||
        loadingTechStack.value,
);

const loaded = computed(
    () =>
        profileLoaded.value &&
        experienceLoaded.value &&
        projectsLoaded.value &&
        techStackLoaded.value,
);

const error = computed(
    () =>
        errorProfile.value ||
        errorExperience.value ||
        errorProjects.value ||
        errorTechStack.value,
);

// ── Composable ──────────────────────────────────────────────────────────────
export function usePortfolio() {
    return {
        // state
        profile,
        experience,
        projects,
        techStack,
        loading,
        loaded,
        error,

        // per-resource state
        loadingProfile,
        loadingExperience,
        loadingProjects,
        loadingTechStack,
        errorProfile,
        errorExperience,
        errorProjects,
        errorTechStack,

        // loaders
        fetchProfile,
        fetchExperience,
        fetchProjects,
        fetchTechStack,
        fetchAll,
    };
}
