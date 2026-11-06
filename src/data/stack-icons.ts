import type { StackTool } from './portfolio';
import typescript from '../assets/stack/typescript.svg?raw';
import react from '../assets/stack/react.svg?raw';
import nextjs from '../assets/stack/nextjs.svg?raw';
import astro from '../assets/stack/astro.svg?raw';
import nodejs from '../assets/stack/nodejs.svg?raw';
import graphql from '../assets/stack/graphql.svg?raw';
import trpc from '../assets/stack/trpc.svg?raw';
import postgresql from '../assets/stack/postgresql.svg?raw';
import supabase from '../assets/stack/supabase.svg?raw';
import mcp from '../assets/stack/mcp.svg?raw';
import openai from '../assets/stack/openai.svg?raw';
import anthropic from '../assets/stack/anthropic.svg?raw';
import rag from '../assets/stack/rag.svg?raw';
import aws from '../assets/stack/amazonwebservices.svg?raw';
import cloudflareWorkers from '../assets/stack/cloudflareworkers.svg?raw';
import docker from '../assets/stack/docker.svg?raw';
import playwright from '../assets/stack/playwright.svg?raw';
import vitest from '../assets/stack/vitest.svg?raw';

/** Server-rendered local vectors; every technology must have an icon at build time. */
export const stackIcons = {
  TypeScript: typescript,
  React: react,
  'Next.js': nextjs,
  Astro: astro,
  'Node.js': nodejs,
  GraphQL: graphql,
  tRPC: trpc,
  PostgreSQL: postgresql,
  Supabase: supabase,
  MCP: mcp,
  'OpenAI API': openai,
  'Anthropic API': anthropic,
  RAG: rag,
  AWS: aws,
  'Cloudflare Workers': cloudflareWorkers,
  Docker: docker,
  Playwright: playwright,
  Vitest: vitest,
} satisfies Record<StackTool, string>;
