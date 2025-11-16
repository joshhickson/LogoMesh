# Predicted Questions from Samuel Lee Cong
**Generated:** 2025-11-16
**Confidence:** High

This document contains a prioritized list of questions we predict Samuel will ask during his review of the "Cyber-Sentinel Agent" repository. The questions are derived by cross-referencing his "Verifiable Product-Builder" persona with the gap between the strategic `PROJECT_PLAN.md` and the tactical reality in the `RECOVERY_PLAN.md` and source code.

---

### Category 1: The 'Verifiable Product' Questions
*(His core mindset: "I ship robust, tested products. How close is this to a real, working system?")*

1.  **The E2E Test:** Your `RECOVERY_PLAN` correctly identifies that the current end-to-end test is not truly asynchronous. How would you handle a real-world scenario where an evaluation takes several minutes to run? What happens if a worker fails mid-process? How is that state managed and communicated back to the user?
2.  **`TestingDebtAnalyzer` Implementation:** The `RECOVERY_PLAN` specifies using `isolated-vm` for a secure sandbox, but the current `TestingDebtAnalyzer` is a simple regex check. What's the timeline for building the sandboxed execution environment? How do you plan to handle security risks like infinite loops or resource exhaustion in agent-submitted test code?
3.  **Error Handling & Resilience:** The `evaluationOrchestrator` has a `try/catch` block for the main evaluation flow, but what about the workers themselves? If the `architectural-worker` crashes because `escomplex` fails on some unusual syntax, does the entire evaluation halt? How do you ensure the system is resilient to partial failures?
4.  **Configuration Management:** Right now, Redis connection details and queue names are hardcoded. How do you plan to manage configuration for different environments (dev, test, production)? A real product can't be rebuilt for every deployment.
5.  **State Management:** The orchestrator currently stores evaluation results in an in-memory `Map`. This won't survive a server restart and doesn't scale. What's your strategy for persistent state management? Is this something you'd use Redis for, or a more structured database like Postgres?
6.  **Reproducibility:** You mention "verifiable audit trails," but true verification requires reproducibility. Given the non-determinism of LLMs, how can you guarantee that running the same evaluation twice on the `rationaleDebtAnalyzer` will produce the same result? Are you caching LLM responses or versioning the prompts?
7.  **The "Happy Path" Problem:** I see a lot of prototype code that seems focused on the "happy path." My experience shipping `herbie` taught me that 90% of the work is in the edge cases. What's your philosophy on this, and when do you plan to move from building features to hardening them?

---

### Category 2: The 'AGENTGUARD' Security Questions
*(His specialist mindset: "I see systems through an adversarial lens. How is this hardened?")*

8.  **"Contextual Debt" as an Attack Vector:** Your definition of Contextual Debt is an *internal* reasoning failure. My AGENTGUARD framework focuses on *external, malicious* actions. Could an attacker intentionally craft a code submission with subtle flaws that *injects* Contextual Debt, causing the evaluator to score it incorrectly or even crash?
9.  **Auth0 Integration Status:** The `PROJECT_PLAN` heavily emphasizes the Auth0 integration as a core strategic goal. When do you plan to move beyond the mocked middleware and implement the FGA-secured endpoints described in the recovery plan?
10. **Securing the Workers:** The workers seem to implicitly trust the data they receive from the Redis queues. How do you ensure that a compromised worker can't inject malicious data into the `evaluation-flow` or poison the results for another evaluation? Is there any validation or signing on the job data?
11. **Tool-Use Sandboxing:** My AGENTGUARD paper is about constraining unsafe tool use. Your `TestingDebtAnalyzer` will eventually run arbitrary code. How does your "hardened spine" concept prevent that code from, for example, exfiltrating data from the environment or attacking the Redis instance it has network access to?
12. **Audit Log Integrity:** You plan to create an audit log for verifiability. How do you protect this log from tampering? If an agent's evaluation produces a result I want to dispute, how can I be sure the log I'm seeing hasn't been altered?
13. **Credential Management:** The recovery plan mentions provisioning short-lived tokens. This is the right approach. Can you walk me through the proposed flow for how the Orchestrator would securely provide an agent with an Auth0 token to access a protected tool?

---

### Category 3: The 'Architectural & Performance' Questions
*(His data/performance engineer mindset: "I optimize systems. Is this architecture scalable and efficient?")*

14. **Why BullMQ?** You've chosen BullMQ for your orchestration. What was the reasoning behind this choice versus a simpler in-process model for a Week 2 prototype, or a more robust system like Kafka? What limitations do you foresee with this approach as you scale?
15. **Performance Overhead:** The `escomplex` analysis is synchronous and runs in the worker. What's the performance impact of this on a large codebase? At Cuberg, I achieved a 10x speedup by refactoring a similar pipeline. Have you benchmarked the latency of each analyzer, and what's the overall budget for a complete evaluation?
16. **Data Schema & Contracts:** The `contracts` package is a good start. Are you considering a more formal data contract system like Protocol Buffers or Avro, especially for event-driven architectures? This is key to preventing service-to-service communication failures as the system evolves.
17. **Scalability of Workers:** The current model seems to be one queue per worker type. How do you plan to scale this? If the `rationale-worker` (which calls a slow LLM) becomes a bottleneck, would you add more workers to that queue? How does that affect things like API rate limits on the LLM?
18. **Cost Analysis:** The LLM-based `rationaleDebtAnalyzer` is essentially making an API call for every single reasoning step. This could get expensive very quickly. Have you done a cost analysis on how much a single, full evaluation would cost in terms of LLM tokens and compute resources?

---

### Category 4: The 'Strategic & Business Metric' Questions
*(His business-centric mindset: "How does this create value? How do you quantify success?")*

19. **Quantifying "Contextual Debt":** This is a fascinating concept, but how do you prove its business impact? My work at Endeavor involved shipping demos that directly led to "$1M ARR." Can you frame the cost of "Contextual Debt" in similar, quantifiable business terms, like "a 20% increase in security vulnerabilities" or "a 30% slower time-to-market"?
20. **The User of the Benchmark:** Who is the end-user of the Cyber-Sentinel Agent? Is it a developer getting feedback in a PR, a CTO tracking the quality of their AI workforce, or a compliance officer auditing an agent's work? The answer dramatically changes the product you should build.
21. **Beyond "Good/Bad":** Your scoring seems to produce a single "contextual debt score." Is there a plan for more diagnostic, actionable feedback? A developer doesn't just want a score; they want to know *exactly* what to fix and why.
22. **Competitive Landscape:** How does this benchmark compare to others in the space, like the official HELM benchmark or custom solutions from companies like Scale AI? What is your unique, defensible value proposition?
23. **The "Why" Behind the Architecture:** You're building a sophisticated, distributed system for what is currently a prototype. This introduces significant complexity that can slow down development velocity. Why was this the right architectural choice *right now*, versus a simpler, monolithic approach that might allow you to ship and iterate faster, like we did at `herbie`?
