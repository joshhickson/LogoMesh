---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-01-15]: Technical architecture documentation for the 3-agent arena (Green/Purple/Red) evaluation system.

# Agent Architecture Guide

## 1. Overview

This document explains how the LogoMesh **three-agent arena** evaluates AI coding agents using the "Contextual Debt" framework. The arena consists of:

- **Green Agent (Judge):** Orchestrates battles, assigns tasks, computes CIS scores
- **Purple Agent (Defender):** Generates code solutions to programming tasks
- **Red Agent (Attacker):** Finds vulnerabilities in Purple's code

## 2. System Architecture

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
└─────────────────────────────────────────────────────────────────────┘
```

### Agents

| Agent | Role | Port | Purpose |
|-------|------|------|---------|
| **Green** | Judge/Assessor | 9000 | Orchestrates battles, evaluates responses, computes CIS |
| **Purple** | Defender/Assessee | 9001 | Receives tasks, generates code solutions |
| **Red** | Attacker | 9021 | Finds vulnerabilities in Purple's code |

## 3. Evaluation Flow

1. **Trigger**: External request hits Green Agent with `battle_id` + `purple_agent_url`

2. **Green → Purple**: Green Agent sends a coding task (e.g., "Implement LRU Cache") via A2A protocol

3. **Purple responds**: Purple Agent's LLM generates:
   ```json
   {
     "sourceCode": "class LRUCache: ...",
     "testCode": "class TestLRUCache: ...",
     "rationale": "I used dict + doubly linked list for O(1)..."
   }
   ```

4. **Green evaluates**: Green Agent's LLM scores the response using the Contextual Debt framework

5. **Output**: Final score (0.0-1.0) with detailed breakdown

## 4. Contextual Debt Framework

The Green Agent evaluates code on three dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Rationale Debt** | 33% | Does it explain *why*, not just *what*? |
| **Architectural Debt** | 33% | Would a senior engineer approve this code? |
| **Testing Debt** | 33% | Are there meaningful, comprehensive tests? |

### Scoring Scale

| Score | Rating | Description |
|-------|--------|-------------|
| 0.85+ | Excellent | Production-ready, thoughtful rationale, clean architecture |
| 0.65-0.85 | Good | Solid implementation, minor improvements needed |
| 0.45-0.65 | Fair | Works but has significant debt |
| 0.25-0.45 | Poor | Barely functional, hard to maintain |
| 0.0-0.25 | Failing | Non-functional or no response |

## 5. How Tools Work

The `@ab.tool` decorator registers Python functions that the LLM can call during execution.

### Green Agent Tools

```python
@ab.tool
async def send_coding_task(purple_agent_url: str, battle_id: str) -> str:
    """Send a coding task to the purple agent."""
    # 1. Picks a random task (Email Validator, Rate Limiter, LRU Cache)
    # 2. Sends it to purple agent via HTTP POST (A2A protocol)
    # 3. Returns the purple agent's response

@ab.tool
def report_result(battle_id: str, score: float, breakdown: str) -> str:
    """Report the final evaluation result."""
    # 1. Prints score breakdown to console
    # 2. Returns confirmation JSON
```

### Tool Execution Flow

```
User Request: "battle_id: test-001, purple_agent_url: http://localhost:9050/"
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Green Agent LLM    │
                         │  (reads system      │
                         │   prompt + tools)   │
                         └─────────────────────┘
                                    │
            LLM decides: "I need to call send_coding_task"
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ send_coding_task(             │
                    │   "http://localhost:9050/",   │
                    │   "test-001"                  │
                    │ )                             │
                    └───────────────────────────────┘
                                    │
                         HTTP POST to Purple Agent
                                    │
                                    ▼
                         Purple Agent responds
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Green Agent LLM    │
                         │  evaluates response │
                         └─────────────────────┘
                                    │
            LLM decides: "Score is 0.92, call report_result"
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ report_result(                │
                    │   "test-001",                 │
                    │   0.92,                       │
                    │   "RATIONALE: 0.95\n..."      │
                    │ )                             │
                    └───────────────────────────────┘
