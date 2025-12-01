# Deep Research Prompt: Simulating the AgentX Judge Evaluation Process

**Objective:** To generate a comprehensive research report that simulates the evaluation process of the AgentX AgentBeats competition judges. This report will serve as an "inside peek" to help our team anticipate the judges' criteria, focus, and potential critiques.

**Persona:** You are a senior research analyst and AI strategist. Your task is to provide a detailed briefing to a team that has submitted a project to the AgentX "Benchmarks Track." Your analysis should be critical, insightful, and grounded in the specific context of the competition and its key players.

---

## **Core Research Question**

**"Based on all available information, how will the AgentX AgentBeats competition organizers and judges likely review our Green Agent submission for the 'Benchmarks Track'?"**

To answer this, your report must address the following sub-questions:

### **1. Judge and Competition Analysis (External Research)**

*   **Past Precedents:** What projects have won past AgentX competitions, and what were the stated reasons for their victory? Conversely, what common themes or weaknesses were present in projects that did not win? Analyze past winner announcements, blog posts, or publications.
*   **Judge Identification:** Who are the likely judges for this year's "Benchmarks Track"? Can you identify them from the official AgentX website, associated academic institutions (like Berkeley RDI), or sponsor organizations?
*   **Judge Profiling:** For any identified judges, what are their professional backgrounds, research interests, and publicly stated opinions on AI agents, software quality, and evaluation methodologies? (e.g., are they from industry or academia? Do they focus on security, scalability, or novel AI architectures?).
*   **Implicit Biases:** Based on the profiles of the judges and the explicit goals of the competition sponsors (like Auth0), what are the likely implicit biases of the judging panel? Will they favor projects with deep commercial potential, novel academic research, or flawless technical execution?

### **2. Submission Analysis (Internal Context)**

Based *only* on the provided source material below, perform a "red team" analysis of our project as if you were a judge. Identify the strengths a judge would praise and, more importantly, the weaknesses or questions they would raise.

*   **First Impressions:** Based on the [README.md](../../README.md), how easy is it to understand the project's purpose and verify its functionality? Are the "Quick Start" instructions clear, professional, and effective?
*   **Novelty and Impact:** Does the core concept of "Contextual Debt," as explained in the submission paper, represent a truly novel and important contribution to agent evaluation? Is it a "Zero to One" benchmark, or an incremental improvement?
*   **Technical Rigor:** Does the architecture, as shown in the diagram, appear robust, scalable, and well-designed for its purpose? Are there any obvious architectural flaws a judge might question?
*   **Meeting the Criteria:** How well does the project align with the stated goals of the "Benchmarks Track," which are to "enable meaningful cross-agent comparisons and offer insights into efficiency, accuracy, and generalization"?

### **3. Predictive Synthesis**

Synthesize your external research and internal analysis into a final, actionable "mock judging report." This section should:

*   Outline the step-by-step process a judge will likely follow when reviewing our submission, from cloning the repository to reading the paper.
*   Predict the 3-5 key questions the judges will ask during a Q&A session.
*   Identify the single biggest strength of our submission that we should emphasize, and the single biggest weakness we need to be prepared to defend.

---

## **Source Material for Submission Analysis**

You must use the following documents as the complete and total context for your analysis of our project.

### **Document 1: The [README.md](../../README.md) (Quick Start Guide)**

**Filepath:** `./[README.md](../../README.md)`

### **Document 2: The `AgentX_Submission_Paper.md`**

**Filepath:** `./docs/AgentX_Submission_Paper.md`

### **Document 3: The System Architecture Diagrams**

**Filepath:** `./[../onboarding/system-architecture.md](../onboarding/system-architecture.md)`

### **Document 4: Example Evaluation Report**

**Filepath:** `./../onboarding/example-evaluation-report.json`

### **Document 5: Key Source Code Files**

To provide deeper context into the technical implementation, please consider the following key files:

*   **`packages/server/src/server.ts`**: The main entry point for the Express server, showing middleware and route setup.
*   **`packages/server/src/routes/evaluation.routes.ts`**: The routing logic that handles the `/v1/evaluate` endpoint.
*   **`packages/core/src/orchestration/evaluationOrchestrator.ts`**: The core class that orchestrates the entire evaluation process.
*   **`packages/core/src/analysis/rationaleDebtAnalyzer.ts`**: An example analyzer service, showing how "Contextual Debt" is calculated for the rationale.
*   **`packages/contracts/src/entities.ts`**: The core data structures and types used throughout the application.
*   **`packages/server/src/e2e/evaluation.e2e.test.ts`**: The end-to-end test that verifies the entire system.
