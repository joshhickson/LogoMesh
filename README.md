
## [note: this project is in pre-alpha. for potential devs: consult docs/README-dev.md]

---

# LogoMesh

https://discord.gg/6ydDxzMjvD

**Tagline:**
> A recursive thought engine for humans and AI — designed to evolve meaning, resolve contradictions, and externalize self-reflection.

LogoMesh is a visual thinking tool built in React that allows you to create, organize, and navigate complex ideas through interconnected thought bubbles, nested segments, and flexible metadata filtering.

Designed as a **local-first, AI-augmented cognitive framework**, LogoMesh helps you transform scattered thoughts into structured insight. It's more than a mind map; it's a living memory graph that supports segment-level filtering, AI-ready data export, and deep extensibility — perfect for understanding your own thinking and co-evolving ideas with AI.

---

## Features

* **Thought Bubbles** with customizable titles, descriptions, tags, and colors for high-level organization.
* **Nested Segments** within each thought bubble, each with its own title, content, and unique attributes for granular detail.
* **Multi-attribute Classification** per segment (field name, value, and type) for powerful data structuring.
* **Advanced Filtering** by attribute field name, field type, and field value to quickly find relevant information.
* **Canvas Highlighting** of matching bubbles (non-matches fade) for focused views.
* **Light/Dark Mode Toggle** for personalized viewing comfort.
* **Export all or filtered thoughts** to JSON (AI-parsable structure) for data ownership and integration.
* **Import JSON backups** to easily restore or transfer your thought data.
* **Batch Editing Tools** — apply tags or colors to filtered results for efficient organization.
* **Local-First AI Foundations**: Built to run core AI features on your local machine, giving you control and privacy over your data and cognitive process.

---

## Getting Started

LogoMesh is designed to be easy to run locally, minimizing dependencies and maximizing control.

### 1. Clone the repo

```bash
git clone [https://github.com/joshhickson/thought-web.git](https://github.com/joshhickson/thought-web.git)
cd thought-web
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

  * **Enhanced Visuals & Navigation:** Refinements to the interactive canvas for more intuitive thought organization and exploration.
  * **Core AI-Powered Insights (Local-First):**
      * **Automatic Related Thoughts:** Instantly discover connections between your ideas.
      * **AI-Assisted Reflection:** Get prompts that encourage deeper thinking and help you identify patterns or contradictions in your knowledge.
      * **Conceptual Blending:** Explore new ideas formed by combining existing concepts.
  * **Seamless Data Integration:** Tools to integrate LogoMesh with other applications and services.
  * **Future: Advanced AI Features & Collaboration:** As LogoMesh matures, we envision features like recursive AI querying, conceptual diffusion, and secure collaborative workspaces.

-----

## License

MIT — free to fork, remix, and evolve.

-----

## ✨ Created by [Josh Hickson](https://github.com/joshhickson)

-----

This is not just productivity software.
This is a cognitive framework for the evolution of intelligence.
Welcome to LogoMesh.

```
```
