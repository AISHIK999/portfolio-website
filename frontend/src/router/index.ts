import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// Route components are lazy-loaded so the landing page doesn't ship the
// charting/animation libraries used by other pages.
const routes: RouteRecordRaw[] = [
  { path: "/", component: () => import("@/pages/LandingPage.vue") },
  { path: "/about", component: () => import("@/pages/AboutPage.vue") },
  {
    path: "/experience",
    component: () => import("@/pages/ExperiencePage.vue"),
  },
  { path: "/projects", component: () => import("@/pages/ProjectsPage.vue") },
  { path: "/connect", component: () => import("@/pages/ConnectPage.vue") },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("@/pages/404Page.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
