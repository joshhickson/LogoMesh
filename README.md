# LogoMesh Green Agent: A Benchmark for Contextual Debt

This repository contains the official submission for the AgentX-AgentBeats "Benchmarks Track." We have built a novel "Green Agent" designed to evaluate competing "Purple Agents" on **Contextual Debt**—a new, unmeasured liability in AI-generated code.

Our agent provides a comprehensive, automated score that moves beyond simple task completion to measure the true quality, maintainability, and "knowability" of an agent's work.

**For a deep dive into the research and methodology, please see our submission paper: [A Green Agent for Measuring Contextual Debt](./docs/AgentX_Submission_Paper.md)**

---

## Quick Start (Verifying the System)

We have included a full end-to-end (E2E) test suite that proves the entire system works as intended. This test will:

1.  Start our **Green Agent** API server.
2.  Start a **Mock Purple Agent** server.
3.  Run a full evaluation by having our agent send a task to the mock agent via the A2A protocol.
4.  Validate the final "Contextual Debt Score" and report.

### Prerequisites

- Node.js (v20 LTS recommended)
- pnpm

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run the End-to-End Test

This single command runs the entire verification:

```bash
pnpm --filter @logomesh/server run test:e2e
```

You will see output as both servers spin up, followed by a passing test result, confirming the system is fully operational.

---

## Running Manually

You can also run the components individually to interact with the API yourself.

### 1. Start the Mock Agent

In your first terminal, start the mock Purple Agent:

```bash
pnpm --filter @logomesh/mock-agent start
```

*Running on http://localhost:3002*

### 2. Start the Green Agent (Our Server)

In your second terminal, start our Green Agent API server:

```bash
pnpm --filter @logomesh/server start
```

*Running on http://localhost:3001*

### 3. Run an Evaluation via curl

In a third terminal, use curl to send a new evaluation request to our Green Agent, pointing it at the mock agent's endpoint:

```bash
curl -X POST http://localhost:3001/v1/evaluate \
     -H "Content-Type: application/json" \
     -d '{ "purple_agent_endpoint": "http://localhost:3002/a2a" }'
```

### 4. Get Your Results

You will receive a JSON response with the full evaluation, including the final **contextual_debt_score** and the detailed report:

```json
{
  "evaluation_id": "uuid-...",
  "status": "complete",
  "contextual_debt_score": 0.85,
  "report": {
"rationaleDebt": { "score": 0.5, "details": "mocked" },
    "architecturalCoherenceDebt": { "score": 0.8, "details": "Good architecture." },
    "testingVerificationDebt": { "score": 0.7, "details": "Good tests." }
  }
}
```

---

### Core Architecture

This project is a TypeScript monorepo built with pnpm and Turborepo.

- packages/contracts: Defines the shared data structures (e.g., EvaluationReport).
- packages/core: Contains the core logic:
  - analysis/: The three specialist inspectors (RationaleDebtAnalyzer, etc.).
  - orchestration/: The EvaluationOrchestrator (the "Head Inspector").
  - services/: The A2AClient and secure PluginHost.
  - storage/: The normalized SQLiteAdapter.
- packages/server: The Express.js API server.
- packages/mock-agent: The mock Purple Agent used for testing.
