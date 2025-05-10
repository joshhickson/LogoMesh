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
     
        
-   **05.09.2025 WE ARE HERE:**

-   **Graph Visualization & Data**
    -   Replace visual canvas with **Cytoscape.js** (open-source alternative).
    -   Create React wrapper using `ref` integration pattern.
    -   **Action: Implement Cytoscape.js Graph Model & Integrate `cytoscape.js-fcose` Layout.**
        -   Configure Cytoscape.js to correctly model **Thought Bubbles as compound parent nodes** and **Segments as their child nodes**. This is crucial for leveraging fCoSE's strengths.
        -   Integrate the `cytoscape.js-fcose` extension into the Cytoscape.js instance.
        -   Implement **automatic layout using `cytoscape.js-fcose`** for the graph.
        -   **Action:** Configure initial `cytoscape.js-fcose` parameters to prioritize:
            -   Clear visual separation of segments within their parent bubbles.
            -   Visually grouping connected bubbles.
            -   Minimizing edge crossings for a clean view.
            -   Aim for a balanced layout that hints at the graph's structure.
        -   **Note for Developers & LLM Agents:** `cytoscape.js-fcose` is a force-directed layout optimized for compound graphs. Its parameters (consult `cytoscape.js-fcose` documentation) can be tuned to influence node spacing, edge lengths, and clustering. Effective configuration is key to a clear visual representation of the thought structure. This lays the foundation for visually leveraging future schema metadata like `cluster_id` and `graph_neighbors` for more semantically informed layouts (in later phases).
    -   Migrate bubbles/segments from initial state (e.g., old JSON or dummy data) to the Cytoscape.js graph model.
    -   Implement full React ↔ Cytoscape.js sync for visual updates based on data changes.


