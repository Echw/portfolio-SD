import type { ImageMetadata } from 'astro';
import goldnatImage from '../assets/goldnat.webp';
import mlynImage from '../assets/mlyn.webp';

export interface Project {
  id: string;
  name: string;
  description: string;
  contributions: string[];
  image: ImageMetadata;
  imageAlt: string;
  imagePosition: string;
  url: string;
  caseStudyHref?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  summary?: string;
}

export interface HeroHeadline {
  lines: [string, string];
}

export const heroHeadlines: HeroHeadline[] = [
  { lines: ['Full-Stack', 'Developer'] },
  { lines: ['Web applications.', 'AI tools.'] },
];

export const profile = {
  name: 'Damian Stojaniuk',
  role: 'Senior Full-Stack Developer · AI/LLM',
  heroDescription: 'Senior full-stack developer working with AI.',
  email: 'stojaniuk.damian@gmail.com',
  linkedin: 'https://www.linkedin.com/in/dstojaniuk',
  linkedinLabel: 'linkedin.com/in/dstojaniuk',
  description:
    'Damian Stojaniuk — senior full-stack developer building web applications, AI integrations and developer tools with TypeScript, React and Node.js.',
  about: {
    start: 'I build applications from user interfaces to APIs and integrations. My recent work focuses on',
    highlight: 'AI features',
    end: 'and developer tools.',
    personal: 'Away from the keyboard: guitar, DIY effects and microcontrollers.',
  },
};

export const projects: Project[] = [
  {
    id: 'goldnat',
    name: 'Goldnat',
    description: "I built Goldnat's website and adapted Payload CMS to its sales workflow, including tailored vehicle selections and custom customer forms shared through private links.",
    contributions: ['Full-stack development', 'Payload CMS customisation', 'Sales workflows', 'Deployment'],
    image: goldnatImage,
    imageAlt: 'A black car outside a lit concrete building at night, from the Goldnat website.',
    imagePosition: 'center 75%',
    url: 'https://goldnat.pl/',
    caseStudyHref: '/work/goldnat/',
  },
  {
    id: 'mlyn-nad-sanna',
    name: 'Młyn nad Sanną',
    description: "I developed a responsive website from a graphic designer's supplied design, with Sanity CMS for managing room listings and site content. My work included integrations, deployment and handover to the client.",
    contributions: ['Development from supplied design', 'Sanity CMS', 'Integrations', 'Deployment and handover'],
    image: mlynImage,
    imageAlt: 'Autumn trees reflected in the Sanna river, from the Młyn nad Sanną website.',
    imagePosition: 'center 55%',
    url: 'https://mlynnadsanna.pl/',
    caseStudyHref: '/work/mlyn-nad-sanna/',
  },
];

export const experience: Experience[] = [
  { company: 'Flyps', role: 'Senior Full-Stack Developer', period: '11.2025 — Present', summary: 'AI features and developer tools.' },
  { company: 'TheBrain', role: 'Senior Full-Stack Developer', period: '05.2025 — 10.2025', summary: 'Interactive learning with AI.' },
  { company: 'Xolv.io', role: 'Full-Stack Developer', period: '07.2021 — 04.2025', summary: '2K websites and browser-to-hardware tooling.' },
  { company: 'Leaderna', role: 'Full-Stack Developer · Part-time', period: '10.2022 — 05.2023' },
  { company: 'eLeader', role: 'Junior Software Developer', period: '01.2020 — 05.2021' },
  { company: 'Plum', role: 'Intern / Junior Developer', period: '07.2018 — 06.2019' },
];

export const stack = [
  'TypeScript', 'React', 'Next.js', 'Astro', 'Node.js', 'GraphQL', 'tRPC',
  'PostgreSQL', 'Supabase', 'MCP', 'OpenAI API', 'Anthropic API', 'RAG',
  'AWS', 'Cloudflare Workers', 'Docker', 'Playwright', 'Vitest',
] as const;

export type StackTool = (typeof stack)[number];
