---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-01-31]: Updated for Phase 1 submission. Reflects current architecture with embedded Red Agent, ground-truth scoring, and self-improving features.

# Judges Start Here: LogoMesh Agent Arena

Welcome to LogoMesh — a **multi-agent evaluation platform** for the Berkeley RDI AgentX AgentBeats competition.

This document walks you through what LogoMesh does, how it works, and why we made the design decisions we did.

---

## What Is LogoMesh?

LogoMesh is a benchmark that answers the question: **"When an AI writes code, how good is it really?"**

Most code benchmarks check if the output passes tests. LogoMesh goes further — it checks whether the AI:

1. **Understood the task** (Rationale Integrity)
2. **Wrote secure code** (Architectural Integrity — an adversarial Red Agent tries to break it)
3. **Wrote tests that actually work** (Testing Integrity — we run them in Docker)
4. **Got the logic right** (Logic Score — LLM-based code review)

The result is a single **Contextual Integrity Score (CIS)** between 0.0 and 1.0.

---

## The Agents

LogoMesh uses two services and one embedded module:

| Agent | What It Does | How It Runs |
|-------|-------------|-------------|
| **Green Agent** (Judge) | Orchestrates evaluation: sends tasks, runs tests, computes scores, manages refinement loop | Standalone FastAPI server (port 9009) |
| **Purple Agent** (AI under test) | Receives a coding task, returns source code + tests + explanation | Standalone A2A server (port 9010) |
| **Red Agent** (Attacker) | Hunts for security vulnerabilities in Purple's code using MCTS-based exploration | **Embedded inside Green** — no separate service |

The Red Agent is embedded inside Green intentionally. This lets Green dynamically adjust attack aggressiveness based on task complexity (simple tasks skip MCTS entirely) and eliminates a network hop.

---

## How a Battle Works

```
1. You send a task to Green:
   "Implement a thread-safe LRU cache with O(1) operations"

2. Green forwards to Purple via A2A protocol

3. Purple returns:
   - sourceCode: the implementation
   - testCode: unit tests
   - rationale: explanation of the approach

4. Green evaluates the response:
   a. Task complexity classification (simple / moderate / complex)
   b. Red Agent scans for vulnerabilities (MCTS for complex, static for simple)
   c. Static analyzer checks AST constraints (banned imports, required patterns)
   d. Adversarial test generator creates edge-case tests
   e. Docker sandbox executes all tests, captures pass/fail
   f. Scorer computes R, A, T, L from ground-truth signals
   g. LLM synthesis adjusts scores by at most ±0.10
   h. If score is low, refinement loop sends feedback and re-evaluates

5. Output:
   - CIS score (0.0 to 1.0)
   - Component breakdown (R, A, T, L)
   - Red Agent vulnerability report
   - Sandbox test results
   - DBOM (cryptographic audit trail)
```

---

## The Contextual Integrity Score (CIS)

### Formula

```
CIS = (0.25 × R + 0.25 × A + 0.25 × T + 0.25 × L) × red_penalty × intent_penalty
```

### Component Details

| Component | Name | Source of Truth | Range |
|-----------|------|-----------------|-------|
| **R** | Rationale Integrity | Cosine similarity: task description vs. AI's explanation | 0.0–1.0 |
| **A** | Architectural Integrity | Baseline 0.80, deducted for constraint violations (AST analysis) | 0.0–1.0 |
| **T** | Testing Integrity | Docker sandbox test pass rate: 100% pass → 0.85, 0% pass → 0.20 | 0.0–1.0 |
| **L** | Logic Score | LLM code review, anchored to test results | 0.0–1.0 |

### Penalties (Multiplicative)

| Penalty | Trigger | Effect |
|---------|---------|--------|
| Red Agent | Vulnerabilities found | Critical: ×0.70, High: ×0.80, Medium: ×0.90 |
| Intent mismatch | Code doesn't match task | ×0.30 if similarity ≈ 0 (scales linearly to ×1.0 at threshold) |

### Score Interpretation

| CIS Range | Meaning |
|-----------|---------|
| 0.75+ | Strong implementation — code works, is secure, and matches the task |
| 0.55–0.75 | Reasonable implementation with gaps (missing edge cases, minor issues) |
| 0.35–0.55 | Partial implementation — significant issues in one or more dimensions |
| 0.00–0.35 | Failed — code doesn't work, doesn't match, or has critical vulnerabilities |

---

## Why Ground-Truth Scoring?

This is the core design decision that differentiates LogoMesh from other LLM-as-judge benchmarks.

**The problem with pure LLM judging:** We found ±0.15 variance between identical runs when using an LLM alone to score code. The LLM might say "this is well-tested" for code that actually fails half its tests.

**Our solution:** Derive scores from observable facts, then let the LLM add nuance.

