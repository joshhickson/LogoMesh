# LogoMesh

**Tagline:**
> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

LogoMesh is a powerful, intuitive, and versatile framework that allows you to create, organize, and navigate complex ideas through interconnected nodes (thought bubbles), nested segments, and flexible metadata filtering. It's designed as a **local-first, AI-augmented cognitive framework** to help you transform scattered concepts into structured insight.

## Core Concepts

*   **Local-First Approach:** Emphasizes user data ownership and local execution of core functionalities.
*   **AI Augmentation:** Integrates AI capabilities modularly and transparently.
*   **Visual Graph Interface:** Uses a graph structure to visually represent thoughts and their interconnections.
*   **Structured Data:** Breaks down thoughts into "Segments" with metadata for advanced filtering and querying.

## Features

*   **Thought Bubbles:** Customizable nodes for high-level organization.
*   **Nested Segments:** Granular detail within each thought bubble.
*   **Multi-attribute Classification:** Powerful data structuring per segment.
*   **Advanced Filtering:** Find relevant information quickly.
*   **Canvas Highlighting:** Focused views of matching bubbles.
*   **JSON Export/Import:** Data ownership, integration, and backup.
*   **Batch Editing Tools:** Efficient organization of thoughts.
*   **Local-First AI Foundations:** Core AI features run on your local machine.

## What Is LogoMesh?

LogoMesh is a modular framework for building applications that structure, visualize, and enhance interconnected thoughts. Key components include:

*   **Core Schema:** Fundamental data structures for thoughts and segments.
*   **Semantic Graph:** Underlying data structure for interconnected knowledge.
*   **Adapters:** Interchangeable modules for storage, display, and AI integration.
*   **Interface Contracts:** Versioned schemas for data consistency.
*   **JSON Export System:** Standardized data serialization/deserialization.

LogoMesh can be used to build:

*   Digital journals
*   Knowledge management tools
*   Forecasting engines
*   Personal knowledge bases
*   Collaborative thought mapping applications
*   AI-powered cognitive assistance tools

## Getting Started

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/joshhickson/LogoMesh.git
    cd LogoMesh
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start local server:**
    ```bash
    npm start
    ```
    Visit `http://localhost:3000` in your browser.

## Build for Static Export

```bash
npm run build
```
This creates a `build/` folder for offline use or PWA setup.

## JSON Schema Overview

Thoughts are saved locally and exported as structured JSON.
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
        }
      ]
    }
  ]
}
```

## Roadmap

*   **Enhanced Visuals & Navigation**
*   **Core AI-Powered Insights (Local-First)**
    *   Automatic Related Thoughts
    *   AI-Assisted Reflection
    *   Conceptual Blending
*   **Seamless Data Integration**
*   **Future: Advanced AI Features & Collaboration**

## License

MIT — free to fork, remix, and evolve.

## ✨ Created by [Josh Hickson](https://github.com/joshhickson)

Welcome to LogoMesh.