-   **Local Persistence (SQLite - Foundation for Cluster Runtime & Universal Extensibility)**
    -   Set up **SQLite** DB instance (primary local database).
    -   **Action: Design and Implement Core SQLite Schema.** This schema must be robust, normalized, and incorporate foundational elements necessary for future "Cluster Runtime", efficient AI processing of large graphs, and Universal Extensibility for multiple data formats.
    -   Migrate JSON bubbles/segments into SQLite, ensuring data is correctly mapped to the new normalized schema.
    -   Implement full React ↔ SQLite load/save cycle via API or in-browser WebAssembly (e.g., sql.js), ensuring data is correctly read from and written to the new normalized table structure.
        -   Define core tables:
            -   `thoughts`: Stores thought bubble metadata (UUID PK `thought_bubble_id`, title, description, created_at, color, position_x REAL, position_y REAL, etc.).
            -   `segments`: Stores segment metadata and content.
                -   `segment_id` (`TEXT` / UUID - Primary Key)
                -   `thought_bubble_id` (`TEXT` / UUID - Foreign Key referencing `thoughts.thought_bubble_id`)
                -   `title` (`TEXT`)
                -   `content` (`TEXT`) - Stores text content OR a text placeholder for non-text types.
                -   `content_type` (`TEXT`) - **[Universal Extensibility]** Stores the modality type ('text', 'image', 'audio', 'video', etc.). Non-nullable, defaults to 'text'.
                -   `asset_path` (`TEXT`, Nullable) - **[Universal Extensibility]** Stores the local file path to the media asset for non-text segment types. NULL for text segments.
                -   `embedding_vector` (`BLOB` or `REAL` array serialized to TEXT) - Placeholder for segment embedding. Type TBD based on `sqlite3_vector` specifics, but allocate space/field.
                -   `created_at` (`INTEGER` or `TEXT`)
                -   `updated_at` (`INTEGER` or `TEXT`)
                -   `abstraction_level` (`TEXT`) - ('Fact', 'Idea', 'Theme', 'Goal'). Non-nullable, defaults to 'Fact'.
                -   **[AI Metadata / Attention Scaffolding Fields - Foundation for Cluster Runtime]**
                    -   `local_priority` (`REAL`) - Importance for LLM chunking. Non-nullable, defaults to 0.5.
                    -   `cluster_id` (`TEXT`) - Grouping by theme/narrative. **Non-nullable**, requires a value (implement a default 'uncategorized' cluster concept).
        -   Define linking/metadata tables (Normalized Approach):
            -   `thought_tags`: Links thoughts to tags.
                -   `thought_bubble_id` (`TEXT` / UUID - FK to `thoughts`)
                -   `tag_name` (`TEXT`)
                -   Primary Key (`thought_bubble_id`, `tag_name`)
            -   `segment_tags`: Links segments to tags.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `tag_name` (`TEXT`)
                -   Primary Key (`segment_id`, `tag_name`)
            -   `tags`: Stores unique tag names and metadata (e.g., color).
                -   `tag_name` (`TEXT` - Primary Key)
                -   `color` (`TEXT`)
            -   `segment_fields`: **[Normalized Fields]** Stores key-value field data for segments.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `field_name` (`TEXT`)
                -   `field_value` (`TEXT`)
                -   `field_type` (`TEXT`) - ('text', 'number', 'date', 'concept', etc.)
                -   Primary Key (`segment_id`, `field_name`) - (Assuming field names are unique per segment)
            -   `segment_neighbors`: **[Normalized Graph Neighbors]** Stores neighbor relationships between segments.
                -   `source_segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `target_segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `relationship_type` (`TEXT`, Nullable) - Type of link (e.g., 'semantic_similarity', 'manual', 'ai_suggested', 'potential_analogy', 'supports_claim'). Allows for 'fuzzy links' and theory representation.
                -   Primary Key (`source_segment_id`, `target_segment_id`, `relationship_type`) - if multiple relationship types between same two segments are possible. If only one type per pair, Primary Key (`source_segment_id`, `target_segment_id`). **Decision:** Assume Primary Key (`source_segment_id`, `target_segment_id`, `relationship_type`) for max flexibility.
            -   `segment_related_context`: **[Normalized Related Context]** Stores arbitrary context links for segments.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `context_key` (`TEXT`) - Label for the context (e.g., 'source_document', 'external_url', 'related_concept_string').
                -   `context_value` (`TEXT`) - The actual context value (e.g., '/path/to/doc.pdf', 'https://...', 'Predictive Maintenance', a segment ID).
                -   `context_type` (`TEXT`, Nullable) - Type of value (e.g., 'filepath', 'url', 'string', 'segment_id').
                -   Primary Key (`segment_id`, `context_key`, `context_value`) - Assuming a unique key+value pair per segment.
            -   `segment_llm_history`: **[Structured LLM History]** Stores audit trail of AI processing.
                -   `history_id` (`TEXT` / UUID - Primary Key)
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `pass_timestamp` (`INTEGER`) - Unix timestamp.
                -   `llm_model` (`TEXT`)
                -   `prompt_summary` (`TEXT`)
                -   `output_summary` (`TEXT`)
                -   `context_chunk_ids` (`TEXT`) - JSON string array of `segment_id`s in the input chunk.
                -   `actions_taken` (`TEXT`) - JSON string array of actions/suggestions.
                -   `temperature` (`REAL`, Nullable)
                -   `top_p` (`REAL`, Nullable)
                -   `random_seed` (`INTEGER`, Nullable)
                -   `version` (`TEXT`, Nullable) - Version of processing logic.

        -   **Note for Future Developers:** This normalized schema, including dedicated tables for fields, relationships, context, and LLM history, aligns with best practices for relational databases and is designed to support efficient querying and complex data relationships critical for "Cluster Runtime" scalability and advanced AI features. The AI metadata fields (`local_priority`, `cluster_id`, etc.) are foundational for the Context Window Allocator and intelligent AI processing. The `content_type` and `asset_path` fields enable Universal Extensibility for multimodal data, allowing future AI pipelines to process and link various media types.
        -   **Action:** Design and implement appropriate SQLite Indexes for efficient querying, focusing on Foreign Keys (`thought_bubble_id`, `segment_id`), AI metadata fields (`local_priority`, `cluster_id`), and fields/tags (`field_name`, `field_value`, `tag_name`).
    -   Migrate JSON bubbles/segments into SQLite, ensuring data is correctly mapped to the new normalized schema. This will involve parsing the JSON `fields` array and inserting rows into the `segment_fields` table, etc.
    -   Implement full React ↔ SQLite load/save cycle via API or in-browser WebAssembly (e.g., sql.js), ensuring data is correctly read from and written to the new normalized table structure.

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
    -   DB migration scripts (Knex/Flyway) in CI - **Action:** Ensure migration scripts correctly handle creating the new normalized tables and fields.
    -   Unit tests for React–SQLite sync - **Action:** Update unit tests to verify data is correctly written to and read from the new normalized schema.
    -   GitHub Actions for lint/build/test on PR

