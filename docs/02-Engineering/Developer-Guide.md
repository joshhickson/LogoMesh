---
status: ACTIVE
type: Guide
---
> **Context:**
> *   2026-02-17: Comprehensive developer onboarding guide for the LogoMesh codebase

# LogoMesh Developer Guide

## 1. What Is LogoMesh?

LogoMesh is a multi-agent AI code evaluation platform. It answers: **"When an AI writes code, how good is it really?"**

Instead of asking an LLM to rate code (subjective, high-variance), LogoMesh:
1. Runs the code in a Docker sandbox
2. Attacks it with an adversarial Red Agent
3. Measures rationale quality via embeddings
4. Checks architectural constraints via AST analysis
5. Produces a single **Contextual Integrity Score (CIS)** from 0.0 to 1.0

The LLM can only adjust scores **±0.10** from ground-truth anchors. Run-to-run variance is < 0.05.

---

## 2. Quick Start

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Docker (for sandbox execution)
- An OpenAI API key

### Setup

```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh
git checkout feat/agi-agents   # <-- active branch, master is stale

pip install uv
uv sync

cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Run the Agents

```bash
# Terminal 1: Start Purple Agent (the AI being tested)
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010

# Terminal 2: Start Green Agent (the judge)
uv run main.py --role GREEN --host 0.0.0.0 --port 9009
```

Or use Docker Compose:
```bash
docker compose -f docker-compose.agents.yml up --build
```

### Trigger an Evaluation

```bash
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-004"}'
```

This sends the Fibonacci task to Purple, runs Red Agent attacks, executes tests in the sandbox, and returns a CIS score.

---

## 3. Architecture Overview

```
                          A2A JSON-RPC
AgentBeats Platform ──────────────────> Green Agent (FastAPI, :9009)
                                              │
                              ┌───────────────┼────────────────────┐
                              │               │                    │
                              ▼               ▼                    ▼
                        Purple Agent    Embedded Red         Docker Sandbox
                        (Code Gen)      Agent (MCTS)         (pytest runner)
                        :9010                                logomesh-sandbox
```

### The Three Agents

| Agent | What It Does | Where It Lives |
|-------|-------------|----------------|
| **Green** | Orchestrates evaluation. Sends tasks to Purple, runs Red Agent, executes tests in Docker, computes CIS score. This is the benchmark. | `src/green_logic/` |
| **Purple** | The AI under test. Receives a coding task, returns source code + tests + rationale. | `src/purple_logic/` |
| **Red** | Adversarial attacker. Hunts for security vulnerabilities using MCTS. Embedded inside Green. | `src/red_logic/` |

### The 5-Step Evaluation Pipeline

When Green receives a task:

```
1. SEND TASK         → Purple Agent via A2A JSON-RPC
2. CLASSIFY          → AST-based complexity: simple / moderate / complex
3. ATTACK            → Red Agent: MCTS for complex tasks, static analysis for simple
4. EXECUTE TESTS     → Docker sandbox: pytest with 128MB RAM, no network, 15s timeout
5. SCORE             → CIS = (0.25×R + 0.25×A + 0.25×T + 0.25×L) × penalties
   └─ REFINE (optional) → Send feedback to Purple, re-evaluate (up to 2 iterations)
