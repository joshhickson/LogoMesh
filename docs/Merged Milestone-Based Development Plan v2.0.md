# Milestone-Based Development Plan (v2.0 – Unified: Core + MLOps + UX + Cognitive)

---

## PHASE 1: Scaffold & Realignment (Weeks 1–2)  
*(Pure ThoughtWeb core—no AI, with MLOps & UX foundations)*

- **Start Using docs/Claude-log.md**
  - Purpose: Manual running log of Claude’s outputs, bugs, and resolutions.
  - Action: After each successful Claude task, append:
      - Task name
      - Prompt summary
      - Summary of changes
      - Observed outcome / test result
      - Any error messages, hallucinations, or edge-case discoveries
   
- ** Create state_snapshots/ folder in root**
  - Purpose: Stores .json exports of full graph state at milestone checkpoints.
  - Action: At the end of each major phase (e.g. post-ReGraph, post-filter layer), export graph data using the current JSON schema and save to:
      - state_snapshots/v0.1_init.json
      - state_snapshots/v0.2_with_filters.json
      - state_snapshots/v1.0_ai_ready.json

- **Create todo/Claude_Feedback.md**
  - Purpose: Running scratchpad for user observations about Claude’s behavior.
  - Action: After every 2–3 Claude sessions, document:
      - Repeated inefficiencies
      - Things Claude misunderstood or mis-executed
      - Any suggested prompts that increased precision
      - Promising follow-ups or forked ideas to revisit

- **ReGraph & Data**  
  - Replace visual canvas with **ReGraph**  
  - Migrate bubbles to ReGraph node/edge model  

- **Local Persistence**  
  - Set up **SQLite** DB schema  
  - Migrate JSON bubbles/segments into SQLite  
  - Full React ↔ SQLite load/save cycle  

- **Abstraction Taxonomy Definition**  
  - Co-design **concept hierarchy**:  
    1. **Fact** (atomic data)  
    2. **Idea** (interpretation)  
    3. **Theme** (clusters of ideas)  
    4. **Goal** (outcomes)  
  - Tag each bubble with its level + **memory cue** (anchor/trigger)  

- **DevOps Foundations**  
  - Containerize front-end + SQLite (**Docker Compose**)  
  - DB migration scripts (Knex/Flyway) in CI  
  - Unit tests for React–SQLite sync  
  - GitHub Actions for lint/build/test on PR  

- **UX Foundations**  
  - Style guide: node shapes, WCAG palette, typography scale  
  - Basic interactions: click-select, hover-preview, drag-pan/zoom  
  - Onboarding tour stub with progressive-disclosure  

> **Goal:** a solid, repeatable dev environment with clear hierarchy and consistent UI patterns.

---

## PHASE 2: Interaction, Filters & Embedding Infrastructure (Weeks 2–4)  
*(Wiring in real embeddings + filters + cognitive prompts)*

### UI & Filters  
- **Tag/Color/Abstraction Filters**  
  - Sliders/dropdowns for levels; **drill-down** from Themes → Ideas → Facts  
  - **Progressive disclosure** (top-3 by default, “More…” expand)  
- **Theme Clusters**  
  - Auto-cluster view, **Merge/Unmerge** controls  
- **Memory Prompts**  
  - After 5 new bubbles: “What pattern do you observe?”  
  - After linking 3 clusters: “What higher-level theme emerges?”  
- **Fuzzy Links**  
  - Dashed lines + tooltips (“Similarity: 0.xx”)  
  - Toggle to show/hide low-confidence links  
- **Structured Entry Form**  
  - Placeholder hints (“Enter idea, date, reference…”)  
  - Inline validation + contextual microcopy  

### Embedding & Vector Store  
- **Embed Micro-service** (FastAPI/Flask)  
  - `POST /v1/embed` (versioned) → float32[]  
  - Health check `GET /healthz` + `/metrics` (Prometheus)  
  - In-memory LRU cache or Redis caching  
- **Client Integration**  
  - Async embed on `addSegment()`/`updateSegment()` with loading state  
  - Timeout (200 ms) + retry logic  
- **Vector DB**  
  - Local: SQLite + sqlite3_vector  
  - Scale: PostgreSQL + pgvector  
  - CI rebuild scripts + integration tests (insert→query→verify)  
  - Nightly snapshots & DB backups  

> **Checkpoint:** segments hold real embeddings, filterable by concept level, with cognitive prompts to surface reflection.

---

## PHASE 3: Proto-LCM & AI Hooks (Month 2–3)  
*(Static NN + local LLM + UX & cognitive dialogues)*

1. **Related Thoughts**  
   - “Show Related” → top-5 by cosine(sim) under 50 ms  
   - **Inline preview card** on hover (snippet + source tag)  
   - **Why this link?** CTA: AI explains connection in 1–2 sentences  

2. **Metacognitive Dialogue**  
   - After suggestions: “Does this align with your goals?” (Yes/No + comment)  
   - Prompt “How does this change your current Theme?” on accept  