-   **UX Foundations**
    -   Style guide: node shapes, WCAG palette, typography scale
    -   Basic interactions: click-select, hover-preview, drag-pan/zoom
    -   Onboarding tour stub with progressive-disclosure

> **Goal:** A solid, repeatable dev environment with clear hierarchy, automation readiness, and consistent UI patterns, underpinned by a robust, normalized SQLite schema designed for future AI processing needs, multimodal flexibility, and foundational "Cluster Runtime" considerations.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **API Abstraction Layer Design (Foundation for Cloud Integration & Universal Extensibility)**
    -   Design clear API contracts and interfaces for **Embedding Services** and **Vector Databases** that allow for swapping out local implementations (e.g., `sqlite3_vector`) with cloud-based alternatives (e.g., Pinecone, Weaviate) in later phases without major refactoring.
    -   Define base classes/interfaces for AI model interactions that support various LLM APIs (local via `llama.cpp`/Ollama, or cloud like OpenAI/GPT) for future extensibility.
    -   **Action:** Explicitly design these abstraction layers to handle different data modalities, allowing future integration of multimodal AI services (e.g., image captioning APIs, audio transcription models) through the same generalized interfaces.
-   **Automation Foundations (Cloud Readiness)**
    -   Consider architecture patterns for extending n8n workflows to potentially interact with cloud services for backups or integrations as complexity warrants.

### Should you implement fCoSE at the same time as SQLite?

Yes, absolutely. Implementing the Cytoscape.js / `cytoscape.js-fcose` integration **concurrently** with the SQLite implementation (specifically the data *reading* and loading part) is highly recommended and beneficial for several reasons:

1.  **Integrated Testing:** You need data to test your visual canvas and layout. Loading this data from the new SQLite database provides an immediate way to see if your data migration and database reading logic are working correctly *and* if the visual layer is interpreting that data as expected.
2.  **Visual Feedback:** Seeing the graph rendered and automatically laid out based on data pulled from SQLite gives you instant visual feedback on both systems. You can quickly spot if data is missing, relationships are incorrect, or if the layout isn't behaving as anticipated with real (or realistic dummy) data from the database.
3.  **Identifying Bottlenecks:** Implementing the data loading from SQLite to the Cytoscape.js graph model and then applying the fCoSE layout allows you to identify potential performance bottlenecks early in the data pipeline or the rendering process.
4.  **Ensuring Compatibility:** It ensures that the data structure you're pulling from SQLite is correctly formatted and structured for the Cytoscape.js graph model, which is necessary for fCoSE (especially for compound nodes).

You can break this down into smaller, testable steps:

* Implement basic SQLite schema and data insertion.
* Implement a function to *read* data from SQLite.
* Implement the React wrapper for Cytoscape.js.
* Implement the logic to convert data read from SQLite into the Cytoscape.js graph model format (nodes and edges, including parent-child relationships for compound nodes).
* Integrate `cytoscape.js-fcose` and apply the layout to the graph model loaded from SQLite.
* Incrementally refine both the SQLite reading logic and the Cytoscape.js/fCoSE implementation based on testing.

By tackling these together, you ensure that your new data backend (SQLite) is correctly hooked up to your new data visualization frontend (Cytoscape.js + fCoSE), building a solid functional core for Phase 1.





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

-   **Embedding & Vector Store (Local-First Implementation - Leveraging Phase 1 Foundations)**
    -   **Embed Micro-service** (FastAPI/Flask)
        -   `POST /v1/embed` (versioned) → float32[]
        -   Powered by highly optimized local models (e.g., Sentence Transformers via `llama.cpp` or Ollama).
        -   Health check `GET /healthz` + `/metrics` (Prometheus)
        -   In-memory LRU cache or Redis caching (for local performance)
    -   **Client Integration**
        -   Async embed on `addSegment()`/`updateSegment()` with loading state
        -   Timeout (200 ms) + retry logic. **Action:** Benchmark local embedding generation times (e.g., for typical segment lengths on a Mac Mini) with chosen models. Adjust timeout to a realistic, configurable value if 200ms is not consistently achievable. Implement robust progress indicators in UI during embedding.
    -   **Vector DB (Local)**
        -   Implement **SQLite + sqlite3_vector** as the primary local vector store, utilizing the schema designed in Phase 1 (including metadata fields for future AI processing).
        -   CI rebuild scripts + integration tests (insert→query→verify)
        -   Nightly snapshots & DB backups for local data safety.
        -   **Action:** Benchmark vector similarity search performance in SQLite with typical dataset sizes, focusing on efficient querying of embeddings and related metadata fields. Ensure proper indexing is configured for `sqlite3_vector` to achieve the 50ms target. Optimize query patterns if necessary.
    -   **Pathways for Multimodal Embedding (Universal Extensibility Follow-up):**
        -   **Action: Research & Design Pathways for Multimodal Processing Integration.** Based on the schema flexibility designed in Phase 1, research potential technical pathways for integrating future multimodal embedding models (image, audio, video) and their processing pipelines. This phase focuses on design, not implementation, preparing for later phases.

