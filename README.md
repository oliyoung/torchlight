# Torchlight Engineering Reference

This README summarizes the core engineering conventions, context, and rules for the Torchlight project. For full details, see `.cursor/rules/context.mdc` and related MDC files.

## Project Context & Conventions

- **Greenfield project.** All features currently implemented can be inferred from UI completeness. New features should follow established patterns and conventions.
- **Backlog:** The next most important features/screens are being determined. Backlog and prioritization are the immediate priority.
- **Core data models:** Defined in `app/api/graphql/schema.graphql` (always the single source of truth). Use the GraphQL Playground at http://localhost:3000/api/graphql.
- **No wireframes or user stories.** Develop directly in code and browser.
- **AI features:** All AI-related GraphQL mutations (e.g., `summarizeSessionLog`, `generateSession`, `analyzeProgress`) must be stubbed/mocked for now. Actual integration will use [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol) with the TypeScript SDK. AI integration is open for experimentation.
- **Authentication:** Supabase Auth. Only "Coach" role is implemented; "Client" and "Admin" roles will come after core features and AI integration.
- **Environments:** Only local (development) and production. Supabase is always remote; use the provided connection string in `.env` as `DATABASE_URL`.
- **UI:** Only use Shadcn UI and Tailwind CSS. No custom component libraries or other design systems. No Figma or brand guidelines yet.
- **Performance:** Use React Server Components where possible. Minimize client-side state. Organize code under `/src/app` and `/src/components`.
- **Testing:** Prefer E2E and integration tests (Playwright). Use Storybook for component-driven development. Use Jest and [Testing Library](https://testing-library.com/) for unit/component tests.
- **Documentation:** Use `@context.mdc` for all architectural decisions and conventions. Add a `/docs` directory for feature-specific docs as needed. Use JSDoc/TSDoc in code. Keep all docs in-repo and markdown-based.
- **Collaboration:** No strict branching/PR conventions yet. Document all decisions in `@context.mdc`.
- **Open for experimentation:** AI integration layer is open for prototyping and new approaches. All other areas should follow established conventions.
- **No known technical debt or areas to avoid.**
- **No explicit security, privacy, or compliance requirements (e.g., GDPR, SOC2) at this time, but always act as if such requirements are in place. Use secure coding practices, encrypt data at rest and in transit, minimize data exposure, and follow the principle of least privilege.**

---

For more, see:
- `.cursor/rules/context.mdc` (project context and conventions)
- `.cursor/rules/general.mdc` (code style, structure, and optimization)
- `.cursor/rules/faq.mdc` (FAQ)
- `.cursor/rules/internal-product-narrative.mdc` (product narrative)
- `.cursor/rules/press-release.mdc` (press release)

## Features

- **Session Logging**
  - Create and manage detailed `SessionLogs` for each client
  - Track upcoming and past sessions with notes and transcripts

- **Goal Tracking**
  - Define measurable goals per client
  - Associate session logs and notes with specific goals
  - Monitor completion and progress over time

- **Client Management**
  - Maintain rich client profiles
  - View client history across sessions and goals

- **AI-Powered Insights**
  - Automatically generate summaries of sessions
  - Detect trends and recurring themes
  - Draft personalized training plans

- **Clean, Actionable Dashboard**
  - Focus on upcoming and recent sessions
  - Quick access to AI summaries and action items
  - Overview of active goals and recent achievements

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** GraphQL API
- **AI Integration:** Large Language Model (LLM) for summarization, goal analysis, and planning

## Development Notes

- `SessionLog` is used instead of `Session` to avoid confusion with authentication sessions.
- GraphQL schema is modular and supports namespaced types for clients, goals, and sessions.
- Designed with extensibility in mind—AI features are isolated and can evolve independently.

## Status

This is an early-stage prototype. Key features like data modeling, AI integration points, and dashboard UX have been outlined and are actively being developed.

---

**This codebase is proprietary and confidential. All rights reserved. Unauthorized use, distribution, or copying is prohibited.**