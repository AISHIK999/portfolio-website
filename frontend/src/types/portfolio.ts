export interface Profile {
  id: number;
  name: string;
  roles: string[];
  tagline: string;
  bio: string;
  avatar: string | null;
  github: string;
  linkedin: string;
  email: string;
  resume: string | null;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
  order: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  image: string | null;
  featured: boolean;
  order: number;
}

export interface TechStack {
  id: number;
  node: string;
  title: string;
  href: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface WakaChartItem {
  grand_total: {
    decimal: string;
    digital: string;
    hours: number;
    minutes: number;
    text: string;
    total_seconds: number;
  };
  range: {
    date: string;
    end: string;
    start: string;
    text: string;
  };
}

export interface WakaLanguage {
  name: string;
  percent: number;
  total_seconds: number;
  text: string;
}
