---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2025-12-03]: Technical implementation plan for the "Architectural Integrity" ($A$) pillar.
> *   **Goal:** Move from qualitative "red-agent" checks to quantitative "graph-centrality" measurements.
> *   **Executor:** Automated Worker (`ArchitecturalDebtAnalyzer`).

# Implementation Plan: Architectural Integrity ($A$)

## 1. Executive Summary

This document outlines the technical steps to implement the **Architectural Integrity ($A$)** scoring mechanism as defined in the [Dual-Track Arena Specs](../../../Dual-Track-Arena/Embedding-Vectors/Architectural_Integrity.md).

**The Challenge:**
We must transition from a subjective LLM-based evaluation to a deterministic, graph-based calculation. The core formula requires us to:
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
1.  **Input:** The `ArchitecturalDebtAnalyzer` receives the `sourceCode` (string) or a path to the staged code.
2.  **Extraction:**
    *   Since `dependency-cruiser` works on files, we must write the `sourceCode` to a temporary directory.
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
    *   Return the `ArchitecturalDebtReport`.

## 3. Implementation Steps

### Phase 1: Infrastructure & Dependencies

1.  **Add Dependencies:**
    *   `pnpm add graphology graphology-centrality` to `@logomesh/workers`.
    *   Ensure `dependency-cruiser` is available to the worker (it is currently a devDependency in root, might need to be a prod dependency for the worker package).

2.  **Policy Definition (`contracts` package):**
    *   Define the `ArchitecturePolicy` interface in `@logomesh/contracts`.
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

```typescript
export class ArchitecturalDebtAnalyzer {
  async analyze(sourceCode: string): Promise<ArchitecturalDebtReport> {
     // 1. Write sourceCode to temp dir
     // 2. graph = await GraphAnalyzer.generateGraph(tempDir);
     // 3. violations = ConstraintEngine.evaluate(graph, defaultPolicy);
     // 4. score = calculateScore(violations);
     // 5. Cleanup temp dir
     return { score, details, ... };
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
