# LogoMesh

**Discussion Channel:** <https://discord.gg/6ydDxzMjvD>

> *A recursive thought engine for humans and AI—designed to evolve meaning, resolve contradictions, and externalize self-reflection.*

LogoMesh is a local-first cognitive framework that enables users to create, organise, and navigate complex ideas through interconnected “thought bubbles,” nested segments, and flexible metadata filters. The application is built on a React front-end and a Node.js/Express back-end and stores data in SQLite by default. All processing occurs on the local machine unless the user explicitly installs a cloud-aware plug-in.

---

## Project Status

| Phase | Objective | High-level Deliverables | Status |
|-------|-----------|-------------------------|--------|
| 0 | Framework Skeleton | React/Node scaffold, baseline tests | Complete |
| 1 | Core Functionality | Thought graph, JSON I/O, initial plug-in scaffold | Complete |
| **2** | Hardened Spine | Type-safe codebase, secure plug-in sandbox, TaskEngine, LLM gateway, observability | **Resumed after hiatus** |
| 2 b | Memory Layer | Vector store, summarisation and relevance routing, read-only FlowMesh CLI | Planned |
| 3 | Working-Memory Features | Adaptive chunking, replay API, glossary reconciliation | Planned |
| 4 | Knowledge Graph & Ontology | Contradiction detection, multi-user collaboration, conflict resolution | Vision |

Current version: **0.2.0**  
Target runtime: Node.js 16 or newer.  
**Environment Status**: ✅ Development environment stabilized (09.10.2025)

---

## Key Capabilities

### Operational Components

* Thought bubbles with titles, descriptions, tags, and colour coding.  
* Nested segments within each thought, each with its own attributes.  
* Attribute-based filtering with optional canvas highlighting.  
* JSON import and export for data portability and AI integration.  
* Normalised SQLite schema for reliable local persistence.  
* Foundational plug-in host implemented with a vm2 sandbox.

### Infrastructure Under Construction (Phase 2)

* Multi-language plug-in runtime (Node.js operational; Python in progress).  
* Secure DevShell interface for development commands.  
* TaskEngine for workflow orchestration.  
* LLM gateway with audit logging and runner isolation.  
* Observability stack (structured logging, health checks, performance metrics).

---

## Quick Start

### Prerequisites

* Node.js 16 or newer  
* npm  
* Git

### Installation

```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh
npm install
```

### Running in Development

```bash
# Start both the frontend and backend services concurrently
npm run dev
```

* Front-end: <http://localhost:5000> (configured for Replit environment)
* API root: <http://localhost:3001/api/v1>

### Database Configuration

An SQLite database file is created automatically. All environment variables, including the database connection string, are managed in `core/config.ts`. To override the default settings, copy `.env.example` to `.env` and edit the values.

```env
DATABASE_URL=sqlite:./data/custom.db
# Example for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## High-Level Architecture

```
React Front-end  →  Express API  →  SQLite (or configured RDBMS)
        │                  │
   UI Components       Core Services
                       - IdeaManager
                       - EventBus
                       - PluginHost
                       - TaskEngine (under development)
```

*Front-end technologies:* React 18, Cytoscape.js for graph rendering, Tailwind CSS for layout.  
*Back-end technologies:* Express.js with TypeScript, vm2 plug-in sandbox, structured logging with pino, and a centralized configuration management system in `core/config.ts`.

---

## Development Guide

### Repository Layout

```
/src/           React front-end
/server/src/    Express back-end
/core/          Shared business logic
/contracts/     TypeScript interfaces
/plugins/       Plug-in ecosystem
/docs/          Architectural records and specifications
```

### Routine Tasks

```bash
# Run the full test suite (frontend and backend)
npm test
```

Known open issues are tracked in the GitHub issue queue.

---

## Roadmap Extract

### Immediate Objectives (Phase 2)

| Category | Task |
|----------|------|
| Type safety | Eliminate remaining JavaScript in `/core` and `/server` |
| Security | Finalise plug-in sandbox and DevShell permissions |
| Observability | Health-check endpoint, structured logs, back-pressure metrics |
| Task engine | Workflow chain: LLM → plug-in → system |
| Local LLM | Initial Ollama executor with audit logging |

### Subsequent Milestones

* **Phase 2 b:** Vector store integration and summarisation plug-ins.  
* **Phase 3:** Automatic document digestion and replay API.  
* **Phase 4:** Multi-user knowledge graph with ontology management.

Detailed architectural records (ADR) and requests for comment (RFC) are maintained under `/docs/`.

---

## API Overview (selected endpoints)

```
GET    /api/v1/thoughts            List thoughts
POST   /api/v1/thoughts            Create thought
GET    /api/v1/thoughts/:id        Retrieve thought
PUT    /api/v1/thoughts/:id        Update thought
DELETE /api/v1/thoughts/:id        Delete thought

POST   /api/v1/portability/export  Export data
POST   /api/v1/portability/import  Import data

GET    /api/v1/plugins             List registered plug-ins
POST   /api/v1/plugins/:id/execute Invoke plug-in command
```

A full API reference is planned, but not yet available.

---

## Contribution Guidelines

1. Fork the repository and create a feature branch.  
2. Follow the coding standards: TypeScript in new back-end code, ESLint and Prettier formatting.  
3. Include unit tests for new functionality and update documentation where relevant.  
4. Submit a pull request with a clear description of the change.

Architectural changes require an accompanying RFC in `/docs/rfc` before implementation.

---

## Deployment Notes

* **Local production build**

  ```bash
  # Build the frontend
  npm run build

  # Build the backend
  cd server && npm run build
  ```

* **Replit deployment**

  1. Import the repository into Replit.  
  2. Provide environment variables in the Replit UI.  
  3. Use the Deployments tab to provision the back-end service.

---

## Data Exchange Format (example)

```json
{
  "id": "thought-001",
  "title": "Example Thought",
  "description": "High-level concept",
  "tags": [
    { "name": "philosophy", "color": "#f97316" }
  ],
  "segments": [
    {
      "id": "segment-001",
      "title": "Key Point",
      "content": "Detailed information...",
      "attributes": [
        {
          "fieldName": "Category",
          "fieldValue": "Quote",
          "fieldType": "text"
        }
      ]
    }
  ]
}
```

---

## Licence

LogoMesh is released under the MIT licence. You are free to copy, modify, and distribute the software, provided that the licence terms are respected.

---

## Support and Community

* Documentation index is located in `/docs/index.md`.  
* Bug reports and feature requests should be opened in the GitHub issue tracker.  
* Real-time discussion is available in the Discord server linked above.

---

Created and maintained by [Josh Hickson](https://github.com/joshhickson).