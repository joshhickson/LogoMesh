# LogoMesh — Full Context Handoff Prompt

Paste everything below this line into a new Claude Code session.

---

You are continuing work on **LogoMesh**, a multi-agent AI code evaluation platform built for the UC Berkeley RDI AgentX AgentBeats competition. The repo is at `/Users/ovoievodin/zasha/agentbeats/LogoMesh`. The active branch is `feat/agi-agents` (20+ commits ahead of `master`; master is stale).

---

## 1. What LogoMesh Does

LogoMesh answers: **"When an AI writes code, how good is it really?"** Unlike LLM-as-judge approaches that ask an LLM to rate code (subjective, high-variance), LogoMesh anchors scores to ground-truth signals — it actually runs the code in a Docker sandbox, attacks it with an adversarial Red Agent, and only allows the LLM to adjust scores ±0.10. This dropped run-to-run variance from ±0.15 to <0.05.

**The pitch:** "We don't ask if code looks good. We run it, attack it, and learn from every battle."

### Three Agents

| Agent | Role | Port | Entry Point |
|-------|------|------|-------------|
| **Green** (Judge/Benchmark) | Orchestrates evaluation: sends tasks to Purple, runs Red, executes tests in Docker, computes CIS score | 9009 | `src/green_logic/server.py` |
| **Purple** (AI under test) | Receives coding task, returns `{sourceCode, testCode, rationale}` | 9010 | `src/purple_logic/agent.py` |
| **Red** (Attacker) | MCTS-based vulnerability hunter, embedded inside Green | — | `src/red_logic/orchestrator.py` |

### The 5-Step Evaluation Pipeline (Green Agent)

```
1. Send task to Purple Agent via A2A JSON-RPC
2. Classify task complexity (simple/moderate/complex via AST analysis)
3. Run embedded Red Agent attack (MCTS for complex, static for simple)
4. Execute tests in Docker sandbox (128MB RAM, 50% CPU, no network)
5. Compute CIS score → Store in SQLite + DBOM → Optionally run refinement loop
```

---

## 2. The CIS Scoring Formula

```
CIS = (0.25 × R + 0.25 × A + 0.25 × T + 0.25 × L) × red_penalty × intent_penalty
```

### Score Components

| Component | What It Measures | How Computed |
|-----------|-----------------|--------------|
| **R** (Rationale Integrity) | Does the AI explain what it wrote? | Cosine similarity (all-MiniLM-L6-v2, 384-dim) between task description and rationale + length bonus |
| **A** (Architectural Integrity) | Is the code well-structured? | Baseline 0.80; deducted for YAML constraint violations (forbidden imports, missing patterns); minor ±0.05 vector adjustment |
| **T** (Testing Integrity) | Do tests actually pass? | Ground truth: `0.20 + (0.65 × pass_rate)` + test specificity bonus (0.6–1.0 multiplier). 100% pass → 0.85, 0% → 0.20 |
| **L** (Logic Score) | Is the logic correct? | LLM senior code review (seed=42, temp=0); bounded ±0.10 from ground truth |

### Penalties (multiplicative on full CIS)

| Penalty | Trigger | Multiplier |
|---------|---------|------------|
| Red Agent: Critical vuln | MCTS or static analysis finds critical | ×0.60 (40% penalty) |
| Red Agent: High vuln | | ×0.75 (25% penalty) |
| Red Agent: Medium vuln | | ×0.85 (15% penalty) |
| Intent mismatch | `cosine(task_desc, source_code) < 0.35` | Scales 0.30→1.0 linearly |

### Key Design Guarantees

- LLM can only adjust scores ±0.10 from ground-truth anchors
- `seed=42, temperature=0` for all judge LLM calls (deterministic)
- Each signal penalizes exactly once — no double-counting
- Vulnerabilities are NOT deducted from A score (only red_penalty handles them)

---

## 3. Complete Source File Reference

### Green Agent Stack (`src/green_logic/`)

