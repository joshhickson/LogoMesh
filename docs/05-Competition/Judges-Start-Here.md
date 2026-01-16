---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-01-15]: Comprehensive overview for competition judges to understand the LogoMesh Agent Arena system.

# Judges Start Here: LogoMesh Agent Arena

Welcome to the LogoMesh Agent Arena - an **Agent-on-Agent evaluation platform** for the Lambda Security Track of the AgentX AgentBeats competition.

---

## Executive Summary

LogoMesh implements a **three-agent adversarial arena** that measures "Contextual Debt" - the hidden liability in AI-generated code when context is lost or misunderstood.

| Agent | Role | Purpose |
|-------|------|---------|
| **Green Agent** | Judge/Assessor | Orchestrates battles, evaluates code quality via CIS scoring |
| **Purple Agent** | Defender/Assessee | Generates code solutions to programming tasks |
| **Red Agent** | Attacker | Finds vulnerabilities in Purple's code using hybrid static+LLM analysis |

**Core Innovation:** The Contextual Integrity Score (CIS) - a quantitative metric that measures how well AI-generated code preserves the original intent, architecture, and testability of a task.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AGENT ARENA                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐     Task      ┌─────────────┐                     │
│   │   GREEN     │──────────────▶│   PURPLE    │                     │
│   │   AGENT     │               │   AGENT     │                     │
│   │  (Judge)    │◀──────────────│  (Defender) │                     │
│   │  Port 9000  │   Solution    │  Port 9001  │                     │
│   └──────┬──────┘               └──────┬──────┘                     │
│          │                             │                             │
│          │ Sends code                  │                             │
│          ▼                             │                             │
│   ┌─────────────┐                      │                             │
│   │    RED      │◀─────────────────────┘                             │
│   │   AGENT     │   (Code to attack)                                 │
│   │  (Attacker) │                                                    │
│   │  Port 9021  │                                                    │
│   └─────────────┘                                                    │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    vLLM BRAIN                                │   │
│   │            Qwen/Qwen2.5-Coder-32B-Instruct-AWQ              │   │
│   │                     Port 8000                                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Contextual Integrity Score (CIS)

CIS quantifies how well AI-generated code maintains the original task's intent. Formula:

```
CIS = (0.25 × R) + (0.25 × A) + (0.25 × T) + (0.25 × L)
```

| Component | Weight | Measures |
|-----------|--------|----------|
| **R** (Rationale) | 25% | Does the code explanation match the task intent? (Cosine similarity: task_description ↔ rationale) |
| **A** (Architecture) | 25% | Is the code well-structured, maintainable, follows best practices? |
| **T** (Testing) | 25% | Are tests meaningful, comprehensive, and actually run? |
| **L** (Logic) | 25% | Does the code work correctly? (Sandbox execution results) |

### CIS Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 0.85+ | Excellent | Production-ready, minimal contextual debt |
| 0.65-0.85 | Good | Solid implementation, minor debt |
| 0.45-0.65 | Fair | Works but has significant debt |
| 0.25-0.45 | Poor | Barely functional, high debt |
| 0.0-0.25 | Failing | Non-functional or critical issues |

---

## Agent Deep Dives

### Green Agent (Judge/Assessor)

**Purpose:** Orchestrates the entire battle, assigns tasks, collects responses, computes CIS scores.

**Architecture:**
```
Green Agent
├── Battle Orchestrator (coordinates flow)
├── Task Database (20 curated tasks across 5 categories)
├── Sandbox Executor (runs Purple's tests safely)
├── CIS Scorer (computes final scores)
└── Report Generator (produces evaluation JSON)
```

**Key Components:**

1. **Task Categories:**
   - Data Structures (LRU Cache, Trie, etc.)
   - Algorithms (Sorting, Pathfinding)
   - Security (Input validation, Auth)
   - Concurrency (Rate limiters, Thread safety)
   - Financial (ERC20 tokens, Calculations)

