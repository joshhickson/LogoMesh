# LogoMesh - AI Agent Evaluation Platform

## Overview

LogoMesh is an open-source platform designed to evaluate AI agents through the concept of "Contextual Debt" - a metric measuring the erosion of discernible human intent, architectural rationale, and domain knowledge in AI-generated code. The platform focuses on the "Cyber-Sentinel Agent" narrative, positioning itself as a specialized evaluator for AI agents in cybersecurity and critical infrastructure contexts.

The project represents a strategic pivot from an earlier "Cognitive IDE" vision to a focused AI agent evaluation platform. The current implementation is a marketing/documentation website that communicates the project's research thesis and strategic positioning, with plans for a sophisticated multi-agent evaluation system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Static HTML/CSS Website**: The current implementation is a pure static site using vanilla HTML and CSS with no build process or JavaScript framework. The architecture prioritizes simplicity and immediate deployment over technical complexity.

**Design System**: Consistent dark theme UI (#121212 background, #e0e0e0 text, #bb86fc accent) implemented across all pages. Navigation structure uses a shared navbar component linking to four main sections: Home, Your Code Has Amnesia, The Liability, and The Breakthrough.

**Rationale**: This minimal approach was chosen for rapid iteration during the conceptual phase. As a landing page communicating research concepts, it avoids the complexity of modern frontend frameworks, allowing focus on content clarity and message refinement.

### Backend Architecture

**Development Server**: Simple Python 3.11 HTTP server (server.py) configured for Replit deployment on port 5000 with HOST="0.0.0.0". Implements no-cache headers to ensure fresh content during development and blocks access to /private directory.

**Planned Multi-Agent System**: Documentation references a future "Orchestrator-Worker" pattern for the evaluation engine. The envisioned architecture includes:
- Orchestrator agent managing evaluation workflow
- Specialized worker agents for different analysis pillars
- Event-driven communication between components
- Immutable audit trail for agent decisions

**Rationale**: The current Python server is a minimal development solution for Replit hosting. The planned architecture reflects a sophisticated understanding of distributed AI systems, designed to make agent reasoning transparent and auditable - addressing the core "Contextual Debt" problem the platform aims to solve.

### Core Evaluation Framework (Conceptual)

The platform is designed around three evaluation pillars that triangulate contextual integrity:

**Rationale Integrity Score (RIS)**: Measures alignment between code implementation and documented business intent. Evaluates whether the code's purpose is discernible, traceable to requirements, and explicitly aligned with business rationale.

**Architectural Integrity Score (AIS)**: Assesses adherence to established system design patterns and constraints. Validates that code follows architectural conventions and doesn't introduce technical debt through structural violations.

**Testing Integrity Score (TIS)**: Evaluates whether tests validate semantic intent rather than just achieving code coverage. Focuses on whether tests capture the "why" behind requirements, not just the "what" of implementation.

**Rationale**: This three-pillar approach addresses a fundamental gap in traditional metrics. Cyclomatic complexity and code coverage fail to capture the preservation of human intent - the core concern when AI agents generate code. By measuring alignment across documentation, architecture, and testing, the framework detects when AI-generated code is functionally correct but contextually disconnected from its purpose.

### Content Management

**Documentation Intake System**: The /private/docs-intake directory implements a structured process for content updates with clear separation between source documents, archive, and prepared content. Includes mapping.json for tracking document transformations and processing-log.md for audit trail.

**Rationale**: This system was created to manage the strategic pivot from Cognitive IDE to evaluation platform, ensuring systematic content updates while preserving intellectual property and maintaining clear versioning of strategic documents.

## External Dependencies

### Hosting and Infrastructure

**Replit Platform**: Primary hosting environment, requiring specific server configuration (port 5000, 0.0.0.0 binding). The Python server is tailored for Replit's deployment model.

### Future Dependencies (Planned)

**AI/LLM Services**: The planned evaluation system will integrate with LLM providers for agent orchestration and analysis. Specific providers not yet determined.

**Message Queue System**: The Orchestrator-Worker pattern will require a message bus (candidates mentioned: Kafka, NATS, RabbitMQ) for event-driven communication between evaluation agents.

**Static Analysis Tools**: References to escomplex and similar libraries for implementing the Architectural Integrity Score through real static analysis rather than mock data.

**Authentication (Auth0)**: Strategic documents reference planned Auth0 integration for Fine-Grained Authorization in agent evaluation scenarios, though this represents earlier planning and may not reflect current direction.

### Research and Community Context

**AgentX/Berkeley RDI**: The project is positioned within the context of the AgentX AgentBeats competition and Berkeley RDI's agentic AI MOOC, informing its evaluation framework and community engagement strategy.

**Academic Foundations**: The conceptual framework draws from established research on technical debt (Ward Cunningham, Martin Fowler) while extending these concepts to the novel domain of AI-generated code integrity.