| File | Lines/Size | Key Classes/Functions |
|------|-----------|----------------------|
| `server.py` | ~1,093 lines | FastAPI app; `classify_task_complexity()`; `stream_purple_response()` with 30s stall detection; `send_coding_task_action()` — the full 5-step pipeline; A2A routes: `GET /.well-known/agent-card.json`, `POST /`, `POST /actions/send_coding_task` |
| `scoring.py` | ~672 lines | `ContextualIntegrityScorer`; `evaluate()` — computes R/A/T/L + penalties; `_perform_logic_review()` — LLM code review; `_parse_purple_response()` — handles A2A + Harmony formats; `_evaluate_architecture_constraints()` — YAML checker; `_evaluate_test_specificity()` — test quality multiplier |
| `tasks.py` | ~31KB | 20 `CODING_TASKS` dicts across 4 difficulty tiers. Each has: `id`, `title`, `description`, `constraints`, optional `hidden_tests` |
| `sandbox.py` | ~320 lines | `Sandbox` class; Docker-first, subprocess fallback; `run(source_code, test_code)` → creates container from `logomesh-sandbox:latest`, copies files via `put_archive`, runs pytest; 128MB mem, 50% CPU, 50 procs, no network; always cleans up |
| `analyzer.py` | ~30KB | `SemanticAuditor` — AST-based static analysis: forbidden imports, banned patterns, recursion/loop requirements, cyclomatic complexity; `SecurityIssue`, `CodeSmell`, `AnalysisResult` dataclasses |
| `generator.py` | ~17KB | `TestGenerator` — dual mode: LLM-generated adversarial tests + programmatic fuzzer; `CodeAnalyzer(ast.NodeVisitor)` extracts function signatures; `generate_adversarial_tests()` combines both |
| `refinement_loop.py` | ~66KB (largest file) | `RefinementLoop` — iterative improvement; `ScientificMethodEngine` — hypothesis testing for targeted feedback; `should_continue(iteration, test_passed, score, critical_vulns)`; `create_refinement_task_prompt()` |
| `compare_vectors.py` | small | `VectorScorer` — wraps sentence-transformers `all-MiniLM-L6-v2`; `calculate_similarity(text1, text2)` → cosine; `get_embedding(text)` → 384-dim |
| `agent.py` | ~132 lines | `GreenAgent` — `generate_dbom(result)` creates DBOM (SHA-256 hash, 384-dim intent vector, CIS score, signature); `submit_result()` saves to SQLite + writes DBOM JSON |
| `red_report_types.py` | small | `Severity(Enum)` — CRITICAL/HIGH/MEDIUM/LOW/INFO with penalty %s; `Vulnerability` dataclass; `RedAgentReport` — `get_penalty_multiplier()` |
| `harmony_parser.py` | ~9.7KB | Protocol compat for `gpt-oss` models with Harmony channel tags (`<\|channel\|analysis>`, `<\|channel\|final>`) |
| `architecture_constraints.yaml` | config | Per-task YAML: each task (`task-001` through `task-020`) has named constraints with `forbidden_imports`, `required_imports`, `forbidden_patterns`, `penalty` (0–1.0) |

### Red Agent Stack (`src/red_logic/`)

| File | Lines/Size | Key Classes/Functions |
|------|-----------|----------------------|
| `orchestrator.py` | ~72KB (largest) | `RedAgentV3` — MCTS attack engine; `MCTSPlanner` — branching→valuation→selection→execution→backpropagation; `DynamicToolBuilder` — creates tools at runtime (AGI-level); `ToolRegistry`; UCB1 branch selection (`exploration_weight=1.414`); configurable: `max_steps`, `max_time_seconds`, `use_mcts`, `mcts_branches`; auto-falls back to simpler analysis for simple tasks |
| `reasoning.py` | ~16KB | `SmartReasoningLayer` + `ReflectionLayer` — LLM-powered vulnerability reasoning; 20 hardcoded per-task attack hints (e.g., task-014: "SQL injection edge cases, UNION injection, blind injection") |
| `semantic_analyzer.py` | — | `AGICodeAnalyzer` — deep code understanding; `QueryBuilderDetector` — false positive filtering for SQL patterns in query builder code |
| `dependency_analyzer.py` | — | Taint-tracking `DependencyAnalyzer` — traces import chains and data flows |
| `workers/static_mirror.py` | ~538 lines | `StaticMirrorWorker` — mirrors Green's `SemanticAuditor` exactly (guarantees same penalties); checks: forbidden imports (`os`, `sys`, `subprocess`, `shutil`, `socket`, `ctypes`), dangerous functions (`eval`/`exec` → CRITICAL, `compile`/`__import__` → HIGH), SQL injection (12 regex patterns), command injection, complexity (max 10), nesting (max 4), tautologies (`x == x` → CRITICAL), broken authorization patterns |
| `workers/constraint_breaker.py` | ~530 lines | `ConstraintBreakerWorker` — 22 `TaskConstraint` entries for tasks 001–020; checks: `forbidden_import`, `required_import`, `forbidden_pattern`, `required_pattern`, `forbidden_construct`; task-specific ad-hoc checks (JWT algorithm confusion, timing attacks, resource leaks, SQL IN clause); `_infer_task_id()` heuristic for unknown tasks |
| `workers/base.py` | ~123 lines | `WorkerResult` dataclass; `BaseWorker(ABC)` — abstract `analyze()` method |
| `executor.py` | ~208 lines | `RedAgentV2Executor(AgentExecutor)` — A2A SDK wrapper; parses `TARGET CODE:` sections; extracts task_id via regex |
| `agent.py` | small | Starts A2A Starlette server for standalone Red Agent |

