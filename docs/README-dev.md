# 🧠 ThoughtWeb — Developer Onboarding

Welcome to the core of ThoughtWeb: a schema-driven, AI-ready, visually organized thought engine designed for flexible knowledge structuring, deep filtering, and scalable augmentation.

This document exists to help new contributors or returning developers quickly get up to speed on what ThoughtWeb is — and how to develop inside it.

---

## 🎯 Mission

**To empower individuals to structure, filter, and grow their thoughts with precision.**

Modern thinking tools either:
- Flatten information (lists, notes, blocks),
- Overwhelm with noise (graphs without clarity),
- Or trap users in rigid workflows.

**ThoughtWeb** breaks that cycle. It’s a space where:
- Thought bubbles are flexible containers of meaning
- Segments hold layered context
- Every part is extensible, filterable, and exportable
- The system grows with your mind — and eventually, helps guide it

---

## 🌌 Vision

ThoughtWeb is not just a mind map. It's a **thinking OS**.

- It should feel as comfortable for journaling as it is for concept modeling.
- It should scale from one idea to ten thousand.
- It should be easy to port, visualize, and AI-augment.
- It should outlast note apps — and act as the long-term substrate for your evolving worldview.

---

## 🧭 Why ThoughtWeb Exists

ThoughtWeb is more than a note-taking tool—it is a cognitive interface for building, evolving, and aligning conceptual thought. Where others embed abstractions deep inside machine layers, ThoughtWeb empowers users to map and refine their own reasoning in a persistent, interpretable structure.

This system prioritizes:

- **Human agency** over black-box automation  
- **Conceptual clarity** over raw token fluency  
- **Transparency** over model opacity  
- **Cognitive fingerprinting** over one-size-fits-all prompts  
- **Sovereignty** over dependency

Rather than tuning intelligence for benchmark performance, ThoughtWeb externalizes it—anchoring ideas in field-tagged, modular segments that can evolve, connect, and persist beyond any single interaction. It provides both the interface and infrastructure for humans to *think with structure*, organize insight, and optionally guide AI systems through grounded abstraction rather than shallow pattern-matching.

ThoughtWeb is a framework for truth-driven intelligence—**a system for thinking, not just outputting.**

---

## ⚙️ Stack

- **React + Tailwind** (lightweight, hot-reloadable UI)
- **React Flow** (node visualization engine)
- **LocalStorage** (simple persistence for now)
- **JSON-first schema design** (everything exportable + parseable)

---

## 📐 Key Concepts

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

## 📦 Schema Overview

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

## 🚧 Development Tasks (Ongoing)

- Fix segment field entry (buttons work but need stable update)
- Add vector embedding generation
- Allow real-time field-type filtering (e.g. numeric range queries)
- Add collaboration features (multi-user or versioned sync)
- Add Thought Timeline view (sort by created_at)
- Export preset filters / views for fast context switching

---

## 🧠 Developer Philosophy

- Always prefer structured flexibility over rigid constraints.
- The system should teach itself to the user through use.
- Everything that matters must be exportable and portable.
- The codebase should never assume “this is how people think” — it should adapt to how people evolve their thinking.

---

## ✨ Final Note

If you're reading this, you’re not just coding — you’re helping build a better way to think.

This isn’t productivity.
This is philosophy encoded in an interface.

Welcome to ThoughtWeb.