```

---

## 4. Project Structure

```
LogoMesh/
├── main.py                          # Entry point: --role GREEN/PURPLE/RED
│
├── src/
│   ├── green_logic/                 # === GREEN AGENT (the judge) ===
│   │   ├── server.py                # FastAPI app, A2A routes, pipeline orchestration
│   │   ├── scoring.py               # CIS computation engine (R, A, T, L scores)
│   │   ├── tasks.py                 # 20 coding task definitions
│   │   ├── sandbox.py               # Docker sandbox for test execution
│   │   ├── analyzer.py              # AST-based static analysis (SemanticAuditor)
│   │   ├── generator.py             # Adversarial test generation (LLM + fuzzer)
│   │   ├── refinement_loop.py       # Iterative improvement with Scientific Method
│   │   ├── compare_vectors.py       # Cosine similarity via sentence-transformers
│   │   ├── agent.py                 # DBOM generation + SQLite persistence
│   │   ├── red_report_types.py      # Severity enum + Vulnerability dataclass
│   │   ├── harmony_parser.py        # Compat layer for gpt-oss Harmony protocol
│   │   └── architecture_constraints.yaml  # Per-task forbidden/required patterns
│   │
│   ├── red_logic/                   # === RED AGENT (adversarial attacker) ===
│   │   ├── orchestrator.py          # MCTS attack engine (MCTSPlanner, DynamicToolBuilder)
│   │   ├── reasoning.py             # LLM-powered vulnerability reasoning
│   │   ├── semantic_analyzer.py     # Deep code analysis (AGICodeAnalyzer)
│   │   ├── dependency_analyzer.py   # Taint-tracking import chain analysis
│   │   ├── executor.py              # A2A SDK wrapper for standalone Red Agent
│   │   ├── agent.py                 # Standalone Red Agent server
│   │   └── workers/
│   │       ├── static_mirror.py     # Mirrors Green's SemanticAuditor (8 checks)
│   │       ├── constraint_breaker.py # Task-specific constraint violations (22 rules)
│   │       └── base.py              # BaseWorker ABC + WorkerResult dataclass
│   │
│   ├── purple_logic/                # === PURPLE AGENT (AI code generator) ===
│   │   └── agent.py                 # Thin wrapper → GenericDefenderExecutor
│   │
│   ├── agentbeats/                  # === FRAMEWORK UTILITIES ===
│   │   ├── client.py                # A2A client (send_message via httpx)
│   │   ├── client_cli.py            # TOML-driven CLI for running evaluations
│   │   ├── run_scenario.py          # Multi-process scenario runner
│   │   ├── green_executor.py        # GreenAgent abstract base + A2A executor
│   │   ├── tool_provider.py         # Stateful agent communication
│   │   ├── models.py                # EvalRequest / EvalResult Pydantic models
│   │   └── cloudflare.py            # Cloudflare tunnel exposure
│   │
│   ├── memory.py                    # Battle Memory (SQLite, cross-run learning)
│   ├── strategy_evolver.py          # UCB1 multi-armed bandit strategy selection
│   ├── task_intelligence.py         # Dynamic task understanding (3-tier hierarchy)
│   └── llm_utils.py                 # Temperature/model config helpers
│
├── scenarios/                       # TOML-defined evaluation scenarios
│   ├── security_arena/              # Primary: coding task evaluation + security
│   └── debate/                      # Alternative: debate format
│
├── packages/                        # TypeScript (legacy, unused by Python pipeline)
│   ├── contracts/                   # Type definitions (A2A, entities)
│   ├── server/                      # Express.js prototype
│   ├── core/, mock-agent/, workers/ # Support packages
│   └── frontend/                    # Empty placeholder
│
├── data/                            # Runtime data (gitignored except baselines)
│   ├── battles.db                   # SQLite: evaluation history + memory
│   ├── dboms/                       # Decision Bill of Materials (JSON audit trail)
│   └── runs/                        # Raw run outputs
│
├── tests/                           # Test files
│   ├── mock_purple.py               # Mock Purple with 4 canned responses
│   ├── test_leaderboard_query.py    # Leaderboard SQL tests
│   └── verify_persistence.py        # DB persistence check
│
├── scripts/                         # Automation scripts (bash, python, js)
├── config/                          # Campaign configuration
├── docs/                            # Documentation
│
├── Dockerfile                       # Base polyglot image (Node 20 + Python 3)
├── Dockerfile.green                 # Green Agent container
├── Dockerfile.purple                # Purple Agent container
├── Dockerfile.sandbox               # Isolated test execution container
├── Dockerfile.gpu                   # GPU variant (Lambda Labs H100)
├── docker-compose.agents.yml        # Green + Purple orchestration
│
├── pyproject.toml                   # Python deps (uv)
├── package.json                     # Node monorepo (pnpm + turbo, legacy)
├── .env.example                     # All env vars documented
└── leaderboard.json                 # AgentBeats leaderboard SQL queries
```

---

## 5. Key Source Files — What To Read First

Read these files in order to build a mental model of the system:

### Week 1: The Pipeline

1. **`main.py`** (~185 lines) — Entry point. See how `--role` dispatches to each agent.

2. **`src/green_logic/server.py`** (~1,093 lines) — The heart of the system. Start with:
   - `send_coding_task_action()` — the full 5-step evaluation pipeline
   - `stream_purple_response()` — how Green calls Purple via A2A
   - `classify_task_complexity()` — AST-based complexity classifier

3. **`src/green_logic/tasks.py`** (~31KB) — The 20 coding tasks. Read a few to understand what Purple receives.

### Week 2: The Scoring Engine

4. **`src/green_logic/scoring.py`** (~672 lines) — CIS computation. Focus on:
   - `evaluate()` — computes R, A, T, L and applies penalties
   - `_perform_logic_review()` — the LLM judge call (seed=42, temp=0)
   - `_evaluate_architecture_constraints()` — YAML constraint checking

5. **`src/green_logic/sandbox.py`** (~320 lines) — Docker sandbox. Clean, self-contained.

6. **`src/green_logic/compare_vectors.py`** — Cosine similarity for rationale scoring.

### Week 3: The Red Agent

7. **`src/red_logic/orchestrator.py`** (~72KB) — MCTS attack engine. Complex but powerful:
   - `MCTSPlanner` — tree search with UCB1 branch selection
   - `DynamicToolBuilder` — creates attack tools at runtime
   - Understand the branching → valuation → selection → execution → backpropagation cycle

8. **`src/red_logic/workers/static_mirror.py`** — 8 static checks (forbidden imports, dangerous functions, SQL injection, tautologies, etc.)

9. **`src/red_logic/workers/constraint_breaker.py`** — 22 task-specific constraint rules.

### Week 4: Self-Improving Systems

10. **`src/memory.py`** (~23KB) — Battle Memory. How the system learns from past evaluations.

11. **`src/strategy_evolver.py`** (~15KB) — UCB1 bandit for strategy selection. 5 strategy variants.

12. **`src/task_intelligence.py`** (~16KB) — 3-tier task understanding: hardcoded → memory → LLM.

---

## 6. The CIS Scoring Formula

```
CIS = (0.25 × R + 0.25 × A + 0.25 × T + 0.25 × L) × red_penalty × intent_penalty
```

| Dimension | What It Measures | Ground Truth Signal |
|-----------|-----------------|---------------------|
| **R** (Rationale) | Does the AI explain its code? | Cosine similarity (all-MiniLM-L6-v2) between task description and rationale |
| **A** (Architecture) | Is code well-structured? | AST constraint violations from `architecture_constraints.yaml` |
| **T** (Testing) | Do tests pass? | Docker sandbox pytest pass rate: `0.20 + (0.65 × pass_rate)` |
| **L** (Logic) | Is the logic correct? | LLM senior code review (seed=42, temp=0), bounded ±0.10 |

**Penalties** (multiplicative on full CIS):

| Penalty | Trigger | Effect |
|---------|---------|--------|
| Critical vulnerability | Red Agent finds critical | ×0.60 |
| High vulnerability | Red Agent finds high | ×0.75 |
| Medium vulnerability | Red Agent finds medium | ×0.85 |
| Intent mismatch | `cosine(task, code) < 0.35` | Scales ×0.30 → ×1.0 |

### Design Invariants (Do Not Change Without Discussion)

- LLM adjustments are bounded to ±0.10 from ground truth
- All judge LLM calls use `seed=42, temperature=0` for determinism
- Each signal penalizes exactly once (no double-counting)
- Red Agent penalties are multiplicative on full CIS, not deducted from individual components

---

## 7. A2A Protocol

LogoMesh agents communicate via [Google's A2A (Agent-to-Agent)](https://a2a-protocol.org/) JSON-RPC protocol.

### Agent Discovery

Each agent serves a card at `GET /.well-known/agent-card.json`:
```json
{
  "name": "LogoMesh Green Agent",
  "description": "AI code evaluation benchmark",
  "url": "http://localhost:9009",
  "capabilities": { "streaming": true }
}
```

### Message Format

Green sends a task to Purple:
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "messageId": "task-004-battle-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "CODING TASK: Implement recursive Fibonacci..."}]
    }
  },
  "id": "battle-001"
}
```