### Self-Improving Systems

| File | Lines/Size | Key Classes/Functions |
|------|-----------|----------------------|
| `src/memory.py` | ~23KB | `BattleMemory` — SQLite-backed cross-run learning; tables: `memory_lessons`, `memory_attack_hints`, `memory_task_stats`; `get_task_memory()` retrieves relevant lessons; `store_lessons()` extracts from completed battles; `format_for_red_agent/test_generator/scoring/refinement()` — context strings; `backfill_from_battles()` — learns from history on startup |
| `src/strategy_evolver.py` | ~15KB | `StrategyEvolver` — UCB1 multi-armed bandit; 5 strategy variants: `aggressive_red`, `correctness_focus`, `deep_refinement`, `security_hunter`, `minimal_overhead`; `select_strategy(task_id)` via UCB1 explore/exploit; `record_outcome()` updates weights |
| `src/task_intelligence.py` | ~16KB | `TaskIntelligence` — 3-tier hierarchy: hardcoded hints → battle memory → LLM generation; 20 pre-defined attack hint strings; `get_attack_hints()` for Red, `get_architecture_guidance()` for novel tasks; in-memory cache per (task_id, method) |

### Purple Agent (`src/purple_logic/`)

| File | Purpose |
|------|---------|
| `agent.py` | 41 lines. Creates `AgentCard` with streaming, uses `GenericDefenderExecutor` from `scenarios/security_arena/agents/generic_defender.py`; model from `OPENAI_MODEL` env (default `gpt-4o-mini`) |

### AgentBeats Framework (`src/agentbeats/`)

| File | Purpose |
|------|---------|
| `client.py` | `send_message()` — full A2A round-trip via httpx (timeout 300s); resolves agent card; handles streaming events |
| `client_cli.py` | TOML-driven CLI: reads scenario, sends `EvalRequest` to green agent, prints streaming events |
| `run_scenario.py` | Multi-process orchestrator: starts participant agents + green agent as subprocesses; `wait_for_agents()` polls health via `A2ACardResolver`; SIGTERM→SIGKILL cleanup |
| `green_executor.py` | `GreenAgent` abstract base + `GreenExecutor(AgentExecutor)` A2A wrapper |
| `tool_provider.py` | `ToolProvider` — stateful agent communication with conversation continuity per URL |
| `models.py` | `EvalRequest(BaseModel)`, `EvalResult(BaseModel)` — Pydantic models |
| `cloudflare.py` | `quick_tunnel()` — async context manager for Cloudflare tunnel exposure |

### Other Key Files

| File | Purpose |
|------|---------|
| `main.py` | Entry point: `argparse` for `--role GREEN/PURPLE/RED`, `--host`, `--port`; dispatches to `run_green_agent()`, `run_purple_agent()`, or `run_red_agent()` |
| `src/llm_utils.py` | `get_temperature_kwargs(default)` — reads `LLM_TEMPERATURE` env; supports `"skip"` for models rejecting the parameter (like gpt-5.2) |
| `tests/mock_purple.py` | FastAPI mock Purple with 4 pre-canned responses: GOOD, BAD_LOOP, BROKEN_LOGIC, BAD_RATIONALE |
| `leaderboard.json` | SQL queries for AgentBeats leaderboard: main CIS query + security audit view |

