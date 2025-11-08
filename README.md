# LogoMesh: An Open Platform for Agent-on-Agent Evaluation

**Submission for the AgentX AgentBeats Competition (Benchmarks Track)**

---

## 1. Mission Overview

This repository contains the source code for the **LogoMesh Evaluation Platform**, an open-source, scalable, and resilient system for running "agent-on-agent" evaluations. Our primary goal is to provide a robust piece of "public good" infrastructure that solves the fragmentation and reproducibility crisis in agent evaluation.

To demonstrate the platform's power, we have implemented a premier, novel benchmark: the **Contextual Debt Score**.

**Contextual Debt is a dynamic, multi-step benchmark for quantifying how irrelevant or misleading context in an agent's memory degrades its future reasoning steps.**

This metric moves beyond static, single-turn evaluations to provide a systems-level view of an agent's long-term reasoning capabilities. For a complete explanation of the theory and methodology, please review our full submission paper.

**➡️ [Read the Full Submission Paper](./docs/AgentX_Submission_Paper.md)**

## 2. Quick Start & Verification

To ensure our system is reproducible and transparent, you can run the core evaluation logic with two simple commands. This will execute the full, asynchronous end-to-end test suite, which validates the entire platform, including the API, the asynchronous orchestrator, and the analysis services.

**Step 1: Install Dependencies**
```bash
pnpm install
```

**Step 2: Run the End-to-End Verification Test**
```bash
pnpm --filter @logomesh/server test:e2e
```

Upon successful execution, the test will confirm that the evaluation server can start, process a mock agent submission via the asynchronous pipeline, and generate a correctly structured Contextual Debt report.
