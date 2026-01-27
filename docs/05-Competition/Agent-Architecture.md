---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-01-26]: Technical architecture documentation for the 3-agent arena (Green/Purple/Red) evaluation system. Updated for Final Submission.

# Agent Architecture Guide

## 1. Overview

This document explains how the LogoMesh **three-agent arena** evaluates AI coding agents using the "Contextual Debt" framework. The arena consists of:

- **Green Agent (Judge):** Orchestrates battles, assigns tasks, computes CIS scores
- **Purple Agent (Defender):** Generates code solutions to programming tasks
- **Red Agent (Attacker):** Finds vulnerabilities in Purple's code (can be standalone or embedded)

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
│   │  Port 9040  │   Solution    │  Port 9001  │                     │
│   └──────┬──────┘               └──────┬──────┘                     │
│          │                                                           │
│          │ (Orchestration)                                           │
│          ▼                                                           │
│   ┌─────────────┐                                                    │
│   │   RED       │ (Embedded Library or Microservice)                 │
│   │   AGENT     │                                                    │
│   │  (Attacker) │                                                    │
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
| **Green** | Judge/Assessor | 9040 | Orchestrates battles, evaluates responses, computes CIS |
| **Purple** | Defender/Assessee | 9001 | Receives tasks, generates code solutions |
| **Red** | Attacker | N/A | Finds vulnerabilities in Purple's code (Embedded in Green Agent) |

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

The Green Agent evaluates code on four dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Rationale Debt** | 25% | Semantic alignment between task intent and rationale |
| **Architectural Debt** | 25% | Architectural soundness and security (Red Agent findings) |
| **Testing Debt** | 25% | Test coverage, assertion specificity, and pass/fail status |
| **Logic Debt** | 25% | Correctness as evaluated by Senior Code Review (LLM) |

### Scoring Scale

| Score | Rating | Description |
|-------|--------|-------------|
| 0.85+ | Excellent | Production-ready, thoughtful rationale, clean architecture |
| 0.65-0.85 | Good | Solid implementation, minor improvements needed |
| 0.45-0.65 | Fair | Works but has significant debt |
| 0.25-0.45 | Poor | Barely functional, hard to maintain |
| 0.0-0.25 | Failing | Non-functional or no response |

## 5. Hybrid Testing Strategy (Fuzzer + LLM)

The Green Agent employs a dual-mode testing strategy to ensure robust evaluation:

### 1. Programmatic Fuzzer (Deterministic)
The `CodeAnalyzer` (AST-based) systematically generates edge case tests without relying on an LLM. It infers types from function signatures and variable names to test:
- **Empty inputs** (None, [], {})
- **Boundary values** (0, -1, MAX_INT)
- **Type confusion** (passing strings to int fields)

### 2. LLM-Based Adversarial Generation (Probabilistic)
The `TestGenerator` prompts the LLM (Qwen-2.5-Coder) to create complex test cases that target logic gaps:
- **Business logic flaws**
- **Complex state transitions**
- **Off-by-one errors**

This hybrid approach ensures high coverage (fuzzer) and deep logic validation (LLM).

## 6. Red Agent V2 (Attacker)

The Red Agent is a **hybrid vulnerability detection engine** that attacks Purple's code to find security flaws and logic bugs. It operates primarily as an **Embedded Library** within the Green Agent for speed and simplicity, but can also run as a standalone microservice.

### Architecture

```
┌─────────────────────────────────────────┐
│           Red Agent V2                   │
├─────────────────────────────────────────┤
│  Layer 1: Static Workers (Always runs)  │
│  ├── StaticMirrorWorker                 │  ← Pattern matching
│  ├── ConstraintBreakerWorker            │  ← Task constraint violations
│  └── DependencyAnalyzer                 │  ← Context-aware data flow analysis
├─────────────────────────────────────────┤
│  Layer 2: Smart Reasoning (If needed)   │
│  └── SmartReasoningLayer                │  ← LLM-powered logic flaw detection
├─────────────────────────────────────────┤
│  Layer 3: Reflection (Optional)         │
│  └── ReflectionLayer                    │  ← Deep analysis if time permits
└─────────────────────────────────────────┘
```

### Layer 1: Static Analysis (Guaranteed, Fast)

Three specialized workers run in parallel:

**DependencyAnalyzer** (New):
- Context-aware AST analysis
- Distinguishes user input vs. hardcoded values
- Flags `subprocess.run(user_input)` as CRITICAL
- Flags `subprocess.run(["ls"])` as SAFE

**StaticMirrorWorker** detects:
- SQL Injection, Command Injection
- Dangerous Functions (`eval()`, `exec()`)
- Hardcoded Secrets
- Tautological Comparisons (`if x == x`)

**ConstraintBreakerWorker** detects:
- Forbidden imports
- Required pattern violations
- Missing thread safety

### Vulnerability Severity Levels

| Severity | Description | Penalty Multiplier |
|----------|-------------|--------------------|
| **CRITICAL** | Exploitable immediately | 0.6x (Max Penalty) |
| **HIGH** | Significant security/logic flaw | 0.7x |
| **MEDIUM** | Moderate risk | 0.8x |
| **LOW** | Minor issues | 0.9x |
| **INFO** | Informational findings | 1.0x (No Penalty) |

## 7. File Structure

```
src/
├── green_logic/              # Green Agent (Judge)
│   ├── server.py             # Battle coordination (was orchestrator.py)
│   ├── scoring.py            # CIS computation (was cis_scorer.py)
│   ├── sandbox.py            # Safe code execution
│   └── generator.py          # Hybrid Test Generator (Fuzzer + LLM)
│
├── purple_logic/             # Purple Agent (Defender)
│   └── agent.py              # Code generation
│
└── red_logic/                # Red Agent (Attacker)
    ├── orchestrator.py       # 3-layer attack engine
    ├── dependency_analyzer.py # Context-aware analysis
    └── workers/              # Static analysis workers
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

## 9. Configuration

### Environment Variables

Create `.env` in repository root:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
LLM_MODEL_NAME=Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
HOST=0.0.0.0
PORT=9040
```

### Agent Card Fields

| Field | Purpose |
|-------|---------|
| `name` | Agent display name |
| `description` | System prompt (instructions for the LLM) |
| `url` | Agent's public URL |
| `port` | Port to listen on (Default 9040) |

## 10. Current Capabilities

| Capability | Status | Description |
|------------|--------|-------------|
| **3-Agent Arena** | ✅ Complete | Green, Purple, Red agents operational |
| **CIS Scoring** | ✅ Complete | Quantitative Contextual Integrity Score (R+A+T+L) |
| **Embedded Red Agent** | ✅ Complete | Integrated security scanning within Green Agent |
| **Hybrid Testing** | ✅ Complete | Fuzzer + LLM test generation |
| **Context-Aware Analysis** | ✅ Complete | Dependency Analyzer distinguishes safe/unsafe patterns |
| **Docker Sandbox** | ✅ Complete | Secure execution with `put_archive` (no volume mounts) |

## 11. Quick Start

### Launch the Arena
```bash
python main.py
```

### Endpoints
| Service | URL |
|---------|-----|
| Green Agent (Judge) | http://localhost:9040 |
| Purple Agent (Defender) | http://localhost:9001 |
| vLLM Brain | http://localhost:8000 |

## 12. Related Documents

- [Judges-Start-Here.md](./Judges-Start-Here.md) - Quick overview for competition judges
- [00_CURRENT_TRUTH_SOURCE.md](../00_CURRENT_TRUTH_SOURCE.md) - Master project index