---

## 4. The 20 Coding Tasks

Tasks span 4 difficulty tiers. Each sent to Purple via A2A, evaluated by Green:

| ID | Title | Key Constraint | Difficulty |
|----|-------|---------------|------------|
| task-001 | Email Validator | No network imports (`socket`, `urllib`), must use `re` | Simple |
| task-002 | Rate Limiter | Thread safety required, no `time.time()` (use `monotonic`) | Simple |
| task-003 | LRU Cache | — | Simple |
| task-004 | Fibonacci (Recursive) | Must use recursion, loops forbidden | Simple |
| task-005 | JWT Token Handler | Signature validation required, limited imports | Moderate |
| task-006 | Connection Pool | Thread safety (`threading` import), lock required | Moderate |
| task-007 | State Machine | — | Moderate |
| task-008 | Merkle Tree | Leaf/internal node differentiation | Moderate |
| task-009 | Blockchain | Proof of work required | Complex |
| task-010 | HD Wallet | — | Complex |
| task-011 | ECDSA | Nonce generation required | Complex |
| task-012 | ERC-20 Token | Zero-address check required | Complex |
| task-013 | REST API Router | — | Complex |
| task-014 | SQL Query Builder | Parameterized queries required, no string interpolation | Complex |
| task-015 | Event Sourcing | — | Complex |
| task-016 | Task Queue | Thread safety required | Complex |
| task-017 | Raft Consensus | Term tracking required | Complex |
| task-018 | B-Tree | — | Complex |
| task-019 | Hash Ring | — | Complex |
| task-020 | MVCC | Thread safety required, version tracking | Complex |

---

## 5. Architecture & Infrastructure

### A2A Protocol (Agent-to-Agent)