Purple responds with structured JSON containing `sourceCode`, `testCode`, and `rationale`.

---

## 8. Environment Variables

All configurable via `.env` (see `.env.example`):

| Variable | Default | What It Controls |
|----------|---------|-----------------|
| `OPENAI_API_KEY` | *(required)* | LLM access for scoring, generation, Red Agent |
| `OPENAI_MODEL` | `gpt-4o-mini` | Which model to use |
| `OPENAI_BASE_URL` | *(empty)* | Custom endpoint (Azure, local models) |
| `SANDBOX_TIMEOUT` | `15` | Docker sandbox timeout in seconds |
| `RED_AGENT_MCTS` | `true` | Enable MCTS-based attacks |
| `RED_AGENT_MAX_STEPS` | `5` | MCTS exploration depth |
| `RED_AGENT_TIMEOUT` | `20` | Red Agent timeout in seconds |
| `ENABLE_REFINEMENT` | `true` | Enable refinement loop |
| `ENABLE_SCIENTIFIC_METHOD` | `true` | Hypothesis-based feedback in refinement |
| `MAX_REFINEMENT_ITERATIONS` | `2` | Max refinement rounds |
| `LLM_TEMPERATURE` | *(unset)* | Set to `skip` for models that reject the param |

---

## 9. Docker Setup