2. **Sandbox Execution:**
   - Docker-isolated Python environment
   - 30-second timeout per test
   - Memory limits enforced
   - Captures stdout/stderr + test results

3. **Scoring Pipeline:**
   ```
   Purple Response → Parse → Sandbox Execute → Red Attack → CIS Compute → Report
   ```

**Files:** `src/green_logic/`

---

### Purple Agent (Defender/Assessee)

**Purpose:** Receives coding tasks, generates solutions with rationale and tests.

**Output Format:**
```json
{
  "sourceCode": "class LRUCache:\n    def __init__(self, capacity)...",
  "testCode": "import pytest\ndef test_lru_basic()...",
  "rationale": "I used OrderedDict for O(1) operations because..."
}
```

**Key Features:**
- LLM-powered code generation
- Structured JSON output
- Includes test generation
- Provides reasoning/rationale

**Files:** `src/purple_logic/`

---

### Red Agent V2 (Attacker)

**Purpose:** Finds vulnerabilities in Purple's code using a hybrid 3-layer attack engine.

**Architecture:**
```
┌─────────────────────────────────────────┐
│           Red Agent V2                   │
├─────────────────────────────────────────┤
│  Layer 1: Static Workers (Always runs)  │
│  ├── StaticMirrorWorker                 │  ← Pattern matching, AST analysis
│  └── ConstraintBreakerWorker            │  ← Task constraint violations
├─────────────────────────────────────────┤
│  Layer 2: Smart Reasoning (If needed)   │
│  └── SmartReasoningLayer                │  ← LLM-powered logic flaw detection
├─────────────────────────────────────────┤
│  Layer 3: Reflection (Optional)         │
│  └── ReflectionLayer                    │  ← Deep analysis if time permits
└─────────────────────────────────────────┘
```

**Layer 1: Static Analysis (Guaranteed, Fast)**

Two specialized workers:

1. **StaticMirrorWorker** - Detects:
   - SQL Injection (`f"SELECT * FROM {table}"`)
   - Command Injection (`os.system(user_input)`)
   - Dangerous Functions (`eval()`, `exec()`, `pickle.loads()`)
   - Hardcoded Secrets (`password = "admin123"`)
   - Path Traversal (`open(user_path)`)
   - **Tautological Comparisons** (`if x == x:` - always True)
   - **Broken Authorization** (`self._require(self.owner == self.owner, ...)`)

2. **ConstraintBreakerWorker** - Detects:
   - Forbidden imports (e.g., `socket` in email validator)
   - Required pattern violations (e.g., loop instead of recursion)
   - Missing thread safety in concurrent code
   - Task-specific constraint violations

**Layer 2: Smart Reasoning (LLM-Enhanced)**

- Analyzes code semantically for logic flaws
- Finds vulnerabilities static analysis misses
- Context-aware (understands task requirements)
- Timeout-bounded (30 seconds max)

**Layer 3: Reflection (Deep Analysis)**

- Only runs if no critical findings yet
- Second-pass analysis for subtle bugs
- Race condition detection
- Business logic flaws

**Vulnerability Report Format:**
```json
{
  "attack_successful": true,
  "vulnerabilities": [
    {
      "severity": "CRITICAL",
      "category": "authorization_bypass",
      "title": "Tautological comparison bypasses owner check",
      "description": "self.owner == self.owner is always True...",
      "location": "line 42",
      "exploit": "Any user can call mint() to create tokens",
      "fix": "Change to: self._require(caller == self.owner, ...)"
    }
  ],
  "attack_summary": "Found 3 CRITICAL, 1 HIGH vulnerabilities..."
}
```

**Files:** `src/red_logic/`

---

## Battle Flow

A complete battle proceeds as follows:

