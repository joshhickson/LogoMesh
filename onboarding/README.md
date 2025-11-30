# LogoMesh Onboarding Hub

**🚨 Important Notice (November 30, 2025) 🚨**

**The project has entered a "Discovery Sprint." The `PROJECT_PLAN.md` is now a historical artifact.**

**Please use the [Strategic Master Log](index.html) as the single source of truth for the project's current status, priorities, and documentation.** It contains the most up-to-date information and links to the relevant planning documents for the current sprint.

Welcome to the LogoMesh onboarding documentation system! This folder contains interactive HTML guides to help you quickly understand the project's strategy, architecture, and current priorities.

## 🎯 Start Here

**→ [Strategic Master Log](index.html)** - Your complete navigation guide to all project documentation

**→ [Strategic Gaps Analysis](gaps-analysis.html)** - Comprehensive breakdown of what needs to be done

## 📚 Quick Access to Document Summaries

All key documents have dedicated summary pages for quick understanding:

### Current Priority
- [Recommendation Report](summaries/recommendation-report.html) - **READ THIS FIRST** - Current strategic decision

### Core Documents
- [PROJECT_PLAN.md](summaries/project-plan.html) - The "what" and "why" of LogoMesh
- [Contextual Debt Paper](summaries/contextual-debt-paper.html) - Core IP and foundational concept

### Strategic Evolution
- [Strategic Pivot Plan](summaries/strategic-pivot-plan.html) - Future mathematical approach
- [Meeting 1 Minutes](summaries/meeting-minutes.html) - Origin of IP/commercialization focus

### Historical Context
- [RECOVERY_PLAN.md](summaries/recovery-plan.html) - Deprecated tactical plan (historical reference)

## 🗂️ Folder Structure

```
onboarding/
├── index.html              # Strategic Master Log (main navigation)
├── gaps-analysis.html      # Strategic Gaps & Opportunities
├── summaries/              # Individual document summaries
│   ├── project-plan.html
│   ├── recommendation-report.html
│   ├── recovery-plan.html
│   ├── contextual-debt-paper.html
│   ├── strategic-pivot-plan.html
│   └── meeting-minutes.html
└── README.md               # This file
```

## 💡 How to Use This System

1. **New to the project?**
   - Start with [index.html](index.html) to get the big picture
   - Then read the [Recommendation Report](summaries/recommendation-report.html) for current priorities

2. **Want to contribute?**
   - Review the [Gaps Analysis](gaps-analysis.html) to see what needs work
   - Read the [PROJECT_PLAN.md summary](summaries/project-plan.html) to understand roles

3. **Understanding the IP?**
   - Read the [Contextual Debt Paper summary](summaries/contextual-debt-paper.html)
   - Review the [Meeting Minutes](summaries/meeting-minutes.html) for business context

## 🚀 How to View This Site

This directory contains a standalone web server to properly display the interactive documentation and knowledge graphs.

**Why is this necessary?**
The `index.html` page loads graph data from local files. For security reasons, modern web browsers block these kinds of file requests when you open an HTML file directly from your local filesystem. This server provides the correct environment to allow these requests.

**It is specifically configured to ONLY serve files from within this `onboarding` directory, ensuring that no other project files or source code are exposed.**

### Running the Server

1.  **Navigate to the onboarding directory:**
    From the workspace root, open a terminal and change your directory:
    ```bash
    cd onboarding
    ```

2.  **Install Dependencies (First Time Only):**
    If you haven't run this server before, you need to install its dependencies using `pnpm`.
    ```bash
    pnpm install
    ```

3.  **Start the Server:**
    ```bash
    pnpm start
    ```

4.  **View the Site:**
    Open the URL shown in the terminal, which is typically [http://localhost:3000](http://localhost:3000).

### Generating the Documentation Graph

The `index.html` page displays a documentation graph rendered using Mermaid. To regenerate the graph from the latest documentation structure, run the following command from the **root of the workspace**:

```bash
node scripts/generate_mermaid_list.js
```
This script will:
1. Read the raw graph data from `onboarding/doc_graph/doc_graph_raw.json`.
2. Generate a static Mermaid.js graph definition.
3. Highlight any files modified in the last 24 hours.
4. Update `index.html` to render the new graph.


## 📅 Last Updated

November 30, 2025
