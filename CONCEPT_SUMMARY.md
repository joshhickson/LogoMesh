LogoMesh: A Recursive Thought Engine

LogoMesh is a software project aimed at creating a "recursive thought engine for humans and AI." Its primary goal is to provide a framework that helps users transform scattered thoughts into structured, actionable insights.

Core Concepts:

1.  **Local-First Approach:** Emphasizes user data ownership and the ability for core functionalities to run efficiently on modest local hardware, without mandatory internet connectivity.
2.  **AI Augmentation:** Integrates AI capabilities in a modular and transparent manner. The system is designed to avoid "black boxes," making AI processes explicit and traceable.
3.  **Visual Graph Interface:** Utilizes a graph structure (implemented with Cytoscape.js) to visually represent thoughts and their interconnections, allowing users to navigate and understand complex idea landscapes.
4.  **Structured Data:** Thoughts are broken down into "Segments," which include metadata such as tags, abstraction levels (Fact, Idea, Theme, Goal), content types, and eventually embedding vectors. This structured approach is key to enabling advanced filtering, querying, and AI processing.
5.  **Tiered Development:**
    *   **Tier 1 (Local-First Full Immersion):** The primary focus, ensuring core features (including essential AI) run on local hardware. This involves using optimized local models for embeddings and LLM tasks.
    *   **Tier 2 (Cloud-Enhanced Extensions):** Optional pathways for leveraging cloud services for more advanced features, scalability, or users without powerful local hardware. This is designed with abstraction layers to easily swap local components with cloud alternatives.

Key Architectural Components & Features:

*   **Core Logic (`/core`):** Contains business logic and data management (e.g., `IdeaManager`).
*   **Contracts (`/contracts`):** Defines TypeScript interfaces for data entities (e.g., `Thought`, `Segment`) and service contracts (e.g., `LLMExecutor`, `StorageAdapter`).
*   **LLM Integration:** Includes an `LLMExecutor` interface for pluggable LLM providers and an `llmAuditLogger` for traceability.
*   **Persistence:** Transitioning from in-memory data (Phase 0) to SQLite for local persistent storage (Phase 1), with plans for future PostgreSQL support.
*   **Backend API:** A Node.js/Express.js server to manage data operations, serving as the intermediary between the frontend and the database.
*   **Automation:** Node-RED is planned for local workflow automation (e.g., backups, auto-tagging).

Current Development Status (based on docs):

The project appears to have completed "Phase 0," which focused on establishing the foundational architecture: decoupling UI from core logic, defining data contracts, creating utility and logging services, and scaffolding for LLM integration.
It is now moving into "Phase 1," which aims to:
*   Implement a backend API server.
*   Integrate SQLite for persistent data storage via a `StorageAdapter`.
*   Refactor the React frontend to consume the new backend API.
*   Refine graph visualization (compound nodes, `fcose` layout).
*   Set up Node-RED for initial automation tasks.
*   Containerize the backend using Docker.

The long-term vision is a system that acts as a cognitive partner, facilitating reflection, reasoning, contradiction resolution, and the emergence of new insights over time for both human users and AI agents.
