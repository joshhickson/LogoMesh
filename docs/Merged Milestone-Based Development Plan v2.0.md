# Milestone-Based Development Plan (v2.0 – Unified: Core + MLOps + UX + Cognitive)

---

## Tiered Approach to ThoughtWeb Development

This development plan is structured around two distinct tiers, reflecting ThoughtWeb's commitment to a local-first philosophy while ensuring future extensibility and scalability via cloud services. The goal is to provide a robust core accessible to all users, with optional advanced features that leverage cloud resources if desired.

### Tier #1: Local-First Full Immersion
This tier prioritizes minimal internet connectivity and aims for all core ThoughtWeb functionalities, including AI features, to run efficiently on local user hardware (e.g., Mac Mini). Development in early phases will primarily focus on achieving a stable and performant experience within this tier.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)
This tier outlines paths for leveraging cloud services (e.g., managed databases, powerful LLM APIs, specialized AI models) for enhanced features, scalability, or as alternatives for users without powerful local hardware. Development for this tier will focus on designing robust abstraction layers in early phases to allow seamless integration without major refactoring, with active implementation in later phases.

---

## PHASE 1: Scaffold & Realignment (Weeks 1–2)
*(Pure ThoughtWeb core—no AI, with MLOps & UX foundations)*

### Tier #1: Local-First Full Immersion

-   **Start Using docs/Claude-log.md**
    -   Purpose: Manual running log of Claude’s outputs, bugs, and resolutions.
    -   Action: After each successful Claude task, append:
        -   Task name
        -   Prompt summary
        -   Summary of changes
        -   Observed outcome / test result
        -   Any error messages, hallucinations, or edge-case discoveries

-   **Create state_snapshots/ folder in root**
    -   Purpose: Stores .json exports of full graph state at milestone checkpoints.
    -   Action: At the end of each major phase (e.g. post-Cytoscape, post-filter layer), export graph data using the current JSON schema and save to:
        -   state_snapshots/v0.1_init.json
        -   state_snapshots/v0.2_with_filters.json
        -   state_snapshots/v1.0_ai_ready.json

-   **Create todo/Claude_Feedback.md**
    -   Purpose: Running scratchpad for user observations about Claude’s behavior.
    -   Action: After every 2–3 Claude sessions, document:
        -   Repeated inefficiencies
        -   Things Claude misunderstood or mis-executed
        -   Any suggested prompts that increased precision
        -   Promising follow-ups or forked ideas to revisit

-   **Graph Visualization & Data**
    -   Replace visual canvas with **Cytoscape.js** (open-source alternative to ReGraph)
    -   Create React wrapper using `ref` integration pattern
    -   Migrate bubbles to Cytoscape node/edge model with initial layout

-   **Local Persistence**
    -   Set up **SQLite** DB schema (primary local database)
    -   Migrate JSON bubbles/segments into SQLite
    -   Full React ↔ SQLite load/save cycle via API or in-browser WebAssembly (e.g., sql.js)

-   **Abstraction Taxonomy Definition**
    -   Co-design **concept hierarchy**:
        1.  **Fact** (atomic data)
        2.  **Idea** (interpretation)
        3.  **Theme** (clusters of ideas)
        4.  **Goal** (outcomes)
    -   Tag each bubble with its level + **memory cue** (anchor/trigger)

-   **Automation Foundations (Local)**
    -   Set up self-hosted **n8n** instance for local-centric automation.
    -   Define webhook triggers for local bubble/segment sync events.
    -   Scaffold logic flows for local auto-tagging, backup to local storage, and initial embedding prep, evaluating if simpler in-app mechanisms are sufficient for initial needs.

-   **DevOps Foundations**
    -   Containerize front-end + SQLite (**Docker Compose**) for easy local deployment.
    -   DB migration scripts (Knex/Flyway) in CI
    -   Unit tests for React–SQLite sync
    -   GitHub Actions for lint/build/test on PR

-   **UX Foundations**
    -   Style guide: node shapes, WCAG palette, typography scale
    -   Basic interactions: click-select, hover-preview, drag-pan/zoom
    -   Onboarding tour stub with progressive-disclosure

