---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2025-12-03]: Technical implementation plan for the "Architectural Integrity" ($A$) pillar.
> *   **Goal:** Move from qualitative "red-agent" checks to quantitative "graph-centrality" measurements.
> *   **Executor:** Automated Worker (`ArchitecturalDebtAnalyzer`).
> *   **Analysis Status:** Completed gap analysis of existing Rationale analyzer and contracts.

# Implementation Plan: Architectural Integrity ($A$)

## 1. Executive Summary

This document outlines the technical steps to implement the **Architectural Integrity ($A$)** scoring mechanism as defined in the [Dual-Track Arena Specs](../../../Dual-Track-Arena/Embedding-Vectors/Architectural_Integrity.md).

**The Challenge:**
We must transition from a subjective LLM-based evaluation (and the current placeholder `escomplex` static analysis) to a deterministic, graph-based calculation. The core formula requires us to:
1.  Extract the dependency graph of the submitted code.
2.  Compute the "Centrality" (importance) of every node.
3.  Identify "Illegal Edges" based on a policy.
4.  Calculate the score: $A(\Delta) = \prod (1 - P(Violation | e))$.

## 2. Technical Architecture

### 2.1 Tooling Choices
*   **Graph Extraction:** `dependency-cruiser` (already present in repo). It can output the dependency graph in JSON format.
*   **Graph Analysis:** `graphology` (npm package). A robust library for graph algorithms (centrality, traversal) in JavaScript/TypeScript.
*   **Worker:** `@logomesh/workers` (TypeScript).

### 2.2 Data Flow
1.  **Input:** The `ArchitecturalDebtAnalyzer` receives the `sourceCode` (string) via `architectural-worker.ts`.
2.  **Extraction (FileSystem Adapter):**
    *   Since `dependency-cruiser` works on files, we must write the `sourceCode` to a temporary directory.
    *   *Note:* We will reuse the `fs.mkdtemp` and cleanup pattern seen in `TestingDebtAnalyzer` (using `os.tmpdir()`), but we do *not* need `isolated-vm` since we are running trusted analysis tools, not executing untrusted code directly (unlike tests).
    *   Run `depcruise` programmatically to generate a JSON output of modules and dependencies.
3.  **Construction:**
    *   Load the JSON into a `graphology` Directed Graph instance.
4.  **Analysis:**
    *   Run `pagerank` or `betweennessCentrality` on the graph to assign a weight ($W$) to every node.
    *   Load the `architecture-policy.yaml` (Constraints).
    *   Iterate through all edges in the graph.
    *   Check if edge $e$ violates a constraint.
5.  **Scoring:**
    *   Apply the formula.
    *   Return the `ArchitecturalDebtReport` (defined in `@logomesh/contracts`).

## 3. Implementation Steps

### Phase 1: Infrastructure & Dependencies

1.  **Add Dependencies:**
    *   `pnpm add graphology graphology-centrality` to `@logomesh/workers`.
    *   Ensure `dependency-cruiser` is available to the worker (it is currently a devDependency in root, might need to be a prod dependency for the worker package).

2.  **Policy Definition (`contracts` package):**
    *   Define the `ArchitecturePolicy` interface in `@logomesh/contracts/src/entities.ts` (or similar).
    *   Create a default policy file (e.g., `default-policy.json` or `yaml`) that defines standard layered architecture rules (e.g., "Presentation cannot touch Data").

### Phase 2: The Graph Analyzer Service

Create a new service `GraphAnalyzer.ts` in `packages/workers/src/services/`:

*   **Method:** `generateGraph(sourcePath: string): Promise<Graph>`
    *   Executes `dependency-cruiser` API.
    *   Maps the output to a `graphology` instance.
*   **Method:** `calculateCentrality(graph: Graph): Map<string, number>`
    *   Runs PageRank to determine node importance.

### Phase 3: The Constraint Engine

Create `ConstraintEngine.ts`:

*   **Input:** The `Graph` and the `ArchitecturePolicy`.
*   **Logic:**
    *   Iterate over all edges.
    *   Match edges against Policy Rules (Allow/Deny/Warn).
    *   **The "Critical Veto":** If a rule is `severity: critical`, the violation probability $P$ is 1.0.
    *   **The "Soft Veto":** If a rule is `severity: warning`, $P$ scales with the destination node's *Centrality*.
        *   $P = \text{BasePenalty} \times \text{Centrality(TargetNode)}$.

### Phase 4: Integration into Worker

Update `ArchitecturalDebtAnalyzer` in `packages/workers/src/analyzers.ts`:

*   **Class Structure:**
    *   Remove `escomplex` imports and logic.
    *   Add imports for `GraphAnalyzer`, `ConstraintEngine`, `fs`, `path`, `os`.
*   **Method:** `analyze(sourceCode: string): Promise<ArchitecturalDebtReport>`
    ```typescript
    async analyze(sourceCode: string): Promise<ArchitecturalDebtReport> {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'logomesh-arch-'));
      try {
        // 1. Write sourceCode to temp file (e.g. index.ts or structure)
        await fs.writeFile(path.join(tempDir, 'index.ts'), sourceCode);

        // 2. Generate Graph
        const graph = await GraphAnalyzer.generateGraph(tempDir);

        // 3. Calculate Centrality
        const centralityMap = GraphAnalyzer.calculateCentrality(graph);

        // 4. Evaluate Constraints
        const violations = ConstraintEngine.evaluate(graph, centralityMap, defaultPolicy);

        // 5. Calculate Score
        let score = 1.0;
        for (const v of violations) {
          score *= (1 - v.probability);
        }

        return {
           score,
           details: JSON.stringify(violations),
           metrics: { nodeCount: graph.order, edgeCount: graph.size }
        };
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    }
    ```

## 4. Policy Schema Design

We will use a JSON schema compatible with `dependency-cruiser`'s own rule format but extended for our scoring logic.

```json
{
  "forbidden": [
    {
      "name": "strict-layers",
      "from": { "path": "frontend" },
      "to": { "path": "database" },
      "severity": "critical", // P = 1.0 (Score -> 0)
      "message": "Frontend cannot access Database directly."
    },
    {
      "name": "util-coupling",
      "from": { "path": "utils" },
      "to": { "path": "core" },
      "severity": "warning", // P = 0.2 * Centrality
      "message": "Utils should not depend on Core logic."
    }
  ]
}
```

## 5. Verification Plan

1.  **Unit Tests:**
    *   Create a mock graph with known "illegal" edges.
    *   Verify that `ConstraintEngine` correctly identifies them.
    *   Verify that the score drops to 0.0 for critical violations.
2.  **Integration Test:**
    *   Feed a sample "Spaghetti Code" project into the analyzer.
    *   Feed a clean "Layered" project.
    *   Assert that $Score_{Clean} \gg Score_{Spaghetti}$.

## 6. Definition of Done

*   [ ] `graphology` installed in `workers`.
*   [ ] `GraphAnalyzer` implemented and unit tested.
*   [ ] `ConstraintEngine` implemented and unit tested.
*   [ ] `ArchitecturalDebtAnalyzer` updated to use the new logic.
*   [ ] `Architectural_Integrity.md` updated with "Implemented" status.