LogoMesh uses Google's A2A JSON-RPC protocol. Green sends task to Purple:
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "messageId": "task-004-battle-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "CODING TASK: Recursive Fibonacci..."}]
    }
  },
  "id": "battle-001"
}
```

Purple responds with `{sourceCode, testCode, rationale}`. Agent discovery via `GET /.well-known/agent-card.json`.

### Docker Configuration

| File | Purpose |
|------|---------|
| `Dockerfile` | Base polyglot image: Node.js 20 + Python 3 + pnpm + uv |
| `Dockerfile.green` | Green Agent: `ENTRYPOINT ["python3", "main.py", "--role", "GREEN"]` |
| `Dockerfile.purple` | Purple Agent: `--role PURPLE` |
| `Dockerfile.sandbox` | Isolated execution: pytest pre-installed, resource limits |
| `Dockerfile.gpu` | GPU variant for Lambda Labs H100 |
| `docker-compose.agents.yml` | Orchestrates Green (9009) + Purple (9010); shared `battle-data` volume; Docker socket mount for DinD |

**Critical:** Green mounts `/var/run/docker.sock` for Docker-in-Docker sandbox execution.

### Data Persistence

- **SQLite** (`data/battles.db`, WAL mode) — tables: `battles`, `memory_lessons`, `memory_attack_hints`, `memory_task_stats`, `strategy_outcomes`
- **DBOM files** (`data/dboms/`, 315+ JSON files) — each contains: `h_delta` (SHA-256), `v_intent` (384-dim vector), `score_cis`, `sigma_judge` (signature)

### Environment Variables (`.env.example`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | (required) | LLM access |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model for scoring, generation, Red Agent |
| `OPENAI_BASE_URL` | (optional) | For Azure/local models |
| `SANDBOX_TIMEOUT` | `15` | Docker sandbox timeout (seconds) |
| `RED_AGENT_MCTS` | `true` | Enable MCTS-based attacks |
| `RED_AGENT_MAX_STEPS` | `5` | MCTS exploration steps |
| `RED_AGENT_TIMEOUT` | `20` | Red Agent timeout (seconds) |
| `ENABLE_REFINEMENT` | `true` | Enable refinement loop |
| `ENABLE_SCIENTIFIC_METHOD` | `true` | Hypothesis-based feedback |
| `MAX_REFINEMENT_ITERATIONS` | `2` | Max refinement rounds |
| `LLM_TEMPERATURE` | (unset) | `"skip"` for models rejecting param |

### TypeScript Packages (Legacy/Unused)

Located in `packages/` — original concept before Python pivot. Not used by current pipeline but remain in monorepo:
- `@logomesh/contracts` — TypeScript type definitions (A2A, entities, storage)
- `@logomesh/server` — Express.js server with `/v1/evaluate`
- `@logomesh/core` — Core evaluation logic
- `@logomesh/mock-agent`, `@logomesh/workers` — Support packages
- `@logomesh/frontend` — Empty placeholder

### CI/CD (`.github/workflows/ci.yml` — "Operation Phoenix CI")

Three jobs: Install & Build (pnpm/turbo) → Lint, Test & Boundaries (eslint, vitest, dependency-cruiser) → Security Audit (pnpm audit). Triggers on push/PR to `main`.

---

## 6. Scenarios System

TOML-defined scenarios in `scenarios/`:

### `scenarios/security_arena/` (Primary)
- `generic_defender.py` — Purple Agent using a2a-sdk with OpenAI streaming
- `generic_attacker.py` — Red Agent variant
- `orchestrator.py` — Scenario orchestration
- 7 scenario TOML files: `scenario_ad_attack.toml`, `scenario_debugdump.toml`, `scenario_dockerdoo.toml`, etc.
- `arena_common.py` — Shared utilities

### `scenarios/debate/` — Alternative debate-format scenario

---

## 7. Competition Context: UC Berkeley RDI AgentX AgentBeats

### What Is AgentBeats?

AgentBeats is an open-source platform from Berkeley RDI that introduces the **AAA (Agentified Agent Assessment)** paradigm — turning benchmarks themselves into agents:

- **Green Agent** = the benchmark/evaluator (proctor + judge + environment manager)
- **Purple Agent** = the agent being tested
- **A2A + MCP protocols** = universal interface (build once, test against any green agent)
- Scores sync to public leaderboards on [agentbeats.dev](https://agentbeats.dev)

### Competition Overview

| Detail | Value |
|--------|-------|
| Organizers | UC Berkeley RDI — Prof. Dawn Song (Co-Director), Xiaoyuan Liu (Research Fellow) |
| Scale | 1,300+ teams worldwide, ~40K MOOC learners community |
| Prizes | $1M+ total (GCP/Gemini credits, inference credits, OpenAI credits, AWS, HuggingFace) |
| Sponsors | Google DeepMind, Nebius, Lambda, Amazon/AWS, OpenAI, Meta, HuggingFace, ServiceNow, Sierra, Snowflake, Linux Foundation, PyTorch Foundation |
| Judges | Authors of τ²-Bench, GAIA2, CyberGym, AgentBench; researchers from DeepMind, Meta, Sierra, Lambda |

### Phase 1: Green Agent Track (COMPLETED)

- **Dates:** Oct 16, 2025 → Jan 31, 2026
- **Goal:** Build green agents (evaluation benchmarks)
- **LogoMesh submitted to:** Multi-Agent Evaluation track
- **Phase 1 winners:** Announced ~Feb 16, 2026 (see competition page for results)

**Phase 1 Tracks:**
- Sponsored: Agent Safety (Lambda), Coding Agent (Nebius+DeepMind), Healthcare (Nebius), Web Agent (DeepMind), Computer Use (DeepMind), Research Agent (OpenAI), Finance Agent (OpenAI)
- Unsponsored: Software Testing, Game Agent, DeFi, Cybersecurity, Legal Domain, Multi-Agent Evaluation
- Custom: Agent Security/Lambda ($5K/$3K/$1K prizes), τ²-Bench/Sierra, OpenEnv/Meta+HuggingFace

**Known Phase 1 Winners (from competition page):**
- Agent Safety 1st: Pi-Bench (deterministic scoring, no LLM judges)
- Coding 1st: NetArena (Kubernetes network policy debugging)
- Healthcare 1st: ICU-Later (FHIR-based clinical tasks, MIMIC-IV)
- Finance 1st (Tie): MateFin & WebShop Plus
- Game 1st: Minecraft Benchmark (MCU agentification)
- Cybersecurity 1st: Ethernaut Arena (41 Solidity exploit challenges)
- Multi-Agent 1st: MAizeBargAIn (game-theoretic bargaining)

### Phase 2: Purple Agent Track (UPCOMING)

- **Dates:** Feb 23 → Apr 26, 2026
- **Goal:** Build purple agents that excel on top Phase 1 green agents
- **Format:** Sprint-based, 3 tracks per sprint:
  - Weeks 1–3 (2/23–3/15): Research Agent, Web & Computer-Use Agent, Game Agent
  - Weeks 4–6 (3/16–4/5): Agent Safety, Cybersecurity & Software Testing, Finance Agent
  - Weeks 7–9 (4/6–4/26): Multi-Agent Evaluation, Coding Agent, Healthcare Agent
- **Resources per team:** $100 Lambda credits + $50 Nebius inference credits
- **Scoring:** Performance on public leaderboards hosted on AgentBeats

### Platform Submission Pipeline

1. Package agent as Docker image
2. Register on [agentbeats.dev](https://agentbeats.dev)
3. Set up GitHub Actions workflow (auto-build + publish image)
4. Write `scenario.toml` config
5. Push triggers GitHub Actions → runs assessment in isolated environment → parses results to JSON
6. Submit PR to leaderboard repo → merge → webhook updates leaderboard
7. Requires `agentbeats_id` for leaderboard tracking
8. **BYOK model** — bring your own API keys (set as GitHub Actions secrets)

### Lambda × Berkeley Security Arena (Custom Track)

Separate track run by Lambda Labs with its own repo (`LambdaLabsML/agentbeats-lambda`):
- Phase 1 (Nov 24 → Jan 16): Implement security scenarios (prompt injection, data exfil, jailbreaking)
- Phase 2 (Feb 2 → Feb 23): Attacker vs Defender agent competition
- Model constraint: `gpt-oss-20b` only (fits 80GB H100)
- Prizes: $5K/$3K/$1K for top 3 in each phase
- 462 scenario specifications in library

---

## 8. The Contextual Debt Thesis

LogoMesh is built on the academic concept of **Contextual Debt** — a paper by the team (Aladdin writing in .tex format):

- **Technical Debt** = failure of *how* code is built (suboptimal implementation)
- **Contextual Debt** = failure of *why* code exists (missing intent, rationale, institutional memory)
- AI coding assistants create **"comprehension debt"** — developers accept AI code without building mental models (Peter Naur's "theory building")
- CIS formula directly measures this: R (rationale), A (architecture), T (testing), L (logic) — each dimension captures whether the AI understood and documented *why*, not just *what*
- **DBOM (Decision Bill of Materials)** = tamper-evident audit trail: `{h(delta), v_intent, score_cis, sigma_judge}` — evidence for "duty of care" defense

---

## 9. Business Strategy (from Feb 5 Founder Session)

### Product Direction

- **Recommended:** GitHub PR App (LogoMesh's slowness is a feature for CI, not a bug for CLI)
- **Pricing:** Free for public repos, $29/seat/month private
- **Moat:** "We run the code. Everyone else just reads it." (CodeRabbit, Codacy, Snyk = static analysis only)
- **Market:** AI Code Tools $4.86B (2023) → $26.03B (2030), 27.1% CAGR

### Phase Roadmap

1. Phase 1 (0-3 months): GitHub PR App MVP
2. Phase 2 (3-6 months): CLI for local deep scans
3. Phase 3 (6+ months): VS Code extension (only if traction)

### Open Questions

- **Cloud TOS:** OpenAI/Anthropic prohibit "red teaming" — does MCTS Red Agent violate this? May need self-hosted models.
- **CodeRabbit moat:** If they add sandbox execution, what stops them? Need clear defensibility answer.

---

## 10. Team Context

| Person | Role | Focus |
|--------|------|-------|
| **Oleksander (sszz01)** | CTO/Technical | Wrote all agent logic, scoring pipeline, features. You're helping him. |
| **Josh (joshhickson)** | CEO/Business, Repo owner | Documentation, demo video, paper with Aladdin, Lambda deployment. Pulling from master — needs `feat/agi-agents`. |
| **Aladdin** | Research | Contextual Debt paper (.tex). Paper doesn't cover Red Agent or testing results yet. |
| Plus: Alaa, Samuel, Mark, Garrett, Deepti | — | Various contributions |

---

## 11. Development History (Jan 28–31 Session)

### Bug Fixes
1. `MODEL_NAME → OPENAI_MODEL` in `scoring.py` — wrong env var
2. Empty sourceCode guard — Purple returning empty code now returns CIS 0.10 instead of crashing
3. Null guard for `red_agent.attack()` in server.py
4. Double-penalization removal — vulns were deducted from A AND applied as red_penalty
5. Intent-code mismatch detection — factorial-for-LRU-cache caught, penalty ×0.30
6. Prompt injection hardening — XML tags + SECURITY warnings in LLM prompts

### Features Added
- Ground-truth-driven scoring for A and T
- Task complexity classifier (simple/moderate/complex)
- Hallucination reduction in LLM prompts
- Score floors for architecture and testing
- Safe default strategy on first run

### Recent Commits on feat/agi-agents
```
5b2e90d fix: harden LLM prompts against prompt injection from Purple agent
43f327f docs: rewrite README and judges guide + add baseline DBOMs
836c554 docs: overhaul README and configs for Phase 1 submission
11f7e6f fix: detect and penalize intent-code mismatch + 3 critical bug fixes
d256321 fix: resolve 3 competition-critical bugs before submission
b1b3e5c fix: eliminate 3 double-penalization paths suppressing CIS scores
f51acd0 feat: ground-truth-driven scoring for Architecture and Testing
433d30a fix: enforce score floors for architecture and testing
f921dcd feat: reduce hallucination and add task complexity classifier
1ec24cd fix: use safe default strategy on first run
67fbc0e feat: add self-improving strategy evolution via UCB1 multi-armed bandit
42d30d1 feat: add dynamic task intelligence for novel task generalization
```

---

## 12. Baseline Results

Average CIS across 20 tasks with gpt-4o-mini Purple: **0.55** (range 0.00–0.75)

Key calibration points:
- Fibonacci (simple, well-understood): **0.75** (high — correct)
- ERC-20 Token (complex, security-sensitive): **0.356** (moderate — correct)
- Factorial-for-LRU-cache (wrong code): **0.19** (low — correctly caught)
- REST API Router (Purple failed completely): **0.00** (zero — correct)

---

## 13. Deployment

### Lambda Labs (H100/A100)
```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh && git checkout feat/agi-agents
pip install uv && uv sync
cp .env.example .env  # Add OPENAI_API_KEY