### Building the Sandbox Image

The sandbox must be built before Green can execute tests:

```bash
docker build -f Dockerfile.sandbox -t logomesh-sandbox:latest .
```

### How Sandbox Execution Works

1. Green Agent creates a Docker container from `logomesh-sandbox:latest`
2. Copies Purple's source code + tests into the container via `put_archive`
3. Runs `pytest` inside the container
4. Container has strict limits: 128MB RAM, 50% CPU, 50 processes, no network
5. Container is always cleaned up in a `finally` block

### Docker-in-Docker

Green Agent needs Docker socket access to spawn sandbox containers:
```yaml
# docker-compose.agents.yml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

---

## 10. Testing

### Running Red Agent Tests

```bash
# Static analysis tests (no API key needed)
uv run python src/red_logic/test_red_agent_v2.py

# With LLM reasoning layer (needs OPENAI_API_KEY)
uv run python src/red_logic/test_red_agent_v2.py --smart-layer
```

The 7 test cases cover: SQL injection, eval injection, forbidden imports, loop-in-Fibonacci, race conditions, ERC-20 tautology bypass, and simple tautologies.

### Using the Mock Purple Agent

For testing Green without a real LLM:

```bash
# Terminal 1: Start mock Purple (port 9002)
uv run python tests/mock_purple.py

