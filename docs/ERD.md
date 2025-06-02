---
title: System Overview (Mermaid)
---

## System Overview

```mermaid
graph TD
    subgraph Frontend
        Dashboard[Dashboard UI]
        AthletePage[Athlete Profiles]
        GoalPage[Goal Tracker]
        SessionLogPage[Session Logs]
    end

    subgraph Backend
        API[GraphQL API]
        DB[(Database)]
        AI[AI Services]
    end

    Dashboard -->|Query| API
    AthletePage -->|Query| API
    GoalPage -->|Mutation/Query| API
    SessionLogPage -->|Mutation/Query| API

    API --> DB
    API --> AI

    subgraph Data Model
        Athlete[Athlete]
        Goal[Goal]
        SessionLog[SessionLog]
        Transcript[Transcript]
        Insight[AI Insight]
    end

    DB --> Athlete
    DB --> Goal
    DB --> SessionLog
    DB --> Transcript
    DB --> Insight

    SessionLog -->|has many| Transcript
    SessionLog -->|belongs to| Athlete
    Goal -->|belongs to| Athlete
    SessionLog -->|linked to| Goal
    Insight -->|generated from| SessionLog