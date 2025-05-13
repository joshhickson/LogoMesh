# LogoMesh — Developer Vision & Architecture Guide

**Tagline:**

> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

---

## Executive Summary

LogoMesh is a **local-first, AI-augmented cognitive framework** that transforms scattered thoughts into structured insight. By using a visual graph of tagged, filterable, and recursively linked segments, it enables users — and eventually AI — to reflect, reason, and grow in clarity over time.

Our development follows a **tiered approach to AI capabilities**, ensuring core functionalities operate efficiently on modest local hardware while providing pathways for advanced features that can leverage more powerful local resources (e.g., GPUs) or integrate optionally with cloud services. This approach emphasizes user control and transparency, fostering a system that is explicit, traceable, and explainable by design. LogoMesh acts as both an external memory system and a sandbox for emergent reasoning, with an architecture anticipating collaboration, AI-assisted introspection, and the evolution of ideas across time and context.

---

## Mission

LogoMesh empowers humans and AI to co-evolve their thinking using a structured, filterable, and recursively queryable thought system. Built on transparent fields, visual abstraction, and dynamic emergence, it creates a long-term substrate for:

* Human insight and pattern recognition
* AI-assisted synthesis and contradiction discovery
* Meta-cognitive dialogue between the system and its users

---

## Public-Facing Pitch

> What if your thoughts could talk back?
>
> LogoMesh is an emergence engine for humans and AI — a visual thinking platform that reveals patterns, contradictions, and hidden connections across your ideas. It's more than a mind map. It's a m...

---
## [Dev Plan (currently being revised)](https://github.com/joshhickson/LogoMesh/blob/master/docs/Merged%20Milestone-Based%20Development%20Plan%20v2.0.md)


## Core Architecture (not updated yet)

LogoMesh is designed as a federated system of microservices and a rich client-side application, emphasizing local-first data ownership and modularity.

### Key Components:

* **Current Client-Side UI:** React (Next.js) application for visual graph interaction, filtering, and content editing.
* **Visual Engine:**Cytoscape.js** (an open-source alternative)
* **Local Persistence:** SQLite (for graph data, segments, metadata) as the primary local database. Postgress coming soon. 
* **AI Microservices (Tiered):**
    * **Embedding Service:** For generating vector representations of text segments. Primarily powered by highly optimized local models (e.g., Sentence Transformers via `llama.cpp` or Ollama).
    * **LLM Orchestration:** For recursive queries, synthesis, and Socratic dialogues. Designed to utilize quantized models for local execution, with an optional cloud-based API key fallback.
    * **Concept-Diffusion:** For emergent idea generation and blending. These features will primarily leverage local GPU capabilities for efficient processing.
* **Data Export/Import:** Standardized JSON schema for interoperability and backup.
* **Automation:** Utilizes `node-RED` for local workflow automation, with architectural provisions for cloud extensions.

### AI Strategy & Tiered Implementation:

LogoMesh's AI integration follows a progressive enhancement model, guided by our tiered development approach:

#### Tier #1: Local-First Full Immersion (Primary Focus)
This tier ensures core LogoMesh functionalities, including essential AI features, run efficiently on common local hardware without requiring internet connectivity for core operations.

* **Local Model Prioritization:** We primarily leverage highly optimized and quantized open-source models (e.g., GGML/GGUF formats for LLMs, Sentence Transformers via `llama.cpp`/Ollama for embeddings, HF Diffusers for diffusion) to minimize resource footprint and enable robust CPU-based execution where possible.
* **Hardware Acknowledgment:** While core features run on modest hardware (e.g., Mac Mini), advanced AI capabilities (larger LLMs, diffusion models) are designed to leverage dedicated GPU hardware if available, with performance expectations clearly communicated to the user.
* **Local Persistence for AI:** All AI-generated embeddings and vector store operations rely on local databases like `SQLite + sqlite3_vector` (with plans for `PostgreSQL + pgvector` for local scaling/server environments) to keep data ownership with the user.
* **Automation:** Local node-RED instances manage in-app workflows for auto-tagging, embedding prep, and local backups.

#### Tier #2: Cloud-Enhanced Extensions (Optional/Future)
This tier outlines how LogoMesh can extend its capabilities by optionally integrating with cloud services, providing enhanced features or alternatives for users with different needs or hardware.