> **Checkpoint:** Segments hold real embeddings (primarily text initially), are filterable by concept level, with cognitive prompts to surface reflection, all running efficiently on local hardware, with foundational schema and design patterns for future extensibility and scalability.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Vector DB (Cloud Readiness & Scalability - Leveraging Phase 1 Foundations)**
    -   Explore integrating with **PostgreSQL + pgvector** as a local scaling option that can also serve as a foundation for cloud-managed PostgreSQL instances, building on the schema design from Phase 1.
    -   Refine the API Abstraction Layer (from Phase 1) to easily swap the local vector DB with cloud-based services like **Pinecone** or **Weaviate** (e.g., for larger datasets or distributed access), ensuring the schema metadata is compatible or can be mapped.
    -   Implement automated indexing workflows to cloud vector DBs when new thought segments are created or edited, via n8n or direct service calls through the abstraction layer.
-   **Cloud-Based Embedding Alternatives:**
    -   Ensure the Embedding Service abstraction supports integration with cloud-based embedding APIs (e.g., OpenAI Embeddings) as an alternative if local performance is a bottleneck for some users or for specific use cases.

---

## PHASE 3: Proto-LCM & AI Hooks (Month 2–3)
*(Static NN + local LLM + UX & cognitive dialogues - Integrating Context Management)*

### Tier #1: Local-First Full Immersion

1.  **Related Thoughts**
    -   “Show Related” → top-5 by cosine(sim) under 50 ms (leveraging Phase 2 vector store).
    -   **Inline preview card** on hover (snippet + source tag)
    -   **Why this link?** CTA: AI explains connection in 1–2 sentences (powered by local LLM).

2.  **Metacognitive Dialogue**
    -   After suggestions: “Does this align with your goals?” (Yes/No + comment)
    -   Prompt “How does this change your current Theme?” on accept

3.  **Mock Diffusion & Blend**
    -   Blend two embeddings (e.g., via simple averaging or weighted interpolation) → decode via a small, quantized local LLM (e.g., ~1B parameter GGUF model) or specialized text generation model to produce a new segment text. This simulates a conceptual blend.
    -   Show in side panel with **Accept/Refine/Dismiss** actions.

4.  **LLM Micro-service (Local-First - Implementing Context Management)**
    -   Containerize highly optimized and quantized 7B–8B LLMs (e.g., 4-bit GGML/GGUF models run via `llama.cpp` or a similar engine) for local deployment using Torch-Serve/BentoML.
    -   `POST /v1/complete` { context[], plan } → new segment text
    -   Async queue (Celery + Redis), rate-limiting, circuit breaker for local performance.
    -   `/metrics`: request rate, errors, GPU memory (for local monitoring).
    -   **Action: Design and Implement Context Window Allocator / Chunking Strategy Middleware.** Create a component that utilizes the schema metadata from Phase 1 (`local_priority`, `graph_neighbors`, `cluster_id`, etc.) to intelligently select, rank, and chunk data from the local vector store and database for LLM calls. This middleware is critical for managing LLaMA 3's context window limits for large graphs.
        -   Design logic for prioritizing segments based on `local_priority` and `graph_neighbors`.
        -   Implement chunking based on token count limits (e.g., keeping chunks below 16k or 32k tokens).
        -   Incorporate the use of `cluster_id` for scoped queries.
        -   Design how `llm_pass_history` will be updated/utilized.
    -   **Action: Implement LLM-Powered Document Parsing (Text-Only Initial Focus).** Integrate the LLaMA 3 parsing pipeline (Text extraction → LLaMA 3 segmentation → ThoughtWeb JSON formatting → DB Injection) leveraging the new Context Window Allocator and the flexible schema. Initial focus is on text documents (PDF, Markdown, TXT).