3. **Mock Diffusion & Blend**  
   - Blend two embeddings → decode via embedder or small LLM  
   - Show in side panel with **Accept/Refine/Dismiss** actions  

4. **LLM Micro-service**  
   - Containerize 7 B–8 B LLM (Torch-Serve/BentoML)  
   - `POST /v1/complete` { context[], plan } → new segment text  
   - Async queue (Celery + Redis), rate-limiting, circuit breaker  
   - `/metrics`: request rate, errors, GPU memory  

5. **AI UI Stubs & Co-Writing**  
   - Buttons: “What patterns repeat?”, “Any contradictions?” → overlay modal streaming suggestions  
   - Co-writing pane stub: AI proposes bubbles/edits; **Accept/Refine/Dismiss**  
   - Explanatory footer: “Powered by ThoughtWeb AI—suggestions may vary.”  

6. **Auto-reflective Loop**  
   - Store AI proposals with `abstraction_level = ai_suggestion` + glow badge  
   - On accept: animate insertion, auto-link via NN query  

> **Checkpoint:** ThoughtWeb offers AI-driven ideas framed as reflective questions and transparent suggestions.

---

## PHASE 4: Emergence Engine & Concept-Diffusion (Month 3+)  
*(Deep reasoning: GPU-powered diffusion + iterative reflection + UX polish + MLOps metrics)*

- **Heatmap & Timelines**  
  - Heatmap layer (hotness = access/timestamp) with legend + time-slider  
  - Timeline playback animating graph growth; snapshot prompts: “What changed today?”  

- **Recursive Queries**  
  - `POST /v1/query`: vector → LLM → vector; log DAGs for audit  
  - UI: collapsible query-tree sidebar for backtracking & tweak  

- **Concept-Diffusion Endpoints**  
  - Containerize one-tower/two-tower diffusion (HF Diffusers) on GPU  
  - `POST /v1/diffuse` { contextEmbeds[], params } → sample embeddings  
  - GPU via Docker NVIDIA runtime or K8s device plugin  
  - Benchmark throughput & latency; CI smoke tests  

- **Advanced Contradiction Analysis**  
  - Debate view: side-by-side bubble pairs + AI-generated pros/cons  
  - Prompt “Which stance resonates most, and why?”  

- **Goal-Oriented Planning**  
  - Multi-step Plan nodes outlining steps to Goals  
  - Drag-and-drop reordering; journaling prompts at each step: “What’s your next action?”  

- **Weekly Knowledge Consolidation**  
  - Auto-summaries of Themes with bullet prompts: “How would you teach this?”  

> **Checkpoint:** full emergence engine with MLOps observability, UX metaphors, and cognitive reflection baked in.

---

## PHASE 5: Full LCM Integration & Beyond (Month 4+)  
*(Production-quality, collaborative, metacognitive partner)*

- **Unified Concept-Model Service**  
  - Merge embed + diffusion + LLM into a container/K8s cluster  
  - `POST /v1/predict_sequence` & `/v1/coauthor`  

- **Beam Search & Hybrid Ranking**  
  - Implement beam search; score by cosine + LLM log-prob  
  - Present ranked paths as flowchart; hover-preview before insert  

- **Multimodal & Multilingual**  
  - `/v1/embed_audio`, `/v1/generate_speech` (SONAR)  
  - Drag-drop images/audio → embed → thumbnails + language flags  
  - Language selector for SONAR decode target  

- **User-AI Collaborative Authoring**  
  - **Split-view pane**: left draft, right AI suggestions in context  
  - **Change-tracking**: highlight AI edits, inline comments, version history  

- **Socratic AI Dialogues**  
  - AI poses: “Why is this Theme significant?”; user replies refine graph  

- **Adaptive Learning Paths**  
  - Suggest micro-lessons (articles/videos) tied to active Themes  

- **Narrative Coherence Checker**  
  - Analyze cluster/story flow; prompt “Where are the logical gaps?”  

- **Spaced Repetition & Recall**  
  - Interval triggers surface old bubbles: “Do you still agree? Add a note.”  

- **Collaborative Workspaces**  
  - Real-time multi-user graphs; shared Themes; role-based prompts (e.g. Devil’s Advocate)  
  - Conflict resolution tests; merge strategies in CI  

- **Deployment & Versioning**  
  - Helm/Terraform for infra-as-code (even local)  
  - Docker images versioned semantically; model checkpoints tracked via MLflow/W&B  
  - Canary strategy: shadow mode → incremental rollout  
  - Security sandboxing, resource quotas, audit logs  

- **Accessibility & Usability**  
  - Keyboard nav, screen-reader labels, color-blind safe palette  
  - Usability test scripts for every major feature  

> **Ultimate Vision:**  
> A **local, inspectable, production-quality hybrid-consciousness engine**—a true cognitive partner that suggests, challenges, guides, and reinforces insights over time, all within a rich, navigable ThoughtWeb.  
