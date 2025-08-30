# LogoMesh

> An open-source cognitive framework for mapping complex ideas, developed and managed by a team of specialized AI agents.

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge)](https://github.com/joshhickson/LogoMesh/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1022230737984852028?style=for-the-badge&logo=discord)](https://discord.gg/6ydDxzMjvD)

**LogoMesh** is a local-first tool for thinking. It helps you create, connect, and explore complex ideas using a graph-based interface. It's designed for writers, researchers, developers, and anyone trying to bring structure to their thoughts.

What makes this project unique is its development process. **LogoMesh is built and managed by a team of AI Personas**—specialized agents with distinct roles and responsibilities, from strategic planning to security auditing. This README, the project roadmap, and the code itself are all products of this AI-driven process.

---

## Project Status

| Phase | Objective | High-level Deliverables | Status |
|-------|-----------|-------------------------|--------|
| 0 | Framework Skeleton | React/Node scaffold, baseline tests | ✅ Complete |
| 1 | Core Functionality | Thought graph, JSON I/O, initial plug-in scaffold | ✅ Complete |
| **2** | **Hardened Spine** | **Type-safe codebase, secure plug-in host, LLM gateway, observability** | **🚀 In Progress** |
| 2b | Memory Layer | Vector store, summarisation, relevance routing, read-only CLI | ⏳ Planned |
| 3 | Working-Memory | Adaptive chunking, replay API, glossary reconciliation | ⏳ Planned |
| 4 | Knowledge Graph | Contradiction detection, multi-user collaboration | 🔭 Vision |

The project is currently in **Phase 2: Hardened Spine**. The focus is on creating a rock-solid, reliable, and secure foundation before adding more complex features. You can read the detailed, week-by-week plan in the [Phase 2 Implementation Plan](docs/IMPLEMENTATION_PLAN.md).

---

## Project Philosophy: AI-Driven Development

LogoMesh's development is a live experiment in AI-coordinated software engineering. Instead of a traditional human-led team, the project is guided by a roster of AI "Personas." Each persona has a name, a role, and a specific set of responsibilities.

*   **The Archivist:** Coordinates memory and delegates tasks.
*   **Napoleon:** Oversees strategic architecture and planning.
*   **Bezalel:** Implements core system modules.
*   **The Watchman:** Audits security and plugin integrity.

This approach allows for a unique, highly-documented, and focused development process. You can view the full roster and their responsibilities in the [Persona Registry](docs/personas/registry.md). Their work logs are captured in the `docs/progress` directory.

---

## Key Features

*   **Graph-Based Visualization:** Create and connect "thought bubbles" on an infinite canvas.
*   **Rich Content:** Each thought has a title, description, tags, and nested content segments.
*   **Plugin Architecture:** Extend functionality with custom plugins that run in a secure sandbox.
*   **LLM Gateway:** Integrated gateway for connecting to local or remote Large Language Models like Ollama.
*   **Data Portability:** Import and export your thought graphs as JSON.
*   **Local-First Storage:** Your data is stored locally in SQLite, with support for PostgreSQL and Neo4j.

---

## Architecture & Technology Stack

LogoMesh uses a modern, type-safe technology stack designed for reliability and scalability.

```
React Frontend  →  Express API  →  Database (SQLite/Postgres/Neo4j)
      │                  │
 UI Components       Core Services
 (React,           - IdeaManager
  Tailwind,          - EventBus
  Cytoscape.js)      - PluginHost
                     - TaskEngine
                     - LLMGateway
```

*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Cytoscape.js, React Flow
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** SQLite (default), PostgreSQL, Neo4j
*   **Testing:** Vitest for unit and integration testing.
*   **Core Principles:**
    *   **Event-Driven:** Core services communicate via an event bus to decouple components.
    *   **Plugin Isolation:** Plugins run in a secure sandbox to protect the core system.
    *   **Strict Boundaries:** The frontend, core, and server layers are strictly separated.

---

## Quick Start

### Prerequisites

*   Node.js 18 or newer
*   npm (v9 or newer)
*   Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/joshhickson/LogoMesh.git

# 2. Change into the project directory
cd LogoMesh

# 3. Install all dependencies (for frontend and backend)
npm install
```

### Running in Development

This command starts both the React frontend and the Express backend concurrently.

```bash
# Run the frontend (port 3000) and backend (port 3001) together
npm run dev
```

*   **Frontend:** `http://localhost:3000`
*   **API:** `http://localhost:3001/api/v1`

### Database Configuration

The application uses an SQLite database by default, which is created automatically. To use a different database like PostgreSQL or Neo4j, copy `.env.example` to `.env` and set the `DATABASE_URL`.

```env
# Default: SQLite
DATABASE_URL=sqlite:./data/logomesh.db

# Example for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Example for Neo4j:
# DATABASE_URL=neo4j://user:pass@host:7687/dbname
```

---

## Development Guide

### Repository Layout

```
/src/           React frontend (Vite)
/server/src/    Express backend
/core/          Shared business logic (TypeScript)
/contracts/     Shared data structures and interfaces
/plugins/       The plugin ecosystem
/docs/          Architectural records, plans, and persona logs
```

### Key Development Scripts

We use a set of scripts to ensure code quality and correctness.

*   `npm run validate`: The most important script. Runs linting, type-checking, and all tests in sequence. This is what the CI server runs.
*   `npm test`: Runs the entire test suite using Vitest.
*   `npm run typecheck`: Checks the entire project for TypeScript errors.
*   `npm run lint`: Lints the frontend, backend, and core directories.
*   `npm run format`: Formats the code using Prettier.

---

## API Overview

The backend provides a RESTful API for managing thoughts, plugins, and data.

```
GET    /api/v1/thoughts            List all thoughts
POST   /api/v1/thoughts            Create a new thought
GET    /api/v1/thoughts/:id        Retrieve a specific thought
PUT    /api/v1/thoughts/:id        Update a thought
DELETE /api/v1/thoughts/:id        Delete a thought

POST   /api/v1/portability/export  Export all data to JSON
POST   /api/v1/portability/import  Import data from JSON

GET    /api/v1/plugins             List registered plugins
POST   /api/v1/plugins/:id/execute Invoke a command on a plugin

GET    /api/v1/admin/status        Get system health and metrics
```

---

## Contribution Guidelines

1.  Fork the repository and create a feature branch.
2.  Follow the coding standards: strict TypeScript for all new code, ESLint and Prettier for formatting.
3.  Add unit tests with Vitest for any new functionality.
4.  Ensure `npm run validate` passes before submitting.
5.  Submit a pull request with a clear description of your changes.

---

## License

LogoMesh is released under the **MIT License**. You are free to copy, modify, and distribute the software.

---

## Support and Community

*   **Bug Reports & Feature Requests:** Please use the [GitHub Issues](https://github.com/joshhickson/LogoMesh/issues).
*   **Real-time Discussion:** Join our [Discord server](https://discord.gg/6ydDxzMjvD).
