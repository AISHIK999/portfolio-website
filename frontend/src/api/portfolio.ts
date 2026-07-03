import axios from "axios";
import type {
  Profile,
  Experience,
  Project,
  TechStack,
  ContactForm,
} from "@/types/portfolio";

const BASE = import.meta.env.VITE_API_BASE_URL;

export const getProfile = () => axios.get<Profile>(`${BASE}/profile/`);
export const getTechStack = () => axios.get<TechStack[]>(`${BASE}/tech-stack/`);
export const getExperience = () =>
  axios.get<Experience[]>(`${BASE}/experience/`);
export const getProjects = () => axios.get<Project[]>(`${BASE}/projects/`);
export const sendContact = (data: ContactForm) =>
  axios.post(`${BASE}/contact/`, data);

const WAKA_BASE = import.meta.env.VITE_WAKA_BASE_URL;
const WAKA_CHART_ID = import.meta.env.WAKA_CHART_ID;
const WAKA_STATS_ID = import.meta.env.WAKA_STATS_ID;
const WAKA_LANGS_ID = import.meta.env.WAKA_LANGS_ID;

export const getWakaChart = () =>
  axios.get(`${WAKA_BASE}/${WAKA_CHART_ID}.json`);

export const getWakaStats = () =>
  axios.get(`${WAKA_BASE}/${WAKA_STATS_ID}.json`);

export const getWakaLanguages = () =>
  axios.get(`${WAKA_BASE}/${WAKA_LANGS_ID}.json`);

/**
 * Image path fix:
 * If image is relative path (e.g. "/media/projects/img.jpg"),
 * prefix with backend BASE URL if not already absolute.
 */
export function getImageUrl(path: string | null) {
  if (!path) return null;

  // If the path contains an absolute URL, extract and return it
  const httpsIndex = path.indexOf("https://");
  if (httpsIndex !== -1) {
    return path.substring(httpsIndex);
  }
  const httpIndex = path.indexOf("http://");
  if (httpIndex !== -1) {
    return path.substring(httpIndex);
  }

  if (path.startsWith("//") || path.startsWith("data:")) return path;

  const backendBase = import.meta.env.VITE_BACKEND_BASE_URL;
  if (!backendBase) return path;
  const separator =
    backendBase.endsWith("/") || path.startsWith("/") ? "" : "/";
  return `${backendBase}${separator}${path}`;
}
