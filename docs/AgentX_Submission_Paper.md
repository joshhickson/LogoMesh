# AgentX Submission Paper: A Green Agent for Measuring Contextual Debt

## Abstract

The proliferation of AI agents in software development is creating a new, unmeasured liability we call "Contextual Debt"—code that is syntactically correct but lacks discernible human intent, architectural coherence, or testability. This productivity paradox, where development velocity increases while system quality and maintainability decline, stems from practices like "vibecoding," where AI is prompted to generate solutions without a strong underlying mental model. Current benchmarks are ill-equipped to measure this new form of debt, as they focus on functional correctness rather than the semantic and architectural integrity of an agent's work.

To address this critical gap, we have built a "Green Agent" that, for the first time, provides a comprehensive, automated score for Contextual Debt. Our evaluator issues a software requirement to a competing "Purple Agent" and analyzes its submission—code, tests, and rationale—using a multi-faceted framework. The final "Contextual Debt Score" is an aggregation of three metrics: **Rationale Debt**, measuring the clarity of the agent's explanation; **Architectural Debt**, assessing the structural quality of the code via static analysis; and **Testing Debt**, evaluating the thoroughness of the agent's tests. This new benchmark enables a more meaningful evaluation of agentic systems, moving beyond simple task completion to measure the quality and maintainability of an agent's work, which is a critical, missing piece in agent evaluation.

## 1. Introduction: The Problem of "Contextual Debt"

The agentic era of software development has introduced a significant "productivity paradox": while AI-assisted development feels faster and dramatically increases code output, it can lead to systemic fragility and a decline in delivery stability. This paradox arises from a new and insidious form of liability that current evaluation methods fail to capture. The primary source of this liability is a practice we term "vibecoding"—the process of prompting an AI to generate code without a strong, pre-existing mental model of the desired outcome, architecture, or logic. This leads to code that is syntactically correct but semantically opaque.

To address this, we formally define **Contextual Debt**: "the future cost incurred from a lack of discernible human intent, architectural rationale, and domain-specific knowledge within a codebase." Unlike traditional technical debt, which concerns a flawed implementation (the "how"), contextual debt is the cost of a missing or opaque intent (the "why"). This is the critical "secret" that current benchmarks are missing. They can confirm that an agent's solution *works*, but they cannot tell you if the solution is maintainable, well-architected, or even understandable to the human team responsible for its long-term ownership. As agentic systems become more powerful, this unmeasured liability represents the single greatest threat to the long-term health of software projects.

## 2. Methods: A Green Agent for Measuring Agentic Quality

To solve the problem of Contextual Debt, we have constructed a **Green Agent**, an automated evaluator designed to compete in the "Benchmarks Track" and assess the quality of competing "Purple Agents" on the "Coding Agent" track. Our system provides a novel, comprehensive, and automated scoring methodology that moves beyond mere functional correctness.

The evaluation workflow follows the Agent-to-Agent (A2A) protocol:
1.  Our Green Agent issues a software requirement (a "thought") to a Purple Agent via an API endpoint.
2.  It receives the Purple Agent's submission, which must include the generated code, a set of corresponding tests, and a natural language rationale explaining its approach.
3.  It analyzes this multi-faceted submission using a "step-level evaluation framework" executed by a team of specialized internal agents.

The agent's final output is a single, normalized **"Contextual Debt Score"**, which is an aggregation of three distinct metrics, each targeting a different type of debt:

1.  **Rationale Debt (`RationaleDebtAnalyzer`):** This service uses a Large Language Model (LLM) to evaluate the quality of the rationale submitted alongside the code. It scores the explanation based on its clarity, completeness, and discussion of trade-offs, directly measuring the "explainability" of the solution. Does the agent "show its work" and justify its decisions?
2.  **Architectural Debt (`ArchitecturalDebtAnalyzer`):** This service uses static analysis to measure the objective complexity and quality of the generated source code. It calculates metrics such as cyclomatic complexity to determine if the code is simple, modular, and maintainable, or a tangled, high-debt mess.
3.  **Testing Debt (`TestingDebtAnalyzer`):** This service performs a heuristic analysis of the tests provided by the Purple Agent. It verifies not only the existence of tests but also their quality, checking for coverage of edge cases and error conditions beyond the simple "happy path."

## 3. Results: The MVP and a Sample Report

Our Green Agent is implemented and functional, with a working `/v1/evaluate` endpoint that can receive a Purple Agent's endpoint and execute the full evaluation workflow. The tangible output of this process is a detailed JSON report that provides both a top-level Contextual Debt score and a breakdown of the individual debt components. This report serves as our concrete "scoring" deliverable, providing a clear and machine-readable assessment of the Purple Agent's work.

Below is an example of the final JSON report produced by our Green Agent:

```json
{
  "evaluation_id": "uuid-...",
  "status": "complete",
  "contextual_debt_score": 0.85,
  "report": {
    "rationaleDebt": { "score": 0.9, "details": "The rationale is clear, well-structured, and discusses the primary trade-offs." },
    "architecturalDebt": { "score": 0.8, "details": "Cyclomatic complexity is low and the code adheres to a clean, single-responsibility pattern." },
    "testingDebt": { "score": 0.7, "details": "The tests cover the happy path and some edge cases, but miss potential null input failures." }
  }
}
```

## 4. Discussion: Impact and Future Work

Our Green Agent directly meets the judging criteria for the Benchmarks Track by providing a "comprehensive, standardized" evaluation method with "novel tasks, automation, and scoring." The Contextual Debt score offers deep "insights into efficiency, accuracy, and generalization" by measuring the quality of the agent's underlying thought process, not just its final output. This moves beyond a simple pass/fail check to a nuanced assessment of maintainability and architectural integrity—qualities that are essential for real-world software engineering.

This project represents a **"Zero to One" Benchmark**. The problem of Contextual Debt will only grow as agentic systems become more powerful and prolific. By providing the first standardized tool to measure this liability, we are contributing a critical public good that will enable the community to build and compare agents based on the quality and sustainability of their work.

**Future Work:** This benchmark is the first step toward our long-term vision of a full **Cognitive Integrated Development Environment (C-IDE)**. Our goal is to evolve this project from a passive evaluator into an active, collaborative tool that helps humans and AI partners manage Contextual Debt in real-time, transforming the very nature of how we build complex systems together.