# Terminal 2: Start Green pointing at mock
uv run main.py --role GREEN --host 0.0.0.0 --port 9009
```

The mock has 4 canned responses selectable by `battle_id` substring:
- `bad_loop` — loop-based Fibonacci (violates recursion constraint)
- `broken_logic` — returns `n+1` (wrong answer)
- `bad_rationale` — correct code, nonsense rationale
- *(default)* — memoized recursive Fibonacci (good code)

### Running TypeScript Tests

```bash
pnpm install
pnpm run test
```

Note: The TypeScript packages are legacy and not used by the Python pipeline.

---

## 11. Data Persistence

### SQLite Database (`data/battles.db`)

WAL mode enabled for crash-proof persistence. Tables:

| Table | Purpose |
|-------|---------|
| `battles` | All evaluation results (battle_id, score, breakdown, raw_result) |
| `memory_lessons` | Structured lessons from past evaluations |
| `memory_attack_hints` | Attack strategies that worked per task |
| `memory_task_stats` | Aggregate statistics per task |
| `strategy_outcomes` | UCB1 bandit history |

### DBOM Files (`data/dboms/`)

Each evaluation produces a Decision Bill of Materials:
```json
{
  "dbom_version": "1.0",
  "battle_id": "run1-task-004",
  "h_delta": "sha256-hash-of-result",
  "v_intent": [0.12, -0.34, ...],    // 384-dim embedding vector
  "score_cis": 0.75,
  "sigma_judge": "SIG_GREEN_run1-task-004_a1b2c3d4",
  "timestamp": "2026-01-30T15:42:00"
}
```

---

## 12. How To Contribute

### Branch Workflow

1. The active branch is **`feat/agi-agents`** (master is stale)
2. Create feature branches off `feat/agi-agents`
3. Follow the documentation protocol in `CLAUDE.md` if your changes affect architecture or deprecate anything
4. Update `docs/00_CURRENT_TRUTH_SOURCE.md` if your work changes core specs

### Adding a New Coding Task

1. Add the task definition to `src/green_logic/tasks.py`:
```python
{
    "id": "task-021",
    "title": "Your Task Name",
    "description": "Detailed prompt sent to Purple Agent...",
    "constraints": {"category": "complex"},
    "hidden_tests": "def test_edge_case(): ..."  # optional
}
```

2. Add architectural constraints to `src/green_logic/architecture_constraints.yaml`:
```yaml
task-021:
  no_unsafe_imports:
    description: "Must not use os or subprocess"
    forbidden_imports: ["os", "subprocess"]
    penalty: 0.80
```

3. Add attack hints to `src/red_logic/reasoning.py` (the `TASK_ATTACK_HINTS` dict).

4. Add constraint rules to `src/red_logic/workers/constraint_breaker.py` (the `TASK_CONSTRAINTS` list).

5. Add task inference pattern to `constraint_breaker.py` `_infer_task_id()`.

### Adding a New Red Agent Check

Static checks go in `src/red_logic/workers/`. To add a new check:

1. Add a method to `StaticMirrorWorker` in `static_mirror.py`:
```python
def _check_your_pattern(self, tree, code=None) -> list[Vulnerability]:
    vulnerabilities = []
    # ... AST walking or regex matching ...
    if found_issue:
        vulnerabilities.append(self._create_vulnerability(
            severity=Severity.HIGH,
            category="your_category",
            title="Descriptive Title",
            description="What's wrong and why",
            line_number=lineno
        ))
    return vulnerabilities
```

2. Call it from `analyze()`:
```python
vulnerabilities.extend(self._check_your_pattern(tree, code))
```

3. If the same check should appear in Green's `SemanticAuditor`, add it to `analyzer.py` too. The `StaticMirrorWorker` is designed to mirror `SemanticAuditor` exactly.

### Modifying the Scoring Pipeline

The scoring formula is in `src/green_logic/scoring.py` in the `evaluate()` method.

**Before changing anything:**
- The ±0.10 LLM bound, deterministic seeds, and no-double-counting invariants are intentional design decisions
- Red Agent penalties are multiplicative on full CIS (not deducted from components) to prevent double-penalization
- Discuss changes with the team before modifying weights or penalty values

### Adding a New Evaluation Strategy

Strategies are defined in `src/strategy_evolver.py`:

1. Add your strategy to the `STRATEGIES` dict:
```python
"your_strategy": {
    "scoring_emphasis": "testing",
    "mcts_aggressiveness": "moderate",
    "test_focus": "adversarial",
    "refinement_style": "targeted"
}
```

2. The UCB1 bandit will automatically explore it.

---

## 13. Common Tasks

### Run a Single Task Evaluation

```bash
curl -X POST http://localhost:9009/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-004"}'
```

### Run All 20 Tasks

```bash
for i in $(seq -w 1 20); do
  curl -X POST http://localhost:9009/actions/send_coding_task \
    -H "Content-Type: application/json" \
    -d "{\"task_id\": \"task-0$i\"}"
  sleep 5
