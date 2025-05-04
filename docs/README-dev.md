# ThoughtWeb — Developer Vision & Architecture Guide

Welcome to the core of **ThoughtWeb**: a schema-driven, AI-compatible, self-organizing cognitive graph engine built for local-first emergent thinking, recursive querying, and future AI self-reflection.

This document is designed for both human developers and Claude 3.5 (Replit agent) to understand the evolving structure, mission, and logic of ThoughtWeb. It defines how the system should behave, why it matters, and how we implement it step-by-step.

---

## Mission

**ThoughtWeb empowers users and AI to externalize, structure, and evolve their thinking through a visual, filterable, recursive graph engine — optimized for emergence, insight, and local-first autonomy.**

Rather than simulate intelligence via token prediction, ThoughtWeb provides an explicit substrate for:

- **Self-reflection** through transparent node/segment tracking
- **Emergent pattern discovery** via color filters, tags, and abstraction layers
- **Cognitive scaffolding** for human or AI agents using a shared substrate
- **Error-tolerant fuzzy logic** by design (fuzzy links, contradictions, gaps)
- **Future AI co-pilots** that evolve by querying and reasoning about their own graph state

---

## Core Architecture

### Stack (Current & Target)

| Layer | Technology |
|-------|------------|
| Frontend | React + ReGraph (Cambridge Intelligence) |
| Backend Data | SQLite (via `better-sqlite3` or `sql.js`) |
| Local LLM (Future) | llama.cpp / Ollama |
| Storage Format | JSON import/export, embedded field structure |
| Visual Graph Engine | ReGraph (React-based) |
| Hosting | Replit (Mac Mini compatible, local preferred) |

---

## Data Model Overview

### Core Objects:
- **Thought Bubble**: A parent node containing multiple thought segments. Visualized as a ReGraph node.
- **Segment**: A discrete atomic unit of thought, with associated metadata.

### Fields Per Segment:
- `segment_id`: Unique identifier
- `content`: The core text or idea
- `tags`: List of descriptive labels
- `color`: Visual color assigned by user
- `abstraction_level`: One of: `fact`, `hypothesis`, `emerging_pattern`
- `fuzzy_links[]`: Optional array of weak or speculative relations
- `embedding_vector`: *(optional placeholder for LLM integration)*

---

## Milestone-Based Development Plan

### PHASE 1: Scaffold & Realignment (Weeks 1–2)
- [ ] Replace current visual canvas with ReGraph
- [ ] Migrate thought bubbles to ReGraph node/edge model
- [ ] Set up local SQLite DB schema
- [ ] Move all existing JSON bubbles/segments into SQLite
- [ ] Enable full data load/save cycle between SQLite and React state

### PHASE 2: Interaction & Filters (Weeks 2–4)
- [ ] Add filter controls for tags, colors, abstraction levels
- [ ] Add “fuzzy link” style to visually represent uncertainty
- [ ] Add toggle to hide/show lower-abstraction bubbles
- [ ] Begin capturing user inputs into structured segments (no free-floating text)

### PHASE 3: AI Hooks (Month 2–3)
- [ ] Add embedding vector placeholder field to each segment
- [ ] Enable basic LLM-assisted queries over SQLite (Claude or local model)
- [ ] Implement “Summarize Thought Map” prototype (via rule-based logic first)
- [ ] Allow users (or LLM) to generate new connections or spot contradictions

### PHASE 4: Emergence Engine (Month 3+)
- [ ] Add heatmap layer for active segments
- [ ] Add recursive query interface (e.g., “Which of my thoughts contradict?”)
- [ ] Allow AI or user to see “past paths” of thought exploration
- [ ] Prototype self-reflective prompt generator: “What ideas are missing?”

---

## Guiding Principles (for Claude + Human Devs)

1. **Everything is traceable** — Segment relationships must be inspectable, not hidden in latent space.
2. **Data must be filterable by design** — Don’t hardcode views; build dynamic filters.
3. **Thoughts are layered, not flat** — Abstraction levels matter.
4. **Uncertainty is allowed** — Fuzzy links are a first-class citizen.
5. **System must support recursive queries** — Self-reflection is the end goal.
6. **Local-first always wins** — Prioritize performance and offline compatibility.
7. **No black boxes** — AI should evolve via interaction, not obfuscation.

---

## Key Concepts

### Thought Bubble
A visual container on the canvas. Holds metadata and an array of **segments**.

### Segment
A sub-element inside a thought. Contains:
- `title`
- `content`
- `fields {}` – flexible key-value pairs (e.g. “Location”: “Paris”, “Type”: “Quote”)

### Fields
The key to filtering, AI embedding, and structure. Each segment’s `fields` can be queried, colored, and exported cleanly.

---

## Schema Overview

Each file exported from ThoughtWeb follows this schema:

```json
{
  "export_metadata": {
    "version": "0.5",
    "exported_at": "2025-05-01T01:00Z",
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

## Development Tasks (Ongoing)

- Fix segment field entry (buttons work but need stable update)
- Add vector embedding generation
- Allow real-time field-type filtering (e.g. numeric range queries)
- Add collaboration features (multi-user or versioned sync)
- Add Thought Timeline view (sort by created_at)
- Export preset filters / views for fast context switching

---

## Developer Philosophy

- Always prefer structured flexibility over rigid constraints.
- The system should teach itself to the user through use.
- Everything that matters must be exportable and portable.
- The codebase should never assume “this is how people think” — it should adapt to how people evolve their thinking.

---

## Final Note

If you're reading this, you’re not just coding — you’re helping build a better way to think.

This isn’t productivity.
This is philosophy encoded in an interface.

Welcome to ThoughtWeb.
