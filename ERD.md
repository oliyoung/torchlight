---
title: System Overview (Mermaid)
---

## System Overview

```mermaid
graph TD
    subgraph Frontend
        Dashboard[Dashboard UI]
        ClientPage[Client Profiles]
        GoalPage[Goal Tracker]
        SessionLogPage[Session Logs]
    end

    subgraph Backend
        API[GraphQL API]
        DB[(Database)]
        AI[AI Services]
    end

    Dashboard -->|Query| API
    ClientPage -->|Query| API
    GoalPage -->|Mutation/Query| API
    SessionLogPage -->|Mutation/Query| API

    API --> DB
    API --> AI

    subgraph Data Model
        Client[Client]
        Goal[Goal]
        SessionLog[SessionLog]
        Transcript[Transcript]
        Insight[AI Insight]
    end

    DB --> Client
    DB --> Goal
    DB --> SessionLog
    DB --> Transcript
    DB --> Insight

    SessionLog -->|has many| Transcript
    SessionLog -->|belongs to| Client
    Goal -->|belongs to| Client
    SessionLog -->|linked to| Goal
    Insight -->|generated from| SessionLog