## [note: this project is in pre-alpha. for potential devs: consult docs/README-dev.md]

---

# LogoMesh

https://discord.gg/6ydDxzMjvD

**Tagline:**
> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

LogoMesh is a powerful, intuitive, and versatile framework that allows you to create, organize, and navigate complex ideas through interconnected nodes (thought bubbles), nested segments, and flexible metadata filtering.

Designed as a **local-first, AI-augmented cognitive framework**, LogoMesh helps you transform scattered concepts into structured insight. It's more than a mind map; it's a living memory graph that supports segment-level filtering, AI-ready data export, and deep extensibility — perfect for understanding your own thinking and co-evolving ideas with AI.

---

## Features

* **Thought Bubbles** with customizable titles, descriptions, tags, and colors for high-level organization.
* **Nested Segments** within each thought bubble, each with its own title, content, and unique attributes for granular detail.
* **Multi-attribute Classification** per segment (field name, value, and type) for powerful data structuring.
* **Advanced Filtering** by attribute field name, field type, and field value to quickly find relevant information.
* **Canvas Highlighting** of matching bubbles (non-matches fade) for focused views.
* **Export all or filtered thoughts** to JSON (AI-parsable structure) for data ownership and integration.
* **Import JSON backups** to easily restore or transfer your thought data. (soon to be streamlined into something better)
* **Batch Editing Tools** — apply tags or colors to filtered results for efficient organization.
* **Local-First AI Foundations**: Built to run core AI features on your local machine, giving you control and privacy over your data and cognitive process.

---
   **LogoMesh is a modular framework for building applications that structure, visualize, and enhance interconnected thoughts and information.** It provides a flexible and extensible foundation for creating a variety of cognitive tools. This repository includes a demo React web application that showcases one possible implementation of the LogoMesh framework.

   ## What Is LogoMesh?

LogoMesh is a framework designed to help developers create applications that go beyond simple note-taking and delve into structured thought organization.  It consists of several key components:

* **Core Schema:** Defines the fundamental data structures for representing thoughts, segments, and their relationships.  These are described in detail in the interface contracts.
* **Semantic Graph:** The underlying data structure that connects thoughts and segments, allowing for rich, interconnected knowledge representation.
* **Adapters:** A system of interchangeable modules that handle different aspects of data storage, display, and AI integration (e.g., StorageAdapters for SQLite or IndexedDB, DisplayAdapters for React Flow or other visualization libraries).
* **Interface Contracts:** Versioned schemas (e.g., `Thought`, `Segment`, `Tag`) that define the structure of data within LogoMesh, ensuring consistency across different implementations.
* **JSON Export System**: A standardized way to serialize and deserialize LogoMesh data, allowing for interoperability and data portability.

LogoMesh can be used to build a wide range of applications, including:

* Digital journals with interconnected entries
* Knowledge management and planning tools
* Forecasting and analysis engines
* Personal knowledge bases
* Collaborative thought mapping applications
* AI-powered cognitive assistance tools


## Getting Started

LogoMesh is designed to be easy to run locally, minimizing dependencies and maximizing control.

### 1. Clone the repo

```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh
````

### 2\. Install dependencies

```bash
npm install
```

### 3\. Start local server

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

-----

## Build for Static Export

```bash
npm run build
```

This creates a `build/` folder you can upload or open offline.
Perfect for iPad/iPhone use or PWA setup.

-----

## JSON Schema Overview

Thoughts are saved locally and exported as structured JSON. This provides transparency and allows you to interact with your data outside the application.

```json
{
  "id": "bubble-001",
  "title": "Example Thought",
  "description": "A high-level idea.",
  "tags": [{ "name": "philosophy", "color": "#f97316" }],
  "color": "#f97316",
  "position": { "x": 123, "y": 456 },
  "segments": [
    {
      "id": "segment-001",
      "title": "Key Quote",
      "content": "We hold these truths...",
      "attributes": [
        {
          "fieldName": "Segment Concept",
          "fieldValue": "Quote",
          "fieldType": "text"
        },
        ...
      ]
    }
  ]
}
```

-----

## Roadmap

LogoMesh is constantly evolving. Here's a glimpse of what's next:

### Phase 1: Foundation Complete ✅
- Core thought management and visualization
- Local-first architecture with SQLite storage
- Plugin system foundations
- Basic AI integration (LLM executors)

### Phase 2: Infrastructure Planning (Current Status)
**Status:** Comprehensive planning and architecture design completed

We've systematically analyzed Phase 2 requirements through 34 creative scenarios and completed detailed architectural planning:
- ✅ **Scenarios 1-34 Complete:** Comprehensive analysis covering library scaling, gaming sessions, live sermons, journalism workflows, tactical mesh networks, educational environments, VR/AR applications, multiplayer coordination, and advanced enterprise scenarios
- ✅ **Gap Analysis:** 248+ gaps identified and documented across all system components
- ✅ **Architecture Planning:** Complete Phase 2 specifications and implementation roadmaps
- 🎯 **Current Reality:** Codebase remains at Phase 1 level - Phase 2 infrastructure exists as detailed blueprints ready for implementation

**Key Infrastructure Areas:**
* **Multi-language Plugin Runtime:** Support for Go, Rust, Python, JavaScript coordination
* **Real-time Processing:** Sub-second audio-to-visual pipelines with deadline guarantees
* **Distributed Coordination:** Cross-device state synchronization and mesh networking
* **Resource Management:** Hardware-aware quotas, thermal monitoring, graceful degradation
* **Educational Workflows:** Classroom-specific features and offline-first PWA architecture
* **Multiplayer Networking:** Authoritative state management and conflict resolution

### Phase 3: AI Activation (Future)
* **Core AI-Powered Insights (Local-First):**
    * **Automatic Related Thoughts:** Instantly discover connections between your ideas
    * **AI-Assisted Reflection:** Get prompts that encourage deeper thinking
    * **Conceptual Blending:** Explore new ideas formed by combining existing concepts
* **Advanced Features:** Recursive AI querying, conceptual diffusion, secure collaborative workspaces

**Current Priority:** Complete Phase 2 infrastructure gaps before advancing to Phase 3 AI features.

See `docs/phase_2/gap_analysis.md` for detailed technical analysis and `docs/phase_2/use_case_stress_tests/` for complete scenario documentation.

-----

## License

MIT — free to fork, remix, and evolve.

-----

## ✨ Created by [Josh Hickson](https://github.com/joshhickson)

-----

This is not just productivity software.
This is a cognitive framework for the evolution of intelligence.
Welcome to LogoMesh.
## Development Status

**Current Phase:** Pre-Phase 2 Infrastructure Cleanup  
**Version:** 0.2.0  
**Last Updated:** January 2025

**Implementation Status:**
- **Phase 1:** ✅ Complete - Basic thought management with React frontend and Node.js backend
- **Infrastructure Cleanup:** 🔄 In Progress - Resolving naming consistency and technical debt
- **Phase 2:** 📋 Architectural Planning Complete - Ready for implementation after cleanup
- **Phase 2 Implementation:** ⏳ Pending - 8-week roadmap ready after foundation stabilization
```