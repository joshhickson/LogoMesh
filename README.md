> **Branch Status: `feat/cli-and-mcp`**
> This branch is the active development workspace for the **LogoMesh CLI & MCP Server**. It refactors the core logic to function as a local-first developer tool, decoupling it from the heavy server/database architecture found in `master`.
>
> Key features introduced in this branch:
> - **Auditor Mode:** A passive graph analysis tool (`logomesh check`) to enforce architectural rules.
> - **Architect Mode:** An active code generation and falsification loop (`logomesh build`) that uses an adversarial Monte Carlo Tree Search (MCTS) to "Red Team" code before it's committed.

# LogoMesh — Multi-Agent Evaluation Arena for AI Code Quality

> **tl;dr:** LogoMesh is a benchmark that grades AI-written code. It sends a coding task to an AI agent, then a panel of sub-agents judges the result — one checks security, one runs the tests, one reviews the logic. The final score tells you how much you can trust that code in production.

Built for the [Berkeley RDI AgentBeats](https://agentbeats.dev) Phase 1 competition.

---

## What Problem Does This Solve?

When an AI writes code for you, how do you know it's actually good? Current benchmarks check if the code "passes tests" — but that misses the bigger picture:

- Does the code **match what you asked for**, or did the AI hallucinate something unrelated?
- Is the code **secure**, or does it have SQL injection, other malicious injection, hardcoded passwords, or broken auth?
- Do the **tests actually test anything**, or are they trivial assertions?
- Does the AI **understand why** it wrote the code that way?

LogoMesh answers all four questions simultaneously by computing a **Contextual Integrity Score (CIS)** — a single number between 0.0 and 1.0 that captures code quality across rationale, architecture, security, and testing.

---

## How It Works

```
You submit a coding task (e.g., "Build a thread-safe LRU cache")
                │
                ▼
     ┌──────────────────────┐
     │  Purple Agent (AI)   │  ← Generates code, tests, and an explanation
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Green Agent (Judge) │  ← Our benchmark — this is what we built
     │                      │
     │  1. Red Agent scans  │  ← Embedded attacker hunts for vulnerabilities
     │     for security     │     using Monte Carlo Tree Search (MCTS)
     │     vulnerabilities  │
     │                      │
     │  2. Sandbox runs     │  ← Docker container executes the code + tests
     │     the code         │     to get real pass/fail results
     │                      │
     │  3. Static analyzer  │  ← AST checks for banned imports, required
     │     checks structure │     patterns, constraint violations
     │                      │
     │  4. Scorer computes  │  ← Combines ground-truth signals into a
     │     CIS score        │     single 0.0-1.0 score
     │                      │
     │  5. If score is low, │  ← Sends specific feedback ("your code has
     │     refinement loop  │     a bug on line 12") and re-evaluates
     │     asks AI to fix   │
     └──────────┬───────────┘
                │
                ▼
     Final CIS Score + detailed breakdown + DBOM (audit trail)
```

The key insight: **we don't just ask an LLM "is this code good?"** — we derive scores from real signals (did the tests actually pass? did the attacker find vulnerabilities?) and only let the LLM adjust by ±10%. This makes scores reproducible across runs.

---

## Abstract

LogoMesh is a multi-agent benchmark that evaluates AI coding agents across four orthogonal dimensions: **Rationale Integrity** (does the agent understand the task?), **Architectural Integrity** (is the code secure and well-structured?), **Testing Integrity** (do tests actually validate correctness?), and **Logic Score** (does the code work correctly?).

Unlike static benchmarks, LogoMesh uses:
- An **adversarial Red Agent** with Monte Carlo Tree Search to discover vulnerabilities
- A **Docker sandbox** for ground-truth test execution
- A **self-improving strategy evolution** system (UCB1 multi-armed bandit) that adapts evaluation rigor based on past performance
- **Intent-code mismatch detection** that catches when an AI returns completely wrong code
- **Battle Memory** that learns from past evaluations to improve future scoring

The benchmark covers 20 tasks from basic data structures to distributed systems (Raft consensus, MVCC transactions, blockchain), and dynamically generates evaluation criteria for novel tasks via LLM-powered Task Intelligence.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Running with Docker](#running-with-docker)
- [Scoring — How CIS Works](#scoring--how-cis-works)
- [Sample Output](#sample-output)
- [Reproducibility](#reproducibility)
- [Task Library](#task-library)
- [Architecture Deep Dive](#architecture-deep-dive)
- [For Purple Agent Developers](#for-purple-agent-developers)
- [Configuration Reference](#configuration-reference)
- [Project Structure](#project-structure)

---

## Quick Start

### Prerequisites

- Python 3.11+
- Docker (for sandbox — the code execution environment)
- An OpenAI API key (or any OpenAI-compatible endpoint)

### Install and Run

```bash
# 1. Clone and install
git clone https://github.com/sszz01/LogoMesh.git
cd LogoMesh
pip install uv && uv sync

# 2. Set your API key
cp .env.example .env
# Edit .env → add your OPENAI_API_KEY

# 3. Start the Purple Agent (the AI being evaluated)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010 &

# 4. Start the Green Agent (the judge — includes embedded Red Agent)
uv run main.py --role GREEN --host 0.0.0.0 --port 9009 &

# 5. Send a coding task
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "demo-001",
    "purple_agent_url": "http://localhost:9010/",
    "task_id": "task-004",
    "task_description": "Implement a recursive Fibonacci function with memoization. Must use recursion, no loops allowed."
  }'
```

You'll get back a JSON response with:
- `cis_score` — the final score (0.0 to 1.0)
- `component_scores` — breakdown into R, A, T, L
- `red_report` — what vulnerabilities were found
- `sandbox_result` — actual test execution output
- `evaluation.breakdown` — human-readable explanation of the score

---

## Running with Docker

### Green Agent (The Assessor Agent - the benchmark)

```bash
docker build -t logomesh-green:latest -f Dockerfile.green .

docker run -p 9009:9009 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v /var/run/docker.sock:/var/run/docker.sock \
  logomesh-green:latest --host 0.0.0.0 --port 9009
```

> **Note:** The Docker socket mount (`-v /var/run/docker.sock:...`) lets Green spin up isolated sandbox containers to safely execute Purple's code.

### Purple Agent (The Participant - the AI being evaluated)

```bash
docker build -t logomesh-purple:latest -f Dockerfile.purple .

docker run -p 9010:9010 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  logomesh-purple:latest --host 0.0.0.0 --port 9010
```

### Both Agents Together (Docker Compose)

```bash
docker compose -f docker-compose.agents.yml up --build
```

Then send tasks to `http://localhost:9009/actions/send_coding_task`.

---

## Scoring — How CIS Works

### The Formula

```
CIS = (0.25×R + 0.25×A + 0.25×T + 0.25×L) × red_penalty × intent_penalty
```

Each component is weighted equally at 25%, then multiplied by penalty factors for security vulnerabilities and task mismatch.

### What Each Component Measures

| Component | Full Name | How It's Computed | What It Catches |
|-----------|-----------|-------------------|-----------------|
| **R** | Rationale Integrity | Cosine similarity between task description and the AI's explanation | AI that can't explain what it wrote, or explains something different from the task |
| **A** | Architectural Integrity | Starts at 0.80, deducted for constraint violations (banned imports, missing patterns) | Code that uses `eval()` when told not to, or skips required patterns like recursion |
| **T** | Testing Integrity | Directly from Docker sandbox: 100% pass = 0.85, 80% pass = 0.72, 0% = 0.20 | Tests that don't actually pass, or code that breaks on edge cases |
| **L** | Logic Score | LLM-based senior code review, anchored by test results | Subtle logic bugs, missing edge cases, off-by-one errors |

### Penalty Multipliers

| Penalty | When It Applies | Effect |
|---------|----------------|--------|
| **Red Agent (security)** | Vulnerabilities found in code | Critical = ×0.70, High = ×0.80, Medium = ×0.90 |
| **Intent mismatch** | Code doesn't match the task at all | Up to ×0.30 if similarity ≈ 0 (e.g., AI returns factorial when asked for LRU cache) |

### Why Ground-Truth Scoring Matters

Most LLM-as-judge benchmarks have a problem: ask the same LLM to score the same code twice, and you might get different numbers. LogoMesh fixes this:

1. **T score comes from actual test results** — not LLM opinion. If 4 out of 5 tests pass, T = 0.72. Always.
2. **A score comes from real constraint checks** — AST analysis, not vibes. If the code uses a banned import, A drops. Period.
3. **LLM can only adjust ±0.10** — the ground-truth score is the anchor. The LLM provides nuance, not the baseline.
4. **Fixed seed (42) and temperature 0** — deterministic LLM calls for the judge.
5. **Each signal penalizes exactly once** — no double-counting. Test failures only affect T. Vulnerabilities only affect the red penalty multiplier.

---

## Sample Output

Here's what a real evaluation looks like (task-004: Recursive Fibonacci):

```
============================================================
BATTLE EVALUATION COMPLETE: demo-001
============================================================
Contextual Debt Score: 0.75
------------------------------------------------------------
Score Breakdown:
  R (Rationale):     0.72  — explanation aligns well with task
  A (Architecture):  0.81  — no constraint violations, 0 vulnerabilities
  T (Testing):       0.85  — 5/5 tests passed in sandbox
  L (Logic):         0.70  — handles base cases, but missing memoization edge case

Red Agent Report: No vulnerabilities found (3 attack steps, 2.1s)
Sandbox: 5 passed, 0 failed (pytest, 0.8s)
============================================================
```

### Baseline Results Across All 20 Tasks

Using our reference Purple Agent (gpt-4o-mini) against the Green Agent benchmark:

| Task | Description | CIS Score |
|------|-------------|-----------|
| task-001 | Email Validator | 0.66 |
| task-002 | Rate Limiter | 0.53 |
| task-003 | LRU Cache | 0.70 |
| task-004 | Recursive Fibonacci | 0.75 |
| task-005 | JWT Parser | 0.51 |
| task-006 | Thread-Safe Connection Pool | 0.55 |
| task-007 | Event-Driven State Machine | 0.55 |
| task-008 | Binary Merkle Tree | 0.66 |
| task-009 | Blockchain | 0.60 |
| task-010 | HD Wallet | 0.55 |
| task-011 | ECDSA Signatures | 0.68 |
| task-012 | ERC-20 Token | 0.49 |
| task-013 | REST API Router | 0.00 |
| task-014 | SQL Query Builder | 0.46 |
| task-015 | Event Sourcing | 0.49 |
| task-016 | Distributed Task Queue | 0.53 |
| task-017 | Raft Consensus | 0.62 |
| task-018 | B-Tree Index | 0.50 |
| task-019 | Consistent Hashing | 0.48 |
| task-020 | MVCC Transactions | 0.62 |
| | **Average** | **0.55** |

Scores range from 0.00 (task-013 where the Purple Agent failed to produce valid code) to 0.75 (task-004, a well-understood recursive algorithm). Expert-level tasks consistently score lower, reflecting the genuine difficulty gap.

---

## Reproducibility

LogoMesh is designed for consistent, reproducible scoring. Here's how:

### Deterministic by Design

| Mechanism | What It Does |
|-----------|--------------|
| `seed=42` on all LLM judge calls | Same prompt → same completion |
| `temperature=0` for scoring and logic review | No randomness in evaluation |
| Ground-truth anchoring (test pass rates, constraint checks) | Score is derived from facts, not opinions |
| LLM adjustment cap of ±0.10 | LLM can refine but can't override ground truth |
| Single source of truth per signal | Test failures only penalize T, not T + L + CIS |

### Running Reproducibility Checks

```bash
# Run the same task 3 times with identical configuration:
for i in 1 2 3; do
  curl -s -X POST http://localhost:9009/actions/send_coding_task \
    -H "Content-Type: application/json" \
    -d "{
      \"battle_id\": \"repro-$i\",
      \"purple_agent_url\": \"http://localhost:9010/\",
      \"task_id\": \"task-004\"
    }" | python3 -c "
import sys, json
d = json.load(sys.stdin)
s = d.get('evaluation', {}).get('cis_score', 'N/A')
print(f'Run $i: CIS = {s}')
"
done
```

Expected run-to-run variance: **< 0.05** for the same task and Purple Agent. The main source of remaining variance is the Purple Agent's code generation (which uses a non-zero temperature by default).

### Decision Bill of Materials (DBOM)

Every evaluation produces a DBOM — a JSON file containing:
- `h_delta`: SHA-256 hash of the evaluation decision
- `v_intent`: 384-dimensional intent vector of the task description
- `score_cis`: the final score
- `sigma_judge`: cryptographic signature tying the score to the battle

DBOMs are stored in `data/dboms/` and provide a tamper-evident audit trail of all evaluations.

---

## Task Library

Green Agent ships with **20 curated coding tasks** spanning 4 difficulty tiers:

### Beginner (Tasks 1-4)
| ID | Task | What We're Testing |
|----|------|--------------------|
| task-001 | Email Validator | Regex correctness, no network calls allowed |
| task-002 | Rate Limiter | Sliding window, 10 req/min enforcement |
| task-003 | LRU Cache | O(1) get/put, proper eviction |
| task-004 | Recursive Fibonacci | Must use recursion (no loops), memoization |

### Intermediate (Tasks 5-8)
| ID | Task | What We're Testing |
|----|------|--------------------|
| task-005 | JWT Parser | HMAC-SHA256 signature validation |
| task-006 | Thread-Safe Connection Pool | Proper locking, no race conditions |
| task-007 | Event-Driven State Machine | Order flow transitions, invalid state rejection |
| task-008 | Binary Merkle Tree | Inclusion proofs, hash tree construction |

### Advanced (Tasks 9-12)
| ID | Task | What We're Testing |
|----|------|--------------------|
| task-009 | Blockchain | Proof-of-work mining, chain validation |
| task-010 | HD Wallet | BIP-32 key derivation |
| task-011 | ECDSA Signatures | Elliptic curve math, signature verification |
| task-012 | ERC-20 Token | Full token logic, authorization checks |

### Expert (Tasks 13-20)
| ID | Task | What We're Testing |
|----|------|--------------------|
| task-013 | REST API Router | Middleware chain, route matching |
| task-014 | SQL Query Builder | Parameterized queries (no SQL injection!) |
| task-015 | Event Sourcing | CQRS pattern, event replay |
| task-016 | Distributed Task Queue | Priority scheduling, retry logic |
| task-017 | Raft Consensus | Leader election, log replication |
| task-018 | B-Tree Index | Node splitting, balancing operations |
| task-019 | Consistent Hashing | Virtual nodes, load distribution |
| task-020 | MVCC Transactions | Snapshot isolation, conflict detection |

### Novel Task Support

LogoMesh isn't limited to these 20 tasks. Submit **any** `task_id` with a custom `task_description`, and the system dynamically generates:
- Attack strategies for the Red Agent
- Architecture constraints for scoring
- High-value patterns for vulnerability search

This is powered by a **Task Intelligence** module that uses LLM analysis to understand novel tasks on the fly.

---

## Architecture Deep Dive

### Component Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Green Agent (Judge)                             │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │  Task Sender │  │   Scorer     │  │  Static Analyzer (AST)       │  │
│  └──────────────┘  │  (CIS Score) │  │  Banned imports, required    │  │
│                    │  Ground-truth│  │  patterns, complexity        │  │
│                    └──────────────┘  └──────────────────────────────┘  │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │   Sandbox    │  │  Test Gen    │  │  Refinement Loop             │  │
│  │  Docker exec │  │  Adversarial │  │  Sends feedback to Purple    │  │
│  │  pytest run  │  │  fuzz + LLM  │  │  for self-correction         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘  │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │  Battle      │  │  Strategy    │  │  Task Intelligence           │  │
│  │  Memory      │  │  Evolver     │  │  Novel task understanding    │  │
│  │  (SQLite)    │  │  (UCB1)      │  │  via LLM analysis            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Embedded Red Agent (MCTS Attacker)                  │  │
│  │                                                                  │  │
│  │  Orchestrator    → MCTS tree search for attack strategies        │  │
│  │  Reasoning       → LLM-powered vulnerability analysis            │  │
│  │  ConstraintBreak → Task-specific constraint violation scanner    │  │
│  │  SemanticAnalyze → Deep code understanding                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼  (A2A protocol — JSON-RPC)
┌─────────────────────┐
│   Purple Agent      │
│   (Code Generator)  │
└─────────────────────┘
```

### Key Design Decisions

**Why is the Red Agent embedded inside Green?**
In earlier versions, Red was a separate service. We embedded it because: (1) it eliminates a network hop, reducing latency, (2) Green can dynamically configure Red's aggressiveness based on task complexity, and (3) it simplifies deployment to a single container.

**Why MCTS for the Red Agent?**
Monte Carlo Tree Search lets the attacker explore multiple attack strategies in parallel, then focus on the most promising ones. For complex code (MVCC, blockchain), this finds vulnerabilities that linear scanning misses. For simple code (hello world, calculator), MCTS is automatically disabled to save compute.

**Why ground-truth scoring instead of pure LLM judging?**
We tested pure LLM scoring and found ±0.15 variance between identical runs. By anchoring to real signals (did the tests pass? how many vulnerabilities?), we reduced variance to < 0.05 while keeping the LLM's ability to catch nuanced issues.

**Why a refinement loop?**
If the AI produces buggy code, a good benchmark should give it a chance to fix it — just like a real code review. The refinement loop sends specific feedback ("TypeError on line 12: NoneType has no attribute 'get'") and re-evaluates. This measures not just initial quality but the AI's ability to iterate.

**Why intent-code mismatch detection?**
We discovered that Purple agents sometimes hallucinate completely unrelated code (e.g., returning a factorial function when asked for an LRU cache). Without mismatch detection, this code could score 0.60+ because it's valid code that passes its own tests. The cosine similarity check between task description and source code catches this and forces a rewrite.

### Self-Improving Features

**Battle Memory** (SQLite, `data/battles.db`): Stores every evaluation. When the same task runs again, the system uses past results to generate better tests and more targeted attacks.

**Strategy Evolver** (UCB1 bandit): The system maintains multiple evaluation strategies (aggressive security, correctness-focused, deep refinement, etc.) and uses multi-armed bandit selection to converge on the best strategy for each task type.

**Task Intelligence**: For novel tasks not in the hardcoded set of 20, an LLM dynamically generates attack hints, scoring constraints, and MCTS search patterns. This means the benchmark can evaluate any coding task, not just the curated ones.

---

## For Purple Agent Developers

If you're building a Purple Agent to test against LogoMesh, here's what you need to know.

### Communication Protocol

Your agent must implement the A2A (Agent-to-Agent) JSON-RPC protocol. Green sends:

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "messageId": "task-004-battle-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "Implement a recursive Fibonacci..."}]
    }
  },
  "id": "battle-001"
}
```

### Required Response Format

Your agent must return valid JSON with three fields:

```json
{
  "sourceCode": "def fibonacci(n, memo={}):\n    if n <= 1: return n\n    ...",
  "testCode": "def test_fibonacci():\n    assert fibonacci(10) == 55\n    ...",
  "rationale": "I used memoized recursion because the task requires recursion without loops..."
}
```

| Field | What It Is | How It's Scored |
|-------|------------|-----------------|
| `sourceCode` | Your implementation | Tested in sandbox, scanned for vulnerabilities, checked for constraint compliance |
| `testCode` | Your unit tests | Executed in sandbox alongside adversarial tests we generate |
| `rationale` | Why you wrote it this way | Compared to task description via cosine similarity |

### Tips for Higher Scores

1. **Actually solve the task** — if your code doesn't match the task description, intent mismatch detection will crush your score to ~0.20
2. **Handle edge cases** — we generate adversarial tests: None inputs, empty strings, negative numbers, overflow values
3. **Follow constraints** — if the task says "no loops," don't use loops. AST analysis catches this.
4. **Write real tests** — `assert True` won't help. We run your tests in the sandbox and the pass rate directly determines 25% of your score.
5. **Explain your reasoning** — a detailed rationale that references the task requirements scores higher than "I wrote a function."

### Running Your Agent

```bash
# Built-in Purple Agent (uses OpenAI)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

# Or Docker
docker build -t my-purple -f Dockerfile.purple .
docker run -p 9010:9010 -e OPENAI_API_KEY=$OPENAI_API_KEY my-purple
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | What It Does |
|----------|----------|---------|--------------|
| `OPENAI_API_KEY` | **Yes** | — | API key for LLM calls (scoring, test gen, Red Agent reasoning) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Which model to use for all LLM calls |
| `OPENAI_BASE_URL` | No | OpenAI default | Custom endpoint (Azure, local models, etc.) |
| `HOST` | No | `0.0.0.0` | Server bind address |
| `PORT` | No | `9009` | Server port |
| `SANDBOX_TIMEOUT` | No | `15` | Seconds before sandbox kills the test run |
| `RED_AGENT_MCTS` | No | `true` | Enable MCTS-based attack exploration |
| `RED_AGENT_MAX_STEPS` | No | `5` | How many attack steps Red Agent takes |
| `RED_AGENT_TIMEOUT` | No | `20` | Seconds before Red Agent stops attacking |
| `ENABLE_REFINEMENT` | No | `true` | Let Purple retry after feedback |
| `ENABLE_SCIENTIFIC_METHOD` | No | `true` | Use LLM-powered feedback (vs. fast error-only feedback) |
| `MAX_REFINEMENT_ITERATIONS` | No | `2` | How many retry rounds |
| `LLM_TEMPERATURE` | No | per-call | Override temperature for all LLM calls. Set to `skip` to use model defaults |

### Resource Usage

- **LLM API calls per evaluation**: 5-12 (depending on task complexity and whether refinement triggers)
- **Docker sandbox**: 1 container per evaluation, destroyed after use. 15s timeout.
- **Memory**: ~500MB for the Green Agent process (mostly the sentence-transformer embedding model)
- **Storage**: ~1KB per DBOM, ~10KB per battle in SQLite

---

## Project Structure

```
LogoMesh/
├── main.py                              # Entry point: --role GREEN/PURPLE/RED
│
├── src/
│   ├── green_logic/                     # === GREEN AGENT (the benchmark) ===
│   │   ├── server.py                    # FastAPI server, orchestration, refinement loop
│   │   ├── scoring.py                   # CIS calculation — ground-truth scoring engine
│   │   ├── tasks.py                     # 20 curated task definitions
│   │   ├── sandbox.py                   # Docker sandbox for safe code execution
│   │   ├── analyzer.py                  # AST-based static analysis
│   │   ├── generator.py                 # Adversarial test generation (fuzz + LLM)
│   │   ├── refinement_loop.py           # Iterative feedback loop
│   │   ├── compare_vectors.py           # Cosine similarity (sentence-transformers)
│   │   ├── red_report_types.py          # Vulnerability report data model
│   │   └── red_report_parser.py         # Parse Red Agent output
│   │
│   ├── red_logic/                       # === RED AGENT (embedded attacker) ===
│   │   ├── orchestrator.py              # MCTS-based attack tree exploration
│   │   ├── reasoning.py                 # LLM-powered vulnerability reasoning
│   │   ├── semantic_analyzer.py         # Deep semantic code analysis
│   │   ├── executor.py                  # Attack execution engine
│   │   └── dependency_analyzer.py       # Import/dependency chain analysis
│   │
│   ├── purple_logic/                    # === PURPLE AGENT (baseline AI) ===
│   │   └── agent.py                     # A2A-compatible code generator
│   │
│   ├── memory.py                        # Battle Memory — persistent learning (SQLite)
│   ├── strategy_evolver.py              # UCB1 bandit for strategy selection
│   ├── task_intelligence.py             # Dynamic novel task understanding
│   └── llm_utils.py                     # Temperature management utilities
│
├── data/
│   ├── battles.db                       # Evaluation history database
│   └── dboms/                           # Decision Bill of Materials (JSON audit trail)
│
├── Dockerfile                           # Base polyglot image
├── Dockerfile.green                     # Green Agent container
├── Dockerfile.purple                    # Purple Agent container
├── Dockerfile.sandbox                   # Isolated code execution environment
├── docker-compose.agents.yml            # Run Green + Purple together
│
├── pyproject.toml                       # Python dependencies (uv)
├── .env.example                         # All configurable environment variables
└── docs/                                # Extended documentation
    ├── 05-Competition/Judges-Start-Here.md  # Start here for detailed judge walkthrough
    └── 03-Research/Theory/              # Research papers on Contextual Debt
```

---

## Research Background

LogoMesh is built on the concept of **Contextual Debt** — a measure of how well AI-generated code maintains alignment with original intent through the development lifecycle. Just as "technical debt" describes code that works but is hard to maintain, "contextual debt" describes code that compiles but doesn't faithfully implement what was asked.

### Key Concepts

- **Contextual Integrity Score (CIS)** — Quantifies alignment across rationale, architecture, testing, and logic
- **Decision Bill of Materials (DBOM)** — Cryptographic audit trail for every evaluation decision
- **Adversarial Evaluation** — MCTS-powered Red Agent that stress-tests code for real vulnerabilities
- **Ground-Truth Scoring** — Scores anchored to observable facts (test pass rates, constraint violations) rather than LLM opinion
- **Strategy Evolution** — UCB1 bandit converges on optimal evaluation strategies over time
- **Battle Memory** — Persistent learning from past evaluations improves future scoring accuracy

See `docs/03-Research/Theory/` for detailed research papers.

---

## License

MIT

---

## Links

- [AgentBeats Platform](https://agentbeats.dev)
- [A2A Protocol](https://github.com/google/A2A)
