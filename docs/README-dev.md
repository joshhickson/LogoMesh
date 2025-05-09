# LogoMesh — Developer Vision & Architecture Guide

**Tagline:**

> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

---

## Executive Summary

LogoMesh is a **local-first, AI-augmented cognitive framework** that transforms scattered thoughts into structured insight. By using a visual graph of tagged, filterable, and recursively linked segments, it enables users — and eventually AI — to reflect, reason, and grow in clarity over time.

While committed to a local-first experience, LogoMesh embraces a **tiered approach to AI capabilities**. Core functionalities, including thought organization and basic embedding-based search, are designed to run efficiently on modest local hardware (e.g., a Mac Mini). More advanced AI features, such as large language model (LLM) generation and concept-diffusion, will progressively leverage more powerful local hardware (e.g., GPUs) if available, or offer optional user-controlled cloud alternatives via API keys.

Unlike black-box models, LogoMesh is explicit, traceable, and explainable by design. It acts as both an external memory system and a sandbox for emergent reasoning. Its architecture anticipates collaboration, AI-assisted introspection, and the evolution of ideas across time and context.

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

## Core Architecture

LogoMesh is designed as a federated system of microservices and a rich client-side application, emphasizing local-first data ownership and modularity.

### Key Components:

* **Client-Side UI:** React (Next.js) application for visual graph interaction, filtering, and content editing.
* **Visual Engine:** Currently uses **ReactFlow**. The plan is to migrate to **Cytoscape.js** (an open-source alternative) in Phase 1 for enhanced performance and features. (Note: ReGraph was previously considered but Cytoscape.js offers a more suitable open-source path.)
* **Local Persistence:** SQLite (for graph data, segments, metadata)
* **AI Microservices:**
    * **Embedding Service:** For generating vector representations of text segments. Powered by highly optimized local models via `llama.cpp` / Ollama.
    * **LLM Orchestration:** For recursive queries, synthesis, and Socratic dialogues. Designed to utilize quantized models for local execution, with an optional cloud-based API key fallback.
    * **Concept-Diffusion:** For emergent idea generation and blending. These features will primarily leverage local GPU capabilities for efficient processing.
* **Data Export/Import:** Standardized JSON schema for interoperability and backup.

### AI Strategy & Local-First Implementation:

LogoMesh's AI integration follows a progressive enhancement model:

* **Baseline Functionality (Modest Hardware):** Core features like embedding generation and similarity search will be optimized for CPU-based execution on typical local machines (e.g., Mac Mini). We prioritize highly quantized models (e.g., GGML/GGUF formats) to minimize resource footprint.
* **Advanced Functionality (Capable Hardware / Optional Cloud):** Features involving larger LLMs (7B-8B models for generation, recursive queries) and concept-diffusion will benefit significantly from dedicated GPU hardware. Users without GPUs may experience slower performance, or optionally provide their own API keys for cloud-based execution of these specific services, maintaining control and transparency.
* **No Black Boxes:** Our commitment extends to AI integration by focusing on explainable outputs, providing users with control over model choices where applicable, and offering transparent feedback mechanisms (e.g., prompt logs, explicit reasoning for AI suggestions, and the ability to audit AI-generated DAGs).

### Data Flow:

1.  User interacts with the graph via the React UI.
2.  UI communicates with local SQLite for data retrieval/storage.
3.  Optional: Text segments are sent to the local Embedding Service for vectorization.
4.  Optional: AI Microservices process data, potentially interacting with the graph and local persistence.
5.  Data can be imported/exported via JSON.

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

## Ongoing Development Tasks

  * **Visual Engine Migration:** Complete the migration from ReactFlow to Cytoscape.js.
  * **Core UI/UX Enhancements:** Add real-time filter overlays for tags/colors, and refine JSON import/export for full schema support.
  * **Embedding Service Optimization:** Benchmark local embedding generation performance on target hardware (e.g., Mac Mini) and adjust timeouts to ensure responsive UX.
  * **AI Search & Linkage:** Implement initial embedding-based AI search and "Related Thoughts" functionality, focusing on performance for `top-k` similarity queries.
  * **Proto-AI Hook UX:** Begin prototyping user experience for recursive queries and AI-driven explainability.
  * **Data Management:** Add timeline view and interaction logs for better historical context.
  * **Collaboration Foundations:** Begin work on multi-user version control layer (initial focus on underlying data structures).
  * **LLM & Diffusion Strategy:** Research and select optimal quantized LLM and diffusion models for local execution, balancing performance and resource demands.

-----

## [Execution History](https://github.com/joshhickson/thought-web/blob/master/docs/Claude-Log.md)

-----

```
```