| Dimension | Ground Truth Signal | LLM Role |
|-----------|-------------------|----------|
| T (Testing) | Actual pytest pass rate from Docker sandbox | Can adjust ±0.10 for test quality |
| A (Architecture) | AST constraint check + vulnerability count | Can adjust ±0.10 for code structure |
| R (Rationale) | Cosine similarity of sentence embeddings | Can adjust ±0.10 for explanation depth |
| L (Logic) | LLM code review (primary scorer) | Anchored to test results so it can't contradict reality |

**Result:** Run-to-run variance dropped from ±0.15 to < 0.05. The LLM can still catch subtle issues (off-by-one errors, missing edge cases) but can't override what actually happened in the sandbox.

### Deterministic Settings

- `seed=42` on all LLM judge calls
- `temperature=0` for scoring and logic review
- Each signal penalizes exactly once (no double-counting)

---

## Self-Improving Features

LogoMesh isn't a static benchmark — it learns from past evaluations:

### Battle Memory
Every evaluation is stored in SQLite (`data/battles.db`). When the same task runs again, the system:
- Generates more targeted adversarial tests based on past failures
- Provides historical context to the Red Agent for smarter attacks
- Uses past rationale quality to calibrate scoring expectations

### Strategy Evolver
Uses a UCB1 multi-armed bandit to select from evaluation strategies:
- **Aggressive Red** — wider MCTS exploration, security-focused scoring
- **Correctness Focus** — lenient on security, strict on test correctness
- **Deep Refinement** — more iteration rounds, scientific feedback
- **Security Hunter** — maximum security penalty weighting
- **Fast Lenient** — fewer steps, lower thresholds

The system converges on the best strategy per task over time.

### Task Intelligence
For tasks outside the curated set of 20, an LLM dynamically generates:
- Attack hints for the Red Agent
- Architecture constraints for the scorer
- MCTS search patterns for vulnerability hunting

This means LogoMesh can evaluate **any coding task**, not just the hardcoded ones.

---

## Task Library

20 curated tasks across 4 difficulty tiers:

| Tier | Tasks | Examples |
|------|-------|---------|
| Beginner (1–4) | Data structures, algorithms | Email validator, LRU cache, recursive Fibonacci |
| Intermediate (5–8) | Security, concurrency | JWT parser, thread-safe connection pool, Merkle tree |
| Advanced (9–12) | Cryptography, blockchain | PoW blockchain, HD wallet, ECDSA, ERC-20 token |
| Expert (13–20) | Distributed systems | REST router, SQL builder, Raft consensus, MVCC transactions |

See the main [README.md](../../README.md) for the full task list with constraints.

---

## Baseline Results

Running our reference Purple Agent (gpt-4o-mini) against all 20 tasks:

- **Average CIS: 0.55**
- **Range: 0.00 – 0.75**
- Beginner tasks average ~0.66, Expert tasks average ~0.51
- task-013 (REST API Router) scored 0.00 — Purple failed to produce valid code
- task-004 (Recursive Fibonacci) scored 0.75 — well-understood algorithm

The score distribution reflects genuine task difficulty — not benchmark noise.

---

## Running It Yourself

### Quickest Path

```bash
git clone https://github.com/sszz01/LogoMesh.git
cd LogoMesh
pip install uv && uv sync
cp .env.example .env
# Add OPENAI_API_KEY to .env

# Start agents
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010 &
uv run main.py --role GREEN --host 0.0.0.0 --port 9009 &

# Run an evaluation
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "judge-test-001",
    "purple_agent_url": "http://localhost:9010/",
    "task_id": "task-004",
    "task_description": "Implement a recursive Fibonacci function with memoization. Must use recursion, no loops allowed."
  }'
```

### Docker

```bash
docker compose -f docker-compose.agents.yml up --build
```

See the main [README.md](../../README.md) for detailed Docker instructions.

---

## Key Files

If you want to audit the evaluation logic:

| File | What It Contains |
|------|-----------------|
| `src/green_logic/scoring.py` | The CIS scoring engine — ground-truth computation, LLM synthesis, penalty application |
| `src/green_logic/server.py` | The main orchestration — task complexity classification, refinement loop, intent mismatch detection |
| `src/red_logic/orchestrator.py` | MCTS-based Red Agent attack engine |
| `src/green_logic/generator.py` | Adversarial test generation |
| `src/green_logic/sandbox.py` | Docker sandbox for safe code execution |
| `src/strategy_evolver.py` | UCB1 strategy selection |
| `src/memory.py` | Battle memory persistence |

All evaluation logic is in source code — no opaque artifacts or hidden scoring.

---

## Related Documents

- [README.md](../../README.md) — Full documentation with Quick Start, architecture, and configuration
- [Agent-Architecture.md](./Agent-Architecture.md) — Technical architecture details
- [Green-Agent-Detailed-Guide.md](./Green-Agent-Detailed-Guide.md) — Green Agent internals
- [Purple-Agent-Detailed-Guide.md](./Purple-Agent-Detailed-Guide.md) — Purple Agent guide

---

*Last Updated: 2026-01-31*
