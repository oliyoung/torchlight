# Coaching & Training Support Platform

A modern web application designed to help coaches, trainers, and support professionals manage client progress, log sessions, and align conversations with clear goals. By integrating AI tools, the platform streamlines workflows like session summarization, goal tracking, and training program planning.

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

## License

MIT