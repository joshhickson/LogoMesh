# PHASE 2 ADDENDUM: Vector Translation Core (VTC) Foundations & Enhanced Semantic Intelligence

**Date:** May 23, 2025
**Version:** 1.0

**Prerequisite:** Completion of Phase 1, including a functional LM-Core with SQLite persistence, a backend API, initial `LLMExecutor` and `LLMTaskRunner` stubs, and basic local AI model integration (e.g., mock Ollama).

**Overall Goal for this Addendum:**
To lay the foundational groundwork for the Vector Translation Core (VTC) within LogoMesh, enabling initial cross-model semantic operations and establishing a transparent, auditable data pipeline for embeddings. This addendum prioritizes building the *infrastructure and data practices* for VTC, with a proof-of-concept (PoC) translator, rather than aiming for perfect translation quality in this phase. It focuses on using fast, lightweight local models.

---

**Theme 1: Activating Local AI - Enhanced with VTC-Readiness**
    (Extends existing Phase 2 Theme 1)

*   **Sub-Theme 1.1: Embedding Generation & Storage with Transparency**
    *   **Concept:** All `Segments` (and potentially `Thoughts` later) will have a primary semantic embedding. The generation and storage of this embedding will be transparent and auditable.
    *   **Modules/Features:**
        1.  **Refine `EmbeddingService` (`@core/services/embeddingService.ts`):**
            *   Fully implement to use concrete local models (e.g., `bge-small` via configured `OllamaExecutor` or `LlamaCppExecutor`).
            *   Method `generateEmbedding(text: string, modelName: string): Promise<{ vector: number[], modelUsed: string }>`.
        2.  **Update `Segment` Interface & Schema (`@contracts/entities.ts`, `@core/db/schema.sql`):**
            *   Ensure `Segment` includes:
                *   `embedding_vector: number[]` (non-optional if an embedding is always generated).
                *   `embedding_model_id: string` (to store the name/ID of the model that generated `embedding_vector`).
        3.  **Update `IdeaManager` / `SQLiteStorageAdapter`:**
            *   When a `Segment` is created/updated, call `EmbeddingService` to generate its primary embedding.
            *   Store both `embedding_vector` and `embedding_model_id` in the SQLite database.
        4.  **User Toggle: `[TOGGLE_STORE_RAW_FOR_EMBEDDING]` (System Config / UI Setting):**
            *   **If ON (Default for Dev/Research):** When an embedding is generated, ensure the original `segment.content` (raw text) is always stored alongside `embedding_vector` and `embedding_model_id`.
            *   **If OFF (Optional for Privacy/Brevity):** Allow `segment.content` to be potentially cleared or replaced by a summary *after* embedding, if the `Self-Sovereign Latent Store` feature (see below) is active and the user chooses this. For Phase 2, focus on ON by default.
        *   *Verification:* Segments are embedded using a local model. The vector, model ID, and (if toggle is on) raw text are stored.

*   **Sub-Theme 1.2: Semantic Compression Pipeline (Initial Pass)**
    *   **Concept:** Embeddings serve as the "compressed semantic representation." The `ThoughtExportProvider` will use these for context shaping.
    *   **Modules/Features:**
        1.  **Enhance `ThoughtExportProvider`:**
            *   When options like `abstractionLevel` or `localPriorityThreshold` are used, and if embeddings are available, these factors can influence which segments' full content vs. just their embeddings (or titles) are included in the exported context slice.
            *   *(Note: Full semantic compression logic is advanced. Phase 2 focuses on using embeddings as a *factor* in context selection).*
        2.  **User Toggle: `[TOGGLE_LINK_EMBEDDINGS_TO_METADATA]` (System Config / UI Setting):**
            *   **If ON (Default):** When data is exported or processed, explicitly link/associate the `embedding_vector` with its source `segment_id`, `segment.content` (if available), SQL tags/fields (via `segment.fields`, `segment.tags`), and `embedding_model_id`.
            *   This makes the "hybrid linkage" explicit for downstream processes or logging.
        *   *Verification:* `ThoughtExportProvider` can optionally use embedding presence/metadata to refine context slices.

---

**Theme 2: Foundations for Vector Translation Core (VTC)**
    (Extends existing Phase 2 Theme 2)

