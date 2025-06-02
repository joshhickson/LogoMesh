### Note: These suggestions may be inaccurate because Gemini has never read the latest repository branch.

**1. VTC & Semantic Compression Enhancements:**
*   **VTC Concept Integration (Phase 1):**
    *   **Goal:** Implement a basic VTC translator for a *single pair of local text models* (e.g., `bge-small` and `e5-small`) as a proof-of-concept within the `ulsManager`.
    *   **Action:**
        *   Implement the `ulsManager.translateVector(...)` method with a simple, trainable model (e.g., linear projection matrix).
        *   Update the UI/API to allow users to select a source and target model for translation.
        *   Implement the user toggle for VTC transparency logging.
*   **Semantic Compression Pipeline (Phase 1):**
    *   **Goal:** Use embeddings as the primary semantic representation and link them to raw text, SQL tags, and post-VTC embeddings.
    *   **Action:**
        *   Enhance `ThoughtExportProvider` to include options for abstraction level, relevance scoring, and relationship depth.
        *   Implement the user toggle for hybrid linkage of embeddings.
        *   Create a new table `vector_translation_log` for VTC transparency logging.
*   **Self-Sovereign Latent Store (Phase 1):**
    *   **Goal:** Allow embeddings to be the canonical representation, with optional transparency.
    *   **Action:**
        *   Update the `Segment` interface and schema to make `content` optional.
        *   Implement the user toggle for `transparentMode`.

**2. AI-Driven Self-Analysis & Plugin Development:**
*   **LM-Core Self-Documentation & API Schema Generation Agent (Phase 1):**
    *   **Goal:** Leverage an LLM agent to auto-generate API documentation and internal architecture notes.
    *   **Action:**
        *   Implement a `CodeAnalysisLLMExecutor` using a local model (e.g., CodeLlama).
        *   Integrate this executor with `LLMTaskRunner` and `PluginHost`.
*   **Plugin Manifest & Interface Conformance Analysis Agent (Phase 1):**
    *   **Goal:** Use an LLM agent to analyze plugin manifests and code for conformance.
    *   **Action:**
        *   Enhance `PluginHost` to validate plugin manifests.
        *   Integrate the `CodeAnalysisLLMExecutor` to check plugin code against `PluginAPI` interfaces.
*   **VTC Semantic Link Suggester Agent (Phase 1):**
    *   **Goal:** Use an LLM agent with VTC capabilities to suggest semantic links between segments.
    *   **Action:**
        *   Integrate `LLMTaskRunner`, `EmbeddingService`, `ulsManager`, and `IdeaManager`.
        *   Implement a UI for users to review and accept suggested links.
*   **Task Pipeline Design Assistant Agent (via DevShell - Phase 1):**
    *   **Goal:** Allow users to describe workflows, and an agent drafts a `Pipeline` schema.
    *   **Action:**
        *   Implement a `DevShell` plugin with a `CloudDevLLMExecutor`.
        *   Integrate this with `TaskEngine` to validate and store drafted pipelines.
*   **Basic 'Cognitive Load' Aware Task Throttling (Phase 1):**
    *   **Goal:** Implement rule-based task throttling in `MetaExecutor` or `TaskEngine`.
    *   **Action:**
        *   Enhance `CognitiveLoadProfile` and `TaskCostMetadata`.
        *   Implement basic queuing or deferral of "heavy" tasks.

**3. Self-Building/Repair Scaffolding & Developer Experience:**
*   **"Developer Mode" `LLMExecutor` (Phase 1):**
    *   **Goal:** Create a `CloudDevLLMExecutor` for developer-triggered tasks.
    *   **Action:**
        *   Implement an executor that uses an API key for a cloud LLM.
        *   Ensure this is only accessible in a "Developer Mode."
*   **`DevShell` Plugin (Initial Stub - Phase 1):**
    *   **Goal:** Create a basic `DevShell` plugin for developer interaction.
    *   **Action:**
        *   Implement a plugin manifest for `DevShell`.
        *   Integrate `LLMTaskRunner` with `CloudDevLLMExecutor`.
        *   Provide a simple interface for sending prompts to the developer LLM.
*   **File System Access for DevShell (Controlled - Phase 1):**
    *   **Goal:** Allow `DevShell` to read and propose changes to project files.
    *   **Action:**
        *   Expose controlled methods in `PluginAPI` for reading and proposing file changes.
        *   Implement a review mechanism for proposed changes.
*   **Input Templating System (Basic - Phase 1):**
    *   **Goal:** Create a service for transforming structured inputs into `ThoughtNode`s.
    *   **Action:**
        *   Implement `@core/utils/inputTemplateService.ts`.
        *   Integrate this with `BackendAPI` for handling form submissions.