# Option A: Direct
uv run main.py --role PURPLE --host 0.0.0.0 --port 9010 &
uv run main.py --role GREEN --host 0.0.0.0 --port 9009 &

# Option B: Docker
docker compose -f docker-compose.agents.yml up --build
```

---

## 14. Important Rules

- Do NOT include `Co-Authored-By: Claude` in any commit messages.
- Branch `feat/agi-agents` is the source of truth, not `master`.
- Follow the documentation protocol in `CLAUDE.md` if making doc changes.
- The scoring pipeline is intentionally designed so LLM can only adjust ±0.10 from ground truth. Do not change this without discussion.
- Red Agent penalties are multiplicative on the full CIS, not deducted from individual components. This prevents double-penalization.
- The `Severity` enum penalty values (CRITICAL=40%, HIGH=25%, MEDIUM=15%, LOW=5%, INFO=0%) are intentional and calibrated.

---

## 15. Key URLs

| Resource | URL |
|----------|-----|
| LogoMesh Repo | https://github.com/joshhickson/LogoMesh |
| AgentBeats Platform | https://agentbeats.dev |
| AgentBeats Docs | https://docs.agentbeats.dev |
| Competition Page | https://rdi.berkeley.edu/agentx-agentbeats |
| Berkeley RDI Newsletter | https://berkeleyrdi.substack.com |
| AgentBeats Tutorial Repo | https://github.com/RDI-Foundation/agentbeats-tutorial |
| AgentBeats GitHub | https://github.com/agentbeats/agentbeats |
| Lambda Security Arena | https://github.com/LambdaLabsML/agentbeats-lambda |

---

*Last updated: 2026-02-17*
