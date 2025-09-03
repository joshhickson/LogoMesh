# Project Brief v2: Advanced Biblical Ingestion and Analysis Engine
**Date:** 2025-09-03
**Status:** Revised based on Gemini 2.5 Pro Research Report

## 1. Vision
To evolve LogoMesh from a note-taking application into a state-of-the-art computational hermeneutics engine. This system will be capable of ingesting, aligning, and analyzing the entire biblical corpus across multiple translations and original languages, enabling deep semantic and etymological research.

## 2. Core Architectural Pillars
Based on external research, the architecture will be built on three core pillars to ensure accuracy, depth, and scalability.

### Pillar 1: The Canonical Textual Unit
We will abandon a simple verse-string model. The foundational data entity will be a canonical, version-agnostic "Verse" object. This object will serve as a central hub, mapping a single conceptual verse to its various manifestations across different versification schemes (e.g., KJV vs. Hebrew Bible) and manuscript traditions.

### Pillar 2: Context-Aware Lexical Analysis
The system will move beyond static dictionary lookups. We will leverage contextual word embeddings (e.g., from BERT-style models) to capture the specific meaning of each word in its precise context. This enables true semantic search and nuanced etymological tracing, distinguishing, for example, between different senses of the Greek word `kosmos`.

### Pillar 3: Polyglot Persistence Architecture
No single database can meet the diverse query requirements. We will adopt a hybrid data architecture:
- **Document Store (e.g., Elasticsearch):** To store the enriched "Verse" objects and power fast, full-text search across all metadata and translations.
- **Graph Database (e.g., Neo4j):** To model the Biblical Knowledge Graph (people, places, events, and their relationships) for complex relational queries.
- **Vector Database (e.g., pgvector, Pinecone):** To store and index the high-dimensional contextual embeddings, enabling rapid semantic similarity searches.

## 3. The Enriched "Verse" Data Model
Each canonical verse will be represented as a rich JSON object containing:
- **Identifiers:** A canonical UUID, OSIS reference, and a map of versification schemes.
- **Textual Content:** The plain text of the verse in all supported translations and original languages.
- **Original Language Data (per word):**
    - The word text and transliteration.
    - The lemma and corresponding Strong's Number.
    - Detailed morphological tagging (e.g., `N-NSM`).
    - **A pre-computed contextual vector embedding.**
- **Linked Entities:** An array of references to nodes in the Knowledge Graph.

## 4. Phased Implementation Plan

### Phase 1: Foundational Data Pipeline
- **Task 1:** Set up the hybrid database architecture (Postgres with pgvector, Elasticsearch, Neo4j).
- **Task 2:** Develop the ingestion pipeline to parse at least two Bible versions (e.g., KJV and a modern version) and the Greek New Testament.
- **Task 3:** Implement the logic to create the enriched "Verse" objects, including tokenization, Strong's number tagging, and morphological analysis.
- **Task 4:** Build the initial UI for text search and side-by-side translation comparison.

### Phase 2: Semantic Analysis and Knowledge Graph
- **Task 1:** Fine-tune a pre-trained language model (e.g., AlephBERT) on the biblical corpus to generate high-quality contextual embeddings.
- **Task 2:** Populate the vector database with these embeddings.
- **Task 3:** Implement the semantic search feature ("find verses with a similar meaning").
- **Task 4:** Begin populating the Knowledge Graph with key entities (people and places) from a dataset like TIPNR.

### Phase 3: Advanced Features and UI
- **Task 1:** Develop the UI for exploring the Knowledge Graph.
- **Task 2:** Implement the computational intertextuality detection feature.
- **Task 3:** Build UI features for deep lexical analysis and etymological tracing.

## 5. Next Steps
- Finalize this technical brief.
- Begin work on Phase 1, starting with the database setup.
