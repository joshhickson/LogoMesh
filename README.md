# LogoMesh Green Agent: A Benchmark for Contextual Debt

**Submission for the AgentX AgentBeats Competition (Benchmarks Track)**

---

## 1. Mission Overview

This repository contains the source code for our "Green Agent," a system designed to introduce a new benchmark for evaluating AI coding agents: the **Contextual Debt Score**.

Current benchmarks primarily measure task completion, failing to capture the long-term engineering quality of AI-generated code. Our project addresses this gap by quantifying "Contextual Debt"—the liability incurred from code that lacks clear human intent and sound architectural reasoning. Our agent provides a more holistic evaluation of agent performance, moving beyond *if* a task was completed to *how well* it was completed.

For a complete explanation of the theory and methodology, please review our full submission paper.

**➡️ [Read the Full Submission Paper](./docs/AgentX_Submission_Paper.md)**

## 2. Quick Start & Verification

To ensure our system is reproducible and transparent, you can run the core evaluation logic with two simple commands. This will execute the end-to-end test suite for our Minimum Viable Product (MVP), which validates the functionality of our API and analysis services.

**Step 1: Install Dependencies**
```bash
pnpm install
```

**Step 2: Run the Verification Test**
```bash
pnpm test
```

Upon successful execution, the tests will confirm that the evaluation server can start, process a mock agent submission, and generate a correctly structured Contextual Debt report.