```
1. Green receives battle request
   └── Selects task from database

2. Green → Purple: Sends coding task
   └── "Implement a thread-safe rate limiter..."

3. Purple generates solution
   └── Returns: sourceCode + testCode + rationale

4. Green executes in sandbox
   └── Runs Purple's tests, captures results

5. Green → Red: Sends Purple's code
   └── Red performs 3-layer vulnerability analysis

6. Red → Green: Returns vulnerability report
   └── List of findings with severity/category/exploits

7. Green computes CIS score
   └── Combines: R + A + T + L (adjusted for Red findings)

8. Green outputs final report
   └── JSON with scores, breakdown, vulnerabilities
```

---

## Key Innovations

### 1. Contextual Debt Theory
Traditional code metrics (cyclomatic complexity, coverage) miss **contextual debt** - the gap between what the code does and what it should do based on the original intent.

### 2. Adversarial Evaluation
The Red Agent acts as a "security auditor" that stress-tests Purple's solutions, ensuring high CIS scores require genuinely secure code.

### 3. Hybrid Static+LLM Analysis
Red Agent combines fast, reliable static analysis with LLM reasoning to catch both obvious vulnerabilities and subtle logic flaws.

### 4. Tautology Detection
A novel detection for `x == x` patterns that bypass authorization checks - a common bug in AI-generated code.

---

## Running the Arena

### Prerequisites
- Docker with GPU support (NVIDIA)
- Lambda Cloud H100/A100 instance (recommended)

### Launch Command
```bash
./scripts/bash/launch_arena.sh
```

### Endpoints After Launch
| Service | URL |
|---------|-----|
| Green Agent (Judge) | http://localhost:9000 |
| Purple Agent (Defender) | http://localhost:9001 |
| Red Agent (Attacker) | http://localhost:9021 |
| vLLM Brain | http://localhost:8000 |

### Trigger a Battle
```bash
curl -X POST http://localhost:9000/battle \
  -H "Content-Type: application/json" \
  -d '{"battle_id": "test-001", "purple_agent_url": "http://localhost:9001"}'
```

---

## File Structure

```
LogoMesh/
├── src/
│   ├── green_logic/          # Green Agent (Judge)
│   │   ├── orchestrator.py   # Battle coordination
│   │   ├── cis_scorer.py     # CIS computation
│   │   └── sandbox.py        # Safe code execution
│   │
│   ├── purple_logic/         # Purple Agent (Defender)
│   │   └── agent.py          # Code generation
│   │
│   └── red_logic/            # Red Agent (Attacker)
│       ├── orchestrator.py   # 3-layer attack engine
│       ├── workers/
│       │   ├── static_mirror.py      # Pattern detection
│       │   └── constraint_breaker.py # Constraint analysis
│       └── reasoning.py      # LLM-powered analysis
│
├── scenarios/                # Task definitions
│   └── *.yaml               # Task configs
│
├── scripts/bash/
│   └── launch_arena.sh      # Arena launcher
│
└── docs/05-Competition/     # This documentation
```

---

## Evaluation Criteria Alignment

This system addresses the Lambda Security Track requirements:

| Requirement | How We Address It |
|-------------|-------------------|
| Security Testing | Red Agent attacks Purple's code |
| Automated Evaluation | CIS score computed automatically |
| Novel Metrics | Contextual Debt / CIS framework |
| Real Vulnerabilities | Detects SQL injection, auth bypass, etc. |
| Scalable | Docker-based, runs on Lambda GPU |

---

## Related Documents

- [Agent-Architecture.md](./Agent-Architecture.md) - Technical architecture details
- [Green-Agent-Detailed-Guide.md](./Green-Agent-Detailed-Guide.md) - Green Agent deep dive
- [Purple-Agent-Detailed-Guide.md](./Purple-Agent-Detailed-Guide.md) - Purple Agent deep dive
- [00_CURRENT_TRUTH_SOURCE.md](../00_CURRENT_TRUTH_SOURCE.md) - Master project index

---

*Last Updated: 2026-01-15*