done
```

### Run a Security Arena Scenario

```bash
uv run agentbeats-run scenarios/security_arena/scenario_debugdump.toml --show-logs
```

### Check Battle History

```bash
uv run python -c "
import sqlite3, json
conn = sqlite3.connect('data/battles.db')
for row in conn.execute('SELECT battle_id, score FROM battles ORDER BY rowid DESC LIMIT 10'):
    print(f'{row[0]}: CIS={row[1]:.2f}')
"
```

### Inspect a DBOM

```bash
cat data/dboms/dbom_run1-task-004.json | python -m json.tool
```

---

## 14. Debugging Tips

### Green Agent Won't Start

- Check that `OPENAI_API_KEY` is set in `.env`
- Check that `sentence-transformers` model downloads on first run (needs internet)
- Port 9009 might be in use: `lsof -i :9009`

### Sandbox Fails

- Ensure Docker is running: `docker ps`
- Build the sandbox image: `docker build -f Dockerfile.sandbox -t logomesh-sandbox:latest .`
- Check Docker socket permissions: `ls -la /var/run/docker.sock`

### Purple Returns Empty Code

- Green handles this gracefully: returns CIS 0.10 immediately
- Check Purple logs for LLM API errors

### Scores Seem Wrong

- Check the breakdown in the response JSON — each dimension (R, A, T, L) is reported separately
- Look for intent mismatch: if `intent_code_similarity < 0.35`, a heavy penalty is applied
- Check Red Agent report: vulnerabilities trigger multiplicative penalties
- Verify test pass rate: `T = 0.20 + (0.65 × pass_rate)`

### Red Agent Takes Too Long

- Reduce `RED_AGENT_MAX_STEPS` (default 5)
- Reduce `RED_AGENT_TIMEOUT` (default 20s)
- Set `RED_AGENT_MCTS=false` to use static analysis only

---

## 15. Technology Stack Reference

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web server | FastAPI + Uvicorn | Green Agent HTTP server |
| Agent protocol | a2a-sdk | A2A JSON-RPC communication |
| LLM calls | OpenAI Python SDK (async) | Scoring, generation, Red Agent reasoning |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | 384-dim vectors for cosine similarity |
| Math | scipy, numpy | Cosine distance, vector operations |
| Sandbox | Docker SDK | Spinning up isolated containers |
| Config | PyYAML | Architecture constraint loading |
| Testing | pytest, hypothesis | Test execution, property-based testing |
| Database | sqlite3 (stdlib) | Battle memory, strategy outcomes |
| AST analysis | ast (stdlib) | Static code analysis without LLM |
| Package manager | uv | Fast Python dependency management |

---

## 16. Glossary

| Term | Definition |
|------|-----------|
| **CIS** | Contextual Integrity Score (0.0–1.0). The final evaluation score. |
| **DBOM** | Decision Bill of Materials. Tamper-evident audit trail for each evaluation. |
| **Green Agent** | The benchmark/evaluator. Sends tasks, runs attacks, scores code. |
| **Purple Agent** | The AI under test. Generates code from task descriptions. |
| **Red Agent** | Adversarial attacker. Finds vulnerabilities using MCTS. |
| **MCTS** | Monte Carlo Tree Search. Algorithm used by Red Agent for attack exploration. |
| **UCB1** | Upper Confidence Bound 1. Bandit algorithm for strategy selection. |
| **A2A** | Agent-to-Agent. Google's JSON-RPC protocol for agent communication. |
| **Battle** | A single evaluation run: task → Purple response → Red attack → sandbox → CIS score. |
| **Refinement Loop** | Iterative improvement: Green sends feedback, Purple tries again. |
| **Contextual Debt** | The academic concept: liability from missing intent/rationale in AI-generated code. |
| **Battle Memory** | SQLite-backed cross-run learning from past evaluations. |
| **Strategy Evolver** | UCB1 bandit that selects optimal evaluation strategies over time. |

---

*Last updated: 2026-02-17*