> **Goal:** A solid, repeatable dev environment with clear hierarchy, automation readiness, and consistent UI patterns for a local-first experience.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **API Abstraction Layer Design (Foundation for Cloud Integration)**
    -   Design clear API contracts and interfaces for **Embedding Services** and **Vector Databases** that allow for swapping out local implementations (e.g., `sqlite3_vector`) with cloud-based alternatives (e.g., Pinecone, Weaviate) in later phases without major refactoring.
    -   Define base classes/interfaces for AI model interactions to support various LLM APIs (local via `llama.cpp`/Ollama, or cloud like OpenAI/GPT) for future extensibility.
-   **Automation Foundations (Cloud Readiness)**
    -   Consider architecture patterns for extending n8n workflows to potentially interact with cloud services for backups or integrations as complexity warrants.

---

## PHASE 2: Interaction, Filters & Embedding Infrastructure (Weeks 2–4)
*(Wiring in real embeddings + filters + cognitive prompts)*

### Tier #1: Local-First Full Immersion

-   **UI & Filters**
    -   **Tag/Color/Abstraction Filters**
        -   Sliders/dropdowns for levels; **drill-down** from Themes → Ideas → Facts
        -   **Progressive disclosure** (top-3 by default, “More…” expand)
    -   **Theme Clusters**
        -   Auto-cluster view, **Merge/Unmerge** controls
    -   **Memory Prompts**
        -   After 5 new bubbles: “What pattern do you observe?”
        -   After linking 3 clusters: “What higher-level theme emerges?”
    -   **Fuzzy Links**
        -   Dashed lines + tooltips (“Similarity: 0.xx”)
        -   Toggle to show/hide low-confidence links
    -   **Structured Entry Form**
        -   Placeholder hints (“Enter idea, date, reference…”)
        -   Inline validation + contextual microcopy

-   **Embedding & Vector Store (Local-First Implementation)**
    -   **Embed Micro-service** (FastAPI/Flask)
        -   `POST /v1/embed` (versioned) → float32[]
        -   Powered by highly optimized local models (e.g., Sentence Transformers via `llama.cpp` or Ollama).
        -   Health check `GET /healthz` + `/metrics` (Prometheus)
        -   In-memory LRU cache or Redis caching (for local performance)
    -   **Client Integration**
        -   Async embed on `addSegment()`/`updateSegment()` with loading state
        -   Timeout (200 ms) + retry logic. **Action:** Benchmark local embedding generation times (e.g., for typical segment lengths on a Mac Mini) with chosen models. Adjust timeout to a realistic, configurable value if 200ms is not consistently achievable. Implement robust progress indicators in UI during embedding.
    -   **Vector DB (Local)**
        -   Implement **SQLite + sqlite3_vector** as the primary local vector store.
        -   CI rebuild scripts + integration tests (insert→query→verify)
        -   Nightly snapshots & DB backups for local data safety.
        -   **Action:** Benchmark vector similarity search performance in SQLite with typical dataset sizes. Ensure proper indexing is configured for `sqlite3_vector` to achieve the 50ms target. Optimize query patterns if necessary.

> **Checkpoint:** Segments hold real embeddings, filterable by concept level, with cognitive prompts to surface reflection, all running efficiently on local hardware.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Vector DB (Cloud Readiness & Scalability)**
    -   Explore integrating with **PostgreSQL + pgvector** as a local scaling option that can also serve as a foundation for cloud-managed PostgreSQL instances.
    -   Refine the API Abstraction Layer (from Phase 1) to easily swap the local vector DB with cloud-based services like **Pinecone** or **Weaviate** (e.g., for larger datasets or distributed access).
    -   Implement automated indexing workflows to cloud vector DBs when new thought segments are created or edited, via n8n or direct service calls through the abstraction layer.
-   **Cloud-Based Embedding Alternatives:**
    -   Ensure the Embedding Service abstraction supports integration with cloud-based embedding APIs (e.g., OpenAI Embeddings) as an alternative if local performance is a bottleneck for some users or for specific use cases.

---

## PHASE 3: Proto-LCM & AI Hooks (Month 2–3)
*(Static NN + local LLM + UX & cognitive dialogues)*

### Tier #1: Local-First Full Immersion

1.  **Related Thoughts**
    -   “Show Related” → top-5 by cosine(sim) under 50 ms
    -   **Inline preview card** on hover (snippet + source tag)
    -   **Why this link?** CTA: AI explains connection in 1–2 sentences (powered by local LLM).

