# ThoughtWeb — Developer Vision & Architecture Guide

**Tagline:**

> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

---

## Executive Summary

ThoughtWeb is a local-first, AI-augmented cognitive framework that transforms scattered thoughts into structured insight. By using a visual graph of tagged, filterable, and recursively linked segments, it enables users — and eventually AI — to reflect, reason, and grow in clarity over time. Unlike black-box models, ThoughtWeb is explicit, traceable, and explainable by design. It acts as both an external memory system and a sandbox for emergent reasoning. Its architecture anticipates collaboration, AI-assisted introspection, and the evolution of ideas across time and context.

---

## Mission

ThoughtWeb empowers humans and AI to co-evolve their thinking using a structured, filterable, and recursively queryable thought system. Built on transparent fields, visual abstraction, and dynamic emergence, it creates a long-term substrate for:

* Human insight and pattern recognition
* AI-assisted synthesis and contradiction discovery
* Meta-cognitive dialogue between the system and its users

---

## Public-Facing Pitch

> What if your thoughts could talk back?
>
> ThoughtWeb is an emergence engine for humans and AI — a visual thinking platform that reveals patterns, contradictions, and hidden connections across your ideas. It's more than a mind map. It's a mirror. With filters, abstraction layers, and self-reflective prompts, ThoughtWeb helps you see how you think, grow how you think, and someday… build AI that thinks with you, not for you.

---

## Core Architecture

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Frontend        | React + ReGraph (Cambridge Intelligence)        |
| Backend Data    | SQLite (via `better-sqlite3` or `sql.js`)       |
| Visual Engine   | ReGraph                                         |
| Embedding Model | llama.cpp / Ollama (Future)                     |
| Hosting         | Replit (Mac Mini–compatible)                    |
| Format          | JSON / SQLite export with vector-ready segments |

---

## Data Model Overview

### Thought Bubble

A visual container on the canvas. Holds metadata and an array of segments.

### Segment

A sub-element inside a thought. Contains:

* `segment_id`, `title`, `content`
* `tags`, `color`, `abstraction_level`
* `fields {}` – flexible key-value pairs (e.g. “Location”: “Paris”, “Type”: “Quote”)
* `embedding_vector` – placeholder for AI search/similarity
* `fuzzy_links[]` – optional speculative or soft connections

---

## Milestone-Based Development Plan (Full Detailed Plan [here]([url](https://github.com/joshhickson/thought-web/blob/master/docs/Merged%20Milestone-Based%20Development%20Plan%20v2.0.md)))

### Phase 1: Foundation (Weeks 1–3)

* Replace legacy canvas with ReGraph rendering
* Initialize SQLite + create schema for segments & thoughts
* Convert current JSON data to DB-backed state
* Load/save cycles between DB ↔ UI ↔ JSON

### Phase 2: Interaction Logic (Weeks 3–5)

* Add visual styles by abstraction level (Fact, Hypothesis, Pattern)
* Implement fuzzy links with dotted lines
* Tag/color/field-based filters
* Add dropdowns for abstraction tagging

### Phase 3: Embedding & AI Hooks (Weeks 6–8)

* Add `embedding_vector` support
* Create basic cosine similarity search (e.g. “Find similar segments”)
* Enable summarization prompts (rule-based or LLM-assisted)
* Enable contradiction highlighting across segments
* Begin building support for interpolation/diffusion between concepts
* Prototype local conceptual model (LCM) awareness: allow AI to reflect on its own graph state

### Phase 4: Emergence Engine Features (Months 2–3)

* Add recursive query builder (e.g. “Find conflicting bubbles linked to hypothesis X”)
* Add heatmap layer for high-activity and recent interactions
* Track temporal decay and interaction weighting of segments
* Implement prompt-based reflective nudges
* Begin weekly consolidation reports: highlight themes, contradictions, and repeated patterns
* Build memory resurfacing engine to reintroduce old thoughts based on decay, relevance, or similarity

### Phase 5: Collaboration & Cognitive OS (Months 4–6)

* Implement role-based multi-user collaboration (Editor, Synthesizer, Contradiction Finder)
* Develop merge-conflict resolution for thought maps
* Introduce learning paths and custom field schemas
* Enable multimodal input (voice, OCR, PDF ingest, screenshot captioning)

---

## Export Schema Overview

```json
{
  "export_metadata": {
    "version": "0.5",
    "exported_at": "2025-05-03T00:00Z",
    "author": "Josh Hickson",
    "tool": "ThoughtWeb"
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
          "embedding_vector": [optional]
        }
      ]
    }
  ]
}
```

---

## Developer Philosophy

* Prefer traceable structure over guesswork.
* Design for recursive insight, not just information.
* Build tools that evolve with your cognition.
* No black boxes. Make the system think out loud.
* Treat AI as a partner in reflection, not just prediction.
* Anticipate future collaboration and modularity.

---

## Ongoing Development Tasks

* Finalize ReGraph visual sync with SQLite
* Add real-time filter overlays for tags/colors
* Implement embedding field and AI search stubs
* Refactor JSON import/export for full schema support
* Add timeline view and interaction logs
* Begin work on multi-user version control layer

---

This is not just productivity software.
This is a cognitive framework for the evolution of intelligence.
Welcome to ThoughtWeb.
