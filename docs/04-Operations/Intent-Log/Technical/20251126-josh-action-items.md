---
status: SNAPSHOT
type: Log
---
> **Context:**
> * [2025-12-17]: Historical action items.

# Josh's Action Items (Consolidated 2025-11-26)

This document lists the specific action items assigned to Josh, consolidated from the team feedback analysis log and the **Revised Contextual Discovery Plan (2025-11-27)**.

### Collaboration & Tooling
- [ ] Create a dedicated folder in Google Docs for project deliverables, starting with the "Contextual Debt Paper."

### Benchmark Strategy & Competition
- [ ] Plan a research task to investigate existing benchmarks and assess their suitability for compilation or adaptation.
- [ ] Investigate benchmark size requirements, with the intention of asking in the MOOC Discord if official documentation is unclear.

### Task Assignments & Role Clarifications
- [ ] Identify a suitable person (potentially "Garrett") for implementation tasks that were previously assigned to Alaa.

### Research & Intellectual Property
- [ ] **[From Discovery Plan Revision]: Experiment 1.3: The Composite Score Differentiation** (with Alaa)
  - **Task:** Produce a brief markdown report contrasting our "Composite Score" against singular metrics like BLEU or simple CodeBERT embeddings. Focus on the *combination* of R, A, and T as the differentiator.
- [ ] Use Google Scholar Labs AI (Gemini integration) to perform a literature search for papers similar to the project's. The goal is to clearly identify and articulate the unique contributions of the CIS.

  **Primary Research Question:**
  > "To what extent has existing academic and industry literature addressed the concept of a composite software quality metric that, like the Contextual Integrity Score (CIS), programmatically evaluates AI-generated or human-written code by simultaneously measuring the semantic alignment of **(a)** the code to its documented intent, **(b)** the code's adherence to a defined system architecture, and **(c)** the semantic relevance of its test assertions to the original acceptance criteria?"

### Technical Feasibility & Discovery (From Revision Plan)
- [ ] **[From Discovery Plan Revision]: Experiment 4.3: The Data Accessibility & Link Extraction POC**
  - **Task:** Verify that the Node.js server in `onboarding/` can be configured to safely read file contents from the root `docs/` and `logs/` directories.
  - **Task:** Write a script (e.g., Python or Node.js) that can traverse the `docs/` and `logs/` directories and extract all explicit markdown links ([text](./path/to/file.md)) to build a preliminary adjacency list.
  - **Deliverable:** A brief report summarizing the findings (Pass/Fail) and the POC script.
