---
status: SUPERSEDED
type: Guide
---
> **Context:**
> * [2026-04-04]: Team-facing Phase 2 summary. Dates and judging criteria sourced from rdi.berkeley.edu/agentx-agentbeats.html.
> **Superseded By:** [[2026-04-12]-Phase2-Sprint3-Brief.md]([2026-04-12]-Phase2-Sprint3-Brief.md)

# LogoMesh Phase 2 — Team Brief
**Date:** April 2026

This brief outlines our strategy for Phase 2 of the AgentX-AgentBeats Competition. It replaces earlier drafts with ground-truth facts from the official competition guidelines and our most recent technical analysis.

## 1. What We Are Competing For
We are competing in Phase 2 of the AgentBeats competition, organized by Berkeley RDI. The competition features over $1M in prizes and resources, including cloud credits from AWS, Google DeepMind, and Lambda, inference credits from Nebius, and cash prizes for specific custom tracks (like Sierra's τ²-Bench track and Lambda's Agent Security track).

Unlike Phase 1, where we built a benchmark (a "Green Agent"), Phase 2 requires us to build the competitor (a "Purple Agent"). The goal is to perform well on the benchmarks created by the community in Phase 1.

### Official Judging Criteria
Our success isn't just about raw points. The official judges will evaluate us on:
1. **Leaderboard Performance (primary):** The actual scores our agent gets on the benchmarks.
2. **Generality:** Performing well across the full range of tasks in a track, not just a small subset.
3. **Cost Efficiency:** Using fewer resources (API calls, compute time, and tokens).
4. **Technical Quality:** Maintainable code and good documentation.
5. **Innovation:** Novel approaches and architectures.

## 2. Competition Schedule & Active Sprints
Phase 2 is divided into four rotating sprints. Each sprint features different tracks and benchmarks.

*   **Sprint 1 (Mar 2 – Mar 22):** Game, Finance, Business Process (Completed)
*   **Sprint 2 (Mar 23 – Apr 12):** Research, Multi-agent, τ²-Bench, Computer Use & Web
*   **Sprint 3 (Apr 13 – May 3):** Agent Safety, Coding Agent, Cybersecurity (Tentative)
*   **Sprint 4 (May 4 – May 24):** General Purpose Agents (Grand Finale)

**Important Deadlines:** We must submit our Sprint 2 targets by **April 12**. Sprint 3 opens on April 13.

## 3. What We Are Building
We are building a single generalized **Purple Agent**.

Because all benchmarks in the competition use a standard communication method called the Agent-to-Agent (A2A) protocol, we do not need to build a custom agent for every benchmark. Instead, our strategy is to build reusable **output adapters** that format our agent's answers into the shapes required by different groups of benchmarks (e.g., JSON, file writes, multi-turn tool commands).

This approach allows us to reuse work and score across multiple leaderboards efficiently.

## 4. Our Targets & Build Order
Our internal scoring estimates suggest a conservative goal of ~365 points and an optimistic goal of ~480 points across 7–8 benchmarks. *(Note: These internal estimates are used to prioritize our work, not official competition points).*

To maximize our score and meet the April 12 deadline for Sprint 2, the engineering team is building adapters in the following priority order:

1. **JSON Adapter:**
   *   **Unlocks:** `text-2-sql` (Sprint 3) and potentially `Terminal-Bench 2.0` (Sprint 3).
   *   *Why first?* Easiest to implement with the highest expected score return.
2. **Multi-turn Adapter:**
   *   **Unlocks:** `AVER` (Sprint 3), `CAR-bench` (Sprint 2), and `τ²-Bench` (Sprint 2).
   *   *Why next?* We **must** complete this to submit `CAR-bench` before the Sprint 2 deadline on April 12. If time permits before the deadline, we will also submit to `τ²-Bench` for a chance at Sierra's custom track cash prizes.
3. **File Write Adapter:**
   *   **Unlocks:** `RCAbench` (Sprint 3).
4. **Policy Trace Adapter:**
   *   **Unlocks:** `Pi-Bench` (Sprint 3).
5. **Diagnostic Reasoning (Floor Attempt):**
   *   **Unlocks:** `NetArena` (Sprint 3).
   *   *Why?* `NetArena` requires complex live Kubernetes infrastructure we don't currently have. Instead of skipping it, we will submit a "floor attempt" that provides high-quality diagnostic reasoning without executing it, securing partial points for minimal effort.

## 5. Summary of Next Steps
*   **Engineering:** Focus on delivering the JSON and Multi-turn adapters immediately to secure our Sprint 2 submission for `CAR-bench` by April 12.
*   **Research/Outreach:** Monitor the AgentBeats website for the official confirmation of Sprint 3 tracks and benchmarks (expected around mid-April), especially `Terminal-Bench 2.0`.
