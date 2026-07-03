import { ref } from "vue";
import {
  getProfile,
  getExperience,
  getProjects,
  getTechStack,
} from "@/api/portfolio";
import type {
  Profile,
  Experience,
  Project,
  TechStack,
} from "@/types/portfolio";

// ── Singleton state (module-level) ──────────────────────────────────────────
// These refs are created once when the module is first imported, and shared
// across every component that calls usePortfolio(). Navigating away and back
// does NOT reset them, so data is fetched only once per session.

const profile = ref<Profile | null>(null);
const experience = ref<Experience[]>([]);
const projects = ref<Project[]>([]);
const techStack = ref<TechStack[]>([]);
const loaded = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchAll(): Promise<void> {
  // Skip if already loaded or a fetch is already in-flight
  if (loaded.value || loading.value) return;

  loading.value = true;
  error.value = null;
  try {
    const [p, e, pr, t] = await Promise.all([
      getProfile(),
      getExperience(),
      getProjects(),
      getTechStack(),
    ]);
    profile.value = p.data;
    experience.value = e.data;
    projects.value = pr.data;
    techStack.value = t.data;
    loaded.value = true;
  } catch (err: any) {
    console.error("Failed to fetch portfolio data:", err);
    error.value = err.message || "Failed to load portfolio data";
  } finally {
    loading.value = false;
  }
}

// ── Composable (just exposes the shared state) ──────────────────────────────
export function usePortfolio() {
  return {
    profile,
    experience,
    projects,
    techStack,
    loading,
    loaded,
    error,
    fetchAll,
  };
}