5.  **AI UI Stubs & Co-Writing**
    -   Buttons: “What patterns repeat?”, “Any contradictions?” → overlay modal streaming suggestions (from local LLM).
    -   Co-writing pane stub: AI proposes bubbles/edits; **Accept/Refine/Dismiss**
    -   Explanatory footer: “Powered by ThoughtWeb AI—suggestions may vary.”
    -   **Action:** Design UI feedback mechanisms to inform the user when the AI is processing a large graph using the chunking strategy (e.g., "Analyzing cluster 'X'", "Processing neighborhood around 'Y'").

6.  **Auto-reflective Loop**
    -   Store AI proposals with `abstraction_level = ai_suggestion` + glow badge
    -   On accept: animate insertion, auto-link via NN query (using local embeddings/vector DB), ensuring new segments incorporate the necessary metadata (`local_priority`, `graph_neighbors`, `cluster_id`) based on context.

> **Checkpoint:** ThoughtWeb offers AI-driven ideas framed as reflective questions and transparent suggestions, primarily leveraging local LLM and embedding capabilities, supported by an intelligent context management layer.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **LLM Micro-service (Cloud Alternatives - Leveraging Abstraction)**
    -   Leverage the designed API abstraction layer to allow users to optionally integrate with cloud LLM APIs (e.g., OpenAI GPT models, Anthropic Claude) via their own API keys. This provides an alternative for users without powerful local hardware or who desire access to larger, more capable models, integrating these cloud models with the Context Window Allocator middleware.
-   **Cloud-Based RAG Integration:**
    -   For users leveraging cloud vector DBs (e.g., Pinecone), ensure the `Query Agent Workflow` in n8n (or directly in the application) can utilize these cloud services for retrieval, integrating with the Context Window Allocator for query context.

---

## PHASE 4: Emergence Engine & Concept-Diffusion (Month 3+)
*(Deep reasoning: GPU-powered diffusion + iterative reflection + UX polish + MLOps metrics - Advancing Cluster Runtime & Extensibility)*

### Tier #1: Local-First Full Immersion

-   **Heatmap & Timelines**
    -   Heatmap layer (hotness = access/timestamp) with legend + time-slider
    -   Timeline playback animating graph growth; snapshot prompts: “What changed today?”

-   **Recursive Queries (Local-First - Utilizing Chunking & Metadata)**
    -   `POST /v1/query`: vector → LLM → vector; log DAGs for audit (all leveraging local LLM and vector DB).
    -   UI: collapsible query-tree sidebar for backtracking & tweak. **Action:** Design control mechanisms for recursive queries (e.g., user-configurable recursion depth limit, a 'stop' button). Implement UI feedback for query progress and emergent insights, potentially visualizing the query DAG, underpinned by the Context Window Allocator's intelligent data selection. Focus on initial single-step or two-step recursive queries before deeper recursion. Explore implementing Recursive Attention Stitching (RAS) techniques facilitated by the schema metadata (`graph_neighbors`, `llm_pass_history`).

-   **Concept-Diffusion Endpoints (Local GPU)**
    -   Containerize one-tower/two-tower diffusion (HF Diffusers) **on local GPU**.
    -   `POST /v1/diffuse` { contextEmbeds[], params } → sample embeddings
    -   GPU via Docker NVIDIA runtime or K8s device plugin (for local orchestration).
    -   Benchmark throughput & latency; CI smoke tests.
    -   **Action:** Clearly communicate hardware requirements to users.

-   **Advanced Contradiction Analysis**
    -   Debate view: side-by-side bubble pairs + AI-generated pros/cons (powered by local LLM, leveraging chunking strategy for relevant context).
    -   Prompt “Which stance resonates most, and why?”

-   **Goal-Oriented Planning**
    -   Multi-step Plan nodes outlining steps to Goals
    -   Drag-and-drop reordering; journaling prompts at each step: “What’s your next action?”

-   **Weekly Knowledge Consolidation**
    -   Auto-summaries of Themes with bullet prompts: “How would you teach this?” (from local LLM, leveraging chunking strategy for relevant Theme context).

-   **Multimodal Processing (Pathway Implementation - Building on Phase 2 Design)**
    -   **Action: Begin Implementation of Multimodal Embedding Pathways.** Based on the research and design from Phase 2, start implementing the technical pathways for processing and embedding at least one additional modality (e.g., images via OCR/CLIP embeddings), integrating with the flexible schema and abstraction layers. This does not require full AI interpretation yet, but establishes the data pipeline.