```

### Key Points

- **LLM chooses when to call tools** - The system prompt tells it *when* to use them, but the LLM decides autonomously
- **Tools are just Python functions** - They can do anything: HTTP calls, file I/O, database queries, etc.
- **Tool results go back to LLM** - The return value becomes context for the LLM's next decision
- **Purple Agent has no tools** - It just responds directly with JSON (the LLM generates code, no tool calls needed)

## 6. Red Agent V2 (Attacker)

The Red Agent is a **hybrid vulnerability detection engine** that attacks Purple's code to find security flaws and logic bugs.

### Architecture

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

### Layer 1: Static Analysis (Guaranteed, Fast)

Two specialized workers run in parallel:

**StaticMirrorWorker** detects:
- SQL Injection (`f"SELECT * FROM {table}"`)
- Command Injection (`os.system(user_input)`)
- Dangerous Functions (`eval()`, `exec()`, `pickle.loads()`)
- Hardcoded Secrets (`password = "admin123"`)
- Path Traversal (`open(user_path)`)
- **Tautological Comparisons** (`if x == x:` - always True, bypasses checks)
- **Broken Authorization** (`self._require(self.owner == self.owner, ...)`)

**ConstraintBreakerWorker** detects:
- Forbidden imports (e.g., `socket` in email validator task)
- Required pattern violations (e.g., loop instead of recursion)
- Missing thread safety in concurrent code
- Task-specific constraint violations

### Layer 2: Smart Reasoning (LLM-Enhanced)

- Analyzes code semantically for logic flaws
- Finds vulnerabilities static analysis misses
- Context-aware (understands task requirements)
- Timeout-bounded (30 seconds max)

### Layer 3: Reflection (Deep Analysis)

- Only runs if no critical findings yet
- Second-pass analysis for subtle bugs
- Race condition detection
- Business logic flaws

### Vulnerability Severity Levels

| Severity | Description | Examples |
|----------|-------------|----------|
| **CRITICAL** | Exploitable immediately, severe impact | SQL injection, auth bypass, tautology bugs |
| **HIGH** | Significant security/logic flaw | Missing input validation, race conditions |
| **MEDIUM** | Moderate risk, exploitable under conditions | Weak crypto, info disclosure |
| **LOW** | Minor issues, best practice violations | Hardcoded non-secret values |
| **INFO** | Informational findings | Code style, minor inefficiencies |

### Output Format

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

## 7. File Structure

```
src/
├── green_logic/              # Green Agent (Judge)
│   ├── orchestrator.py       # Battle coordination
│   ├── cis_scorer.py         # CIS computation
│   ├── sandbox.py            # Safe code execution
│   └── red_report_types.py   # Shared types with Red
│
├── purple_logic/             # Purple Agent (Defender)
│   └── agent.py              # Code generation
│
└── red_logic/                # Red Agent (Attacker)
    ├── orchestrator.py       # 3-layer attack engine
    ├── workers/
    │   ├── static_mirror.py      # Pattern detection + tautology checks
    │   └── constraint_breaker.py # Task constraint analysis
    ├── reasoning.py          # LLM-powered smart layer
    └── test_red_agent_v2.py  # Test suite

scenarios/                    # Task definitions
└── *.yaml                   # Task configs

scripts/bash/
└── launch_arena.sh          # Arena launcher (Docker)
```

## 8. A2A Protocol

Agents communicate using JSON-RPC over HTTP:

### Request (Green → Purple)
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "messageId": "task-test-001",
      "role": "user",
      "parts": [{"type": "text", "text": "CODING TASK: LRU Cache\n..."}]
    }
  },
  "id": "test-001"
}
```

### Response (Purple → Green)
```json
{
  "jsonrpc": "2.0",
  "result": {
    "artifacts": [...],
    "history": [...],
    "status": {"state": "completed"}
  },
  "id": "test-001"
}
```

## 9. LLM-as-Judge Pattern

The key insight: **no external scoring server is needed**. The Green Agent's LLM *is* the judge.

The system prompt in `agent_card.toml` contains:
- Detailed evaluation rubric with scoring criteria
- Anti-gaming measures (detect verbose-but-empty rationales, trivial tests)
- Error handling instructions (timeouts, malformed responses)
- Output format requirements

The LLM reads the Purple Agent's code and rationale, then scores it based on this rubric.

## 10. Configuration

### Environment Variables

Create `.env` in repository root:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### Agent Card Fields

| Field | Purpose |
|-------|---------|
| `name` | Agent display name |
| `description` | System prompt (instructions for the LLM) |
| `url` | Agent's public URL |
| `port` | Port to listen on |
| `skills` | Advertised capabilities |

## 11. Current Capabilities & Future Work

### What's Working Now

| Capability | Status | Description |
|------------|--------|-------------|
| **3-Agent Arena** | ✅ Complete | Green, Purple, Red agents fully operational |
| **CIS Scoring** | ✅ Complete | Quantitative Contextual Integrity Score (R+A+T+L) |
| **Sandbox Execution** | ✅ Complete | Docker-isolated test execution with timeouts |
| **Red Agent V2** | ✅ Complete | Hybrid static+LLM vulnerability detection |
| **Tautology Detection** | ✅ Complete | Catches `x == x` authorization bypasses |
| **20 Task Categories** | ✅ Complete | Data structures, algorithms, security, concurrency, financial |
| **GPU Deployment** | ✅ Complete | Runs on Lambda H100/A100 via Docker |

### Competition Deliverables

For the AgentBeats Lambda Security Track:
- ✅ A2A protocol communication between agents
- ✅ LLM-as-Judge evaluation pattern
- ✅ Contextual Debt / CIS scoring framework
- ✅ Adversarial security testing (Red Agent)
- ✅ Automated vulnerability detection
- ✅ Docker-based scalable deployment

### Future Improvements

| Area | Enhancement |
|------|-------------|
| **Multi-file Tasks** | Expand Purple to handle multi-file codebases |
| **Iterative Refinement** | Allow back-and-forth to fix issues |
| **RAG Integration** | Retrieval for large codebase context |
| **Dynamic Tasks** | Generate tasks from issue trackers |

## 12. Quick Start

### Launch the Arena
```bash
./scripts/bash/launch_arena.sh
```

### Endpoints
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

## 13. Related Documents

- [Judges-Start-Here.md](./Judges-Start-Here.md) - Quick overview for competition judges
- [Green-Agent-Detailed-Guide.md](./Green-Agent-Detailed-Guide.md) - Green Agent deep dive
- [Purple-Agent-Detailed-Guide.md](./Purple-Agent-Detailed-Guide.md) - Purple Agent deep dive
- [00_CURRENT_TRUTH_SOURCE.md](../00_CURRENT_TRUTH_SOURCE.md) - Master project index
