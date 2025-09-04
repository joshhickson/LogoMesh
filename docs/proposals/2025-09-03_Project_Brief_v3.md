# Project Brief v3: LogoMesh - The Collaborative Exegesis Engine
**Date:** 2025-09-03
**Status:** Detailed roadmap, awaiting final approval.

## 1. Vision
To evolve LogoMesh from a general-purpose "second brain" into the premier platform for modern biblical scholarship. We will achieve this by combining best-in-class original language tools with real-time collaboration features and a user-accessible computational linguistics toolkit.

## 2. Target Audience
Our primary focus is the **"Disenfranchised Power User"**: Academics, scholars, pastors, and serious laypeople who prioritize speed, a text-centric workflow, and deep original language analysis over a massive, pre-packaged library. This is the user base left underserved by the discontinuation of BibleWorks and those who are skeptical of bloated, subscription-only software ecosystems.

## 3. Core Differentiators (The "Why")
*   **Uncompromising Performance:** A native-feel, cross-platform application optimized for speed in search and analysis.
*   **Collaborative by Design:** Real-time, multi-user annotations, workspaces, and research sharing. This is our "Google Docs for Biblical Exegesis" feature.
*   **Democratized NLP:** A user-friendly toolkit for computational analysis (e.g., topic modeling, sentiment analysis) that does not require programming knowledge.

## 4. Business Model
We will adopt a hybrid model to build user trust and ensure long-term project sustainability:
*   **Perpetual License:** The core, high-performance exegesis software will be sold with a perpetual license. This directly appeals to our target audience's desire for ownership.
*   **Premium Subscription:** Advanced, server-dependent services will be offered as an optional subscription. This includes the real-time collaboration features and the cloud-based Computational Linguistics Toolkit.

## 5. Detailed Phased Roadmap

### Phase 1: The Core Exegesis Engine (MVP)
*Goal: Build a standalone, high-performance tool that is superior for individual original language study.*

*   **Epic 1.1: Foundational Data Pipeline**
    *   *Story:* Set up the hybrid database architecture (Postgres/pgvector, Elasticsearch, Neo4j) via Docker Compose.
    *   *Story:* Implement the `BookIngestionService` to parse the Berean Interlinear data into the canonical `EnrichedVerse` model.
    *   *Story:* Implement the `PostgresBibleStorageAdapter` to save enriched verses to the new database schema.

*   **Epic 1.2: The Core Text Workspace UI**
    *   *Story:* Build a high-performance, multi-pane UI for displaying biblical texts.
    *   *Story:* Implement a dynamic, customizable interlinear view based on the stored `EnrichedVerse` data.
    *   *Story:* Create a "Lexicon" panel that displays detailed morphological and definitional information for any clicked word.

*   **Epic 1.3: Advanced Search & Indexing**
    *   *Story:* Implement basic keyword and phrase search across all ingested texts.
    *   *Story:* Implement advanced morphological search (e.g., find every aorist passive participle of a specific lemma).
    *   *Story:* Index all text versions and metadata in Elasticsearch to power fast and complex full-text queries.

### Phase 2: The Collaboration Engine
*Goal: Transform the single-user tool into a multi-user research platform.*

*   **Epic 2.1: User Accounts & Shared Workspaces**
    *   *Story:* Implement a robust user authentication and identity system.
    *   *Story:* Develop the concept of a shared "Workspace" or "Project" that can be private or invite-only.

*   **Epic 2.2: Real-Time Collaborative Features**
    *   *Story:* Implement real-time, multi-user text highlighting and annotations using a CRDT-based approach or a managed service like Liveblocks.
    *   *Story:* Develop a shared note-taking system within a workspace, where notes can be linked to specific verses or words.
    *   *Story:* Implement presence indicators to show who is currently viewing or editing a passage.

*   **Epic 2.3: Sharing and Permissions**
    *   *Story:* Build a system for inviting users to a workspace with different permission levels (e.g., viewer, commenter, editor).

### Phase 3: The Computational Linguistics Toolkit
*Goal: Deliver a unique, "blue ocean" feature set that empowers users with novel forms of analysis.*

*   **Epic 3.1: Backend NLP Services**
    *   *Story:* Fine-tune a pre-trained language model (e.g., AlephBERT) on the biblical corpus to generate high-quality contextual embeddings for every word.
    *   *Story:* Develop a service for running Topic Modeling (LDA) on a user-selected corpus (e.g., "The Pauline Epistles," "The Pentateuch").
    *   *Story:* Develop a service for performing sentiment analysis on narrative texts to chart emotional arcs.

*   **Epic 3.2: User-Facing NLP UI**
    *   *Story:* Design and build an intuitive UI for the Topic Modeling tool, allowing users to run models, explore, and label the resulting topics.
    *   *Story:* Create a "Semantic Search" interface that uses the contextual embeddings to find conceptually similar verses, even if they don't share keywords.
    *   *Story:* Design a visualization for sentiment analysis results (e.g., a chart showing the emotional arc of a biblical story).

## 6. Next Steps
- Final approval of this strategic brief.
- Begin implementation of Phase 1, starting with the data pipeline and core UI.