*   **Sub-Theme 2.1: Universal Latent Space (ULS) Management & PoC Translator**
    *   **Concept:** Establish the `UniversalLatentSpaceManager` and implement a basic, demonstrable vector translation.
    *   **Modules/Features:**
        1.  **Implement `UniversalLatentSpaceManager` (`@core/services/ulsManager.ts`):**
            *   `registerEmbeddingModel(modelInfo: EmbeddingModelInfo)`: Stores info about known local models.
            *   `translateVector(vector: number[], sourceModelId: string, targetModelId: string): Promise<number[]>`:
                *   **Phase 2 PoC:** Implement a simple translator for ONE pair of local text models (e.g., `bge-small` <-> `e5-small`). This can be:
                    *   A pre-trained linear projection matrix loaded from file.
                    *   A tiny MLP trained offline (Python, then weights loaded) on pseudo-aligned sentences (e.g., many sentences embedded by both models, then train a map).
                    *   If direct translation is too complex for initial Phase 2, this method can *simulate* translation by returning the original vector with a note if models are similar, or a specially crafted "placeholder" vector if different, logging the attempt. The key is the API exists and is called.
                *   If no translator exists for the pair, log a warning and return the original vector or throw an error.
        2.  **User Toggle: `[TOGGLE_VTC_TRANSPARENCY_LOGGING]` (System Config / UI Setting):**
            *   **If ON (Default for Dev/Research):** When `translateVector` is called:
                *   Log the `source_vector`, `source_model_id`, `target_model_id`, the resulting `target_vector`, and a reference to the `segment_id` (if applicable) whose vector was translated.
                *   Store this in a new SQLite table, e.g., `vector_translation_audit_log (translation_id, segment_id, source_model_id, target_model_id, source_vector_preview, target_vector_preview, timestamp)`.
                *   This creates the dataset for future VTC improvements.
            *   *Verification:* `ulsManager.translateVector` can be called. For the PoC pair, a (potentially simple) transformation occurs. If the toggle is on, translation attempts are logged.

*   **Sub-Theme 2.2: Self-Sovereign Latent Store & Transparent Mode**
    *   **Concept:** Allow embeddings to be the canonical representation, with optional transparency.
    *   **Modules/Features:**
        1.  **Update `Segment` Interface & Schema:**
            *   Make `content: string` optional (`content?: string;`).
        2.  **User Toggle: `[TOGGLE_SEGMENT_TRANSPARENT_MODE]` (Per Segment or Global Default):**
            *   **If ON (Default):** When a segment is created/updated, store `content` (raw text), `fields`, `tags`, `embedding_vector`, `embedding_model_id`.
            *   **If OFF (Vector-First/Latent Mode):** Allow creation of a segment where `content` might be empty or a brief summary, but `embedding_vector` and `embedding_model_id` are primary. The system relies on the vector for semantic meaning.
                *   *(Note: UI implications for creating/viewing vector-only segments need consideration in UI tasks).*
        *   *Verification:* Segments can be created/stored with or without full raw text if `TOGGLE_SEGMENT_TRANSPARENT_MODE` allows. All necessary metadata (model ID, etc.) is stored with embeddings.

---

**Theme 3: "Self-Building/Repair" Scaffolding & Developer Experience**
    (No direct changes from this addendum, but the transparency logs from VTC and embedding generation feed into this by creating rich datasets for future AI-driven development/analysis of LogoMesh itself).

---

**Implications for Phase 2 Timeline & Scope:**

*   Implementing the PoC VTC translator, even a simple one, will require dedicated R&D time (Python scripting, basic ML model training/loading). This should be a distinct sub-project within Phase 2.
*   The database schema will need to be extended for `embedding_model_id` on segments and the `vector_translation_audit_log` table. Migration scripts will be needed.
*   UI will need to be updated to reflect and manage these new toggles and potentially visualize embedding metadata or translation logs (basic views).

**This addendum makes Phase 2 more ambitious by starting practical VTC work, but it does so in a "realistic, fast, and scalable without burning cash or time" manner by focusing on local, lightweight models and foundational data logging.** It directly supports the goal of making LogoMesh a system that can *understand and explain itself* by making the AI's own representations (embeddings and their translations) first-class, auditable citizens of the data model.
```

---

This addendum should provide a clear focus for the VTC-related aspects of Phase 2.

We can now move on to fleshing out other aspects of Phase 2 if you're ready, or I can proceed to the next step in your original request (which was generating the Phase 1 rewrite checklist, but we've since decided to do the `ARCHITECTURE.MD` and Master Mermaid first, and then the checklist).

Given our current state (finalized `ARCHITECTURE.MD v2.7` and a solid "End Vision Phase 1 Architecture" Mermaid v3.1), the next logical step in *our current meta-task* is for me to **generate the Phase 1 Implementation Checklist** based on these. Or, if you prefer to continue fleshing out Phase 2 more broadly first, I can do that. Let me know your preference.