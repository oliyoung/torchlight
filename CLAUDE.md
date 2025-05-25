# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoachBase - A Next.js 15 sports coaching platform with AI-powered training insights. Uses GraphQL API, Supabase database, and AI providers (Anthropic/OpenAI).

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

**File Organization:**
- Use root-level `/app` and `/components` directories (NOT under `/src`)
- Import paths use `@/*` which maps to the root directory

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

**UI Components:**
- Only use Shadcn UI components and Tailwind CSS
- No custom component libraries or other design systems
- Responsive, accessible, modern design required
- Clean, professional but soft and fun branding

**Authentication:**
- Supabase Auth for authentication
- Only "Coach" role currently implemented
- All authenticated users assumed to be coaches

**Environment:**
- Required variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`
- Supabase always running remotely (no local database)
- Only two environments: local development and production

**Testing:**
- Prefer E2E and integration testing
- Jest configured for unit/component tests
- Prioritize tests reflecting real user interactions

## Important Notes

- SessionLog terminology used instead of "Session" to avoid auth confusion
- This is a greenfield project with established architectural patterns
- Follow established patterns for all new features
- Document decisions in `.cursor/rules/context.mdc`