# LogoMesh — Multi-Agent Evaluation Arena for AI Code Quality

**A ground-truth-driven benchmark for evaluating AI coding agents through adversarial multi-agent evaluation.**

LogoMesh pits AI agents against each other in a structured arena where a **Green Agent** (judge) evaluates **Purple Agents** (code generators) while an embedded **Red Agent** (attacker) stress-tests the generated code for vulnerabilities. The system measures **Contextual Integrity** — how well an agent understands, implements, and secures coding tasks.

Built for the [Berkeley RDI AgentBeats](https://agentbeats.dev) Phase 1 competition.

---

## Abstract

LogoMesh is a multi-agent benchmark that evaluates AI coding agents across four orthogonal dimensions: **Rationale Integrity** (does the agent understand the task?), **Architectural Integrity** (is the code secure and well-structured?), **Testing Integrity** (do tests actually validate correctness?), and **Logic Score** (does the code work?). Unlike static benchmarks, LogoMesh uses an adversarial Red Agent with Monte Carlo Tree Search (MCTS) to discover vulnerabilities, a Docker sandbox for ground-truth test execution, and a self-improving strategy evolution system that adapts evaluation rigor based on past performance. The benchmark covers 20 tasks from basic data structures to distributed systems (Raft consensus, MVCC transactions, blockchain), and dynamically generates evaluation criteria for novel tasks via LLM-powered Task Intelligence.

---

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Running with Docker](#running-with-docker)
- [How Scoring Works](#how-scoring-works)
- [Task Library](#task-library)
- [Reproducibility](#reproducibility)
- [For Purple Agent Developers](#for-purple-agent-developers)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Research Background](#research-background)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Green Agent (Judge)                           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Task Sender  │  │   Scorer     │  │  Static Analyzer (AST)    │  │
│  └──────────────┘  │  (CIS Score)  │  └────────────────────────────┘  │
│                     └──────────────┘                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │   Sandbox    │  │  Test Gen    │  │  Refinement Loop           │  │
│  │  (Docker)    │  │ (Adversarial)│  │  (Self-Correcting)         │  │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Battle      │  │  Strategy    │  │  Task Intelligence         │  │
│  │  Memory      │  │  Evolver     │  │  (Dynamic Novel Tasks)     │  │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │              Embedded Red Agent (MCTS Attacker)                │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────┐ │  │
│  │  │ Orchestrator│ │  Reasoning   │ │  Constraint Breaker     │ │  │
│  │  │ (MCTS tree) │ │  (LLM-based) │ │  (Vuln scanner)         │ │  │
│  │  └─────────────┘ └──────────────┘ └─────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Purple Agent      │
│   (Code Generator)  │
│                     │
│  - Receives task    │
│  - Generates code   │
│  - Writes tests     │
│  - Explains logic   │
└─────────────────────┘
```

### Key Design Decisions

- **Red Agent is embedded** inside Green — no separate service needed. It runs MCTS-based attack exploration with configurable branch count and depth.
- **Ground-truth scoring** — Architecture and Testing scores are derived from real signals (vulnerability count, sandbox test pass rate) rather than LLM judgment alone.
- **Self-improving** — Strategy Evolver uses UCB1 multi-armed bandit to select evaluation strategies based on past performance.
- **Intent-code mismatch detection** — If Purple returns code that doesn't match the task, cosine similarity detects it and forces refinement.

### Communication Protocol

All agents communicate via the **A2A (Agent-to-Agent) protocol** — JSON-RPC based:

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "messageId": "task-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "Your task..."}]
    }
  },
  "id": "battle-001"
}
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Docker (for sandbox execution and full arena)
- OpenAI API key (or compatible endpoint)

### Install

```bash
# Clone the repo
git clone https://github.com/sszz01/LogoMesh.git
cd LogoMesh

# Install Python dependencies
pip install uv
uv sync

# Set up environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Run Locally

```bash
# Terminal 1: Start Purple Agent (code generator)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

# Terminal 2: Start Green Agent (judge + embedded Red Agent)
uv run main.py --role GREEN --host 0.0.0.0 --port 9009

# Terminal 3: Send a task
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "test-001",
    "purple_agent_url": "http://localhost:9010/",
    "task_id": "task-004",
    "task_description": "Implement a recursive Fibonacci function with memoization."
  }'
```

The response includes the full evaluation: CIS score, component breakdown (R/A/T/L), Red Agent vulnerability report, sandbox test results, and a DBOM (Decision Bill of Materials).

---

## Running with Docker

### Build and Run Green Agent

```bash
# Build the Green Agent image
docker build -t logomesh-green:latest -f Dockerfile.green .

# Run Green Agent
docker run -p 9009:9009 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v /var/run/docker.sock:/var/run/docker.sock \
  logomesh-green:latest --host 0.0.0.0 --port 9009
```

### Build and Run Purple Agent

```bash
# Build the Purple Agent image
docker build -t logomesh-purple:latest -f Dockerfile.purple .

# Run Purple Agent
docker run -p 9010:9010 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  logomesh-purple:latest --host 0.0.0.0 --port 9010
```

### Docker Compose (Full Arena)

```bash
# Launch all agents
docker compose -f docker-compose.agents.yml up --build

# Run evaluations
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{"battle_id": "arena-001", "purple_agent_url": "http://purple:9010/", "task_id": "task-001"}'
```

### Docker Volume Mount

Mount `/var/run/docker.sock` to enable the Green Agent's sandbox to execute Purple's code in isolated Docker containers.

---

## How Scoring Works

Green Agent calculates a **Contextual Integrity Score (CIS)** between 0.0 and 1.0.

### Formula

```
CIS = (0.25 * R + 0.25 * A + 0.25 * T + 0.25 * L) * red_penalty * intent_penalty
```

### Components

| Component | Name | Signal Source | What It Measures |
|-----------|------|---------------|------------------|
| **R** | Rationale Integrity | Cosine similarity (task vs rationale) + length heuristic | Does the explanation match the task? |
| **A** | Architectural Integrity | Ground truth: constraint violations + vulnerability count | Is the code secure and well-structured? |
| **T** | Testing Integrity | Ground truth: sandbox test pass rate | Do tests actually pass? |
| **L** | Logic Score | LLM-based senior code review | Does the code handle edge cases correctly? |

### Penalty Multipliers

| Condition | Effect |
|-----------|--------|
| Red Agent finds vulnerabilities | CIS multiplied by (1 - severity_penalty). Critical = -30%, High = -20%, Medium = -10% |
| Intent-code mismatch | CIS multiplied by 0.30-1.0 based on cosine similarity between task description and source code |

### Scoring Pipeline

```
1. Purple agent responds with {sourceCode, testCode, rationale}
2. Task complexity classified (simple / moderate / complex)
3. Red Agent runs MCTS-based vulnerability scan (disabled for simple tasks)
4. Green runs static analysis (AST constraints, banned imports)
5. Green generates adversarial tests + runs in Docker sandbox
6. Ground-truth scores computed:
   - R: cosine similarity (task description ↔ rationale) + length bonus
   - A: 0.80 base - constraint violations (vulns handled separately)
   - T: directly from sandbox pass rate (100% → 0.85, 0% → 0.20)
   - L: LLM code review with anchored scoring
7. LLM synthesis adjusts scores by ±0.10 max
8. Apply Red Agent penalty multiplier and intent mismatch penalty
9. If score < threshold, refinement loop sends feedback to Purple for resubmission
10. DBOM (Decision Bill of Materials) generated with cryptographic hash
```

### Ground-Truth Design Philosophy

Traditional LLM-as-judge scoring suffers from inconsistency — the LLM might score identical code differently across runs. LogoMesh addresses this by:

- **Deriving scores from real signals**: T comes from actual test pass rates, not LLM opinion
- **Anchoring LLM adjustments**: The LLM can only adjust scores by ±0.10 from ground truth
- **Single source of truth**: Each signal penalizes exactly once (no double-penalization)
- **Deterministic parameters**: Fixed seed (42) and temperature 0 for LLM judge calls

---

## Task Library

Green Agent includes 20 coding tasks spanning beginner to expert difficulty:

### Beginner (Tasks 1-4)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-001 | Email Validator | Regex only, no network calls |
| task-002 | Rate Limiter | 10 requests/minute |
| task-003 | LRU Cache | O(1) operations |
| task-004 | Recursive Fibonacci | Must use recursion, no loops |

### Intermediate (Tasks 5-8)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-005 | JWT Parser | Validate HMAC-SHA256 signatures |
| task-006 | Thread-Safe Connection Pool | Proper locking |
| task-007 | Event-Driven State Machine | Order flow transitions |
| task-008 | Binary Merkle Tree | Inclusion proofs |

### Advanced (Tasks 9-12)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-009 | Blockchain | Proof-of-work mining |
| task-010 | HD Wallet | BIP-32 key derivation |
| task-011 | ECDSA Signatures | Elliptic curve math |
| task-012 | ERC-20 Token | Full token logic |

### Expert (Tasks 13-20)
| ID | Task | Key Constraint |
|----|------|----------------|
| task-013 | REST API Router | Middleware chain |
| task-014 | SQL Query Builder | Parameterized queries |
| task-015 | Event Sourcing | CQRS pattern |
| task-016 | Distributed Task Queue | Priority + retry |
| task-017 | Raft Consensus | Leader election |
| task-018 | B-Tree Index | Balancing operations |
| task-019 | Consistent Hashing | Virtual nodes |
| task-020 | MVCC Transactions | Snapshot isolation |

### Novel Task Support

LogoMesh can evaluate **any task**, not just the 20 above. When an unknown `task_id` is submitted, the Task Intelligence module dynamically generates:
- Attack hints for the Red Agent
- Architecture constraints for scoring
- High-value patterns for MCTS exploration

---

## Reproducibility

LogoMesh is designed for consistent, reproducible scoring:

### Deterministic Settings
- **LLM temperature**: 0 for all scoring and logic review calls (fixed via `get_temperature_kwargs(0)`)
- **Fixed seed**: `seed=42` on all LLM judge calls
- **Ground-truth anchoring**: Scores derived from sandbox test pass rates and constraint violations, not LLM opinion alone
- **LLM adjustment cap**: ±0.10 from ground-truth baselines

### Variance Mitigation
- Task complexity classifier routes simple tasks through a lightweight pipeline (no MCTS, fewer steps)
- Strategy Evolver converges on stable strategies via UCB1 multi-armed bandit
- Battle Memory stores past evaluation results for consistency across runs

### Running Reproducibility Tests

```bash
# Run the same task 3 times and compare scores
for i in 1 2 3; do
  curl -s -X POST http://localhost:9009/actions/send_coding_task \
    -H "Content-Type: application/json" \
    -d "{
      \"battle_id\": \"repro-$i\",
      \"purple_agent_url\": \"http://localhost:9010/\",
      \"task_id\": \"task-004\"
    }" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Run $i: CIS={d[\"evaluation\"][\"cis_score\"]:.4f}')"
done
```

Expected variance: < 0.05 between runs for the same task and Purple Agent.

---

## For Purple Agent Developers

### Required Response Format

Your Purple Agent must return valid JSON with three fields:

```json
{
  "sourceCode": "def solution(): ...",
  "testCode": "def test_solution(): assert ...",
  "rationale": "I implemented it this way because..."
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `sourceCode` | Yes | Your implementation code |
| `testCode` | Yes | Unit tests (pytest format preferred) |
| `rationale` | Yes | Explanation of your approach and design decisions |

### Tips for High Scores

1. **Match the task** — Code that doesn't match the task description gets penalized heavily via intent-code mismatch detection
2. **Handle edge cases** — Empty inputs, None values, negative numbers, overflow conditions
3. **Follow constraints** — Some tasks ban certain imports or require specific patterns (e.g., recursion)
4. **Write meaningful tests** — Test pass rate directly drives 25% of the score
5. **Explain your reasoning** — The rationale is scored for semantic alignment with the task

### Running Your Purple Agent

```bash
# Option 1: Use the built-in Purple Agent
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

# Option 2: Use Docker
docker build -t my-purple:latest -f Dockerfile.purple .
docker run -p 9010:9010 -e OPENAI_API_KEY=$OPENAI_API_KEY my-purple:latest
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Model for LLM calls (scoring, logic review, test generation) |
| `OPENAI_BASE_URL` | No | OpenAI default | Custom API endpoint (for local LLMs or Azure) |
| `HOST` | No | `0.0.0.0` | Server bind address |
| `PORT` | No | `9009` | Server port |
| `SANDBOX_TIMEOUT` | No | `15` | Docker sandbox timeout in seconds |
| `RED_AGENT_MCTS` | No | `true` | Enable/disable MCTS for Red Agent |
| `RED_AGENT_MAX_STEPS` | No | `5` | Max Red Agent attack steps |
| `RED_AGENT_TIMEOUT` | No | `20` | Red Agent timeout in seconds |
| `ENABLE_REFINEMENT` | No | `true` | Enable iterative refinement loop |
| `ENABLE_SCIENTIFIC_METHOD` | No | `true` | Enable LLM-based scientific refinement feedback |
| `MAX_REFINEMENT_ITERATIONS` | No | `2` | Max refinement loop iterations |
| `LLM_TEMPERATURE` | No | — | Override LLM temperature (`skip` to use model defaults) |

---

## Project Structure

```
LogoMesh/
├── main.py                              # Entry point (--role GREEN/PURPLE/RED)
│
├── src/
│   ├── green_logic/                     # Green Agent (Judge)
│   │   ├── server.py                    # FastAPI endpoints, orchestration, refinement loop
│   │   ├── scoring.py                   # CIS calculation (ground-truth driven)
│   │   ├── tasks.py                     # 20 task definitions
│   │   ├── sandbox.py                   # Docker-based code execution
│   │   ├── analyzer.py                  # Static analysis (AST constraints)
│   │   ├── generator.py                 # Adversarial test generation
│   │   ├── refinement_loop.py           # Self-correcting feedback loop
│   │   ├── compare_vectors.py           # Semantic similarity (sentence-transformers)
│   │   ├── red_report_types.py          # Red Agent report data structures
│   │   └── red_report_parser.py         # Parse Red Agent vulnerability reports
│   │
│   ├── red_logic/                       # Red Agent (Embedded Attacker)
│   │   ├── orchestrator.py              # MCTS-based attack orchestration
│   │   ├── reasoning.py                 # LLM-powered vulnerability reasoning
│   │   ├── semantic_analyzer.py         # Semantic code analysis
│   │   ├── executor.py                  # Attack execution
│   │   └── dependency_analyzer.py       # Dependency chain analysis
│   │
│   ├── purple_logic/                    # Purple Agent wrapper
│   │   └── agent.py                     # A2A server for Purple
│   │
│   ├── memory.py                        # Battle Memory (persistent learning)
│   ├── strategy_evolver.py              # UCB1 multi-armed bandit strategy selection
│   ├── task_intelligence.py             # Dynamic novel task understanding (LLM-powered)
│   └── llm_utils.py                     # LLM temperature management
│
├── data/
│   ├── battles.db                       # SQLite database (evaluation history)
│   └── dboms/                           # Decision Bill of Materials (JSON)
│
├── scenarios/                           # Scenario configurations
│   └── security_arena/
│       └── agents/generic_defender.py   # Reference Purple Agent
│
├── Dockerfile                           # Base polyglot image
├── Dockerfile.green                     # Green Agent standalone
├── Dockerfile.purple                    # Purple Agent standalone
├── Dockerfile.sandbox                   # Sandbox execution environment
│
├── pyproject.toml                       # Python dependencies (uv)
├── .env.example                         # Environment template
└── .github/workflows/ci.yml            # CI pipeline
```

---

## Research Background

LogoMesh is built on the concept of **Contextual Debt** — a measure of how well AI-generated code maintains alignment with original intent through the development lifecycle.

### Key Concepts

- **Contextual Integrity Score (CIS)** — Quantifies alignment across rationale, architecture, testing, and logic dimensions
- **Decision Bill of Materials (DBOM)** — Cryptographic proof of evaluation decisions, including intent vectors and score hashes
- **Adversarial Evaluation** — MCTS-powered Red Agent stress-tests code for vulnerabilities
- **Ground-Truth Scoring** — Scores anchored to real signals (test pass rates, constraint violations) rather than LLM opinion alone
- **Strategy Evolution** — UCB1 bandit selects evaluation strategies based on cumulative performance data
- **Battle Memory** — Persistent learning from past evaluations informs future scoring and attack strategies

### Papers

See `docs/03-Research/Theory/` for research papers on Contextual Debt.

---

## License

MIT

---

## Links

- [AgentBeats Platform](https://agentbeats.dev)
- [A2A Protocol](https://github.com/google/A2A)