* **Abstraction Layers for Flexibility:** Critical API abstraction layers are designed from Phase 1 to allow seamless swapping of local AI services (embeddings, LLMs, vector databases) with cloud-based alternatives (e.g., OpenAI Embeddings, Pinecone, Weaviate, cloud LLM APIs) in later phases without major refactoring. This ensures extensibility.
* **User Control:** Cloud integrations are designed to be optional, typically requiring user-provided API keys (e.g., for OpenAI GPT models), aligning with our "no black boxes" philosophy and ensuring users retain control over their data and service choices.
* **Collaborative & Scalable Features:** Cloud infrastructure is anticipated for future features demanding high scalability or real-time collaboration across multiple users.

### Data Flow:

1.  User interacts with the graph via the React UI.
2.  UI communicates with local SQLite for data retrieval/storage.
3.  Optional: Text segments are sent to the local Embedding Service for vectorization.
4.  Optional: AI Microservices process data, potentially interacting with the graph and local persistence.
5.  Data can be imported/exported via JSON.
6.  Local automation workflows (node-RED) manage background tasks like embedding prep, auto-tagging, and local backups.

---

## Data Schema (JSON Export)

LogoMesh data is designed to be portable and inspectable. Below is a simplified example of the core JSON structure:

```json
{
  "metadata": {
    "version": "1.0",
    "export_date": "2025-05-03T00:00Z",
    "author": "Josh Hickson",
    "tool": "LogoMesh"
  },
  "thoughts": [
    {
      "thought_bubble_id": "...",
      "title": "...",
      "description": "...",
      "created_at": "...",
      "color": "#hex",
      "tags": [...],
      "position": { "x": ..., "y": ... },
      "segments": [
        {
          "segment_id": "...",
          "title": "...",
          "content": "...",
          "fields": {
            "Concept Type": "Principle",
            "Location": "Whiteboard"
          },
          "embedding_vector": [optional] // Note: While optional for basic exports, this field is crucial for enabling AI-driven features like similarity search, emergent insights, and recursive queries.
        }
      ]
    }
  ]
}
````

-----

## Developer Philosophy

  * Prefer traceable structure over guesswork.
  * Design for recursive insight, not just information.
  * Build tools that evolve with your cognition.
  * No black boxes. Make the system think out loud. **This commitment extends to AI integration by prioritizing transparency, explainability, and user control over models and outputs.**
  * Treat AI as a partner in reflection, not just prediction.
  * Anticipate future collaboration and modularity.

-----

## Current Focus & Ongoing Development Tasks (Tier \#1: Local-First Full Immersion)

This section outlines the immediate, high-priority tasks for LogoMesh's **Tier \#1: Local-First Full Immersion**, aligning with the early phases of the comprehensive development roadmap. For a full, detailed breakdown of all phases and Tier \#2 (Cloud-Enhanced Extensions) plans, please refer to the `Merged Milestone-Based Development Plan v2.0.md`.

  * **Phase 1: Scaffold & Realignment**

      * Complete the migration of the visual canvas from ReactFlow to **Cytoscape.js**.
      * Finalize **SQLite** DB schema for local persistence and ensure full React ↔ SQLite load/save cycle.
      * Set up local **node-RED** instance for core automation tasks (e.g., auto-tagging, local backups, initial embedding prep).
      * Design **API Abstraction Layers** for Embedding Services and Vector Databases to enable future cloud integration without major refactoring.
      * Establish **Docker Compose** for front-end + SQLite for easy local deployment.

  * **Phase 2: Interaction, Filters & Embedding Infrastructure**

      * Develop UI for **Tag/Color/Abstraction Filters** and **Theme Clusters** (auto-cluster view, Merge/Unmerge controls).
      * Implement the **Embed Micro-service** (FastAPI/Flask) powered by highly optimized local models (e.g., `llama.cpp`/Ollama).
      * Integrate **SQLite + sqlite3\_vector** as the primary local vector store for efficient similarity search.
      * **Action:** Benchmark local embedding generation times and vector similarity search performance on target hardware (e.g., Mac Mini) to ensure responsive UX.

-----

## [Execution History](https://github.com/joshhickson/thought-web/blob/master/docs/Claude-log.md)

-----

```
```