> **Checkpoint:** Full emergence engine with MLOps observability, UX metaphors, and cognitive reflection baked in, leveraging local GPU capabilities for advanced AI and recursive processing, with initial pathways for multimodal data established.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Concept-Diffusion (Cloud Alternatives)**
    -   Explore integrating with cloud-based diffusion services or larger, pre-trained diffusion models via API for users without local GPUs or for specialized, high-fidelity diffusion tasks, integrating via abstraction layers.
-   **Recursive Queries (Cloud Scaling)**
    -   Ensure the abstraction layer supports running recursive queries against cloud-based LLM APIs or vector databases for improved performance or scalability if chosen by the user, ensuring compatibility with the schema metadata and Context Window Allocator logic.

---

## PHASE 5: Full LCM Integration & Beyond (Month 4+)
*(Production-quality, collaborative, metacognitive partner - Advanced Cluster Runtime & Full Extensibility)*

### Tier #1: Local-First Full Immersion

-   **Unified Concept-Model Service (Local Orchestration)**
    -   Merge embed + diffusion + LLM into a single container for efficient local deployment, orchestrated by Docker Compose.
    -   `POST /v1/predict_sequence` & `/v1/coauthor`
    -   **Clarification:** This unified service focuses on efficient orchestration of models on a single machine, building on the Context Window Allocator and schema metadata for processing.

-   **Beam Search & Hybrid Ranking**
    -   Implement beam search; score by cosine + LLM log-prob (using local models).
    -   Present ranked paths as flowchart; hover-preview before insert.

-   **Multimodal & Multilingual (Full Implementation - Leveraging Pathways)**
    -   `/v1/embed_audio`, `/v1/generate_speech` (SONAR), `/v1/embed_image`, `/v1/process_video`.
    -   **Action:** Fully implement processing, embedding, and AI interpretation pipelines for multiple modalities based on pathways established in Phase 4, integrating with the flexible schema and using the Context Window Allocator to manage multimodal context for AI models. Prioritize highly optimized local models where feasible.
    -   Drag-drop images/audio → embed → thumbnails + language flags
    -   Language selector for SONAR decode target.

-   **User-AI Collaborative Authoring**
    -   **Split-view pane**: left draft, right AI suggestions in context (from local models, leveraging chunking strategy).
    -   **Change-tracking**: highlight AI edits, inline comments, version history.

-   **Socratic AI Dialogues**
    -   AI poses: “Why is this Theme significant?”; user replies refine graph (from local LLM, leveraging chunking strategy and schema metadata).

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
> A **local, inspectable, production-quality hybrid-consciousness engine**—a true cognitive partner that suggests, challenges, guides, and reinforces insights over time, all within a rich, navigable ThoughtWeb, requiring minimal external dependencies, built on a foundation of universal extensibility and designed with "Cluster Runtime" principles for future growth.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Unified Concept-Model Service (Cloud Orchestration - Full Cluster Runtime)**
    -   Implement deployment using a K8s cluster for a distinct, self-hostable server version or cloud deployment option. This enables true "Cluster Runtime" for large-scale or multi-user scenarios, building on the schema, abstraction layers, and context management logic developed in Tier #1.
-   **Multimodal & Multilingual (Cloud Alternatives)**
    -   Explore cloud-based APIs for more extensive multimodal capabilities or higher-fidelity speech generation if local models prove insufficient, integrating via abstraction layers.
-   **Collaborative Workspaces (Cloud-Based Scaling - Full Cluster Runtime)**
    -   Implement Real-time multi-user graphs; shared Themes; role-based prompts (e.g. Devil’s Advocate).
    -   Develop Conflict resolution tests; merge strategies in CI.
    -   **Action:** This is a significant engineering effort often requiring cloud infrastructure for robust real-time sync and conflict resolution, leveraging the "Cluster Runtime" foundation. Prioritize making the single-user experience robust first.
-   **Deployment & Versioning (Cloud/Server-Side)**
    -   Helm/Terraform for infra-as-code (for cloud/server deployment, not for the default local user application).
    -   Docker images versioned semantically; model checkpoints tracked via MLflow/W&B.
    -   Canary strategy: shadow mode → incremental rollout.
    -   Security sandboxing, resource quotas, audit logs.

---
