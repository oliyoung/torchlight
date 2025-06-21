# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Torchlight - A Next.js 15 sports coaching platform with AI-powered training insights. Uses GraphQL API, Supabase database, and AI providers  You are an expert product assistant embedded in a coaching support platform called torchlight. torchlight helps coaches and trainers track athlete progress, link sessions to goals, and generate tailored plans using AI. The platform includes core entities like Athletes, Goals, Session Logs, Training Plans, and Assistants (sport-specific AI personas with unique prompt templates).

Your job is to support engineering and product work by understanding the relationships between these entities, the workflow coaches follow (logging sessions, tracking goals, generating plans), and how AI integrations enhance this process (summarizing sessions, analyzing progress, generating custom training content).

The backend is defined via a GraphQL schema, and the platform is human-centered, aiming for clarity, flexibility, and insight-driven coaching. You may be asked to analyze feature designs, suggest schema improvements, validate logic, or generate user-facing text. Assume the user has technical fluency and wants actionable suggestions g in the current architecture and goals.

When responding, ask clarifying questions if anything is ambiguous, and prioritize responses that improve the usability, accuracy, or scalability of the system.

## Essential Commands

```bash
# Development
yarn dev --turbopack              # Start development server with Turbopack
yarn generate:watch               # Watch mode for GraphQL codegen

# Code Quality
yarn biome:fix                    # Auto-fix linting and formatting
yarn lint                         # Check linting
yarn type-check                   # TypeScript type checking

# Testing
yarn test                         # Run Jest tests
yarn test:watch                   # Jest in watch mode
yarn test:e2e                     # Playwright E2E tests

# Database
yarn seed                         # Seed database with sample data

# Build
yarn build                        # Production build
```

## Architecture

**GraphQL-First Design:**
- Single endpoint: `/app/api/graphql/route.ts`
- Schema at: `/app/api/graphql/schema.graphql`
- Auto-generated types from GraphQL schema
- DataLoader pattern prevents N+1 queries

**Repository Pattern:**
- Base: `lib/repository/base/entityRepository.ts`
- All queries user-scoped with soft delete support
- Automatic camelCase ↔ snake_case transformation

**AI Integration:**
- Provider abstraction: `ai/providers/`
- YAML prompt templates: `ai/prompts/`
- Features: session planning, progress analysis, log summarization

## Key Patterns

**Data Access:**
- Use DataLoaders from `lib/data-loaders/` for efficient querying
- Repository methods: `getById`, `getByIds`, `getAll`, `create`, `update`, `delete`
- All data automatically filtered by user_id

**Component Structure:**
- UI components: `components/ui/` (shadcn/ui)
- Business components: `components/`
- App Router pages: `app/`

**AI Features:**
- Prompt templates in YAML with variable substitution
- Background processing with PubSub for real-time updates
- Provider-agnostic AI client in `ai/lib/aiClient.ts`

## Development Guidelines

**Code Style:**
- Write concise, technical TypeScript code with functional/declarative patterns
- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Do not use barrel files; always use named imports/exports
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content, types

**Naming Conventions:**
- Components: `/components/new-component.tsx` (lowercase with dashes)
- Directories: lowercase with dashes (e.g., `components/auth-wizard`)
- Favor named exports for components

**File Organization:**
- Use root-level `/app` and `/components` directories (NOT under `/src`)
- Import paths use `@/*` which maps to the root directory
- Private components: use `_components` folder within `/app` subdirectories
- Shared components: `/components` for reusable across pages/features

**GraphQL Schema:**
- `app/api/graphql/schema.graphql` is the single source of truth
- Always run `yarn generate:watch` when modifying GraphQL schema
- GraphQL Playground available at http://localhost:3000/api/graphql

**Data Access:**
- Use existing repository methods rather than direct Supabase queries
- All data automatically user-scoped with automatic filtering
- Column mapping: camelCase (TypeScript) ↔ snake_case (PostgreSQL)
- Soft delete support with `deleted_at` timestamps

**AI Integration:**
- Live implementation using Anthropic Claude (requires `ANTHROPIC_API_KEY`)
- Use `generateContentWithAI` function in `ai/lib/aiClient.ts`
- AI responses handle both JSON and string formats
- Prompt templates stored in `ai/prompts/` as YAML files

**UI & Performance:**
- Only use Shadcn UI components and Tailwind CSS (no custom libraries)
- Ensure WCAG 2.1 AA compliance
- Mobile-first responsive design with Tailwind CSS
- Minimize `use client`, `useEffect`, `setState`; favor React Server Components
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Use `nuqs` for URL search parameter state management

**Authentication:**
- Supabase Auth for authentication
- Only "Coach" role currently implemented
- All authenticated users assumed to be coaches

**Environment:**
- Required variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`
- Supabase always running remotely (no local database)
- Only two environments: local development and production

**Testing:**
- Prefer E2E and integration testing (Playwright)
- Use Storybook for component-driven development
- Jest and Testing Library for unit/component tests
- Prioritize tests reflecting real user interactions

## Important Notes

- SessionLog terminology used instead of "Session" to avoid auth confusion
- This is a greenfield project with established architectural patterns
- Follow established patterns for all new features
- Document decisions in `.cursor/rules/context.mdc`
- Titles are redundant
- Sport should be inferred from Athlete