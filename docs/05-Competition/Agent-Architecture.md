> **Status:** ACTIVE
> **Type:** Guide
> **Context:** Technical architecture documentation for the Green/Purple agent evaluation system

# Agent Architecture Guide

## 1. Overview

This document explains how the LogoMesh Green and Purple agents work together to evaluate AI coding agents using the "Contextual Debt" framework.

## 2. System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  GREEN AGENT    │────────▶│  PURPLE AGENT   │
│  (Assessor)     │◀────────│  (Assessee)     │
│  Port 9040      │         │  Port 9050      │
└─────────────────┘         └─────────────────┘
        │                           │
        │ LLM evaluates             │ LLM generates
        │ code quality             │ code solution
        ▼                           ▼
   Score 0.0-1.0              JSON response
```

### Agents

| Agent | Role | Port | Purpose |
|-------|------|------|---------|
| **Green** | Assessor | 9040 | Sends coding tasks, evaluates responses |
| **Purple** | Assessee | 9050 | Receives tasks, generates code solutions |

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

## 6. File Structure

```
green-agent/
├── agent_card.toml   # Agent config + system prompt (evaluation rubric)
├── tools.py          # send_coding_task() and report_result()
├── run.sh            # Loads .env, starts agent on port 9040
└── QUICKSTART.md     # Setup instructions

purple-agent/
├── agent_card.toml   # Agent config + system prompt (coding instructions)
├── tools.py          # Empty (no custom tools needed)
├── run.sh            # Loads .env, starts agent on port 9050
└── .gitignore
```

## 7. A2A Protocol

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

## 8. LLM-as-Judge Pattern

The key insight: **no external scoring server is needed**. The Green Agent's LLM *is* the judge.

The system prompt in `agent_card.toml` contains:
- Detailed evaluation rubric with scoring criteria
- Anti-gaming measures (detect verbose-but-empty rationales, trivial tests)
- Error handling instructions (timeouts, malformed responses)
- Output format requirements

The LLM reads the Purple Agent's code and rationale, then scores it based on this rubric.

## 9. Configuration

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

## 10. Limitations & Future Work

### Current Limitations

The current implementation is a **minimal proof-of-concept** with several limitations:

| Limitation | Description |
|------------|-------------|
| **Single-file tasks only** | Purple agent generates code in a single response; cannot handle multi-file projects |
| **No file system access** | Purple agent cannot read/write files, navigate directories, or work with existing codebases |
| **No iterative refinement** | One-shot generation; no back-and-forth to fix issues or improve code |
| **Context window limits** | Large codebases won't fit in the LLM's context window |
| **No code execution** | Tests are generated but not actually run to verify correctness |
| **Static task pool** | Only 3 hardcoded tasks (Email Validator, Rate Limiter, LRU Cache) |

### Future Improvements Needed

To work with **real-world codebases**, the system needs:

1. **File System Tools for Purple Agent**
   - `read_file(path)` - Read existing code
   - `write_file(path, content)` - Create/modify files
   - `list_directory(path)` - Navigate codebase
   - `search_code(pattern)` - Find relevant code

2. **Multi-turn Conversations**
   - Allow Green Agent to ask follow-up questions
   - Let Purple Agent request clarification on requirements
   - Iterative improvement based on feedback

3. **Code Execution & Verification**
   - Actually run the generated tests
   - Check for syntax errors, type errors
   - Measure test coverage

4. **Codebase Context Management**
   - Chunking large codebases to fit context
   - Retrieval-augmented generation (RAG) for relevant code
   - Dependency analysis to understand project structure

5. **Dynamic Task Generation**
   - Generate tasks based on actual codebase
   - Pull from issue trackers, TODOs, or bug reports
   - Adapt difficulty based on codebase complexity

6. **Sandboxed Execution Environment**
   - Safe execution of generated code
   - Resource limits (CPU, memory, time)
   - Isolation from host system

### Current Scope

For the AgentBeats competition, the current implementation demonstrates:
- ✅ A2A protocol communication between agents
- ✅ LLM-as-Judge evaluation pattern
- ✅ Contextual Debt scoring framework
- ✅ Tool-based agent architecture

It is **not** yet suitable for evaluating agents on real software engineering tasks involving existing codebases.

## 11. Quick Start

See [green-agent/QUICKSTART.md](../../green-agent/QUICKSTART.md) for setup and run instructions.
