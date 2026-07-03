import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import AboutPage from "@/pages/AboutPage.vue";
import ExperiencePage from "@/pages/ExperiencePage.vue";
import ProjectsPage from "@/pages/ProjectsPage.vue";
import ConnectPage from "@/pages/ConnectPage.vue";
import NotFoundPage from "@/pages/404Page.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: LandingPage },
  { path: "/about", component: AboutPage },
  { path: "/experience", component: ExperiencePage },
  { path: "/projects", component: ProjectsPage },
  { path: "/connect", component: ConnectPage },
  { path: "/:pathMatch(.*)*", name: "404", component: NotFoundPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