2.  **Metacognitive Dialogue**
    -   After suggestions: “Does this align with your goals?” (Yes/No + comment)
    -   Prompt “How does this change your current Theme?” on accept

3.  **Mock Diffusion & Blend**
    -   Blend two embeddings (e.g., via simple averaging or weighted interpolation) → decode via a small, quantized local LLM (e.g., ~1B parameter GGUF model) or specialized text generation model to produce a new segment text. This simulates a conceptual blend.
    -   Show in side panel with **Accept/Refine/Dismiss** actions.

4.  **LLM Micro-service (Local-First)**
    -   Containerize highly optimized and quantized 7B–8B LLMs (e.g., 4-bit GGML/GGUF models run via `llama.cpp` or a similar engine) for local deployment using Torch-Serve/BentoML.
    -   `POST /v1/complete` { context[], plan } → new segment text
    -   Async queue (Celery + Redis), rate-limiting, circuit breaker for local performance.
    -   `/metrics`: request rate, errors, GPU memory (for local monitoring).
    -   **Action:** Conduct extensive benchmarking on target hardware (e.g., Mac Mini, dedicated GPU machine) to establish realistic performance expectations (RAM, VRAM, inference speed).

5.  **AI UI Stubs & Co-Writing**
    -   Buttons: “What patterns repeat?”, “Any contradictions?” → overlay modal streaming suggestions (from local LLM).
    -   Co-writing pane stub: AI proposes bubbles/edits; **Accept/Refine/Dismiss**
    -   Explanatory footer: “Powered by ThoughtWeb AI—suggestions may vary.”

6.  **Auto-reflective Loop**
    -   Store AI proposals with `abstraction_level = ai_suggestion` + glow badge
    -   On accept: animate insertion, auto-link via NN query (using local embeddings/vector DB).

> **Checkpoint:** ThoughtWeb offers AI-driven ideas framed as reflective questions and transparent suggestions, primarily leveraging local LLM and embedding capabilities.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **LLM Micro-service (Cloud Alternatives)**
    -   Leverage the designed API abstraction layer to allow users to optionally integrate with cloud LLM APIs (e.g., OpenAI GPT models, Anthropic Claude) via their own API keys. This provides an alternative for users without powerful local hardware or who desire access to larger, more capable models.
-   **Cloud-Based RAG Integration:**
    -   For users leveraging cloud vector DBs (e.g., Pinecone), ensure the `Query Agent Workflow` in n8n (or directly in the application) can utilize these cloud services for retrieval.

---

## PHASE 4: Emergence Engine & Concept-Diffusion (Month 3+)
*(Deep reasoning: GPU-powered diffusion + iterative reflection + UX polish + MLOps metrics)*

### Tier #1: Local-First Full Immersion

-   **Heatmap & Timelines**
    -   Heatmap layer (hotness = access/timestamp) with legend + time-slider
    -   Timeline playback animating graph growth; snapshot prompts: “What changed today?”

-   **Recursive Queries (Local-First)**
    -   `POST /v1/query`: vector → LLM → vector; log DAGs for audit (all leveraging local LLM and vector DB).
    -   UI: collapsible query-tree sidebar for backtracking & tweak. **Action:** Design control mechanisms for recursive queries (e.g., user-configurable recursion depth limit, a 'stop' button). Implement UI feedback for query progress and emergent insights, potentially visualizing the query DAG. Focus on initial single-step or two-step recursive queries before deeper recursion.

-   **Concept-Diffusion Endpoints (Local GPU)**
    -   Containerize one-tower/two-tower diffusion (HF Diffusers) **on local GPU**.
    -   `POST /v1/diffuse` { contextEmbeds[], params } → sample embeddings
    -   GPU via Docker NVIDIA runtime or K8s device plugin (for local orchestration).
    -   Benchmark throughput & latency; CI smoke tests.
    -   **Action:** Clearly communicate hardware requirements to users.

-   **Advanced Contradiction Analysis**
    -   Debate view: side-by-side bubble pairs + AI-generated pros/cons (powered by local LLM).
    -   Prompt “Which stance resonates most, and why?”

