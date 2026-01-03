---
status: SNAPSHOT
type: Research
---
> **Context:**
> * [2025-12-17]: Historical submission draft.

# A Benchmark for Agentic Quality: Measuring and Managing Contextual Debt

## Abstract

The proliferation of AI-powered code generation tools has unlocked unprecedented development velocity but has also introduced a novel, insidious form of liability: **Contextual Debt**. This is the future cost incurred from a lack of discernible human intent and architectural rationale within a codebase. Current agentic benchmarks, which focus solely on task completion, fail to measure this critical dimension of software quality. This paper introduces a new benchmark and a reference implementation—a "Green Agent"—designed to quantify Contextual Debt. Our agent analyzes code submissions from other AI agents across three axes: rationale, architecture, and testing. It aggregates these findings into a single, actionable **Contextual Debt Score**, providing a more holistic measure of agent performance and paving the way for a new generation of quality-aware AI development tools.

## Introduction: The Problem of Contextual Debt

Agentic software engineering is grappling with a **productivity paradox**: while individual developers report massive speed gains, system-level stability and throughput are declining. The root cause is that AI agents, optimized for localized task completion, are flooding codebases with syntactically correct but semantically opaque code. This practice, termed **"vibecoding,"** prioritizes immediate results over intentional design, leading to a systemic erosion of the "why" behind the code.

This erosion creates **Contextual Debt**. Unlike traditional technical debt (a suboptimal "how"), contextual debt is the cost of a missing "why." It manifests as code that is difficult to debug, maintain, and evolve because its underlying logic and architectural purpose are not owned or understood by the human team. Existing benchmarks, which typically measure only whether an agent can complete a task (e.g., pass a set of unit tests), are insufficient. They incentivize the very "vibecoding" that generates this long-term liability, failing to distinguish between a brittle, context-free solution and a robust, well-architected one. A new benchmark is needed—one that measures not just *if* an agent can solve a problem, but *how well* it solves it from an engineering perspective.

## Methods: A Green Agent for Quantifying Debt

To address this gap, we have developed a Green Agent that acts as an automated code reviewer, specifically designed to score the quality of another agent's (a "Purple Agent") code submission. Our agent's architecture is built around an **`EvaluationOrchestrator`** that coordinates three specialized analyzer services:

1.  **`RationaleDebtAnalyzer`:** This service uses a Large Language Model (LLM) to evaluate the quality of the rationale submitted alongside the code. It scores the explanation based on its clarity, completeness, and discussion of trade-offs, directly measuring the "explainability" of the solution.
2.  **`ArchitecturalDebtAnalyzer`:** This service performs static analysis on the source code to measure its structural integrity. In its initial version, it uses metrics like cyclomatic complexity to identify code that is overly complex and difficult to maintain.
3.  **`TestingDebtAnalyzer`:** This service analyzes the submitted test code to gauge its thoroughness. It rewards submissions that go beyond simple "happy path" tests to include checks for edge cases and error conditions.

The orchestrator invokes these three analyzers in parallel and then aggregates their individual scores (each from 0.0 to 1.0) into a single, averaged **Contextual Debt Score**. This score provides a quantitative measure of the submission's overall engineering quality.

## Results: The MVP and its API

Our Minimum Viable Product (MVP) is a Node.js server that exposes a single API endpoint: `POST /v1/evaluate`. This endpoint accepts the URL of a competing Purple Agent. It then orchestrates the entire evaluation workflow: sending a task to the Purple Agent, receiving its submission, running the analysis, and returning a final report.

### Example JSON Report

The final output is a JSON object that provides the overall score and a detailed breakdown from each analyzer. This structured data is designed to be machine-readable, enabling its use in automated competition benchmarks.

```json
{
  "id": "01J8Y2Z5X3N4Q5R6S7T8V9W0X2",
  "status": "complete",
  "contextualDebtScore": 0.77,
  "report": {
    "rationaleDebt": {
      "score": 0.9,
      "details": "The rationale is clear, well-structured, and discusses potential trade-offs."
    },
    "architecturalCoherenceDebt": {
      "score": 0.8,
      "details": "Code is well-structured with a low cyclomatic complexity score of 5."
    },
    "testingVerificationDebt": {
      "score": 0.6,
      "details": "Tests cover the happy path, but no explicit tests for edge cases were found."
    }
  },
  "createdAt": "2025-12-15T10:00:00.000Z",
  "completedAt": "2025-12-15T10:01:15.000Z"
}
```

## Discussion: Impact and Future Work

The Contextual Debt Score represents a new, more meaningful benchmark for comparing the performance of autonomous software agents. By moving beyond mere task completion, it encourages the development of agents that produce code that is not just functional, but also maintainable, robust, and understandable. We believe this benchmark is a valuable public good that will:

*   Enable more insightful cross-agent comparisons.
*   Incentivize the AI research community to focus on engineering quality, not just capability.
*   Provide a tool for organizations to measure and manage the quality of AI-generated code in their own systems.

Future work will involve expanding the sophistication of the analyzer services, such as incorporating more advanced static analysis, measuring test coverage directly, and fine-tuning the rationale analyzer on a dataset of expert code reviews. By open-sourcing our Green Agent, we invite the community to collaborate on building a comprehensive and standardized benchmark for agentic code quality.

## Related Work

The concept of "debt" as a metaphor for software quality issues is well-established. Our work builds upon two key precedents in the field of LLM and RAG evaluation.

1.  **"PromptDebt" (ArXiv:2509.20497):** This foundational paper establishes the "debt" metaphor for Self-Admitted Technical Debt (SATD) in LLM-centric projects. It identifies "Prompt Debt" as a qualitative, self-admitted concept found in developer comments regarding suboptimal prompts. While we adopt the powerful "debt" metaphor, our contribution is distinct: **"PromptDebt" is a qualitative, manually-identified concept, whereas "Contextual Debt" is a quantitative, automatically-generated, and dynamic benchmark.**

2.  **DeepEval "Contextual Relevancy":** DeepEval is a leading open-source framework for evaluating RAG pipelines. Its "Contextual Relevancy" metric provides a quantitative score for the quality of retrieved context in a single-turn RAG operation. While conceptually similar, the key differentiator is the scope of the analysis. **DeepEval's metric is a static, single-step measurement of a *retrieval* state. "Contextual Debt," in contrast, is a dynamic, multi-step measurement of a *reasoning process*.** Our benchmark is designed to trace the compounding, downstream impact of irrelevant context on an agent's future reasoning steps, which we argue is a fundamentally harder and more critical problem for the next generation of autonomous agents.