-   **Goal-Oriented Planning**
    -   Multi-step Plan nodes outlining steps to Goals
    -   Drag-and-drop reordering; journaling prompts at each step: “What’s your next action?”

-   **Weekly Knowledge Consolidation**
    -   Auto-summaries of Themes with bullet prompts: “How would you teach this?” (from local LLM).

> **Checkpoint:** Full emergence engine with MLOps observability, UX metaphors, and cognitive reflection baked in, leveraging local GPU capabilities for advanced AI.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Concept-Diffusion (Cloud Alternatives)**
    -   Explore integrating with cloud-based diffusion services or larger, pre-trained diffusion models via API for users without local GPUs or for specialized, high-fidelity diffusion tasks.
-   **Recursive Queries (Cloud Scaling)**
    -   Ensure the abstraction layer supports running recursive queries against cloud-based LLM APIs or vector databases for improved performance or scalability if chosen by the user.

---

## PHASE 5: Full LCM Integration & Beyond (Month 4+)
*(Production-quality, collaborative, metacognitive partner)*

### Tier #1: Local-First Full Immersion

-   **Unified Concept-Model Service (Local Orchestration)**
    -   Merge embed + diffusion + LLM into a single container for efficient local deployment.
    -   `POST /v1/predict_sequence` & `/v1/coauthor`
    -   **Clarification:** For local deployments, this unified service will focus on efficient orchestration of models on a single machine (e.g., via Docker Compose).

-   **Beam Search & Hybrid Ranking**
    -   Implement beam search; score by cosine + LLM log-prob (using local models).
    -   Present ranked paths as flowchart; hover-preview before insert.

-   **Multimodal & Multilingual (Local Focus)**
    -   `/v1/embed_audio`, `/v1/generate_speech` (SONAR) – prioritizing local model implementation.
    -   Drag-drop images/audio → embed → thumbnails + language flags
    -   Language selector for SONAR decode target.
    -   **Action:** Research and implement highly optimized local models for these features to minimize resource demands.

-   **User-AI Collaborative Authoring**
    -   **Split-view pane**: left draft, right AI suggestions in context (from local models).
    -   **Change-tracking**: highlight AI edits, inline comments, version history.

-   **Socratic AI Dialogues**
    -   AI poses: “Why is this Theme significant?”; user replies refine graph (from local LLM).

-   **Adaptive Learning Paths**
    -   Suggest micro-lessons (articles/videos) tied to active Themes.

-   **Narrative Coherence Checker**
    -   Analyze cluster/story flow; prompt “Where are the logical gaps?”

-   **Spaced Repetition & Recall**
    -   Interval triggers surface old bubbles: “Do you still agree? Add a note.”

-   **Accessibility & Usability**
    -   Keyboard nav, screen-reader labels, color-blind safe palette
    -   Usability test scripts for every major feature

> **Ultimate Vision (Local-First Focus):**
> A **local, inspectable, production-quality hybrid-consciousness engine**—a true cognitive partner that suggests, challenges, guides, and reinforces insights over time, all within a rich, navigable ThoughtWeb, requiring minimal external dependencies.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Unified Concept-Model Service (Cloud Orchestration)**
    -   If a K8s cluster is considered, it would be for a distinct, self-hostable server version or cloud deployment option for advanced users or organizations, not a standard local user install.
-   **Multimodal & Multilingual (Cloud Alternatives)**
    -   Explore cloud-based APIs for more extensive multimodal capabilities or higher-fidelity speech generation if local models prove insufficient.
-   **Collaborative Workspaces (Cloud-Based Scaling)**
    -   Real-time multi-user graphs; shared Themes; role-based prompts (e.g. Devil’s Advocate).
    -   Conflict resolution tests; merge strategies in CI.
    -   **Action:** This is a significant engineering effort often requiring cloud infrastructure for robust real-time sync and conflict resolution. Prioritize making the single-user experience robust first.
-   **Deployment & Versioning (Cloud/Server-Side)**
    -   Helm/Terraform for infra-as-code (for cloud/server deployment, not for the default local user application).
    -   Docker images versioned semantically; model checkpoints tracked via MLflow/W&B.
    -   Canary strategy: shadow mode → incremental rollout.
    -   Security sandboxing, resource quotas, audit logs.

---
